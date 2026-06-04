import os
import requests
from dotenv import load_dotenv

load_dotenv()

# ==========================
# JOOBLE API CONFIG
# ==========================
JOOBLE_API_KEY = os.getenv("JOOBLE_API_KEY")
JOOBLE_URL = f"https://jooble.org/api/{JOOBLE_API_KEY}"

# ==========================
# FALLBACK SEARCH TERMS
# ==========================
FALLBACK_TITLES = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Data Analyst",
    "Machine Learning Engineer"
]


# ==========================
# MAIN FUNCTION
# ==========================
def get_jobs(role, skills):
    """
    Fetch jobs based on detected role and skills
    """

    if not skills:
        skills = []

    queries = []

    # Search by role first
    if role:
        queries.append(role)

    # Add top skills
    queries.extend(skills[:5])

    print("\n========== RESUME ANALYSIS ==========")
    print("Role:", role)
    print("Skills:", skills)
    print("Search Queries:", queries)

    jobs = fetch_jobs_from_api(queries)

    if jobs:
        print("\nFIRST JOB FROM JOOBLE:")
        print(jobs[0])

    # Fallback if no jobs found
    if not jobs:
        print("No jobs found. Using fallback titles...")
        jobs = fetch_jobs_from_api(FALLBACK_TITLES)

    ranked_jobs = rank_jobs(
        jobs=jobs,
        skills=skills,
        role=role
    )

    return ranked_jobs


# ==========================
# FETCH JOBS FROM JOOBLE
# ==========================
def fetch_jobs_from_api(query_list):

    jobs = []

    for query in query_list:

        payload = {
            "keywords": query,
            "location": "India"
        }

        try:

            response = requests.post(
                JOOBLE_URL,
                json=payload,
                timeout=15
            )

            response.raise_for_status()

            data = response.json()

            api_jobs = data.get("jobs", [])

            print(f"\nQuery: {query}")
            print("Jobs Found:", len(api_jobs))

            jobs.extend(api_jobs)

        except Exception as e:

            print("Jooble API Error:", str(e))

    # Remove duplicates
    seen_links = set()
    unique_jobs = []

    for job in jobs:

        link = job.get("link")

        if link and link not in seen_links:

            unique_jobs.append(job)
            seen_links.add(link)

    print("\nTotal Unique Jobs:", len(unique_jobs))

    return unique_jobs


# ==========================
# JOB RANKING
# ==========================
def rank_jobs(jobs, skills, role):

    ranked_jobs = []

    normalized_skills = normalize_skills(skills)

    for job in jobs:

        score = 0
        matched_skills = []

        description = (
            f"{job.get('title', '')} "
            f"{job.get('snippet', '')}"
        ).lower()

        # ------------------
        # EXACT ROLE MATCH
        # ------------------
        if role and role.lower() in description:
            score += 15

        # ------------------
        # SKILL MATCH
        # ------------------
        for skill in normalized_skills:

            if skill in description:

                score += 5

                if skill not in matched_skills:
                    matched_skills.append(skill)

        # ------------------
        # MATCH %
        # ------------------
        total_skills = max(len(normalized_skills), 1)

        match_percentage = round(
            (len(matched_skills) / total_skills) * 100,
            2
        )

        ranked_jobs.append({
            "title": job.get("title"),
            "company": job.get("company"),
            "location": job.get("location"),
            "salary": job.get("salary"),
            "apply_link": job.get("link"),
            "description": job.get("snippet", ""),
            "matched_skills": matched_skills,
             "score": score,
            "match_percentage": match_percentage
        })

    ranked_jobs.sort(
        key=lambda x: (
            x["score"],
            x["match_percentage"]
        ),
        reverse=True
    )

    return ranked_jobs


# ==========================
# NORMALIZE SKILLS
# ==========================
def normalize_skills(skills):

    cleaned = []

    for skill in skills:

        skill = skill.lower().strip()

        cleaned.append(skill)

    return list(set(cleaned))