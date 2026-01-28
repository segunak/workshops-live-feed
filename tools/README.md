# Test Scripts

Integration tests for the Live Feed API. Tests POST, GET, and DELETE endpoints.

## CI/CD

Tests run automatically on every push to `main` via GitHub Actions. The workflow:

1. Waits 30 seconds for Vercel to deploy
2. Runs all 3 language tests in parallel
3. Each test creates a post, verifies it exists, then deletes it

See `.github/workflows/test-api.yml` for details.

## Manual Usage

Set environment variables (optional, defaults to production):

```bash
export LIVE_FEED_URL="https://live.segunakinyemi.com"
export WORKSHOP_KEY="your-key"
export ADMIN_KEY="your-admin-key"  # Required for cleanup
```

Run tests:

```bash
# Python
python test_post.py

# JavaScript (Node.js 18+)
node test_post.js

# PowerShell
./test_post.ps1

# Run all
./test_all.ps1
```

## Test Flow

Each test script runs:

1. **POST valid data** → expect 200 + id
2. **POST invalid key** → expect 401
3. **GET valid id** → expect 200 + post data
4. **GET invalid id** → expect 404
5. **DELETE** → cleanup the test post (requires ADMIN_KEY)

## Exit Codes

- `0` = All tests passed
- `1` = One or more tests failed

## GitHub Secrets Required

| Secret | Used For |
|--------|----------|
| `WORKSHOP_KEY` | POST and GET authentication |
| `ADMIN_KEY` | DELETE endpoint for cleanup |
