let journalList = getJournalList();

let quill;

/**
 * Journal entry object.
 * @typedef {Object} JournalEntry
 * @property {number} timestamp
 * @property {string} title
 * @property {string[]} tags
 * @property {any} delta
 */

/**
 * Called as soon as the document loads.
 */
function init() {
  const newJournalButton = document.querySelector(".new-journal-button");
  displayList(journalList);
  setUpSearch();

  newJournalButton.addEventListener("click", function () {
    editJournal();
  });
}

document.addEventListener("DOMContentLoaded", init);

/**
 * Display the list of journals on the page.
 * @param journalList {JournalEntry[]} - List of journal entries to display.
 */
function displayList(journalList) {
  const itemList = document.getElementById("item-list");
  itemList.innerHTML = "";

  journalList.forEach((item) => {
    createListItem(item);
  });
}

/**
 * Create a list item for a journal entry.
 * @param item {JournalEntry} - Journal entry to create a list item for.
 */
function createListItem(item) {
  const itemList = document.getElementById("item-list");
  const listItem = document.createElement("li");

  const title = document.createElement("div");
  title.textContent = item.title;
  listItem.appendChild(title);

  const details = document.createElement("div");
  details.style.fontSize = "small";

  let timestamp = parseInt(item.timestamp);
  const timestampText = document.createElement("div");
  timestampText.textContent = `Timestamp: ${new Date(
    timestamp
  ).toLocaleString()}`;
  details.appendChild(timestampText);

  const tagsContainer = document.createElement("div");
  tagsContainer.textContent = "Tags: ";

  item.tags.forEach((tag) => {
    const tagElement = document.createElement("span");
    tagElement.textContent = tag;
    tagElement.className = "tag";
    tagElement.onclick = () => {
      // Future feature for filter search
    };
    tagsContainer.appendChild(tagElement);
    tagsContainer.appendChild(document.createTextNode(" ")); // Add space between tags
  });

  details.appendChild(tagsContainer);
  listItem.appendChild(details);

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.className = "delete-button";
  deleteButton.style.display = "none";

  deleteButton.onclick = (event) => {
    event.stopPropagation();
    listItem.remove();
    deleteJournal(timestamp);
  };

  listItem.appendChild(deleteButton);
  listItem.onmouseover = () => {
    deleteButton.style.display = "inline";
  };
  listItem.onmouseout = () => {
    deleteButton.style.display = "none";
  };
  listItem.onclick = () => {
    editJournal(timestamp);
  };

  itemList.appendChild(listItem);
}

/**
 * Get the list of journals from local storage.
 * @returns {JournalEntry[]} - List of journal entries.
 */
function getJournalList() {
  if (!localStorage.getItem("GarlicNotes")) {
    return [];
  } else {
    return JSON.parse(localStorage.getItem("GarlicNotes"));
  }
}

/**
 * Get a journal entry by its timestamp, or undefined if not found.
 * @param timestamp {number} - Timestamp of the journal entry to get.
 * @returns {JournalEntry|undefined}
 */
function getJournalByTimestamp(timestamp) {
  let journal = journalList.find((entry) => entry.timestamp = timestamp);

  if (journal === undefined) {
    console.error(`Error: No journal entry found with timestamp ${timestamp}`);
    return undefined;
  } else return journal;
}

/**
 * Delete a journal entry by its timestamp.
 * @param timestamp {number} - Timestamp of the journal entry to delete.
 */
function deleteJournal(timestamp) {
  journalList = journalList.filter((entry) => entry.timestamp !== timestamp);
  saveJournalList(journalList);
}

/**
 * Save the list of journal entries to local storage.
 * @param journalList {JournalEntry[]} - List of journal entries to save.
 */
function saveJournalList(journalList) {
  localStorage.setItem("GarlicNotes", JSON.stringify(journalList));
}

/**
 * Edit a journal entry.
 * @param id {number} - Timestamp of the journal entry to edit. If not provided, a new journal entry will be created.
 */
function editJournal(id) {
  const modal = document.getElementById("journalModal");
  const closeModal = document.getElementById("closeModal");
  const saveJournal = document.getElementById("saveJournal");
  const titleBar = document.getElementById("journalTitle");
  const itemList = document.getElementById("item-list");

  modal.style.display = "block";

  if (!quill) {
    quill = new Quill("#editor", { theme: "snow" });
  }

  closeModal.addEventListener("click", function () {
    modal.style.display = "none";
    displayList(journalList);
  });

  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  saveJournal.addEventListener("click", function () {
    const journalContent = quill.root.innerHTML;
    console.log(journalContent);
    modal.style.display = "none";
    itemList.innerHTML = "";
    displayList(journalList);
  });

  if (id === undefined) {
    id = new Date().getTime();
    let noteObject = {
      timestamp: id,
      title: "",
      tags: [],
      delta: undefined,
    };

    quill.setText("\n");
    journalList.push(noteObject);
    saveJournalList(journalList);
  }

  noteObject = getJournalByTimestamp(id);

  quill.setContents(noteObject.delta);
  titleBar.value = noteObject.title;

  quill.on("text-change", () => {
    const newDelta = quill.getContents();
    noteObject.delta = newDelta;
    saveJournalList(journalList);
  });

  titleBar.addEventListener("input", () => {
    let title = titleBar.value;
    noteObject.title = title;
    saveJournalList(journalList);
  });
}

/**
 * Save a journal entry to local storage.
 * @param journalList {JournalEntry[]} - List of journal entries to save.
 */
function saveJournal(journalList) {
  localStorage.setItem("GarlicNotes", JSON.stringify(journalList));
}

/**
 * Get the list of journal entries that match the search query.
 * @param list {JournalEntry[]} - List of journal entries to search.
 * @param query {string} - Search query.
 * @returns {JournalEntry[]} - List of journal entries that match the search query.
 */
function getMatchingEntries(list, query) {
  query = query.toLowerCase();

  if (query.startsWith("#")) {
    return searchByTags(list, query.slice(1));
  }

  let matchingEntriesByTitle = [];
  let matchingEntriesByContent = [];
  let matchingEntriesByTimestamp = [];

  list.forEach((entry) => {
    if (entry.title.toLowerCase().includes(query)) {
      matchingEntriesByTitle.push(entry);
    } else if (getTextFromDelta(entry.delta).toLowerCase().includes(query)) {
      matchingEntriesByContent.push(entry);
    } else if (
      new Date(parseInt(entry.timestamp))
        .toLocaleString()
        .toLowerCase()
        .includes(query)
    ) {
      matchingEntriesByTimestamp.push(entry);
    }
  });

  return matchingEntriesByTitle.concat(
    matchingEntriesByContent,
    matchingEntriesByTimestamp
  );
}

/**
 * Get the text content of a Quill delta.
 * @param delta {any} - Quill delta object.
 * @returns {string} - Text content of the delta.
 */
function getTextFromDelta(delta) {
  let text = "";
  delta.ops.forEach((op) => {
    text += op.insert;
  });
  return text;
}

/**
 * Search for journal entries by tags.
 * @param list {JournalEntry[]}
 * @param query {string}
 * @returns {JournalEntry[]}
 */
function searchByTags(list, query) {
  query = query.toLowerCase();
  return list.filter((entry) => {
    return entry.tags.some((tag) => tag.toLowerCase().includes(query));
  });
}

/**
 * Set up the search bar to filter journal entries.
 */
function setUpSearch() {
  const searchBar = document.getElementById("search-bar");
  searchBar.oninput = () => {
    const itemList = document.getElementById("item-list");
    itemList.replaceChildren();
    displayList(getMatchingEntries(journalList, searchBar.value));
  };
}
