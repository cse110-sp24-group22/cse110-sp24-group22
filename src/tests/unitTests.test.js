/**
 * @jest-environment jsdom
 */
import { getJournalByTimestamp, searchJournal } from "../scripts/list";
import { getJournalList, getMatchingEntries} from "../scripts/util";

// Global test variables
let journalList = [
  {
    timestamp: 1717082192861,
    title: "Hi",
    tags: ["tag1"],
    delta: {
      ops: [
        {
          insert: "text\n",
        },
      ],
    },
  },
  {
    timestamp: 1717082302909,
    title: "Goodbye",
    tags: ["tag1", "tag2"],
    delta: {
      ops: [
        {
          insert: "test\n",
        },
      ],
    },
  },
  {
    timestamp: 1717092302909,
    title: "Good",
    tags: ["tag3", "tag4"],
    delta: {
      ops: [
        {
          insert: "test\n",
        },
      ],
    },
  },
  {
    timestamp: 1717082192860,
    title: "One Off",
    tags: ["tag3", "tag4","tag5"],
    delta: {
      ops: [
        {
          insert: "temp\n",
        }
      ]
    }
  },
  {
    timestamp: 1709977267,
    title: "RootTest1",
    tags: ["tag1"],
    delta: {
      ops: [
        {
          insert: "text\n",
        },
      ],
    },
  },
  {
    timestamp: 1709977267,
    title: "RootTest2",
    tags: ["tag1"],
    delta: {
      ops: [
        {
          insert: "text\n",
        },
      ],
    },
  }
]; 

describe("getMatchingEntries correctly retrieves searched entries", () => {
  /*
  test("getTextFromDelta to correctly grab 'getTextFromDelta to\n correctly\n grab journal text\n'", () => {
    let delta = {
      ops: [
        {
          attributes: {
            italic: true,
          },
          insert: "getTe",
        },
        {
          attributes: {
            italic: true,
            bold: true,
          },
          insert: "xtFrom",
        },
        {
          attributes: {
            italic: true,
          },
          insert: "Delta to",
        },
        {
          insert: "\n correctly",
        },
        {
          attributes: {
            list: "bullet",
          },
          insert: "\n",
        },
        {
          insert: " grab journal text",
        },
        {
          attributes: {
            list: "ordered",
          },
          insert: "\n",
        },
      ],
    };
    expect(getTextFromDelta(delta)).toStrictEqual(
      "getTextFromDelta to\n correctly\n grab journal text\n",
    );
  });
*/
  test("getMatchingEntries to correctly grab entries containing title 'Hi'", () => {
    let matches = getMatchingEntries(journalList, "hi");
    expect(matches).toStrictEqual([
      {
        timestamp: 1717082192861,
        title: "Hi",
        tags: ["tag1"],
        delta: {
          ops: [
            {
              insert: "text\n",
            },
          ],
        },
      },
    ]);
  });

  /*
  test("getMatchingEntries to correctly grab entries containing content 'test'", () => {
    let matches = getMatchingEntries(journalList, "test");
    expect(matches).toStrictEqual([
      {
        timestamp: 1717082302909,
        title: "Goodbye",
        tags: ["tag1", "tag2"],
        delta: {
          ops: [
            {
              insert: "test\n",
            },
          ],
        },
      },
      {
        timestamp: 1717092302909,
        title: "Good",
        tags: ["tag3", "tag4"],
        delta: {
          ops: [
            {
              insert: "test\n",
            },
          ],
        },
      }
    ]);
  });
  */
  test("getMatchingEntries to not grab anything with search term 'nothing'", () => {
    let matches = getMatchingEntries(journalList, "nothing");
    expect(matches).toStrictEqual([]);
  });
});

describe("getJournalByTimestamp correctly uses date creation as id", () => {
  test("get entry with id 1717082302909 (Goodbye)", () => {

    let match = getJournalByTimestamp(1717082302909, journalList);
    expect(match).toStrictEqual(
      {
        timestamp: 1717082302909,
        title: "Goodbye",
        tags: ["tag1", "tag2"],
        delta: {
          ops: [
            {
              insert: "test\n",
            },
          ],
        },
      }
    );
  });

  test("get entry with id 1717082192860 (One Off) that is one off another entry", () => {
    let match = getJournalByTimestamp(1717082192860, journalList);
    expect(match).toStrictEqual(
      {
        timestamp: 1717082192860,
        title: "One Off",
        tags: ["tag3","tag4","tag5"],
        delta: {
          ops: [
            {
              insert: "temp\n",
            }
          ]
        }
      }
    );
  });

  test("get no with id 1715082192860", () => {
    let match = getJournalByTimestamp(1715082192860, journalList);
    expect(match).toBe(undefined);
  });
});

describe("searchJournal correctly filters entries with a combination of search queries", () => {
  test("searchJournal finds two entries with matching prefix 'Good'", () => {
    let matches = searchJournal("Good", [], "", "", journalList);
    expect(matches).toStrictEqual([
      {
        timestamp: 1717082302909,
        title: "Goodbye",
        tags: ["tag1", "tag2"],
        delta: {
          ops: [
            {
              insert: "test\n",
            },
          ],
        },
      },
      {
        timestamp: 1717092302909,
        title: "Good",
        tags: ["tag3", "tag4"],
        delta: {
          ops: [
            {
              insert: "test\n",
            },
          ],
        },
      }
    ]);
  });

  test("searchJournal gets a single entry when searching 'Hi'", () => {
    let match = searchJournal("Hi", [], "", "", journalList);
    expect(match).toStrictEqual([
      {
        timestamp: 1717082192861,
        title: "Hi",
        tags: ["tag1"],
        delta: {
          ops: [
            {
              insert: "text\n",
            },
          ],
        },
      }
    ]);
  });

  test("searchJournal gets four entries when filtering by single tag", () => {
    let matches = searchJournal("", ["tag1"], "", "", journalList);
    expect(matches).toStrictEqual([
      {
        timestamp: 1717082192861,
        title: "Hi",
        tags: ["tag1"],
        delta: {
          ops: [
            {
              insert: "text\n",
            },
          ],
        },
      },
      {
        timestamp: 1717082302909,
        title: "Goodbye",
        tags: ["tag1", "tag2"],
        delta: {
          ops: [
            {
              insert: "test\n",
            },
          ],
        },
      },
      {
        timestamp: 1709977267,
        title: "RootTest1",
        tags: ["tag1"],
        delta: {
          ops: [
            {
              insert: "text\n",
            },
          ],
        },
      },
      {
        timestamp: 1709977267,
        title: "RootTest2",
        tags: ["tag1"],
        delta: {
          ops: [
            {
              insert: "text\n",
            },
          ],
        },
      }
    ]);
  });
});