# Job Scraper and Application Automation

This script automates the process of finding and applying to jobs on Kenyan job boards. It scrapes job listings, automatically fills out application forms, and tracks your applications in a local JSON file.

## Features

- Scrapes jobs from BrighterMonday Kenya
- Automatically fills application forms using Selenium
- Tracks applications in a local JSON file
- Runs weekly via scheduler
- Comprehensive logging system
- Error handling and retry mechanisms

## Prerequisites

- Python 3.x
- Chrome browser installed
- Internet connection

## Installation

1. Clone this repository or download the files
2. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

## Configuration

1. Open `job_scraper.py` and update the `APPLICANT_INFO` dictionary with your personal information:
   ```python
   APPLICANT_INFO = {
       "full_name": "Your Full Name",
       "email": "your.email@example.com",
       "phone": "+254700000000",
       "resume_path": "/path/to/your/resume.pdf",
       "cover_letter": "Your cover letter text..."
   }
   ```

2. Make sure your resume file exists at the specified path

## Usage

### One-time Run

To run the script once:

```bash
python job_scraper.py
```

### Weekly Scheduler

To run the script weekly:

1. Uncomment the `schedule_weekly()` line in `job_scraper.py`
2. Run the script:
   ```bash
   python job_scraper.py
   ```

The script will run every Monday at 9:00 AM.

## Files Generated

- `applied_jobs.json`: Tracks all applications made
- `job_scraper.log`: Contains detailed logs of the script's operation

## Customization

- Adjust `MAX_JOBS_PER_RUN` to change the number of jobs to apply for per run
- Modify the CSS selectors in `scrape_jobs()` if the job board's HTML structure changes
- Update form field names in `autofill_apply()` to match different application forms

## Troubleshooting

1. Check `job_scraper.log` for detailed error messages
2. Ensure Chrome is installed and up to date
3. Verify your internet connection
4. Make sure your resume file exists at the specified path

## Security Notes

- Keep your personal information secure
- Don't share your `applied_jobs.json` file as it contains your application history
- Consider using environment variables for sensitive information

## License

This project is open source and available under the MIT License. 