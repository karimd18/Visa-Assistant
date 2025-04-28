import json
from openai_service import visa_estimation, country_shortening

with open('./assets/visa_information.json', 'r') as f:
    visa_info = json.load(f)

def check_visa(passport_code, destination_code):
    """
    Check visa requirements based purely on codes.
    If information is missing, use GPT to estimate.
    """
    if len(passport_code) != 3 or len(destination_code) != 3:
        return country_shortening(passport_code, destination_code)

    data = visa_info.get(passport_code, {})

    if destination_code in data.get('visaFree', {}):
        visa_entry = data['visaFree'][destination_code]
        max_stay = visa_entry.get('maxStay')
        if max_stay:
            return f"Travelers from {passport_code} are exempt from visa for {destination_code} with a maximum stay of {max_stay} days."
        else:
            return visa_estimation(passport_code, destination_code, "visaFree")

    if destination_code in data.get('visaOnArrival', {}):
        visa_entry = data['visaOnArrival'][destination_code]
        max_stay = visa_entry.get('maxStay')
        if max_stay:
            return f"Travelers from {passport_code} can obtain a visa on arrival when visiting {destination_code} allowing a maximum stay of {max_stay} days."
        else:
            return visa_estimation(passport_code, destination_code, "visaOnArrival")

    return visa_estimation(passport_code, destination_code, "visaRequired")
