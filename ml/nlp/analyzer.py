"""
NLP Analyzer — Extracts tone, priorities, and pain points from prospect text.
Uses spaCy for NER and HuggingFace for sentiment/tone classification.
"""
import spacy

nlp = spacy.load("en_core_web_sm")

def extract_profile(text: str) -> dict:
    """
    Given raw text from LinkedIn bio / website / GitHub,
    return a structured behavioral profile.
    """
    doc = nlp(text)
    
    return {
        "tone": detect_tone(text),
        "priorities": extract_priorities(doc),
        "pain_points": extract_pain_points(doc),
        "communication_style": detect_style(text),
        "keywords": [token.text for token in doc if token.is_alpha and not token.is_stop]
    }

def detect_tone(text: str) -> str:
    # TODO: implement tone classifier
    return "analytical"

def extract_priorities(doc) -> list:
    # TODO: extract priority signals from named entities + verbs
    return []

def extract_pain_points(doc) -> list:
    # TODO: extract pain point signals
    return []

def detect_style(text: str) -> str:
    # TODO: formal / casual / technical / visionary
    return "professional"
