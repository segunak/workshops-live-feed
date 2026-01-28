"""
Live Feed Test - Python
Tests posting to the Vercel serverless endpoint.
"""

import requests
import os
from datetime import datetime

# Use environment variable or default for local testing
URL = os.getenv("LIVE_FEED_URL", "https://live.segunakinyemi.com/api/post")
WORKSHOP_KEY = os.getenv("WORKSHOP_KEY", "cinnamon-rolls-are-the-best-pastry-hands-down")

data = {
    "Name": "Test Script (Python)",
    "Message": f"Pre-workshop test at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
    "Workshop": "Test Workshop",
    "Tags": "test, python, pre-workshop",
    "WorkshopKey": WORKSHOP_KEY
}

print("Posting to live feed...")
print(f"  URL: {URL}")
print(f"  Name: {data['Name']}")
print(f"  Message: {data['Message']}")
print(f"  Workshop: {data['Workshop']}")
print(f"  Tags: {data['Tags']}")
print()

response = requests.post(URL, json=data)

print(f"Status: {response.status_code}")
try:
    result = response.json()
    print(f"Response: {result}")
    if result.get("success"):
        print("\nSUCCESS: Post submitted!")
        print("Check https://live.segunakinyemi.com to verify.")
    else:
        print(f"\nFAILED: {result.get('error', 'Unknown error')}")
except Exception as e:
    print(f"Could not parse response: {e}")
    print(response.text[:500] if response.text else "No response body")
