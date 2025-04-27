import json

# Load data
with open('./assets/visa_information.json', 'r') as f:
    visa_info = json.load(f)

with open('./assets/country_names.json', 'r') as f:
    country_names = json.load(f)

def check_visa(passport_code, destination_code):
    """Generate detailed visa message with country names."""
    passport = country_names.get(passport_code, "Unknown passport country")
    destination = country_names.get(destination_code, "Unknown destination")

    data = visa_info.get(passport_code, {})
    
    # Visa free
    if destination_code in data.get('visaFree', {}):
        days = data['visaFree'][destination_code]['maxStay']
        return f"{passport} passport holders are exempt from visa for travel to {destination} with a maximum stay of {days} days."
    
    # Visa on arrival
    if destination_code in data.get('visaOnArrival', {}):
        days = data['visaOnArrival'][destination_code]['maxStay']
        return f"{passport} passport holders can obtain a visa upon arrival which will give you {days}-day maximum stay."
    
    # Visa required
    return f"{passport} passport holders will need to apply for a visa in advance at a {destination} consulate - there are no visa on arrival or visa exemptions."