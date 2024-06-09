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
        page.coverage.startJSCoverage({
          resetOnNavigation: false,
          reportAnonymousScripts: false,
          includeRawScriptCoverage: false,
          useBlockCoverage: true
        }),
        page.coverage.startCSSCoverage()
      ]);
  
      await page.goto("http://127.0.0.1:5500/src/html/home.html");
    });

  // ==============================================================
  async function getTextById(page, id) {
    const element = await page.$(`#${id}`);
    if (element) {
      const textContent = await element.evaluate((el) => el.textContent.trim());
      return textContent;
    }
    return null;
  }

  async function countDivsWithClass(page, className) {
    const count = await page.evaluate((className) => {
      return document.querySelectorAll(`div.${className}`).length;
    }, className);
    return count;
  }

  async function isModalVisible(page) {
    const isVisible = await page.evaluate(() => {
      // Get the modal element
      const modal = document.getElementById("journalModal");
      // Check if the modal is visible (display: block)
      const isVisible =
        window.getComputedStyle(modal).getPropertyValue("display") === "block";
      return isVisible;
    });
    return isVisible;
  }

  // Testing 0: There are 0 nodes on the current page.
  it("Check for no nodes", async () => {
    let intCount = await countDivsWithClass(page, "root-node");
    expect(intCount).toBe(0);
  });

  // Testing 1: Canceling a new Journal
  it("Canceling creation of journal does not create journal", async () => {
    await page.click("#can-container");
    await page.click(".close-button");
    let cancelCount = await countDivsWithClass(page, "root-node");
    expect(cancelCount).toBe(0);
  });

  // Testing 2: Expect date and weekday display to be correct
  it("Check for correct date and weekday", async () => {
    let todayTime = new Date();
    let testWeekDay = await getTextById(page, "weekday");
    let testWeekDayValue;
    switch (testWeekDay) {
      case "Sunday":
        testWeekDayValue = 0;
        break;
      case "Monday":
        testWeekDayValue = 1;
        break;
      case "Tuesday":
        testWeekDayValue = 2;
        break;
      case "Wednesday":
        testWeekDayValue = 3;
        break;
      case "Thursday":
        testWeekDayValue = 4;
        break;
      case "Friday":
        testWeekDayValue = 5;
        break;
      case "Saturday":
        testWeekDayValue = 6;
        break;
    }
    expect(testWeekDayValue).toBe(todayTime.getDay());
    let testDate = await getTextById(page, "date");
    let todayMonth = todayTime.getMonth() + 1;
    let todayDate =
      todayMonth + "/" + todayTime.getDate() + "/" + todayTime.getFullYear();
    expect(testDate).toBe(todayDate);
  });

  // Testing 3: Pressing create opens modal
  it("Pressing create opens modal", async () => {
    await page.reload();
    await page.click("#can-container");
    const modal = await isModalVisible(page);
    expect(modal).toBe(true);
  });

  // Testing 4: Edit and save a journal to have title Testing 4
  it("Edit and save a journal to have title Testing 4", async () => {
    let testTitle = "Testing 4";
    await page.type("#journalTitle", testTitle);

    await page.click("#closeModal");

    const journalEntries = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem("GarlicNotes"));
    });

    // Check that the title is updated
    expect(journalEntries[0].title).toBe(testTitle);
  });

  // Testing 5: New root node appears after saving a journal labeled with current day
  it("New root node appears after saving a journal", async () => {
    let newCount = await countDivsWithClass(page, "root-node");
    expect(newCount).toBe(1);
  });

  // Testing 6: Search for 'Testing 4' journal by title
  it("Search for a journal by title", async () => {
    await page.reload();

    await page.type("#search-bar", "Testing 4");

    const journalEntries = await page.$$("#entry-dropdown li");

    expect(journalEntries.length).toBe(1);
  });

  // Testing 7: Pressing entry search result opens modal
  it("Pressing entry search result opens modal", async () => {
    const dropDownEntry = await page.$("#entry-dropdown li");
    await dropDownEntry.click();
    const modalEntry = await isModalVisible(page);
    expect(modalEntry).toBe(true);
  });

  // Testing 8: Editing title to 'Testing 3 Updated' and saving modal from entry search result updates dropdown to have new title
  it("Editing and saving modal from entry search result updates dropdown", async () => {
    let testEditTitle = "Testing 3 Updated";
    await page.click("#journalTitle");
    await page.keyboard.down("Control");
    await page.keyboard.press("A");
    await page.keyboard.up("Control");
    await page.keyboard.press("Backspace");
    await page.type("#journalTitle", testEditTitle);
    await page.click("#closeModal");
    const journalEntries = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem("GarlicNotes"));
    });
    // Check that the title is updated
    expect(journalEntries[0].title).toBe(testEditTitle);
    await page.reload();
    await page.type("#search-bar", testEditTitle);

    const journalEditEntries = await page.$$("#entry-dropdown li");

    expect(journalEditEntries.length).toBe(1);
  });

  // Testing 9: The previous edit to an existing entry didn't add another root node
  it("The previous edit to an existing entry didn't add another root node", async () => {
    let editCount = await countDivsWithClass(page, "root-node");
    expect(editCount).toBe(1);
  });

  // Testing 10: Cancelling modal from entry search result doesn't update dropdown
  it("Editing and cancelling modal from entry search result doesn't update dropdown", async () => {
    const dropDownEditEntry = await page.$("#entry-dropdown li");
    await dropDownEditEntry.click();
    let testEditTitle = "Testing 2 Updated";
    await page.click("#journalTitle");
    await page.keyboard.down("Control");
    await page.keyboard.press("A");
    await page.keyboard.up("Control");
    await page.keyboard.press("Backspace");
    await page.type("#journalTitle", testEditTitle);
    await page.click("#cancelModal");
    const journalEntries = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem("GarlicNotes"));
    });
    // Check that the title is updated
    expect(journalEntries[0].title).toBe("Testing 3 Updated");
    await page.reload();
    await page.type("#search-bar", testEditTitle);

    const journalCancelEntries = await page.$$("#entry-dropdown li");
    expect(journalCancelEntries.length).toBe(0);
  });

  // Testing 11: Increment year button doesn't do anything (doesn't increment to a future year)
  it("Increment year button doesn't do anything (doesn't increment to a future year)", async () => {
    await page.reload();
    await page.click("#year-increment");
    const yearDisplayText = await getTextById(page, "year-display-inner");
    expect(yearDisplayText).toBe("2024");
  });

  // Testing 12: Decrement year button correctly changes year-display year and changes root to have 0 nodes
  it("Decrement year button correctly changes year-display year and changes root to have 0 nodes", async () => {
    await page.click("#year-decrement");
    const yearDisplayText = await getTextById(page, "year-display-inner");
    expect(yearDisplayText).toBe("2023");
    let intIncrementNode = await countDivsWithClass(page, "root-node");
    expect(intIncrementNode).toBe(0);
  });

  // Testing 13: Increment year button correctly changes year-display year and changes root to have previous amount of nodes
  it("Increment year button correctly changes year-display year and changes root to have previous amount of nodes", async () => {
    await page.click("#year-increment");
    const yearDisplayText = await getTextById(page, "year-display-inner");
    expect(yearDisplayText).toBe("2024");
    let intIncrementNode = await countDivsWithClass(page, "root-node");
    expect(intIncrementNode).toBe(1);
  });

  //Test 14: Checks clicking on the nodes
  it("Checks clicking on the nodes", async () => {
    await page.reload();
    await page.click(".root-node");
    await page.waitForSelector("#deleteModal");
    const nodeModal = await isModalVisible(page);
    expect(nodeModal).toBe(true);
  });
  it("Checks the save button after clicking on the node", async () => {
    let testEditTitle = "Testing 14 Updated";
    await page.click("#journalTitle");
    await page.keyboard.down("Control");
    await page.keyboard.press("A");
    await page.keyboard.up("Control");
    await page.keyboard.press("Backspace");
    await page.type("#journalTitle", testEditTitle);
    await page.click("#closeModal");
    const journalEntries = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem("GarlicNotes"));
    });
    // Check that the title is updated
    expect(journalEntries[0].title).toBe("Testing 14 Updated");
  });

//   //Testing 14: Checks Delete Button
//   it("Checks the delete button in the modal", async () => {
//     await page.reload();
//     await page.click(".root-node");
//     await page.click("#deleteModal");
//     let checkNodeCount = await countDivsWithClass(page, "root-node");
//     expect(checkNodeCount).toBe(0);
//   });

  // Test 15: Check if having 2 entries on one node does not update node Count.
  it("Check if having 2 entries on one node does not update node Count.", async () => {
    await page.reload();
    await page.click("#can-container");
    let testEditTitle = "Testing 3 Updated";
    await page.click("#journalTitle");
    await page.keyboard.down("Control");
    await page.keyboard.press("A");
    await page.keyboard.up("Control");
    await page.keyboard.press("Backspace");
    await page.type("#journalTitle", testEditTitle);
    await page.click("#closeModal");
    await page.click("#can-container");
    let testEdit2Title = "Testing 2 Updated";
    await page.click("#journalTitle");
    await page.keyboard.down("Control");
    await page.keyboard.press("A");
    await page.keyboard.up("Control");
    await page.keyboard.press("Backspace");
    await page.type("#journalTitle", testEdit2Title);
    await page.click("#closeModal");
    let noNewCount = await countDivsWithClass(page, "root-node");
    expect(noNewCount).toBe(1);
  });

//   // Test 16: Checking if having 2 entries on one node redirects
//   it("Checking if having 2 entries on one node redirects", async () => {
//     await page.reload();
//     await page.click(".root-node");
//     let testEntriesDate = new Date();
//     let result = false;
//     // Convert month to string
//     let basemonth = ("0" + (testEntriesDate.getMonth() + 1)).slice(-2);
//     // Convert date to string
//     let basetime =
//       testEntriesDate.getFullYear() +
//       "-" +
//       basemonth +
//       "-" +
//       ("0" + testEntriesDate.getDate()).slice(-2);
//     // Construct URL to take us to the list page
//     let url =
//       "http://127.0.0.1:5500/src/html/list.html?query=&tags=&startDate=" +
//       basetime +
//       "&endDate=" +
//       basetime;
//     if (page.url() == url) {
//       result = true;
//     }
//     expect(result).toBe(true);
//   });
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
