import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
import os
import requests

def load_jobs():
    """Load jobs from the JSON file."""
    try:
        with open('code for automatic jobs/applied_jobs.json', 'r') as f:
            data = json.load(f)
            print('DEBUG: Loaded jobs data:', data)  # Debug print
            return data
    except FileNotFoundError:
        return {"applied_jobs": []}

def filter_new_jobs(jobs_data, days=14):
    """Filter jobs that are not yet applied to and within the last X days."""
    cutoff_date = datetime.now() - timedelta(days=days)
    new_jobs = []
    
    for job in jobs_data['applied_jobs']:
        if not job.get('applied', False):
            # If job has an applied_date, check if it's recent
            if 'applied_date' in job:
                job_date = datetime.strptime(job['applied_date'].split('T')[0], '%Y-%m-%d')
                if job_date >= cutoff_date:
                    new_jobs.append(job)
            else:
                new_jobs.append(job)
    
    return new_jobs

def is_valid_url(url):
    """Check if the URL is valid and accessible."""
    if not url.startswith(('http://', 'https://')):
        return False
    try:
        response = requests.head(url, allow_redirects=True, timeout=5)
        return response.status_code < 400
    except:
        return False

def create_email_content(jobs):
    """Create HTML email content from jobs."""
    html = """
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .job { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
            .job-title { color: #2c3e50; font-size: 18px; margin-bottom: 10px; }
            .job-company { color: #7f8c8d; margin-bottom: 5px; }
            .job-location { color: #95a5a6; margin-bottom: 5px; }
            .job-description { margin: 10px 0; }
            .job-link { color: #3498db; text-decoration: none; }
            .job-link:hover { text-decoration: underline; }
            .platform { background: #f8f9fa; padding: 3px 8px; border-radius: 3px; font-size: 12px; }
        </style>
    </head>
    <body>
        <h2>New Job Opportunities</h2>
        <p>Here are the new job opportunities from the last 14 days:</p>
    """
    
    for job in jobs:
        if is_valid_url(job['url']):
            html += f"""
            <div class="job">
                <div class="job-title">{job['title']}</div>
                <div class="job-company">{job.get('company', 'Company not specified')}</div>
                <div class="job-location">{job.get('location', 'Location not specified')}</div>
                <div class="job-description">{job.get('description', 'No description available')}</div>
                <div>
                    <span class="platform">{job['source']}</span>
                    <a href="{job['url']}" class="job-link" target="_blank">Apply Here</a>
                </div>
            </div>
            """
    
    html += """
    </body>
    </html>
    """
    return html

def send_email(jobs):
    """Send email with job listings."""
    if not jobs:
        print("No new jobs to send.")
        return

    # Email configuration
    sender_email = "jobkimani@gmail.com"
    receiver_email = "jobkimani@gmail.com"
    
    # Get password from environment variable
    password = os.getenv('GMAIL_APP_PASSWORD')
    
    if not password:
        print("""
        Please set up Gmail App Password:
        1. Go to your Google Account (https://myaccount.google.com)
        2. Click on 'Security'
        3. Enable 2-Step Verification if not already enabled
        4. Go back to Security and click on 'App Passwords'
        5. Select 'Mail' and 'Other (Custom name)'
        6. Name it 'Job Digest Script'
        7. Copy the 16-digit password
        8. Set it as an environment variable:
           export GMAIL_APP_PASSWORD='your-16-digit-app-password'
        """)
        return

    # Create message
    msg = MIMEMultipart('alternative')
    msg['Subject'] = f'Job Opportunities Digest - {datetime.now().strftime("%Y-%m-%d")}'
    msg['From'] = sender_email
    msg['To'] = receiver_email

    # Create HTML content
    html_content = create_email_content(jobs)
    msg.attach(MIMEText(html_content, 'html'))

    try:
        # Create secure connection with server and send email
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.login(sender_email, password)
        server.send_message(msg)
        server.quit()
        print("Email sent successfully!")
    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        print("\nIf you're getting authentication errors, please:")
        print("1. Make sure you've enabled 2-Step Verification")
        print("2. Generated an App Password")
        print("3. Set the GMAIL_APP_PASSWORD environment variable correctly")

def main():
    """Main function to run the job digest process."""
    # Load jobs
    jobs_data = load_jobs()
    
    # Filter new jobs
    new_jobs = filter_new_jobs(jobs_data)
    
    # Send email if there are new jobs
    if new_jobs:
        print(f"Found {len(new_jobs)} new jobs. Sending email...")
        send_email(new_jobs)
    else:
        print("No new jobs found.")

if __name__ == "__main__":
    main() 