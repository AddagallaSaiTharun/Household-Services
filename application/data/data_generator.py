from faker import Faker
import random

# Initialize the Faker library
fake = Faker()

def generate_random_user_data():
    # Generate random data for each field
    user_data = {
        'email': fake.email(),
        'first_name': fake.first_name(),
        'last_name': fake.last_name(),
        'age': random.randint(18, 65),  # Random age between 18 and 65
        'role': random.choice(['admin', 'service professional', 'customer']),  # Random role
        'user_image_url': fake.image_url(),
        'password': fake.password(),  # You can customize the password generation as needed
        'phone': fake.phone_number(),
        'address': fake.address().replace("\n", ", "),  # Replacing newlines with commas
        'address_link': fake.url(),  # Random URL as a placeholder for address link
        'pincode': random.randint(100000, 999999),  # Random 6-digit pincode
        "gender": random.choice(["M","F","O"])
    }
    return user_data

def generate_random_service_data():
    service_data = {
        'service_name': fake.job(),  # Random job title as service name
        'time_req': random.randint(1, 8),  # Random time requirement in hours
        'service_base_price': round(random.uniform(500, 5000), 2),  # Random price between 500 and 5000
        # 'service_image': fake.image_url(),  # Random image URL as a placeholder
        'service_dscp': fake.text(max_nb_chars=200)  # Random description
    }
    return service_data

print(generate_random_user_data())