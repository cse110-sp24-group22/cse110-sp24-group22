describe("Basic user flow for Website", () => {
  // First, visit the lab 8 website
  beforeAll(async () => {
    await page.goto("http://127.0.0.1:5501/src/html/list.html");
  });

  it("Initial Check for 0 journal", async () => {
    // Get all journal entries on the page
    const journalEntries = await page.$$("item-list");
    // Check that the number of journal entries is 0
    expect(journalEntries.length).toBe(0);
  });
});
