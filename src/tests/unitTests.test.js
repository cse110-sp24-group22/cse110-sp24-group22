/**
 * @jest-environment jsdom
 */
import { getTextFromDelta, getMatchingEntries } from "../scripts/list";

test("adds 1 + 2 to equal 3", () => {
  expect(1 + 2).toBe(3);
});

describe("Testing non-DOM functions in list.js", () => {
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

  test("getMatchingEntries to correctly grab entries containing title 'Hi'", () => {
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
    ];
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
    ];
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
});
