import json
import logging
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('jobs_application.log'),
        logging.StreamHandler()
    ]
)

# Applicant information
APPLICANT_INFO = {
    'full_name': 'Job Kimani',
    'email': 'jobkimani@gmail.com',
    'phone': '+254700000000',
    'resume_path': 'resume.pdf',
    'cover_letter_template': """
Dear Hiring Manager,

I am writing to express my interest in the {job_title} position at {company}. With my background in data science and passion for {field}, I believe I would be a valuable addition to your team.

{personalized_paragraph}

Thank you for considering my application. I look forward to discussing how I can contribute to {company}'s success.

Best regards,
Job Kimani
"""
}

# LinkedIn credentials
LINKEDIN_CREDENTIALS = {
    'email': 'jobkimani@gmail.com',
    'password': 'your_password_here'  # Replace with actual password
}

def setup_driver():
    """Set up and return a configured Chrome WebDriver."""
    chrome_options = Options()
    # chrome_options.add_argument('--headless')  # Uncomment to run in headless mode
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    driver.implicitly_wait(10)
    return driver

def wait_for_element(driver, by, value, timeout=10):
    """Wait for an element to be present and clickable."""
    try:
        element = WebDriverWait(driver, timeout).until(
            EC.element_to_be_clickable((by, value))
        )
        return element
    except TimeoutException:
        logging.warning(f"Timeout waiting for element: {value}")
        return None

def login_to_linkedin(driver):
    """Log in to LinkedIn."""
    try:
        driver.get('https://www.linkedin.com/login')
        time.sleep(2)  # Wait for page to load
        
        # Find and fill email field
        email_field = wait_for_element(driver, By.ID, 'username')
        if email_field:
            email_field.send_keys(LINKEDIN_CREDENTIALS['email'])
        
        # Find and fill password field
        password_field = wait_for_element(driver, By.ID, 'password')
        if password_field:
            password_field.send_keys(LINKEDIN_CREDENTIALS['password'])
        
        # Find and click sign in button
        sign_in_button = wait_for_element(driver, By.CSS_SELECTOR, 'button[type="submit"]')
        if sign_in_button:
            sign_in_button.click()
            time.sleep(5)  # Wait for login to complete
            return True
        
        return False
    except Exception as e:
        logging.error(f"Failed to login to LinkedIn: {str(e)}")
        return False

def find_field(driver, field_type, field_names):
    """Find a form field using multiple strategies."""
    for name in field_names:
        try:
            # Try by name
            field = driver.find_element(By.NAME, name)
            if field.is_displayed() and field.is_enabled():
                return field
        except NoSuchElementException:
            pass
        
        try:
            # Try by ID
            field = driver.find_element(By.ID, name)
            if field.is_displayed() and field.is_enabled():
                return field
        except NoSuchElementException:
            pass
        
        try:
            # Try by placeholder
            field = driver.find_element(By.CSS_SELECTOR, f'input[placeholder*="{name}" i]')
            if field.is_displayed() and field.is_enabled():
                return field
        except NoSuchElementException:
            pass
        
        try:
            # Try by label text
            label = driver.find_element(By.XPATH, f'//label[contains(text(), "{name}")]')
            field_id = label.get_attribute('for')
            if field_id:
                field = driver.find_element(By.ID, field_id)
                if field.is_displayed() and field.is_enabled():
                    return field
        except NoSuchElementException:
            pass
    
    return None

def debug_page(driver, job_title):
    """Debug information about the current page."""
    logging.info(f"\nDebugging page for job: {job_title}")
    logging.info(f"URL: {driver.current_url}")
    
    # Log all forms
    forms = driver.find_elements(By.TAG_NAME, 'form')
    logging.info(f"Found {len(forms)} forms on the page")
    
    for i, form in enumerate(forms, 1):
        logging.info(f"\nForm {i}:")
        logging.info(f"Form action: {form.get_attribute('action')}")
        logging.info(f"Form method: {form.get_attribute('method')}")
        
        # Log input fields
        inputs = form.find_elements(By.TAG_NAME, 'input')
        logging.info("Input fields in form {i}:")
        for input_field in inputs:
            logging.info(f"- Name: {input_field.get_attribute('name')}, ID: {input_field.get_attribute('id')}, Type: {input_field.get_attribute('type')}")
        
        # Log textarea fields
        textareas = form.find_elements(By.TAG_NAME, 'textarea')
        logging.info("Textarea fields in form {i}:")
        for textarea in textareas:
            logging.info(f"- Name: {textarea.get_attribute('name')}, ID: {textarea.get_attribute('id')}")

def autofill_form(driver, job_info):
    """Autofill the application form with applicant information."""
    try:
        # Wait for form to be present
        time.sleep(3)  # Give page time to load
        
        # Debug the page
        debug_page(driver, job_info['title'])
        
        # Find and fill name field
        name_field = find_field(driver, 'name', ['name', 'full_name', 'applicant_name'])
        if name_field:
            name_field.clear()
            name_field.send_keys(APPLICANT_INFO['full_name'])
        else:
            logging.warning("Could not find name field")
        
        # Find and fill email field
        email_field = find_field(driver, 'email', ['email', 'email_address', 'applicant_email'])
        if email_field:
            email_field.clear()
            email_field.send_keys(APPLICANT_INFO['email'])
        else:
            logging.warning("Could not find email field")
        
        # Find and fill phone field
        phone_field = find_field(driver, 'phone', ['phone', 'phone_number', 'mobile', 'telephone'])
        if phone_field:
            phone_field.clear()
            phone_field.send_keys(APPLICANT_INFO['phone'])
        else:
            logging.warning("Could not find phone field")
        
        # Find and fill resume upload
        resume_field = find_field(driver, 'file', ['resume', 'cv', 'upload_resume', 'upload_cv'])
        if resume_field:
            resume_field.send_keys(APPLICANT_INFO['resume_path'])
        else:
            logging.warning("Could not find resume upload field")
        
        # Find and fill cover letter
        cover_letter_field = find_field(driver, 'textarea', ['cover_letter', 'message', 'additional_info'])
        if cover_letter_field:
            personalized_letter = APPLICANT_INFO['cover_letter_template'].format(
                job_title=job_info['title'],
                company=job_info.get('company', 'the company'),
                field='data science and analysis',
                personalized_paragraph=f"I am particularly interested in this role because it aligns with my experience in {job_info.get('field', 'data analysis')}."
            )
            cover_letter_field.clear()
            cover_letter_field.send_keys(personalized_letter)
        else:
            logging.warning("Could not find cover letter field")
        
        # Find and click submit button
        submit_button = find_field(driver, 'submit', ['submit', 'apply', 'send', 'submit_application'])
        if submit_button:
            submit_button.click()
            time.sleep(3)  # Wait for submission
            return True
        else:
            logging.warning("Could not find submit button")
            return False
            
    except Exception as e:
        logging.error(f"Error filling form: {str(e)}")
        return False

def apply_to_job(driver, job_info):
    """Apply to a specific job."""
    try:
        # Navigate to job page
        driver.get(job_info['url'])
        time.sleep(3)  # Wait for page to load
        
        # Handle LinkedIn authentication if needed
        if 'linkedin.com' in job_info['url'] and not driver.current_url.startswith('https://www.linkedin.com/feed/'):
            if not login_to_linkedin(driver):
                logging.error("Failed to login to LinkedIn")
                return False
        
        # Find and click apply button
        apply_button = wait_for_element(driver, By.CSS_SELECTOR, 'button[aria-label*="Apply"], button:contains("Apply"), a:contains("Apply")')
        if apply_button:
            apply_button.click()
            time.sleep(2)
            
            # Fill out the application form
            if autofill_form(driver, job_info):
                logging.info(f"Successfully applied to {job_info['title']}")
                return True
            else:
                logging.error(f"Failed to fill application form for {job_info['title']}")
                return False
        else:
            logging.error(f"Could not find apply button for {job_info['title']}")
            return False
            
    except Exception as e:
        logging.error(f"Failed to apply to {job_info['title']}: {str(e)}")
        return False

def run_job_application_process():
    """Main function to run the job application process."""
    logging.info("Starting job application process")
    
    try:
        # Read jobs from JSON file
        with open('applied_jobs.json', 'r') as f:
            jobs = json.load(f)
        
        # Initialize WebDriver
        driver = setup_driver()
        
        # Process each job
        for job in jobs:
            logging.info(f"\nProcessing job: {job['title']}")
            if apply_to_job(driver, job):
                # Update job status in JSON
                job['applied'] = True
                job['applied_date'] = time.strftime('%Y-%m-%d')
                
                # Save updated job list
                with open('applied_jobs.json', 'w') as f:
                    json.dump(jobs, f, indent=2)
        
    except Exception as e:
        logging.error(f"Error in job application process: {str(e)}")
    finally:
        driver.quit()

if __name__ == "__main__":
    run_job_application_process() 