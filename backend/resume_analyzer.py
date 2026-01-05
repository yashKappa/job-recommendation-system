import re
import json
import spacy

nlp = spacy.load("en_core_web_sm")

with open("skills.json") as f:
    RAW_SKILLS = json.load(f)

def normalize(text):
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def skill_regex(skill):
    words = skill.split()
    return r"\b" + r"\s+".join(map(re.escape, words)) + r"\b"

def extract_experience(text):
    """
    Extract experience mentions like "2 years", "3 yrs", "5+ years", etc.
    Returns list of strings found in resume.
    """
    pattern = re.compile(r"(\d+)\+?\s*(years|yrs)", re.IGNORECASE)
    matches = pattern.findall(text)
    return [f"{m[0]} {m[1]}" for m in matches] if matches else []

def analyze_resume(text):
    clean_text = normalize(text)
    doc = nlp(clean_text)

    # Skills
    skills_found = []
    for skill in RAW_SKILLS:
        norm_skill = normalize(skill)
        pattern = skill_regex(norm_skill)
        if re.search(pattern, clean_text):
            skills_found.append(skill)

    # Email
    email_match = re.findall(
        r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text
    )
    email = email_match[0] if email_match else None

    # Keywords
    keywords = list({
        token.text
        for token in doc
        if token.pos_ in ["NOUN", "PROPN"] and not token.is_stop and len(token.text) > 2
    })[:20]

    # Locations
    locations = list({
        ent.text for ent in doc.ents if ent.label_ in ["GPE", "LOC"]
    })

    # Experience
    experience = extract_experience(text)

    return {
        "email": email,
        "skills": sorted(set(skills_found)),
        "keywords": keywords,
        "location": locations,
        "experience": experience  # now actual experience from resume
    }
