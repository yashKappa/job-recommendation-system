import re
import json
import spacy
import os

# Load SpaCy model
nlp = spacy.load("en_core_web_sm")

# Load skills safely
SKILLS_PATH = os.path.join(os.path.dirname(__file__), "skills.json")

try:
    with open(SKILLS_PATH, "r", encoding="utf-8") as f:
        RAW_SKILLS = json.load(f)
except Exception as e:
    print(f"[ERROR] Failed to load skills.json: {e}")
    RAW_SKILLS = []

def infer_role(skills):
    skills = [s.lower() for s in skills]

    # MERN / Full Stack
    if (
        "react" in skills
        and "node.js" in skills
        and "mongodb" in skills
    ):
        return "Full Stack Developer"

    # Frontend
    if (
        "react" in skills
        or "angular" in skills
        or "vue" in skills
    ):
        return "Frontend Developer"

    # Backend
    if (
        "node.js" in skills
        or "express.js" in skills
        or "django" in skills
        or "spring boot" in skills
    ):
        return "Backend Developer"

    # Machine Learning
    if (
        "python" in skills
        and (
            "machine learning" in skills
            or "tensorflow" in skills
            or "pytorch" in skills
        )
    ):
        return "Machine Learning Engineer"

    # Data Analyst
    if (
        "sql" in skills
        and (
            "power bi" in skills
            or "tableau" in skills
            or "excel" in skills
        )
    ):
        return "Data Analyst"

    # App Support
    if (
        "sql" in skills
        and "linux" in skills
    ):
        return "Application Support Engineer"

    return "Software Engineer"
# ------------------ HELPERS ------------------

def normalize(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def skill_regex(skill: str) -> str:
    words = skill.split()
    return r"\b" + r"\s+".join(map(re.escape, words)) + r"\b"


def extract_experience(text: str):
    """
    Extract experience mentions like:
    - 2 years
    - 3 yrs
    - 5+ years
    """
    pattern = re.compile(r"(\d+)\+?\s*(years|yrs)", re.IGNORECASE)
    matches = pattern.findall(text)
    return [f"{m[0]} {m[1]}" for m in matches] if matches else []


# ------------------ MAIN ANALYZER ------------------

def analyze_resume(text: str):
    clean_resume_text = normalize(text)
    doc = nlp(clean_resume_text)

    # ----------- SKILLS EXTRACTION -----------
    skills_found = []
    for skill in RAW_SKILLS:
        norm_skill = normalize(skill)
        if not norm_skill:
            continue

        pattern = skill_regex(norm_skill)
        if re.search(pattern, clean_resume_text):
            skills_found.append(skill)

    skills_found = sorted(set(skills_found))
    role = infer_role(skills_found)

    # ----------- EMAIL EXTRACTION -----------
    email_match = re.findall(
        r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+",
        text
    )
    email = email_match[0] if email_match else None

    # ----------- KEYWORDS EXTRACTION -----------
    keywords = list({
        token.lemma_.lower()
        for token in doc
        if token.pos_ in ["NOUN", "PROPN"]
        and not token.is_stop
        and len(token.text) > 2
    })[:25]

    # ----------- LOCATION EXTRACTION -----------
    locations = list({
        ent.text
        for ent in doc.ents
        if ent.label_ in ["GPE", "LOC"]
    })

    # ----------- EXPERIENCE EXTRACTION -----------
    experience = extract_experience(text)

    # ----------- ANALYTICS METRICS (RESEARCH USE) -----------
    metrics = {
        "skills_count": len(skills_found),
        "keywords_count": len(keywords),
        "locations_count": len(locations),
        "experience_mentions": len(experience)
    }

    return {
    "role": role,
    "email": email,
    "skills": skills_found,
    "keywords": keywords,
    "location": locations,
    "experience": experience,
    "metrics": metrics
}
