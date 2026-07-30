"""
SkillSync Selenium E2E — Pytest Conftest
Provides fixtures, screenshot-on-failure hooks, and test metadata collection.
"""
import pytest
import os
import time
import json
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from automation.config.config import SCREENSHOTS_DIR, LOGS_DIR


# ─── Screenshot on Failure Hook ─────────────────────────────────────────────

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Capture screenshot on test failure for any test that has a 'driver' fixture."""
    outcome = yield
    report = outcome.get_result()

    if report.when == "call" and report.failed:
        driver = None
        # Try to find driver from fixture
        if "driver" in item.funcargs:
            driver = item.funcargs["driver"]
        elif "auth_driver" in item.funcargs:
            driver = item.funcargs["auth_driver"]
        elif "logged_in_driver" in item.funcargs:
            driver = item.funcargs["logged_in_driver"]
        elif "recruiter_driver" in item.funcargs:
            driver = item.funcargs["recruiter_driver"]

        if driver is not None:
            try:
                os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
                test_name = item.name.replace("[", "_").replace("]", "_")
                screenshot_path = os.path.join(
                    SCREENSHOTS_DIR, f"FAIL_{test_name}_{int(time.time())}.png"
                )
                driver.save_screenshot(screenshot_path)
                print(f"\n📸 Screenshot saved: {screenshot_path}")
            except Exception as e:
                print(f"\n⚠️ Screenshot failed: {e}")


# ─── Test Execution Metadata Collection ──────────────────────────────────────

test_execution_log = []


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_protocol(item, nextitem):
    """Track execution time and result for each test."""
    start_time = time.time()
    outcome = yield
    elapsed = round(time.time() - start_time, 3)

    test_execution_log.append({
        "name": item.name,
        "nodeid": item.nodeid,
        "duration": elapsed,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime()),
    })


def pytest_sessionfinish(session, exitstatus):
    """Write execution metadata log after all tests complete."""
    os.makedirs(LOGS_DIR, exist_ok=True)
    log_path = os.path.join(LOGS_DIR, f"execution_metadata_{int(time.time())}.json")
    try:
        with open(log_path, "w") as f:
            json.dump({
                "total_tests": len(test_execution_log),
                "exit_status": exitstatus,
                "tests": test_execution_log,
            }, f, indent=2)
        print(f"\n📋 Execution metadata saved: {log_path}")
    except Exception as e:
        print(f"\n⚠️ Failed to save metadata: {e}")


# ─── Custom Markers Registration ─────────────────────────────────────────────

def pytest_configure(config):
    """Register custom markers to avoid warnings."""
    config.addinivalue_line("markers", "authentication: Authentication test cases")
    config.addinivalue_line("markers", "navigation: Navigation test cases")
    config.addinivalue_line("markers", "ui: UI validation test cases")
    config.addinivalue_line("markers", "forms: Forms test cases")
    config.addinivalue_line("markers", "crud: CRUD operation test cases")
    config.addinivalue_line("markers", "validation: Input validation test cases")
    config.addinivalue_line("markers", "error_handling: Error handling test cases")
    config.addinivalue_line("markers", "regression: Regression test cases")
    config.addinivalue_line("markers", "security: Security test cases")
    config.addinivalue_line("markers", "performance: Performance smoke test cases")
