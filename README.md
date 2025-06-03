# Automatic Job Application System

This project automates the process of job searching and application tracking. It includes scripts for scraping job listings, managing applications, and sending email digests of new opportunities.

## Features

- Job scraping from multiple sources
- Application tracking
- Email digest of new job opportunities
- URL validation for job listings

## Setup

1. Clone the repository:
```bash
git clone https://github.com/jobkimani/automatic-jobs.git
cd automatic-jobs
```

2. Create and activate a virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
export GMAIL_APP_PASSWORD='your-16-digit-app-password'
```

## Usage

1. Run the job scraper:
```bash
python job_scraper.py
```

2. Run the job digest:
```bash
python job_digest.py
```

## Configuration

- Update `applied_jobs.json` to track your job applications
- Configure email settings in `job_digest.py`
- Modify scraping parameters in `job_scraper.py`

## Security

- Never commit sensitive information like passwords or API keys
- Use environment variables for credentials
- Keep your Chrome profile and credentials files in .gitignore

## License

MIT License 
