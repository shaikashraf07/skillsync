from selenium.webdriver.common.by import By
from automation.pages.base_page import BasePage

class LandingPage(BasePage):
    HEADING = (By.CSS_SELECTOR, "h1")
    NAV_LOGIN = (By.XPATH, "//a[contains(text(),'Login') or contains(text(),'Sign In')]")
    NAV_SIGNUP = (By.XPATH, "//a[contains(text(),'Sign Up') or contains(text(),'Get Started') or contains(text(),'Register')]")
    CTA_BUTTON = (By.CSS_SELECTOR, "a.btn, a.button, button.btn, .cta, [class*='cta']")
    FOOTER = (By.CSS_SELECTOR, "footer")
    LOGO = (By.CSS_SELECTOR, "header img, .logo, nav img, header h1, header a")

    def open_landing(self):
        self.open("/")

    def is_landing_page(self):
        return self.driver.title != "" or self.is_visible(self.HEADING)

    def click_login(self):
        self.click(self.NAV_LOGIN)

    def click_signup(self):
        self.click(self.NAV_SIGNUP)

    def get_heading_text(self):
        try:
            return self.get_text(self.HEADING)
        except:
            return self.driver.title


class CandidateDashboardPage(BasePage):
    INTERNSHIPS_LINK = (By.XPATH, "//a[contains(text(),'Internship') or contains(@href,'internship')]")
    PROJECTS_LINK = (By.XPATH, "//a[contains(text(),'Project') or contains(@href,'project')]")
    PROFILE_LINK = (By.XPATH, "//a[contains(text(),'Profile') or contains(@href,'profile')]")
    LOGOUT_BTN = (By.XPATH, "//button[contains(text(),'Logout') or contains(text(),'Sign Out')]")
    POSTING_CARD = (By.CSS_SELECTOR, ".card, [class*='card'], article")
    SEARCH_INPUT = (By.CSS_SELECTOR, "input[type='search'], input[placeholder*='search'], input[placeholder*='Search']")

    def open_dashboard(self):
        self.open("/internships")

    def is_on_dashboard(self):
        return self.driver.current_url.find("internship") > -1 or self.driver.current_url.find("dashboard") > -1 or self.driver.current_url.find("project") > -1

    def get_posting_cards(self):
        try:
            return self.driver.find_elements(*self.POSTING_CARD)
        except:
            return []


class RecruiterDashboardPage(BasePage):
    POST_INTERNSHIP = (By.XPATH, "//a[contains(text(),'Post Internship') or contains(@href,'post')]")
    MANAGE_LINK = (By.XPATH, "//a[contains(text(),'Manage') or contains(@href,'manage')]")
    LOGOUT_BTN = (By.XPATH, "//button[contains(text(),'Logout') or contains(text(),'Sign Out')]")

    def open_dashboard(self):
        self.open("/recruiter")

    def is_on_recruiter_dashboard(self):
        return "recruiter" in self.driver.current_url or "post" in self.driver.current_url
