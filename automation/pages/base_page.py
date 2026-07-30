import os
import time
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from automation.config.config import BASE_URL, SCREENSHOTS_DIR

class BasePage:
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 15)

    def open(self, path=""):
        url = BASE_URL.rstrip("/") + "/" + path.lstrip("/")
        self.driver.get(url)

    def find(self, locator):
        return self.wait.until(EC.presence_of_element_located(locator))

    def click(self, locator):
        el = self.wait.until(EC.element_to_be_clickable(locator))
        el.click()

    def type_text(self, locator, text):
        el = self.find(locator)
        el.clear()
        el.send_keys(text)

    def get_text(self, locator):
        return self.find(locator).text

    def is_visible(self, locator):
        try:
            return self.wait.until(EC.visibility_of_element_located(locator)).is_displayed()
        except:
            return False

    def take_screenshot(self, name):
        os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
        filename = os.path.join(SCREENSHOTS_DIR, f"{name}_{int(time.time())}.png")
        self.driver.save_screenshot(filename)
        return filename
