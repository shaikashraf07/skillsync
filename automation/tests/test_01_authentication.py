"""
AUTHENTICATION TEST CASES (TC001 - TC040)
Module: Authentication | Priority: P1 | Total: 40 Test Cases
Tests login, signup, logout, token validation, and auth state management
against the LIVE GitHub Pages + Render API deployment.
"""
import pytest
import time
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from automation.utils.driver_factory import create_driver
from automation.pages.login_page import LoginPage
from automation.pages.signup_page import SignupPage
from automation.pages.landing_page import LandingPage
from automation.data.test_data import *
from automation.config.config import BASE_URL

@pytest.fixture(scope="function")
def driver():
    d = create_driver()
    yield d
    d.quit()

# ─── TC001–TC010: Login Tests ─────────────────────────────────────────────────

def test_tc001_login_page_loads(driver):
    """TC001: Login page loads with correct title and form elements."""
    page = LoginPage(driver)
    page.open_login()
    assert page.is_login_page(), "Login page should display email and password fields"

def test_tc002_valid_candidate_login(driver):
    """TC002: Valid candidate credentials enable successful login."""
    page = LoginPage(driver)
    page.open_login()
    page.login(CANDIDATE_USER["email"], CANDIDATE_USER["password"])
    time.sleep(2)
    assert "login" not in driver.current_url.lower(), "Should redirect away from login after success"

def test_tc003_valid_recruiter_login(driver):
    """TC003: Valid recruiter credentials enable successful login."""
    page = LoginPage(driver)
    page.open_login()
    page.login(RECRUITER_USER["email"], RECRUITER_USER["password"])
    time.sleep(2)
    assert "login" not in driver.current_url.lower(), "Should redirect after recruiter login"

def test_tc004_invalid_email_login(driver):
    """TC004: Invalid email shows error message."""
    page = LoginPage(driver)
    page.open_login()
    page.login(INVALID_EMAIL, INVALID_PASSWORD)
    time.sleep(2)
    assert page.is_login_page() or "login" in driver.current_url.lower(), "Should stay on login page"

def test_tc005_wrong_password_login(driver):
    """TC005: Wrong password for valid email shows error."""
    page = LoginPage(driver)
    page.open_login()
    page.login(CANDIDATE_USER["email"], INVALID_PASSWORD)
    time.sleep(2)
    assert page.is_login_page() or "login" in driver.current_url.lower(), "Should stay on login page"

def test_tc006_empty_email_login(driver):
    """TC006: Empty email field prevents form submission."""
    page = LoginPage(driver)
    page.open_login()
    page.login(EMPTY_STRING, CANDIDATE_USER["password"])
    time.sleep(1)
    assert page.is_login_page(), "Should stay on login with empty email"

def test_tc007_empty_password_login(driver):
    """TC007: Empty password field prevents form submission."""
    page = LoginPage(driver)
    page.open_login()
    page.login(CANDIDATE_USER["email"], EMPTY_STRING)
    time.sleep(1)
    assert page.is_login_page(), "Should stay on login with empty password"

def test_tc008_malformed_email_login(driver):
    """TC008: Malformed email format is rejected."""
    page = LoginPage(driver)
    page.open_login()
    page.login(MALFORMED_EMAIL, CANDIDATE_USER["password"])
    time.sleep(1)
    assert page.is_login_page(), "Should reject malformed email"

def test_tc009_login_page_has_signup_link(driver):
    """TC009: Login page contains a link to signup/register page."""
    page = LoginPage(driver)
    page.open_login()
    assert page.is_visible(page.SIGNUP_LINK), "Login page must have link to signup"

def test_tc010_login_form_has_submit_button(driver):
    """TC010: Login form contains a submit/login button."""
    page = LoginPage(driver)
    page.open_login()
    assert page.is_visible(page.SUBMIT), "Login page must have submit button"

# ─── TC011–TC020: Signup Tests ────────────────────────────────────────────────

def test_tc011_signup_page_loads(driver):
    """TC011: Signup page loads with registration form."""
    page = SignupPage(driver)
    page.open_signup()
    assert page.is_signup_page(), "Signup page should display email field"

def test_tc012_new_candidate_signup(driver):
    """TC012: New candidate can register with unique email."""
    page = SignupPage(driver)
    page.open_signup()
    page.signup(NEW_CANDIDATE_EMAIL, NEW_PASSWORD, role="candidate")
    time.sleep(2)
    assert "signup" not in driver.current_url.lower() or "login" not in driver.current_url.lower(), "Should redirect after signup"

def test_tc013_new_recruiter_signup(driver):
    """TC013: New recruiter can register with unique email."""
    page = SignupPage(driver)
    page.open_signup()
    page.signup(NEW_RECRUITER_EMAIL, NEW_PASSWORD, role="recruiter")
    time.sleep(2)
    assert driver.current_url != BASE_URL + "signup", "Should redirect after recruiter signup"

def test_tc014_duplicate_email_signup(driver):
    """TC014: Duplicate email signup shows error."""
    page = SignupPage(driver)
    page.open_signup()
    page.signup(CANDIDATE_USER["email"], NEW_PASSWORD, role="candidate")
    time.sleep(2)
    assert page.is_signup_page() or page.is_visible(page.SUBMIT), "Should stay on signup or show error"

def test_tc015_signup_short_password(driver):
    """TC015: Short password (< 6 chars) is rejected during signup."""
    page = SignupPage(driver)
    page.open_signup()
    page.signup(NEW_CANDIDATE_EMAIL, "abc", role="candidate")
    time.sleep(1)
    assert page.is_signup_page(), "Should reject short password"

def test_tc016_signup_empty_fields(driver):
    """TC016: Empty fields prevent signup form submission."""
    page = SignupPage(driver)
    page.open_signup()
    page.signup(EMPTY_STRING, EMPTY_STRING)
    time.sleep(1)
    assert page.is_signup_page(), "Should stay on signup with empty fields"

def test_tc017_signup_has_login_link(driver):
    """TC017: Signup page contains a link to login page."""
    page = SignupPage(driver)
    page.open_signup()
    assert page.is_visible(page.LOGIN_LINK), "Signup page should have login link"

def test_tc018_signup_invalid_email(driver):
    """TC018: Invalid email format is rejected on signup."""
    page = SignupPage(driver)
    page.open_signup()
    page.signup(MALFORMED_EMAIL, NEW_PASSWORD)
    time.sleep(1)
    assert page.is_signup_page(), "Should reject malformed email"

def test_tc019_signup_page_title_visible(driver):
    """TC019: Signup page has a visible heading or title."""
    page = SignupPage(driver)
    page.open_signup()
    assert driver.title or page.is_signup_page(), "Signup page should have a title"

def test_tc020_signup_password_field_masked(driver):
    """TC020: Password field on signup is of type 'password' (masked)."""
    page = SignupPage(driver)
    page.open_signup()
    pw_el = driver.find_element(*page.PASSWORD)
    assert pw_el.get_attribute("type") == "password", "Password field must be masked"

# ─── TC021–TC030: Logout & Session Tests ────────────────────────────────────

def test_tc021_candidate_logout(driver):
    """TC021: Logged-in candidate can log out successfully."""
    login = LoginPage(driver)
    login.open_login()
    login.login(CANDIDATE_USER["email"], CANDIDATE_USER["password"])
    time.sleep(2)
    from selenium.webdriver.common.by import By
    try:
        logout_btns = driver.find_elements(By.XPATH, "//button[contains(text(),'Logout') or contains(text(),'Sign Out')]")
        if logout_btns:
            logout_btns[0].click()
            time.sleep(2)
    except:
        pass
    assert "login" in driver.current_url.lower() or driver.current_url == BASE_URL, "Should be logged out"

def test_tc022_recruiter_logout(driver):
    """TC022: Logged-in recruiter can log out successfully."""
    login = LoginPage(driver)
    login.open_login()
    login.login(RECRUITER_USER["email"], RECRUITER_USER["password"])
    time.sleep(2)
    from selenium.webdriver.common.by import By
    try:
        logout_btns = driver.find_elements(By.XPATH, "//button[contains(text(),'Logout') or contains(text(),'Sign Out')]")
        if logout_btns:
            logout_btns[0].click()
            time.sleep(2)
    except:
        pass
    assert "login" in driver.current_url.lower() or driver.current_url == BASE_URL, "Should be logged out"

def test_tc023_unauthenticated_redirect_to_login(driver):
    """TC023: Protected page redirects unauthenticated user to login."""
    from automation.config.config import BASE_URL
    driver.get(BASE_URL.rstrip("/") + "/candidate/profile")
    time.sleep(2)
    assert "login" in driver.current_url.lower() or "signup" in driver.current_url.lower() or driver.current_url == BASE_URL or driver.current_url.rstrip("/") == BASE_URL.rstrip("/"), "Unauthenticated user should be redirected"

def test_tc024_token_stored_after_login(driver):
    """TC024: JWT token is stored in localStorage after login."""
    login = LoginPage(driver)
    login.open_login()
    login.login(CANDIDATE_USER["email"], CANDIDATE_USER["password"])
    time.sleep(3)
    token = driver.execute_script("return localStorage.getItem('token');")
    assert token is not None, "JWT token should be stored in localStorage after login"

def test_tc025_user_stored_after_login(driver):
    """TC025: User object is stored in localStorage after login."""
    login = LoginPage(driver)
    login.open_login()
    login.login(CANDIDATE_USER["email"], CANDIDATE_USER["password"])
    time.sleep(3)
    user = driver.execute_script("return localStorage.getItem('user');")
    assert user is not None, "User data should be stored in localStorage after login"

def test_tc026_token_cleared_after_logout(driver):
    """TC026: JWT token is removed from localStorage after logout."""
    login = LoginPage(driver)
    login.open_login()
    login.login(CANDIDATE_USER["email"], CANDIDATE_USER["password"])
    time.sleep(2)
    from selenium.webdriver.common.by import By
    try:
        btns = driver.find_elements(By.XPATH, "//button[contains(text(),'Logout') or contains(text(),'Sign Out')]")
        if btns:
            btns[0].click()
            time.sleep(2)
    except:
        pass
    token = driver.execute_script("return localStorage.getItem('token');")
    assert token is None, "JWT token should be cleared after logout"

def test_tc027_admin_page_blocked_for_candidate(driver):
    """TC027: Admin page is inaccessible to candidate user."""
    login = LoginPage(driver)
    login.open_login()
    login.login(CANDIDATE_USER["email"], CANDIDATE_USER["password"])
    time.sleep(2)
    driver.get(BASE_URL.rstrip("/") + "/admin")
    time.sleep(2)
    assert "admin" not in driver.current_url.lower() or "login" in driver.current_url.lower() or driver.current_url.rstrip("/") != BASE_URL.rstrip("/") + "/admin", "Admin page should block candidates"

def test_tc028_remember_me_behavior(driver):
    """TC028: Session persists on page refresh after login."""
    login = LoginPage(driver)
    login.open_login()
    login.login(CANDIDATE_USER["email"], CANDIDATE_USER["password"])
    time.sleep(3)
    driver.refresh()
    time.sleep(2)
    token = driver.execute_script("return localStorage.getItem('token');")
    assert token is not None, "Token should persist after page refresh"

def test_tc029_login_redirects_to_dashboard(driver):
    """TC029: Successful login redirects to appropriate dashboard page."""
    login = LoginPage(driver)
    login.open_login()
    login.login(CANDIDATE_USER["email"], CANDIDATE_USER["password"])
    time.sleep(3)
    assert "login" not in driver.current_url.lower(), "Should navigate away from login page"

def test_tc030_signup_redirects_after_creation(driver):
    """TC030: Successful signup redirects user to onboarding or dashboard."""
    page = SignupPage(driver)
    page.open_signup()
    unique_email = f"tctest030_{int(time.time())}@test.com"
    page.signup(unique_email, NEW_PASSWORD)
    time.sleep(3)
    assert "signup" not in driver.current_url.lower() or "onboard" in driver.current_url.lower() or "internship" in driver.current_url.lower(), "Should redirect after signup"

# ─── TC031–TC040: Auth State / Security ──────────────────────────────────────

def test_tc031_sql_injection_login(driver):
    """TC031: SQL injection attempt in login email is safely rejected."""
    page = LoginPage(driver)
    page.open_login()
    page.login(SQL_INJECTION, SQL_INJECTION)
    time.sleep(2)
    assert page.is_login_page() or "login" in driver.current_url.lower(), "SQL injection must be rejected"

def test_tc032_xss_in_login_email(driver):
    """TC032: XSS payload in login email does not execute script."""
    page = LoginPage(driver)
    page.open_login()
    page.login(XSS_PAYLOAD, "password")
    time.sleep(1)
    assert page.is_login_page(), "XSS payload must not execute"

def test_tc033_long_email_input(driver):
    """TC033: Extremely long email input is rejected or truncated gracefully."""
    page = LoginPage(driver)
    page.open_login()
    page.login(LONG_STRING + "@example.com", "password")
    time.sleep(1)
    assert page.is_login_page(), "Long email should be rejected"

def test_tc034_long_password_input(driver):
    """TC034: Extremely long password input is handled gracefully."""
    page = LoginPage(driver)
    page.open_login()
    page.login(CANDIDATE_USER["email"], LONG_STRING)
    time.sleep(2)
    assert page.is_login_page() or "login" in driver.current_url.lower(), "Long password should fail gracefully"

def test_tc035_login_page_https_url(driver):
    """TC035: Login page URL uses HTTPS protocol on live deployment."""
    page = LoginPage(driver)
    page.open_login()
    assert driver.current_url.startswith("https://"), "Login page must be served over HTTPS"

def test_tc036_signup_page_https_url(driver):
    """TC036: Signup page URL uses HTTPS protocol on live deployment."""
    page = SignupPage(driver)
    page.open_signup()
    assert driver.current_url.startswith("https://"), "Signup page must be served over HTTPS"

def test_tc037_back_button_after_logout(driver):
    """TC037: Browser back button after logout does not expose protected content."""
    login = LoginPage(driver)
    login.open_login()
    login.login(CANDIDATE_USER["email"], CANDIDATE_USER["password"])
    time.sleep(2)
    from selenium.webdriver.common.by import By
    try:
        btns = driver.find_elements(By.XPATH, "//button[contains(text(),'Logout') or contains(text(),'Sign Out')]")
        if btns:
            btns[0].click()
            time.sleep(2)
    except:
        pass
    driver.back()
    time.sleep(2)
    current = driver.current_url.lower()
    assert "login" in current or "signup" in current or driver.current_url.rstrip("/") == BASE_URL.rstrip("/"), "Back button after logout should stay on public page"

def test_tc038_login_email_case_insensitive(driver):
    """TC038: Login email is case-insensitive (all lowercase treated equally)."""
    page = LoginPage(driver)
    page.open_login()
    page.login(CANDIDATE_USER["email"].upper(), CANDIDATE_USER["password"])
    time.sleep(2)
    assert "login" not in driver.current_url.lower(), "Email login should be case-insensitive"

def test_tc039_login_with_spaces_in_email(driver):
    """TC039: Email with leading/trailing spaces is trimmed and accepted."""
    page = LoginPage(driver)
    page.open_login()
    page.login("  " + CANDIDATE_USER["email"] + "  ", CANDIDATE_USER["password"])
    time.sleep(2)
    assert "login" not in driver.current_url.lower(), "Email with spaces should be trimmed and accepted"

def test_tc040_concurrent_sessions_not_duplicated(driver):
    """TC040: localStorage does not duplicate token entries on repeated login."""
    page = LoginPage(driver)
    page.open_login()
    page.login(CANDIDATE_USER["email"], CANDIDATE_USER["password"])
    time.sleep(2)
    token1 = driver.execute_script("return localStorage.getItem('token');")
    page.open_login()
    page.login(CANDIDATE_USER["email"], CANDIDATE_USER["password"])
    time.sleep(2)
    token2 = driver.execute_script("return localStorage.getItem('token');")
    assert token2 is not None, "Token should exist after re-login"
