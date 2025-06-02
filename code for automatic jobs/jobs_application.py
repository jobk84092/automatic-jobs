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
import urllib.parse
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('jobs_application.log'),
        logging.StreamHandler()
    ]
)

# Platform configurations
PLATFORM_CONFIGS = {
    'linkedin': {
        'domain': 'https://www.linkedin.com',
        'login_url': 'https://www.linkedin.com/login',
        'logged_in_selector': '#global-nav',
        'apply_button_selector': 'button[data-control-name="jobdetails_topcard_inapply"]'
    },
    'fuzu': {
        'domain': 'https://www.fuzu.com',
        'login_url': 'https://www.fuzu.com/login',
        'logged_in_selector': '.user-profile',
        'apply_button_selector': 'button.apply-now'
    },
    'brightermonday': {
        'domain': 'https://www.brightermonday.co.ke',
        'login_url': 'https://www.brightermonday.co.ke/login',
        'logged_in_selector': '.user-menu',
        'apply_button_selector': 'button.apply-job'
    },
    'myjobsmag': {
        'domain': 'https://www.myjobsmag.co.ke',
        'login_url': 'https://www.myjobsmag.co.ke/login',
        'logged_in_selector': '.user-account',
        'apply_button_selector': 'button.apply-now'
    }
}

# Applicant information
APPLICANT_INFO = {
    'full_name': 'Job Kimani',
    'email': 'jobkimani@gmail.com',
    'phone': '+254 711 216 022',
    'resume_path': 'resume.pdf',
    'cover_letter': """
    Dear Hiring Manager,

    I am writing to express my interest in the {position} position at {company}. With my background in {field} and passion for {field}, I believe I would be a valuable addition to your team.

    I am particularly drawn to this opportunity because of {company}'s reputation for {company_quality} and commitment to {company_value}. My experience in {relevant_experience} aligns well with the requirements of this role.

    Thank you for considering my application. I look forward to discussing how I can contribute to {company}'s success.

    Best regards,
    Job Kimani
    """
}

def setup_driver():
    """Set up and return a configured Chrome WebDriver."""
    chrome_options = Options()
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    # Use default Chrome profile instead of creating a new one
    chrome_options.add_argument('--user-data-dir=/Users/jobkimani/Library/Application Support/Google/Chrome')
    chrome_options.add_argument('--profile-directory=Default')
    # Manually specify the correct ChromeDriver binary
    chromedriver_path = '/Users/jobkimani/.wdm/drivers/chromedriver/mac64/137.0.7151.55/chromedriver-mac-arm64/chromedriver'
    service = Service(executable_path=chromedriver_path)
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

def is_logged_in(driver, platform):
    """Check if already logged in to the platform."""
    try:
        config = PLATFORM_CONFIGS[platform]
        driver.get(config['domain'])
        WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, config['logged_in_selector']))
        )
        return True
    except:
        return False

def get_full_url(url, source):
    """Convert relative URL to full URL based on source."""
    if url.startswith('http'):
        return url
    
    platform = source.lower()
    if platform in PLATFORM_CONFIGS:
        return urllib.parse.urljoin(PLATFORM_CONFIGS[platform]['domain'], url)
    return url

def find_field(driver, field_type, field_names):
    """Find a form field using multiple strategies."""
    for name in field_names:
        try:
            # Try by name
            element = driver.find_element(By.NAME, name)
            if element.is_displayed() and element.is_enabled():
                return element
        except NoSuchElementException:
            pass

        try:
            # Try by ID
            element = driver.find_element(By.ID, name)
            if element.is_displayed() and element.is_enabled():
                return element
        except NoSuchElementException:
            pass

        try:
            # Try by placeholder
            element = driver.find_element(By.CSS_SELECTOR, f'input[placeholder*="{name}"]')
            if element.is_displayed() and element.is_enabled():
                return element
        except NoSuchElementException:
            pass

        try:
            # Try by label text
            label = driver.find_element(By.XPATH, f'//label[contains(text(), "{name}")]')
            element = driver.find_element(By.ID, label.get_attribute('for'))
            if element.is_displayed() and element.is_enabled():
                return element
        except NoSuchElementException:
            pass

    return None

def autofill_form(driver, job_info):
    """Autofill the job application form."""
    try:
        # Find and fill name field
        name_field = find_field(driver, 'name', ['name', 'fullname', 'full_name', 'applicant_name'])
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
            resume_field.send_keys(os.path.abspath(APPLICANT_INFO['resume_path']))
        else:
            logging.warning("Could not find resume upload field")

        # Find and fill cover letter
        cover_letter = APPLICANT_INFO['cover_letter'].format(
            position=job_info['title'],
            company=job_info.get('company', 'the company'),
            field=job_info.get('field', 'this field'),
            company_quality='innovation',
            company_value='excellence',
            relevant_experience='data analysis and software development'
        )
        
        cover_letter_field = find_field(driver, 'textarea', ['cover_letter', 'message', 'additional_info'])
        if cover_letter_field:
            cover_letter_field.clear()
            cover_letter_field.send_keys(cover_letter)
        else:
            logging.warning("Could not find cover letter field")

        # Find and click submit button
        submit_button = find_field(driver, 'submit', ['submit', 'apply', 'send', 'submit_application'])
        if submit_button:
            submit_button.click()
            time.sleep(5)  # Wait for submission to complete
            return True
        else:
            logging.warning("Could not find submit button")
            return False

    except Exception as e:
        logging.error(f"Error filling form: {str(e)}")
        return False

def apply_to_job(driver, job):
    """Apply to a specific job."""
    try:
        # Get platform from source
        platform = job['source'].lower()
        if platform not in PLATFORM_CONFIGS:
            logging.error(f"Unknown platform: {platform}")
            return False

        # Get full URL
        full_url = get_full_url(job['url'], platform)
        logging.info(f"Processing job: {job['title']} at {full_url}")

        # Check if already logged in
        if not is_logged_in(driver, platform):
            logging.error(f"Not logged in to {platform}")
            return False

        # Navigate to job URL
        driver.get(full_url)
        time.sleep(5)  # Wait for page to load

        # Click apply button if it exists
        try:
            apply_button = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, PLATFORM_CONFIGS[platform]['apply_button_selector']))
            )
            apply_button.click()
            time.sleep(3)  # Wait for application form to load
        except:
            logging.warning("Could not find apply button, trying to find form directly")

        # Fill out the application form
        if autofill_form(driver, job):
            logging.info(f"Successfully applied to {job['title']}")
            return True
        else:
            logging.error(f"Failed to apply to {job['title']}")
            return False

    except Exception as e:
        logging.error(f"Failed to apply to {job['title']}: {str(e)}")
        return False

def run_job_application_process():
    """Main function to run the job application process."""
    try:
        # Load jobs from JSON file
        with open('applied_jobs.json', 'r') as f:
            jobs_data = json.load(f)

        # Initialize the driver
        driver = setup_driver()

        # Process each job
        for job in jobs_data['applied_jobs']:
            if not job.get('applied', False):
                logging.info(f"\nProcessing job: {job['title']}")
                if apply_to_job(driver, job):
                    job['applied'] = True
                    job['applied_date'] = time.strftime('%Y-%m-%d %H:%M:%S')
                    # Save updated job status
                    with open('applied_jobs.json', 'w') as f:
                        json.dump(jobs_data, f, indent=2)

        driver.quit()
        logging.info("Job application process completed")

    except Exception as e:
        logging.error(f"Error in job application process: {str(e)}")
        if 'driver' in locals():
            driver.quit()

if __name__ == "__main__":
    run_job_application_process() 