import logging
import os
import json
import re
import openai
from openai import OpenAIError
from dotenv import load_dotenv
import base64
import httpx

load_dotenv()

client = openai.OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    http_client=httpx.Client()
)

def load_system_prompt(prompt_filename):
    """
    Load a system prompt from the prompts folder.
    """
    prompt_path = os.path.join(os.path.dirname(__file__), 'prompts', prompt_filename)
    try:
        with open(prompt_path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        raise Exception(f"Prompt file not found at {prompt_path}")

def clean_markdown_json(reply):
    """
    Remove triple backticks if GPT wrapped JSON in them.
    """
    cleaned = reply.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(json)?\n", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\n```$", "", cleaned)
    return cleaned.strip()

def extract_passport_and_destination(user_message):
    """
    Extract passportCountry and destinationCountry from text using country_shortening_prompt.
    Now using GPT-4o-mini for text processing with enhanced error handling
    """
    try:
        system_prompt = load_system_prompt('country_shortening_prompt.md')

        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_message}
            ],
            temperature=0,
            max_tokens=300
        )
        reply = resp.choices[0].message.content
        if not reply:
            return {'passportCountry': 'UNKNOWN', 'destinationCountry': 'UNKNOWN'}

        cleaned = clean_markdown_json(reply)
        
        if not cleaned.startswith('{'):
            logging.warning(f"Non-JSON response from model: {cleaned}")
            return {'passportCountry': 'UNKNOWN', 'destinationCountry': 'UNKNOWN'}

        try:
            data = json.loads(cleaned)
        except json.JSONDecodeError as e:
            logging.error(f"JSON parsing failed for content: {cleaned}")
            return {'passportCountry': 'UNKNOWN', 'destinationCountry': 'UNKNOWN'}

        if not isinstance(data, dict):
            logging.warning(f"Unexpected response type: {type(data)}")
            return {'passportCountry': 'UNKNOWN', 'destinationCountry': 'UNKNOWN'}

        return {
            'passportCountry': data.get('passportCountry', 'UNKNOWN'),
            'destinationCountry': data.get('destinationCountry', 'UNKNOWN')
        }

    except OpenAIError as e:
        logging.error(f"OpenAI API error: {e}")
        return {'passportCountry': 'UNKNOWN', 'destinationCountry': 'UNKNOWN'}
    except Exception as ex:
        logging.error(f"Unexpected error: {ex}")
        return {'passportCountry': 'UNKNOWN', 'destinationCountry': 'UNKNOWN'}
def extract_country_from_image(image_path):
    """
    Extract passportCountry ISO3 from an image using GPT-4o (since mini doesn't support images)
    """
    try:
        system_prompt = load_system_prompt('country_shortening_prompt.md')

        with open(image_path, 'rb') as img:
            b64 = base64.b64encode(img.read()).decode('utf-8')

        resp = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "What country issued this passport?"},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}", "detail": "high"}}
                    ]
                }
            ],
            temperature=0,
            max_tokens=300
        )

        reply = resp.choices[0].message.content
        cleaned = clean_markdown_json(reply)
        result = json.loads(cleaned)
        code = result.get('passportCountry', 'UNKNOWN').upper()
        return code if len(code)==3 and code.isalpha() else 'UNKNOWN'

    except Exception:
        return 'UNKNOWN'

def country_shortening(passport_country, destination_country):
    """
    Shorten full country names to ISO3 codes using country_shortening_prompt.
    """
    try:
        system_prompt = load_system_prompt('country_shortening_prompt.md')
        user_msg = f"Passport country: {passport_country}\nDestination country: {destination_country}"
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_msg}
            ],
            temperature=0,
            max_tokens=300
        )
        return resp.choices[0].message.content

    except Exception as ex:
        return f"(⚠️ Error shortening) {ex}"

def visa_estimation(passport_country, destination_country, visa_type):
    """
    Estimate visa rules when missing, using visa_estimation_prompt.
    Now using GPT-4o-mini for estimations
    """
    try:
        system_prompt = load_system_prompt('visa_estimation_prompt.md')
        if visa_type == "visaFree":
            user_msg = f"Estimate max stay for visa-free travel from {passport_country} to {destination_country}."
        elif visa_type == "visaOnArrival":
            user_msg = f"Estimate max stay for visa on arrival for travelers from {passport_country} to {destination_country}."
        else:
            user_msg = f"Explain if {passport_country} passport holders require a visa to travel to {destination_country}, indicating this is an estimation."

        resp = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_msg}
            ],
            temperature=0,
            max_tokens=400
        )
        return f"(⚠️ Estimation) {resp.choices[0].message.content}"

    except Exception as ex:
        return f"(⚠️ Estimation error) {ex}"

def handle_greetings_or_scope(user_message):
    """
    Handle greetings or politely refuse out-of-scope queries using greeting_and_scope_prompt.
    """
    try:
        system_prompt = load_system_prompt('greeting_and_scope_prompt.md')
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_message}
            ],
            temperature=0,
            max_tokens=300
        )
        return resp.choices[0].message.content

    except Exception as ex:
        return f"(⚠️ Greeting error) {ex}"
    
def missing_info(passport_country, destination_country):
    prompt = load_system_prompt('missing_info_prompt.md')
    user_msg = prompt.replace('{{PASSPORT}}', passport_country) \
                     .replace('{{DESTINATION}}', destination_country)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role":"system","content":prompt},
            {"role":"user","content":user_msg}
        ],
        temperature=0,
        max_tokens=150
    )
    return response.choices[0].message.content