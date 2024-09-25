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

  await page.waitForTimeout(10000);

  chai.expect(hasPageError).to.be.false;

  const failures = await page.locator("li.failures em").innerText();

  chai.expect(failures).to.equal("0");

  const passes = await page.locator("li.passes em").innerText();

  chai.expect(passes).to.equal("9");
});
