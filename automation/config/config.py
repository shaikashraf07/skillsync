import os

# Base URL for Live Deployment (Configurable via environment variable)
BASE_URL = os.getenv("BASE_URL", "https://shaikashraf07.github.io/skillsync/")

# Framework Directories
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES_DIR = os.path.join(ROOT_DIR, "pages")
TESTS_DIR = os.path.join(ROOT_DIR, "tests")
DATA_DIR = os.path.join(ROOT_DIR, "data")
UTILS_DIR = os.path.join(ROOT_DIR, "utils")
REPORTS_DIR = os.path.join(ROOT_DIR, "reports")
SCREENSHOTS_DIR = os.path.join(ROOT_DIR, "screenshots")
LOGS_DIR = os.path.join(ROOT_DIR, "logs")

# Browser Settings
HEADLESS = os.getenv("HEADLESS", "true").lower() == "true"
IMPLICIT_WAIT = int(os.getenv("IMPLICIT_WAIT", "10"))
EXPLICIT_WAIT = int(os.getenv("EXPLICIT_WAIT", "15"))

# Ensure directories exist
for path in [REPORTS_DIR, SCREENSHOTS_DIR, LOGS_DIR]:
    os.makedirs(path, exist_ok=True)
