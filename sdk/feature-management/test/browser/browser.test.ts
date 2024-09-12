import { test } from "@playwright/test";
import chai from "chai";
import path from "path";

test("Testcase can pass in browser environment", async ({ page }) => {

  const filePath = path.join(__dirname, "index.html");

  let hasPageError = false;

  page.on("pageerror", (err) => {
    hasPageError = true;
    console.log(`Page Error: ${err.message}`);
  });

  await page.goto(`file:${filePath}`);

  const failures = await page.evaluate(() => (window as any).mochaFailures);

  chai.expect(failures).to.equal(0);
  chai.expect(hasPageError).to.be.false;
});
