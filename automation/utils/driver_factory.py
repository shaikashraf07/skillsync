from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from automation.config.config import HEADLESS

def create_driver():
    """
    Creates and returns a configured Selenium Headless Chrome WebDriver.
    """
    options = Options()
    if HEADLESS:
        options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--remote-allow-origins=*")
    options.set_capability("goog:loggingPrefs", {"browser": "ALL"})
    
    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(10)
    return driver
