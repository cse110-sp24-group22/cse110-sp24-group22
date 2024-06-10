# JS Documentation
## LocalStorage
### `GarlicNotes`
It is a list with `JSON` objects inside. We use as database to store our journal data.
```
[
  {
    "timestamp": 1717991662835,
    "title": "CSE 110",
    "editTime": 1717991662835,
    "tags": ["CSE", "SDE"],
    "delta": {
      "ops": [
        { "insert": "We are team " },
        { "attributes": { "bold": true }, "insert": "22. " },
        { "insert": "Go " },
        { "attributes": { "italic": true }, "insert": "garlics!!!" },
        { "insert": "\n" }
      ]
    }
  },
]
```
The above is an example entry stored in local storage. Here's the attributes explained:
- `"timestamp"`: The creation timestamp when the journal is created. It is used externally for sorting and displaying in root page. Internally, we use it as `id` to for methods like `getJournalByTimestamp`.
- `"title"`: The title of the journal entry.
- `"editTime"`: Time of last edited. Note that it will not update if you cancel changes.
- `"tags"`: The tags of this journal.
- `"delta"`: The [delta object](https://quilljs.com/docs/delta#delta) Quill.js provided. Quill uses to render text. Do not need to worry about the internals of it. It is in `JSON` formate so it fits perfectly with localstorage.

### `GarlicNotesTags`
```
["aaa","adsadc","G","CSE","SDE"]
```
It is a separate localstorage entry so we can store *all* tags present. This way we can provide suggestions in drop-down menus when adding a tag.