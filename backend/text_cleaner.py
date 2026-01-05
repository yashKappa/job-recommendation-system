import re
from wordsegment import load, segment

load()

def clean_text(text):
    # Remove special characters
    text = re.sub(r'[^a-zA-Z ]', ' ', text)

    final_words = []
    for word in text.split():
        # Split merged words only if very long
        if len(word) > 15:
            final_words.extend(segment(word.lower()))
        else:
            final_words.append(word.lower())

    return " ".join(final_words)
