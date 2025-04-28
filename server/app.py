import os
import logging
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.utils import secure_filename

from openai_service import (
    extract_passport_and_destination,
    extract_country_from_image,
    handle_greetings_or_scope,
    missing_info
)
from visa_checker import check_visa

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])
app.config['UPLOAD_FOLDER'] = './uploads'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'webp'}
app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024

logging.basicConfig(level=logging.DEBUG)

def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


@app.route('/analyze-message', methods=['POST'])
def analyze_message():
    try:
        if request.is_json:
            user_input = (request.json.get('message') or "").strip()
            files = {}
        else:
            user_input = (request.form.get('message') or "").strip()
            files = request.files

        logging.debug(f"User input: {user_input}")

        if 'image' in files:
            file = files['image']
            if file and allowed_file(file.filename):
                fn   = secure_filename(file.filename)
                path = os.path.join(app.config['UPLOAD_FOLDER'], fn)
                file.save(path)

                iso = extract_country_from_image(path)
                logging.debug(f"Image ISO3 → {iso}")
                if iso != 'UNKNOWN':
                    session['passport'] = iso

                os.remove(path)

        if user_input:
            data = extract_passport_and_destination(user_input)
            logging.debug(f"Text extraction → {data}")

            if session.get('passport','UNKNOWN') == 'UNKNOWN':
                p = (data.get('passportCountry') or 'UNKNOWN').upper()
                if p != 'UNKNOWN':
                    session['passport'] = p

            d = (data.get('destinationCountry') or 'UNKNOWN').upper()
            if d != 'UNKNOWN':
                session['destination'] = d

        passport_country    = session.get('passport', 'UNKNOWN')
        destination_country = session.get('destination', 'UNKNOWN')
        logging.info(f"Session → passport={passport_country}, destination={destination_country}")

        if passport_country == 'UNKNOWN' and destination_country == 'UNKNOWN':
            reply = handle_greetings_or_scope(user_input)
            return jsonify(status="complete", message=reply)

        if passport_country == 'UNKNOWN' or destination_country == 'UNKNOWN':
            reply = missing_info(passport_country, destination_country)
            return jsonify({
                "status": "incomplete",
                "message": reply,
                "passportCountry": None if passport_country=='UNKNOWN' else passport_country,
                "destinationCountry": None if destination_country=='UNKNOWN' else destination_country
            })

        visa_msg = check_visa(passport_country, destination_country)
        session.clear()
        return jsonify({
            "status": "complete",
            "message": visa_msg,
            "passportCountry": passport_country,
            "destinationCountry": destination_country
        })

    except Exception:
        logging.exception("analyze-message failed")
        return jsonify({
            "status": "error",
            "message": "Sorry, something went wrong. Please try again."
        }), 500


if __name__ == "__main__":
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(host="0.0.0.0", port=5000, debug=True)
