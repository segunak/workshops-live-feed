# Test Scripts

Test scripts to verify the endpoint works before a workshop.

## Usage

Set the endpoint URL and WorkshopKey in each script, then run:

```bash
# Python
python test_post.py

# JavaScript (Node.js 18+)
node test_post.js

# PowerShell
./test_post.ps1

# Bash
./test_post.sh

# Run Python, JavaScript, and PowerShell together
./test_all.ps1
```

## What They Do

Each script:
1. POSTs a timestamped test message
2. Includes Name, Message, Workshop, and Tags
3. Reports success or failure with the API response

## After Running

Check https://live.segunakinyemi.com to verify your test post appears.
