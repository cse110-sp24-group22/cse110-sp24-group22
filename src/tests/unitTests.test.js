/**
 * @jest-environment jsdom
 */
import { getTextFromDelta } from "../scripts/list";

test("adds 1 + 2 to equal 3", () => {
  expect(1 + 2).toBe(3);
});

test("getTextFromDelta to correctly grab 'getTextFromDelta to\n correctly\n grab journal text\n'", () => {
  let delta = {"ops": [
    {
      "attributes": {
        "italic": true
      },
      "insert": "getTe"
    },
    {
      "attributes": {
        "italic": true,
        "bold": true
      },
      "insert": "xtFrom"
    },
    {
      "attributes": {
        "italic": true
      },
      "insert": "Delta to"
    },
    {
      "insert": "\n correctly"
    },
    {
      "attributes": {
        "list": "bullet"
      },
      "insert": "\n"
    },
    {
      "insert": " grab journal text"
    },
    {
      "attributes": {
        "list": "ordered"
      },
      "insert": "\n"
    }
  ]};
  expect(getTextFromDelta(delta)).toStrictEqual("getTextFromDelta to\n correctly\n grab journal text\n");
});