import assert from "node:assert/strict";
import app from "../src/app.js";

async function testServerlessEndpoints() {
  console.log("=== RUNNING VERCEL SERVERLESS FUNCTION INTEGRATION TESTS ===");

  const server = app.listen(5088);

  try {
    // 1. Test /api/health (direct full path)
    console.log("Test: GET /api/health...");
    const resHealthFull = await fetch("http://localhost:5088/api/health");
    assert.equal(resHealthFull.status, 200, "Full path /api/health should return 200");
    const jsonHealthFull = (await resHealthFull.json()) as { status: string; setupUrl?: string };
    assert.equal(jsonHealthFull.status, "healthy");
    assert.equal(jsonHealthFull.setupUrl, "https://aistudio.google.com/apikey");
    console.log(" [PASS] /api/health returned 200 with AI Studio setup URL.");

    // 2. Test /health (stripped prefix by Vercel serverless functions)
    console.log("Test: GET /health (Vercel stripped path)...");
    const resHealthStripped = await fetch("http://localhost:5088/health");
    assert.equal(resHealthStripped.status, 200, "Stripped path /health should return 200");
    console.log(" [PASS] Stripped path /health returned 200.");

    // 3. Test POST /api/analyze with images.jfif (must accept upload and never 405)
    console.log("Test: POST /api/analyze with images.jfif...");
    const jfifBlob = new Blob([new Uint8Array(2048)], { type: "image/jfif" });
    const formData = new FormData();
    formData.append("image", jfifBlob, "sample_waste.jfif");
    formData.append("municipality", "Austin, TX");

    const resAnalyzeFull = await fetch("http://localhost:5088/api/analyze", {
      method: "POST",
      body: formData,
    });
    assert.notEqual(resAnalyzeFull.status, 405, "Must never return HTTP 405 Method Not Allowed");
    assert.notEqual(resAnalyzeFull.status, 400, "Valid JFIF image must not be rejected with 400");
    assert.ok(
      resAnalyzeFull.status === 200 || resAnalyzeFull.status === 503,
      `Expected 200 or 503, got ${resAnalyzeFull.status}`
    );
    const dataAnalyze = (await resAnalyzeFull.json()) as { error?: string; success?: boolean };
    console.log(` [PASS] POST /api/analyze returned HTTP ${resAnalyzeFull.status} (${dataAnalyze.error || "success"}).`);

    // 4. Test POST /analyze (stripped prefix by Vercel serverless functions)
    console.log("Test: POST /analyze (Vercel stripped path)...");
    const formDataStripped = new FormData();
    formDataStripped.append("image", jfifBlob, "sample_waste.jfif");

    const resAnalyzeStripped = await fetch("http://localhost:5088/analyze", {
      method: "POST",
      body: formDataStripped,
    });
    assert.notEqual(resAnalyzeStripped.status, 405, "Stripped route must never return 405");
    assert.ok(
      resAnalyzeStripped.status === 200 || resAnalyzeStripped.status === 503,
      `Expected 200 or 503, got ${resAnalyzeStripped.status}`
    );
    console.log(` [PASS] POST /analyze returned HTTP ${resAnalyzeStripped.status}.`);

    console.log("=== ALL SERVERLESS INTEGRATION TESTS PASSED ===");
  } finally {
    server.close();
  }
}

testServerlessEndpoints().catch((err) => {
  console.error("Serverless test failed:", err);
  process.exit(1);
});
