import requests
from bs4 import BeautifulSoup
import json
import time
import logging
from datetime import datetime
import re

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('job_scraper.log'),
        logging.StreamHandler()
    ]
)

# Constants
JOB_BOARDS = {
    'BrighterMonday': 'https://www.brightermonday.co.ke/jobs',
    'LinkedIn': 'https://www.linkedin.com/jobs/search/?keywords=junior%20data%20science&location=Kenya',
    'Fuzu': 'https://www.fuzu.com/jobs?search=junior%20data%20science&location=kenya',
    'MyJobsMag': 'https://www.myjobmag.co.ke/jobs-by-title/data-analyst'
}

APPLICATION_TRACKER_FILE = 'applied_jobs.json'
MAX_JOBS_PER_RUN = 10
LOG_FILE = 'job_scraper.log'

# Applicant information
APPLICANT_INFO = {
    'full_name': 'Job Kimani',
    'email': 'jobkimani@gmail.com',
    'phone': '+254 711 216022',
    'resume_path': '/Users/jobkimani/Library/CloudStorage/OneDrive-Personal/JOB/personal stuff/job application/Job K cv and CERTS/CV/20230709 JOB KIMANI CV for Data Analyst and Data Entry Roles.docx',
    'cover_letter': """
    Dear Hiring Manager,

    I am writing to express my interest in the [Position] role at [Company]. With my background in data analysis and strong analytical skills, I am confident in my ability to contribute effectively to your team.

    My experience includes:
    - Data analysis and visualization
    - Statistical analysis and reporting
    - Database management and SQL
    - Python programming
    - Business intelligence tools

    I am particularly drawn to [Company] because of its innovative approach to [specific company attribute] and commitment to [specific company value].

    Thank you for considering my application. I look forward to discussing how my skills and experience align with your needs.

    Best regards,
    Job Kimani
    """
}

def load_applied_jobs():
    """Load previously applied jobs from JSON file."""
    try:
        with open(APPLICATION_TRACKER_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {'applied_jobs': []}
    except json.JSONDecodeError:
        logging.error(f"Error reading {APPLICATION_TRACKER_FILE}")
        return {'applied_jobs': []}

def save_applied_jobs(data):
    """Save applied jobs to JSON file."""
    try:
        with open(APPLICATION_TRACKER_FILE, 'w') as f:
            json.dump(data, f, indent=4)
    except Exception as e:
        logging.error(f"Error saving to {APPLICATION_TRACKER_FILE}: {str(e)}")

def is_junior_or_entry_level(title):
    """Check if job title indicates junior or entry level position."""
    junior_keywords = ['junior', 'entry', 'entry-level', 'trainee', 'graduate', 'intern']
    return any(keyword in title.lower() for keyword in junior_keywords)

def get_all_links_and_titles(soup, board_name):
    # Try to get all links with visible text
    jobs = []
    for a in soup.find_all('a', href=True):
        text = a.get_text(strip=True)
        href = a['href']
        if text and len(text) > 5 and 'job' in href:
            jobs.append({'title': text, 'url': href, 'source': board_name})
    return jobs

def filter_jobs_by_keywords(jobs, keywords=None):
    if keywords is None:
        keywords = ['junior', 'entry', 'trainee', 'graduate', 'intern', 'data', 'analyst', 'science']
    filtered = []
    for job in jobs:
        title = job['title'].lower()
        if any(k in title for k in keywords):
            filtered.append(job)
    return filtered

def scrape_board_generic(board_name, url):
    jobs = []
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        jobs = get_all_links_and_titles(soup, board_name)
        logging.info(f"{board_name}: {len(jobs)} links scraped (unfiltered)")
        # Save all found jobs for debug
        with open(f'debug_{board_name.lower()}.json', 'w') as f:
            json.dump(jobs, f, indent=2)
    except Exception as e:
        logging.error(f"Error scraping {board_name}: {str(e)}")
    return jobs

def scrape_all_jobs():
    all_jobs = []
    for board, url in JOB_BOARDS.items():
        jobs = scrape_board_generic(board, url)
        all_jobs.extend(jobs)
    logging.info(f"Total jobs scraped from all boards (unfiltered): {len(all_jobs)}")
    # Save all jobs for debug
    with open('debug_all_jobs.json', 'w') as f:
        json.dump(all_jobs, f, indent=2)
    # Now filter
    filtered = filter_jobs_by_keywords(all_jobs)
    logging.info(f"Total jobs after filtering: {len(filtered)}")
    return filtered

def run_job_application_process():
    """Main process to scrape and track jobs."""
    logging.info("Starting job application process")
    
    # Load previously applied jobs
    applied_jobs = load_applied_jobs()
    
    # Scrape new jobs
    new_jobs = scrape_all_jobs()
    
    # Filter out already applied jobs
    new_jobs = [job for job in new_jobs if job['url'] not in [j['url'] for j in applied_jobs['applied_jobs']]]
    
    if not new_jobs:
        logging.warning("No new jobs found to apply for.")
        return
    
    # Process new jobs
    for job in new_jobs[:MAX_JOBS_PER_RUN]:
        logging.info(f"Found job: {job['title']} at {job.get('company', 'N/A')}")
        
        # Add to applied jobs
        applied_jobs['applied_jobs'].append({
            'title': job['title'],
            'company': job.get('company', 'N/A'),
            'url': job['url'],
            'source': job['source'],
            'applied_date': datetime.now().isoformat()
        })
        
        # Save after each job
        save_applied_jobs(applied_jobs)
        
        # Add delay between jobs
        time.sleep(2)

if __name__ == "__main__":
    run_job_application_process() 