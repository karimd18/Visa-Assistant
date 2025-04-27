import os
import json
import re
import openai
from openai import OpenAIError
from dotenv import load_dotenv
import base64

# Load .env variables
load_dotenv()

# Setup OpenAI client
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

PROMPT_PATH = os.path.join(os.path.dirname(__file__), 'prompts', 'prompt.md')

def load_system_prompt(prompt_path):
    """Load system prompt from file."""
    try:
        with open(prompt_path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        raise Exception(f"Prompt file not found at {prompt_path}")

def clean_markdown_json(reply):
    """Remove triple backticks if GPT wrapped the JSON in them."""
    cleaned = reply.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(json)?\n", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\n```$", "", cleaned)
    return cleaned.strip()

def extract_passport_and_destination(user_message):
    """Extract passport and destination info from GPT-4o."""
    try:
        system_prompt = load_system_prompt(PROMPT_PATH)

        # Send to OpenAI
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0,
            max_tokens=300
        )

        reply_content = response.choices[0].message.content

        if not reply_content:
            raise Exception("No reply content received from OpenAI.")

        # Clean reply
        cleaned_reply = clean_markdown_json(reply_content)

        # ONLY NOW parse as JSON
        if isinstance(cleaned_reply, str):
            extraction = json.loads(cleaned_reply)
        else:
            raise Exception("Expected cleaned reply to be string before parsing.")

        # Now extraction is a real Python dict ✅
        if not isinstance(extraction, dict):
            raise Exception("Parsed extraction is not a dictionary.")

        return extraction

    except OpenAIError as e:
        raise Exception(f"OpenAI API error: {str(e)}")
    except json.JSONDecodeError as e:
        raise Exception(f"JSON Decode error: {str(e)}")
    except Exception as ex:
        raise Exception(f"Unexpected error: {str(ex)}")

def extract_country_from_image(image_path):
    """Extract passport country from image using GPT-4o vision with enhanced prompting"""
    try:
        with open(image_path, "rb") as image_file:
            base64_image = base64.b64encode(image_file.read()).decode('utf-8')

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": """Analyze the passport image's cover or biographical data page. 
                                Identify the issuing country using any visible country names, 
                                ISO codes, or national symbols. Return ONLY the 3-letter ISO code 
                                in this JSON format: {"passportCountry": "XXX"}"""
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "What country issued this passport?"},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}",
                                "detail": "high"
                            }
                        }
                    ]
                }
            ],
            temperature=0,
            max_tokens=300
        )

        reply = response.choices[0].message.content
        cleaned = clean_markdown_json(reply)
        result = json.loads(cleaned)
        iso_code = result.get('passportCountry', 'UNKNOWN').upper()
        
        # Validate ISO code format
        if len(iso_code) == 3 and iso_code.isalpha():
            return iso_code
        return 'UNKNOWN'

    except Exception as e:
        print(f"Image analysis error: {str(e)}")
        return 'UNKNOWN'
    """Extract passport country from image using GPT-4o vision."""
    try:
        # Encode image to base64
        with open(image_path, "rb") as image_file:
            base64_image = base64.b64encode(image_file.read()).decode('utf-8')

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": """Analyze the passport image and return ONLY the 3-letter ISO country code 
                                of the issuing country in this JSON format: 
                                {"passportCountry": "XXX"}"""
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "What country issued this passport?"},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            temperature=0,
            max_tokens=300
        )

        # Parse response
        reply = response.choices[0].message.content
        cleaned = clean_markdown_json(reply)
        result = json.loads(cleaned)
        return result.get('passportCountry', 'UNKNOWN')

    except Exception as e:
        print(f"Image analysis error: {str(e)}")
        return 'UNKNOWN'