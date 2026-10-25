import assert from "node:assert/strict";
import { app } from "../src/app.js";

async function testValidation() {
  console.log("=== RUNNING API ENDPOINT VALIDATION TESTS ===");

  const server = app.listen(5099);

  try {
    // 1. Test POST /api/analyze without file
    console.log("Test: POST /api/analyze with no file attached...");
    const resNoFile = await fetch("http://localhost:5099/api/analyze", {
      method: "POST",
    });
    assert.equal(resNoFile.status, 400, "Should return 400 for missing file");
    const jsonNoFile = (await resNoFile.json()) as { error: string };
    assert.equal(jsonNoFile.error, "NO_FILE_UPLOADED");
    console.log(" [PASS] Missing file rejected with 400 NO_FILE_UPLOADED.");

    // 2. Test POST /api/analyze with invalid MIME type (.txt)
    console.log("Test: POST /api/analyze with non-image file...");
    const textBlob = new Blob(["This is a plain text file, not a waste photograph."], {
      type: "text/plain",
    });
    const formDataText = new FormData();
    formDataText.append("image", textBlob, "notes.txt");

    const resText = await fetch("http://localhost:5099/api/analyze", {
      method: "POST",
      body: formDataText,
    });
    assert.equal(resText.status, 400, "Should return 400 for non-image MIME type");
    const jsonText = (await resText.json()) as { error: string };
    assert.equal(jsonText.error, "INVALID_FILE_TYPE");
    console.log(" [PASS] Non-image file rejected with 400 INVALID_FILE_TYPE.");

    // 3. Test POST /api/analyze with oversized file (> 5 MB)
    console.log("Test: POST /api/analyze with file exceeding 5MB...");
    const largeBuffer = new Uint8Array(6 * 1024 * 1024); // 6 MB
    const largeBlob = new Blob([largeBuffer], { type: "image/jpeg" });
    const formDataLarge = new FormData();
    formDataLarge.append("image", largeBlob, "giant_photo.jpg");

    const resLarge = await fetch("http://localhost:5099/api/analyze", {
      method: "POST",
      body: formDataLarge,
    });
    assert.equal(resLarge.status, 400, "Should return 400 for file > 5MB");
    const jsonLarge = (await resLarge.json()) as { error: string };
    assert.ok(
      jsonLarge.error === "FILE_TOO_LARGE" || jsonLarge.error === "UPLOAD_ERROR",
      "Should return FILE_TOO_LARGE error"
    );
    console.log(" [PASS] Oversized 6MB file rejected with 400 FILE_TOO_LARGE.");

    // 4. Test POST /api/analyze with .jfif file (should pass format check, returning 503 or 200 depending on model availability)
    console.log("Test: POST /api/analyze with valid .jfif image file format...");
    const jfifBlob = new Blob([new Uint8Array(1024)], { type: "image/jfif" });
    const formDataJfif = new FormData();
    formDataJfif.append("image", jfifBlob, "images.jfif");

    const resJfif = await fetch("http://localhost:5099/api/analyze", {
      method: "POST",
      body: formDataJfif,
    });
    assert.notEqual(resJfif.status, 400, "JFIF file must not be rejected with 400 INVALID_FILE_TYPE");
    console.log(" [PASS] JFIF image successfully accepted by upload validation.");

    console.log("=== ALL API VALIDATION TESTS PASSED ===");
  } finally {
    server.close();
  }
}

testValidation().catch((err) => {
  console.error("Validation test failed:", err);
  process.exit(1);
});
