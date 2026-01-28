/**
 * Live Feed Test - JavaScript
 * Tests posting to the Vercel serverless endpoint.
 * Requires Node.js 18+ for native fetch.
 */

const URL = process.env.LIVE_FEED_URL || "https://live.segunakinyemi.com/api/post";
const WORKSHOP_KEY = process.env.WORKSHOP_KEY || "cinnamon-rolls-are-the-best-pastry-hands-down";

const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);

const data = {
    Name: "Test Script (JavaScript)",
    Message: `Pre-workshop test at ${timestamp}`,
    Workshop: "Test Workshop",
    Tags: "test, javascript, pre-workshop",
    WorkshopKey: WORKSHOP_KEY
};

console.log("Posting to live feed...");
console.log(`  URL: ${URL}`);
console.log(`  Name: ${data.Name}`);
console.log(`  Message: ${data.Message}`);
console.log(`  Workshop: ${data.Workshop}`);
console.log(`  Tags: ${data.Tags}`);
console.log();

fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
})
.then(async response => {
    console.log(`Status: ${response.status}`);
    const result = await response.json();
    console.log("Response:", result);
    
    if (result.success) {
        console.log("\nSUCCESS: Post submitted!");
        console.log("Check https://live.segunakinyemi.com to verify.");
    } else {
        console.log(`\nFAILED: ${result.error || "Unknown error"}`);
    }
})
.catch(error => {
    console.log("FAILED: Request error");
    console.log(error.message);
});
