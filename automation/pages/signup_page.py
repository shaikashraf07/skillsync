from selenium.webdriver.common.by import By
from automation.pages.base_page import BasePage

class SignupPage(BasePage):
    EMAIL = (By.CSS_SELECTOR, "input[type='email'], input[name='email'], #email")
    PASSWORD = (By.CSS_SELECTOR, "input[type='password'], input[name='password']")
    SUBMIT = (By.CSS_SELECTOR, "button[type='submit']")
    CANDIDATE_ROLE = (By.XPATH, "//label[contains(.,'Candidate')] | //button[contains(.,'Candidate')]")
    RECRUITER_ROLE = (By.XPATH, "//label[contains(.,'Recruiter')] | //button[contains(.,'Recruiter')]")
    LOGIN_LINK = (By.XPATH, "//a[contains(text(),'Login') or contains(text(),'Sign in')]")

    def open_signup(self):
        self.open("/signup")

    def signup(self, email, password, role="candidate"):
        self.type_text(self.EMAIL, email)
        self.type_text(self.PASSWORD, password)
        if role == "recruiter":
            try:
                self.click(self.RECRUITER_ROLE)
            except:
                pass
        else:
            try:
                self.click(self.CANDIDATE_ROLE)
            except:
                pass
        self.click(self.SUBMIT)

    def is_signup_page(self):
        return self.is_visible(self.EMAIL)
