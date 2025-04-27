from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.utils import secure_filename
from openai_service import extract_passport_and_destination, extract_country_from_image
from visa_checker import check_visa
import os
import logging

# Initialize Flask app
app = Flask(__name__)
CORS(app, supports_credentials=True)

# Configuration
app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev-secret-123")
app.config['UPLOAD_FOLDER'] = './uploads'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'webp'}
app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024  # 2MB limit

# Configure logging
logging.basicConfig(level=logging.DEBUG)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/analyze-message', methods=['POST'])
def analyze_message():
    try:
        # Handle different content types
        if request.is_json:
            user_input = request.json.get('message', '')
            files = {}
        else:
            user_input = request.form.get('message', '')
            files = request.files

        # Process image first with high priority
        image_passport = None
        if 'image' in files:
            file = files['image']
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                
                image_passport = extract_country_from_image(filepath)
                app.logger.debug(f"Image analysis result: {image_passport}")
                
                if image_passport and image_passport != 'UNKNOWN':
                    session['passport'] = image_passport
                    app.logger.debug(f"Updated passport from image: {image_passport}")
                
                os.remove(filepath)

        # Process text input (only update missing fields)
        if user_input:
            extraction = extract_passport_and_destination(user_input)
            app.logger.debug(f"Text extraction result: {extraction}")

            # Only update passport from text if image didn't provide it
            if not image_passport or image_passport == 'UNKNOWN':
                text_passport = extraction.get('passportCountry', 'UNKNOWN').upper()
                if text_passport != 'UNKNOWN':
                    session['passport'] = text_passport
                    app.logger.debug(f"Updated passport from text: {text_passport}")

            # Always process destination from text
            text_dest = extraction.get('destinationCountry', 'UNKNOWN').upper()
            if text_dest != 'UNKNOWN':
                session['destination'] = text_dest
                app.logger.debug(f"Updated destination from text: {text_dest}")

        # Get current state with fallbacks
        passport = session.get('passport', 'UNKNOWN')
        destination = session.get('destination', 'UNKNOWN')
        app.logger.info(f"Final session state - Passport: {passport}, Destination: {destination}")
        
        # Prepare response
        if passport == 'UNKNOWN' or destination == 'UNKNOWN':
            response = {
                "status": "incomplete",
                "message": get_missing_info_message(passport, destination),
                "detected_passport": passport if passport != 'UNKNOWN' else None,
                "detected_destination": destination if destination != 'UNKNOWN' else None
            }
        else:
            try:
                visa_msg = check_visa(passport, destination)
                response = {
                    "status": "complete",
                    "message": f"Thank you for the information. {visa_msg}",
                    "passportCountry": passport,
                    "destinationCountry": destination
                }
                session.clear()
            except Exception as e:
                response = {
                    "status": "error",
                    "message": f"Could not check visa requirements: {str(e)}"
                }

        return jsonify(response)

    except Exception as e:
        app.logger.error(f"Server error: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "An internal server error occurred"
        }), 500

def get_missing_info_message(passport, destination):
    if passport == 'UNKNOWN' and destination == 'UNKNOWN':
        return "Could you please share your passport country and destination?"
    elif passport == 'UNKNOWN':
        return "Could you please specify your passport issuer?"
    else:
        return "Could you clarify your destination country?"

if __name__ == "__main__":
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(host="0.0.0.0", port=5000, debug=True)