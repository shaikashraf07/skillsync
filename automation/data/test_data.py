"""
SkillSync - Test Data Module
Contains credentials and test data for all E2E test suites.
"""
import os

# Base URL - always points to LIVE deployment
BASE_URL = os.getenv("BASE_URL", "https://shaikashraf07.github.io/skillsync/")

# Test Users
CANDIDATE_USER = {
    "email": "alice@example.com",
    "password": "password123",
    "name": "Alice Johnson",
    "role": "candidate"
}

CANDIDATE_USER_2 = {
    "email": "bob@example.com",
    "password": "password123",
    "name": "Bob Smith",
    "role": "candidate"
}

RECRUITER_USER = {
    "email": "recruiter1@techcorp.com",
    "password": "password123",
    "name": "TechCorp",
    "role": "recruiter"
}

RECRUITER_USER_2 = {
    "email": "recruiter2@startupai.com",
    "password": "password123",
    "name": "StartupAI",
    "role": "recruiter"
}

# Invalid Test Credentials
INVALID_EMAIL = "nonexistent@notadomain.com"
INVALID_PASSWORD = "wrong_password_123"
MALFORMED_EMAIL = "not-an-email"
EMPTY_STRING = ""
SQL_INJECTION = "' OR '1'='1"
XSS_PAYLOAD = "<script>alert('xss')</script>"
LONG_STRING = "A" * 300

# New Account for Signup Tests (unique per run)
import time
TS = int(time.time())
NEW_CANDIDATE_EMAIL = f"testcandidate_{TS}@example.com"
NEW_RECRUITER_EMAIL = f"testrecruiter_{TS}@example.com"
NEW_PASSWORD = "TestPass@123"

# Page URLs
PAGES = {
    "landing": "/",
    "login": "/login",
    "signup": "/signup",
    "internships": "/internships",
    "projects": "/projects",
    "candidate_profile": "/candidate/profile",
    "recruiter_dashboard": "/recruiter",
    "admin_dashboard": "/admin",
    "not_found": "/this-page-does-not-exist-at-all",
}

# Posting Form Data
INTERNSHIP_DATA = {
    "title": "Frontend Developer Intern",
    "description": "Build and maintain React components for our main product. Work with a cross-functional team.",
    "type": "INTERNSHIP",
    "stipend": "5000",
    "duration": "3 months",
    "skills": ["React", "TypeScript", "CSS"],
    "deadline": "2026-12-31"
}

PROJECT_DATA = {
    "title": "AI Resume Parser Project",
    "description": "Develop a Python-based resume parsing microservice using NLP and spaCy.",
    "type": "PROJECT",
    "skills": ["Python", "spaCy", "FastAPI"],
    "deadline": "2026-12-31"
}
