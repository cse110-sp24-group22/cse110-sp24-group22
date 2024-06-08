/**
 * @jest-environment jsdom
 */
import { getMatchingEntries, getJournalByTimestamp } from "../scripts/list";
import { getJournalList } from "../scripts/util";

// Global test variables
let journalList = [
  {
    timestamp: 1717082192861,
    title: "Hi",
    tags: [],
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
    tags: [],
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
    tags: [],
    delta: {
      ops: [
        {
          insert: "temp\n",
        }
      ]
    }
  },
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
        tags: [],
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

  test("getMatchingEntries to correctly grab entries containing content 'test'", () => {
    let matches = getMatchingEntries(journalList, "test");
    expect(matches).toStrictEqual([
      {
        timestamp: 1717082302909,
        title: "Goodbye",
        tags: [],
        delta: {
          ops: [
            {
              insert: "test\n",
            },
          ],
        },
      },
    ]);
  });

  test("getMatchingEntries to not grab anything with search term 'nothing'", () => {
    let matches = getMatchingEntries(journalList, "nothing");
    expect(matches).toStrictEqual([]);
  })
});

describe("getJournalByTimestamp correctly uses date creation as id", () => {
  test("get entry with id  1717082302909 (Goodbye)", () => {
    let match = getJournalByTimestamp(1717082302909);
    expect(match).toStrictEqual([
      {
        timestamp: 1717082302909,
        title: "Goodbye",
        tags: [],
        delta: {
          ops: [
            {
              insert: "test\n",
            },
          ],
        },
      }
    ])
  })
})
