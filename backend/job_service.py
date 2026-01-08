import os
import requests

# 🔐 Use environment variable for API key
JSEARCH_API_KEY = os.getenv("JSEARCH_API_KEY") or "YOUR_RAPIDAPI_KEY"
JSEARCH_URL = "https://jsearch.p.rapidapi.com/search"

HEADERS = {
    "X-RapidAPI-Key": JSEARCH_API_KEY,
    "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
}

FALLBACK_TITLES = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Data Analyst",
    "Machine Learning Engineer"
]

def get_jobs(skills):
    if not skills:
        skills = []

    # Take top 2–3 skills to form query
    top_skills = skills[:3]

    # Try skills first
    jobs = fetch_jobs_from_api(top_skills)

    # If no jobs found, try fallback titles
    if not jobs:
        jobs = fetch_jobs_from_api(FALLBACK_TITLES)

    # Rank jobs purely based on skills
    ranked = rank_jobs(jobs, skills)
    return ranked


def fetch_jobs_from_api(query_list):
    """
    Fetch jobs from JSearch API using a list of keywords
    """
    jobs = []

    for query in query_list:
        params = {
            "query": query,
            "location": "India",  # can remove to expand results
            "num_pages": 1,
            "language": "en"
        }

        try:
            response = requests.get(JSEARCH_URL, headers=HEADERS, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            print(f"API Response for '{query}':", data)  # DEBUG

            api_jobs = data.get("data", [])
            if api_jobs:
                jobs.extend(api_jobs)

        except Exception as e:
            print("Job API Error:", e)

    # Remove duplicates based on job link
    seen = set()
    unique_jobs = []
    for job in jobs:
        link = job.get("job_apply_link")
        if link and link not in seen:
            unique_jobs.append(job)
            seen.add(link)

    return unique_jobs


def rank_jobs(jobs, skills):
    """Rank jobs purely based on skills matching"""
    ranked_jobs = []
    normalized_skills = normalize_skills(skills)

    for job in jobs:
        score = 0
        description = f"{job.get('job_title', '')} {job.get('job_description', '')}".lower()

        # Skill Matching only
        for skill in normalized_skills:
            if skill.lower() in description:
                score += 1  # 1 point per skill match

        ranked_jobs.append({
            "title": job.get("job_title"),
            "company": job.get("employer_name"),
            "location": job.get("job_city") or job.get("job_country"),
            "apply_link": job.get("job_apply_link"),
            "score": score
        })

    # Sort by skill match score
    ranked_jobs.sort(key=lambda x: x["score"], reverse=True)
    return ranked_jobs


def normalize_skills(skills):
    """Lowercase, strip, remove JS abbreviation noise"""
    cleaned = []
    for skill in skills:
        skill = skill.lower().strip()
        skill = skill.replace("js", "")  # optional: remove noisy abbreviation
        cleaned.append(skill)
    return list(set(cleaned))
