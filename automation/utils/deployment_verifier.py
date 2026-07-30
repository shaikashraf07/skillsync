import urllib.request
import urllib.error
import time
import sys
from automation.config.config import BASE_URL

def verify_deployment(url=BASE_URL, timeout_seconds=60, retry_interval=5):
    """
    Verifies that the deployed web application is live, returns HTTP 200,
    and assets are properly served before executing Selenium E2E tests.
    """
    print(f"====================================================")
    print(f"VERIFYING DEPLOYMENT AVAILABILITY")
    print(f"Target URL: {url}")
    print(f"====================================================")
    
    start_time = time.time()
    attempts = 0
    
    while time.time() - start_time < timeout_seconds:
        attempts += 1
        try:
            req = urllib.request.Request(
                url, 
                headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SkillSync-Verifier/1.0'}
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                status = response.getcode()
                content = response.read().decode('utf-8', errors='ignore')
                
                if status == 200 and ("SkillSync" in content or "<div id=\"root\">" in content or "<html" in content):
                    print(f"🟢 [SUCCESS] Deployment is LIVE and responding with HTTP {status}.")
                    print(f"   Response payload verified (Length: {len(content)} bytes).")
                    return True
                else:
                    print(f"🟡 Attempt {attempts}: Received HTTP {status}, payload pending full render. Retrying in {retry_interval}s...")
        except urllib.error.HTTPError as e:
            print(f"🟡 Attempt {attempts}: HTTP Error {e.code} ({e.reason}). Retrying in {retry_interval}s...")
        except urllib.error.URLError as e:
            print(f"🟡 Attempt {attempts}: URL Error ({e.reason}). Retrying in {retry_interval}s...")
        except Exception as e:
            print(f"🟡 Attempt {attempts}: Exception ({str(e)}). Retrying in {retry_interval}s...")
            
        time.sleep(retry_interval)
        
    print(f"🔴 [FAILURE] Deployment verification timed out after {timeout_seconds}s for {url}.")
    return False

if __name__ == "__main__":
    success = verify_deployment()
    sys.exit(0 if success else 1)
