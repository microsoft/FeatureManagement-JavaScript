import { test } from "@playwright/test";
import * as chai from "chai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test("Testcase can pass in browser environment", async ({ page }) => {

  const filePath = path.join(__dirname, "index.html");

  let hasPageError = false;
  page.on("pageerror", (err) => {
    hasPageError = true;
    console.log(`Page Error: ${err.message}`);
  });

  await page.goto(`file:${filePath}`);
  await page.waitForTimeout(10000);

  const failures = await page.evaluate(() => (window as any).mochaFailures);
  chai.expect(failures).equals(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  chai.expect(hasPageError).to.be.false;
});
