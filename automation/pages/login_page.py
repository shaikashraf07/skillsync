from selenium.webdriver.common.by import By
from automation.pages.base_page import BasePage

class LoginPage(BasePage):
    EMAIL = (By.CSS_SELECTOR, "input[type='email'], input[name='email'], #email")
    PASSWORD = (By.CSS_SELECTOR, "input[type='password'], input[name='password'], #password")
    SUBMIT = (By.CSS_SELECTOR, "button[type='submit']")
    ERROR_MSG = (By.CSS_SELECTOR, ".error, [role='alert'], .toast-error, [data-sonner-toast]")
    SIGNUP_LINK = (By.XPATH, "//a[contains(text(),'Sign') or contains(text(),'Register') or contains(text(),'Create')]")
    HEADING = (By.CSS_SELECTOR, "h1, h2, .heading")

    def open_login(self):
        self.open("/login")

    def login(self, email, password):
        self.type_text(self.EMAIL, email)
        self.type_text(self.PASSWORD, password)
        self.click(self.SUBMIT)

    def is_login_page(self):
        return self.is_visible(self.EMAIL) and self.is_visible(self.PASSWORD)

    def get_error(self):
        try:
            return self.get_text(self.ERROR_MSG)
        except:
            return ""

    def click_signup_link(self):
        self.click(self.SIGNUP_LINK)
