const pti = require("puppeteer-to-istanbul");
const puppeteer = require("puppeteer");

describe("Basic user flow for Website", () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();

    // Enable both JavaScript and CSS coverage
    await Promise.all([
      page.coverage.startJSCoverage(),
      page.coverage.startCSSCoverage(),
    ]);

    await page.goto("http://127.0.0.1:5501/src/html/list.html");
  });

  // ==============================================================
  // Testing 1: Initial check for 0 journals
  it("Initial Check for 0 journals", async () => {
    // Get all journal entries on the page
    const journalEntries = await page.$$("#item-list li");
    // Check that the number of journal entries is 0
    expect(journalEntries.length).toBe(0);
  });
  // ==============================================================

  afterAll(async () => {
    // Disable both JavaScript and CSS coverage
    const [jsCoverage, cssCoverage] = await Promise.all([
      page.coverage.stopJSCoverage(),
      page.coverage.stopCSSCoverage(),
    ]);

    pti.write([...jsCoverage, ...cssCoverage], {
      includeHostname: true,
      storagePath: "./.nyc_output",
    });

    await browser.close();
  });
});
