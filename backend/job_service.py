import os
import re
import requests

from dotenv import load_dotenv
from collections import Counter

from semantic_matcher import calculate_similarity
from analyzer import RAW_SKILLS

load_dotenv()

# =====================================
# JOOBLE CONFIG
# =====================================

JOOBLE_API_KEY = os.getenv("JOOBLE_API_KEY")
JOOBLE_URL = f"https://jooble.org/api/{JOOBLE_API_KEY}"

# =====================================
# FALLBACK SEARCH TERMS
# =====================================

FALLBACK_TITLES = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Data Analyst",
    "Machine Learning Engineer"
]


# =====================================
# MAIN FUNCTION
# =====================================

def get_jobs(role, skills, resume_text):

    if not skills:
        skills = []

    queries = []

    # Search role first
    if role:
        queries.append(role)

    # Search top skills
    queries.extend(skills[:5])

    print("\n========== RESUME ==========")
    print("Role:", role)
    print("Skills:", skills)

    jobs = fetch_jobs_from_api(queries)

    if not jobs:
        print("Using fallback titles...")
        jobs = fetch_jobs_from_api(FALLBACK_TITLES)

    ranked_jobs = rank_jobs(
        jobs,
        skills,
        role,
        resume_text
    )

    skill_gap_analysis = get_market_skill_gaps(
        jobs,
        skills
    )

    return {
        "jobs": ranked_jobs,
        "skill_gap_analysis": skill_gap_analysis
    }


# =====================================
# FETCH JOOBS FROM JOOBLE
# =====================================

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

            print(f"{query} -> {len(api_jobs)} jobs")

            jobs.extend(api_jobs)

        except Exception as e:

            print("Jooble Error:", e)

    # Remove duplicates

    seen = set()
    unique_jobs = []

    for job in jobs:

        link = job.get("link")

        if link and link not in seen:

            unique_jobs.append(job)
            seen.add(link)

    print("Unique Jobs:", len(unique_jobs))

    return unique_jobs


# =====================================
# RANK JOBS
# =====================================

def rank_jobs(
    jobs,
    skills,
    role,
    resume_text
):

    ranked_jobs = []

    normalized_skills = normalize_skills(skills)

    for job in jobs:

        description = (
            f"{job.get('title','')} "
            f"{job.get('snippet','')}"
        ).lower()

        matched_skills = []

        score = 0

        # -----------------
        # ROLE MATCH
        # -----------------

        if role and role.lower() in description:
            score += 15

        # -----------------
        # SKILL MATCH
        # -----------------

        for skill in normalized_skills:

            if skill in description:

                score += 5

                matched_skills.append(skill)

        # -----------------
        # AI SEMANTIC MATCH
        # -----------------

        semantic_score = calculate_similarity(
            resume_text,
            description
        )

        semantic_percentage = round(
            semantic_score * 100,
            2
        )

        # -----------------
        # MATCH %
        # -----------------

        total_skills = max(
            len(normalized_skills),
            1
        )

        match_percentage = round(
            (len(matched_skills) / total_skills) * 100,
            2
        )

        # -----------------
        # FINAL SCORE
        # -----------------

        final_score = (
            score * 0.4
        ) + (
            semantic_percentage * 0.6
        )

        ranked_jobs.append({
            "title": job.get("title"),
            "company": job.get("company"),
            "location": job.get("location"),
            "salary": job.get("salary") or "N/A",
            "apply_link": job.get("link"),
            "description": job.get("snippet", ""),
            "matched_skills": matched_skills,
            "semantic_score": semantic_percentage,
            "match_percentage": match_percentage,
            "score": round(final_score, 2)
        })

    ranked_jobs.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return ranked_jobs


# =====================================
# SKILL GAP ANALYSIS
# =====================================

def get_market_skill_gaps(
    jobs,
    user_skills
):

    all_text = ""

    for job in jobs:

        all_text += (
            job.get("title", "") +
            " " +
            job.get("snippet", "")
        ).lower()

    skill_counter = Counter()

    # Detect skills from jobs

    for skill in RAW_SKILLS:

        pattern = rf"\b{re.escape(skill.lower())}\b"

        matches = re.findall(
            pattern,
            all_text
        )

        if matches:
            skill_counter[skill] = len(matches)

    top_market_skills = skill_counter.most_common(20)

    user_skill_set = {
        skill.lower()
        for skill in user_skills
    }

    missing_skills = []

    for skill, count in top_market_skills:

        if skill.lower() not in user_skill_set:

            missing_skills.append({
                "skill": skill,
                "demand": count
            })

    return {
        "market_skills": [
            {
                "skill": skill,
                "demand": count
            }
            for skill, count in top_market_skills
        ],

        "missing_skills": missing_skills[:10]
    }


# =====================================
# NORMALIZE SKILLS
# =====================================

def normalize_skills(skills):

    return list({
        skill.lower().strip()
        for skill in skills
    })