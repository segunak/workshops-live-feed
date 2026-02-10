"""
Live Feed API Tests - Python
Tests POST, GET, and DELETE endpoints.
Cleans up after itself using the DELETE endpoint.
"""

import requests
import os
import sys
from datetime import datetime

# Configuration from environment
BASE_URL = os.getenv("LIVE_FEED_URL", "https://live.segunakinyemi.com")
ADMIN_KEY = os.getenv("ADMIN_KEY", "")

# ADMIN_KEY is required for all test operations
if not ADMIN_KEY:
    print("ERROR: ADMIN_KEY environment variable is required")
    sys.exit(1)

POST_URL = f"{BASE_URL}/api/post"
POSTS_URL = f"{BASE_URL}/api/posts"
DELETE_URL = f"{BASE_URL}/api/delete"

# Track test results
tests_passed = 0
tests_failed = 0
created_post_id = None


def log_test(name, passed, details=""):
    global tests_passed, tests_failed
    if passed:
        tests_passed += 1
        print(f"  ✓ {name}")
    else:
        tests_failed += 1
        print(f"  ✗ {name}")
        if details:
            print(f"    → {details}")


def test_post_valid():
    """Test: POST with valid data should return 200 and an id"""
    global created_post_id
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    data = {
        "Name": "GitHub Actions (Python)",
        "Message": f"CI test at {timestamp}",
        "Workshop": "CI Test",
        "Tags": "ci, automated, python",
        "WorkshopKey": ADMIN_KEY
    }
    
    try:
        response = requests.post(POST_URL, json=data, timeout=30)
        result = response.json()
        
        if response.status_code == 200 and result.get("success") and result.get("id"):
            created_post_id = result["id"]
            log_test("POST valid data → 200 + id", True)
            return True
        else:
            log_test("POST valid data → 200 + id", False, f"Got {response.status_code}: {result}")
            return False
    except Exception as e:
        log_test("POST valid data → 200 + id", False, str(e))
        return False


def test_post_invalid_key():
    """Test: POST with invalid WorkshopKey should return 401"""
    data = {
        "Name": "Test",
        "Message": "Should fail",
        "Workshop": "CI Test",
        "WorkshopKey": "wrong-key"
    }
    
    try:
        response = requests.post(POST_URL, json=data, timeout=30)
        
        if response.status_code == 401:
            log_test("POST invalid key → 401", True)
            return True
        else:
            log_test("POST invalid key → 401", False, f"Got {response.status_code}")
            return False
    except Exception as e:
        log_test("POST invalid key → 401", False, str(e))
        return False


def test_get_valid_id():
    """Test: GET with valid id should return the post"""
    if not created_post_id:
        log_test("GET valid id → 200 + post", False, "No post id available")
        return False
    
    try:
        url = f"{POSTS_URL}?id={created_post_id}&WorkshopKey={ADMIN_KEY}"
        response = requests.get(url, timeout=30)
        result = response.json()
        
        if response.status_code == 200 and result.get("success") and result.get("post"):
            post = result["post"]
            if post.get("id") == created_post_id:
                log_test("GET valid id → 200 + post", True)
                return True
            else:
                log_test("GET valid id → 200 + post", False, f"ID mismatch: {post.get('id')}")
                return False
        else:
            log_test("GET valid id → 200 + post", False, f"Got {response.status_code}: {result}")
            return False
    except Exception as e:
        log_test("GET valid id → 200 + post", False, str(e))
        return False


def test_get_invalid_id():
    """Test: GET with invalid id should return 404"""
    try:
        url = f"{POSTS_URL}?id=recINVALID123&WorkshopKey={ADMIN_KEY}"
        response = requests.get(url, timeout=30)
        
        if response.status_code == 404:
            log_test("GET invalid id → 404", True)
            return True
        else:
            log_test("GET invalid id → 404", False, f"Got {response.status_code}")
            return False
    except Exception as e:
        log_test("GET invalid id → 404", False, str(e))
        return False


def test_get_by_tag():
    """Test: GET with tag should return posts containing that tag"""
    try:
        url = f"{POSTS_URL}?tag=python&WorkshopKey={ADMIN_KEY}"
        response = requests.get(url, timeout=30)
        result = response.json()
        
        if response.status_code == 200 and result.get("success"):
            # Just verify we get a valid response structure
            if "posts" in result and "count" in result and "tag" in result:
                log_test("GET by tag → 200 + posts", True)
                return True
            else:
                log_test("GET by tag → 200 + posts", False, f"Missing fields: {result}")
                return False
        else:
            log_test("GET by tag → 200 + posts", False, f"Got {response.status_code}: {result}")
            return False
    except Exception as e:
        log_test("GET by tag → 200 + posts", False, str(e))
        return False


def test_delete_cleanup():
    """Test: DELETE should remove the test post"""
    if not created_post_id:
        log_test("DELETE cleanup", False, "No post id to delete")
        return False
    
    try:
        url = f"{DELETE_URL}?id={created_post_id}&AdminKey={ADMIN_KEY}"
        response = requests.delete(url, timeout=30)
        result = response.json()
        
        if response.status_code == 200 and result.get("success"):
            log_test("DELETE cleanup", True)
            return True
        else:
            log_test("DELETE cleanup", False, f"Got {response.status_code}: {result}")
            return False
    except Exception as e:
        log_test("DELETE cleanup", False, str(e))
        return False


def main():
    print("=" * 50)
    print("Live Feed API Tests - Python")
    print("=" * 50)
    print(f"Target: {BASE_URL}")
    print()
    
    print("[POST /api/post]")
    test_post_valid()
    test_post_invalid_key()
    print()
    
    print("[GET /api/posts]")
    test_get_valid_id()
    test_get_invalid_id()
    test_get_by_tag()
    print()
    
    print("[DELETE /api/delete]")
    test_delete_cleanup()
    
    # Summary
    print()
    print("=" * 50)
    total = tests_passed + tests_failed
    print(f"Results: {tests_passed}/{total} tests passed")
    print("=" * 50)
    
    if tests_failed > 0:
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()

