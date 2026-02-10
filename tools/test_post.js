/**
 * Live Feed API Tests - JavaScript
 * Tests POST, GET, and DELETE endpoints.
 * Cleans up after itself using the DELETE endpoint.
 * Requires Node.js 18+ for native fetch.
 */

const BASE_URL = process.env.LIVE_FEED_URL || "https://live.segunakinyemi.com";
const ADMIN_KEY = process.env.ADMIN_KEY || "";

// ADMIN_KEY is required for all test operations
if (!ADMIN_KEY) {
    console.log("ERROR: ADMIN_KEY environment variable is required");
    process.exit(1);
}

const POST_URL = `${BASE_URL}/api/post`;
const POSTS_URL = `${BASE_URL}/api/posts`;
const DELETE_URL = `${BASE_URL}/api/delete`;

// Track test results
let testsPassed = 0;
let testsFailed = 0;
let createdPostId = null;

function logTest(name, passed, details = "") {
    if (passed) {
        testsPassed++;
        console.log(`  ✓ ${name}`);
    } else {
        testsFailed++;
        console.log(`  ✗ ${name}`);
        if (details) {
            console.log(`    → ${details}`);
        }
    }
}

async function testPostValid() {
    const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
    const data = {
        Name: "GitHub Actions (JavaScript)",
        Message: `CI test at ${timestamp}`,
        Workshop: "CI Test",
        Tags: "ci, automated, javascript",
        WorkshopKey: ADMIN_KEY
    };

    try {
        const response = await fetch(POST_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if (response.status === 200 && result.success && result.id) {
            createdPostId = result.id;
            logTest("POST valid data → 200 + id", true);
            return true;
        } else {
            logTest("POST valid data → 200 + id", false, `Got ${response.status}: ${JSON.stringify(result)}`);
            return false;
        }
    } catch (e) {
        logTest("POST valid data → 200 + id", false, e.message);
        return false;
    }
}

async function testPostInvalidKey() {
    const data = {
        Name: "Test",
        Message: "Should fail",
        Workshop: "CI Test",
        WorkshopKey: "wrong-key"
    };

    try {
        const response = await fetch(POST_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (response.status === 401) {
            logTest("POST invalid key → 401", true);
            return true;
        } else {
            logTest("POST invalid key → 401", false, `Got ${response.status}`);
            return false;
        }
    } catch (e) {
        logTest("POST invalid key → 401", false, e.message);
        return false;
    }
}

async function testGetValidId() {
    if (!createdPostId) {
        logTest("GET valid id → 200 + post", false, "No post id available");
        return false;
    }

    try {
        const url = `${POSTS_URL}?id=${createdPostId}&WorkshopKey=${ADMIN_KEY}`;
        const response = await fetch(url);
        const result = await response.json();

        if (response.status === 200 && result.success && result.post) {
            if (result.post.id === createdPostId) {
                logTest("GET valid id → 200 + post", true);
                return true;
            } else {
                logTest("GET valid id → 200 + post", false, `ID mismatch: ${result.post.id}`);
                return false;
            }
        } else {
            logTest("GET valid id → 200 + post", false, `Got ${response.status}: ${JSON.stringify(result)}`);
            return false;
        }
    } catch (e) {
        logTest("GET valid id → 200 + post", false, e.message);
        return false;
    }
}

async function testGetInvalidId() {
    try {
        const url = `${POSTS_URL}?id=recINVALID123&WorkshopKey=${ADMIN_KEY}`;
        const response = await fetch(url);

        if (response.status === 404) {
            logTest("GET invalid id → 404", true);
            return true;
        } else {
            logTest("GET invalid id → 404", false, `Got ${response.status}`);
            return false;
        }
    } catch (e) {
        logTest("GET invalid id → 404", false, e.message);
        return false;
    }
}

async function testGetByTag() {
    try {
        const url = `${POSTS_URL}?tag=javascript&WorkshopKey=${ADMIN_KEY}`;
        const response = await fetch(url);
        const result = await response.json();

        if (response.status === 200 && result.success) {
            // Just verify we get a valid response structure
            if ("posts" in result && "count" in result && "tag" in result) {
                logTest("GET by tag → 200 + posts", true);
                return true;
            } else {
                logTest("GET by tag → 200 + posts", false, `Missing fields: ${JSON.stringify(result)}`);
                return false;
            }
        } else {
            logTest("GET by tag → 200 + posts", false, `Got ${response.status}: ${JSON.stringify(result)}`);
            return false;
        }
    } catch (e) {
        logTest("GET by tag → 200 + posts", false, e.message);
        return false;
    }
}

async function testDeleteCleanup() {
    if (!createdPostId) {
        logTest("DELETE cleanup", false, "No post id to delete");
        return false;
    }

    try {
        const url = `${DELETE_URL}?id=${createdPostId}&AdminKey=${ADMIN_KEY}`;
        const response = await fetch(url, { method: "DELETE" });
        const result = await response.json();

        if (response.status === 200 && result.success) {
            logTest("DELETE cleanup", true);
            return true;
        } else {
            logTest("DELETE cleanup", false, `Got ${response.status}: ${JSON.stringify(result)}`);
            return false;
        }
    } catch (e) {
        logTest("DELETE cleanup", false, e.message);
        return false;
    }
}

async function main() {
    console.log("=".repeat(50));
    console.log("Live Feed API Tests - JavaScript");
    console.log("=".repeat(50));
    console.log(`Target: ${BASE_URL}`);
    console.log();

    console.log("[POST /api/post]");
    await testPostValid();
    await testPostInvalidKey();
    console.log();

    console.log("[GET /api/posts]");
    await testGetValidId();
    await testGetInvalidId();
    await testGetByTag();
    console.log();

    console.log("[DELETE /api/delete]");
    await testDeleteCleanup();

    // Summary
    console.log();
    console.log("=".repeat(50));
    const total = testsPassed + testsFailed;
    console.log(`Results: ${testsPassed}/${total} tests passed`);
    console.log("=".repeat(50));

    if (testsFailed > 0) {
        process.exit(1);
    }
    process.exit(0);
}

main().catch(err => {
    console.error("Fatal error:", err);
    process.exit(1);
});
