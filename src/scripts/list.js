// Instantiate list of entries.
let journalList;
document.addEventListener("DOMContentLoaded", init);

/**
 * Journal entry object.
 * @typedef {Object} JournalEntry
 * @property {number} timestamp - unique identifier and time it was created
 * @property {string} title - title of the journal entry
 * @property {string[]} tags - list of tags
 * @property {Object} delta - Quill delta containing text operations
 */
let quill;

let sortDirection = {
  name: true,
  timestamp: true,
};

/**
 * Called on page load.
 */
function init() {
  // Store the data into localStorage before starting all the things.
  journalList = getJournalList();
  const newJournalButton = document.querySelector(".new-journal-button");
  const filterButton = document.querySelector(".filter-button");
  updateDisplay();

  setUpSearch();

  newJournalButton.onclick = () => {
    editJournal();
  };

  // Animation for the filter dropdown
  filterButton.onclick = () => {
    const filterHeader = document.querySelector(".filter-container");
    const entryHeader = document.querySelector(".entry-header");
    if (filterHeader.classList.contains("show")) {
      filterHeader.classList.remove("show");
      entryHeader.style.marginTop = "75px"; // adjust based on filterHeader height
      setTimeout(function () {
        filterHeader.style.display = "none";
      }, 500);
    } else {
      filterHeader.style.display = "grid";
      setTimeout(() => {
        filterHeader.classList.add("show");
        entryHeader.style.marginTop = "105px"; // adjust based on filterHeader height
      }, 0);
    }
  };
}

document.getElementById("sort-name").addEventListener("click", () => {
  sortByCategory("name");
});
document.getElementById("sort-timestamp").addEventListener("click", () => {
  sortByCategory("timestamp");
});

/**
 * Sorts the journal list by the specified category.
 *
 * @param {string} category - The category to sort by. This can be "name" or "timestamp".
 * If "name" is specified, the journal list is sorted alphabetically by the title of the journal entries.
 * If "timestamp" is specified, the journal list is sorted chronologically by the timestamp of the journal entries.
 * The sort direction (ascending or descending) is toggled each time the function is called with the same category.
 */

/** @type {"none"|"name"|"timestamp"} */
let sortMode = "none";

function sortByCategory(category) {
  if (category === "name") {
    sortMode = "name";
    sortDirection.name = !sortDirection.name;
  } else if (category === "timestamp") {
    sortMode = "timestamp";
    sortDirection.editTime = !sortDirection.editTime;
  }
  updateSortArrows(category);
  updateDisplay();
}

/**
 * Updates the direction of the sorting arrows based on the sorting category and direction.
 *
 * @param {string} category - The category of sorting. This can be "name" or "timestamp".
 * If "name" is specified, the name sort arrow's direction is updated based on the sort direction.
 * If "timestamp" is specified, the timestamp sort arrow's direction is updated based on the sort direction.
 * The other arrow is reset to its default direction.
 */
function updateSortArrows(category) {
  const nameSortArrow = document.getElementById("sort-name");
  const timestampSortArrow = document.getElementById("sort-timestamp");

  if (category === "name") {
    nameSortArrow.innerHTML = sortDirection.name ? "&#9650;" : "&#9660;";
    timestampSortArrow.innerHTML = "&#9650;"; // Reset the other arrow
  } else if (category === "timestamp") {
    timestampSortArrow.innerHTML = sortDirection.editTime
      ? "&#9650;"
      : "&#9660;";
    nameSortArrow.innerHTML = "&#9650;"; // Reset the other arrow
  }
}

/**
 * Displays a list of journal entries on the page.
 * @param list {JournalEntry[]} - list of journal entries
 */
function displayList(list) {
  //Iterate through list and append them to HTML
  const itemList = document.getElementById("item-list");
  itemList.innerHTML = "";

  list.forEach((item) => {
    createListItem(item);
  });
}

/**
 * Creates a list item for a journal entry.
 * @param item {JournalEntry} - journal entry
 */
function createListItem(item) {
  //Get the essential elements
  const itemList = document.getElementById("item-list");
  const listItem = document.createElement("li");

  //Create title container
  const title = document.createElement("div");
  title.setAttribute("id", "entry-title");
  title.textContent = item.title;
  title.className = "title";
  listItem.appendChild(title);

  //Generate tags and create tag container
  const tagsContainer = document.createElement("div");
  tagsContainer.setAttribute("id", "entry-tags");
  tagsContainer.textContent = "";

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

  listItem.appendChild(tagsContainer);

  //Create timestamp container
  let timestamp = parseInt(item.timestamp);
  const timestampText = document.createElement("div");

  timestampText.setAttribute("id", "entry-timestamp");

  let date = new Date(item.editTime);

  let options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // Use 24-hour time
  };

  // Display the formatted date
  timestampText.textContent = date
    .toLocaleString("en-GB", options)
    .replace(",", "");

  listItem.appendChild(timestampText);

  //Create delete button
  const deleteButtonContainer = document.createElement("div");
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.className = "delete-button";
  deleteButtonContainer.id = "delete-container";
  deleteButtonContainer.appendChild(deleteButton);

  // EventListener: When clicking delete, delete from page and LocalStorage
  deleteButton.onclick = (event) => {
    if (
      window.confirm(
        `Are you sure you would like to delete the "${item.title}"?`,
      )
    ) {
      event.stopPropagation();
      listItem.remove();
      deleteJournal(timestamp);
    }
    event.stopPropagation();
  };

  listItem.appendChild(deleteButtonContainer);
  listItem.onmouseover = () => {
    deleteButton.style.display = "inline";
  };
  listItem.onmouseout = () => {
    deleteButton.style.display = "none";
  };
  listItem.onclick = () => {
    editJournal(timestamp);
  };

  // Append the entire list item into the list
  itemList.appendChild(listItem);
}

/**
 * Retrieves the list of journal entries from localStorage.
 * @returns {JournalEntry[]} - list of journal entries
 */
function getJournalList() {
  if (!localStorage.getItem("GarlicNotes")) {
    return [];
  } else {
    return JSON.parse(localStorage.getItem("GarlicNotes"));
  }
}

/**
 * Retrieves a journal entry by its timestamp.
 * @param timestamp {number} - unique identifier and time it was created
 * @returns {JournalEntry|undefined} - journal entry or undefined if not found
 */
function getJournalByTimestamp(timestamp) {
  let journal = journalList.find((entry) => entry.timestamp == timestamp);
  if (journal === undefined) {
    console.error(`Error: No journal entry found with timestamp ${timestamp}`);
    return undefined;
  } else return journal;
}

/**
 * Deletes a journal entry by its timestamp.
 * @param timestamp {number} - unique identifier and time it was created
 */
function deleteJournal(timestamp) {
  journalList = journalList.filter((entry) => entry.timestamp != timestamp);
  saveJournalList(journalList);
}

/**
 * Saves the list of journal entries to localStorage.
 * @param journalList {JournalEntry[]} - list of journal entries
 */
function saveJournalList(journalList) {
  localStorage.setItem("GarlicNotes", JSON.stringify(journalList));
}

/**
 * Checks if a title is valid.
 * @param title {string} - title of the journal entry
 * @returns {boolean} - true if title is valid, false otherwise
 */
function isTitleValid(title) {
  return title.trim().length > 0;
}







/**
 * Opens a modal to edit a journal entry.
 * @param id {number} - unique identifier and time it was created
 */
function editJournal(id) {
  const modal = document.getElementById("journalModal");
  /** @type {HTMLButtonElement} */
  const saveJournal = document.getElementById("closeModal");
  /** @type {HTMLInputElement} */
  const titleBar = document.getElementById("journalTitle");
  /** @type {HTMLButtonElement} */
  const deleteButton = document.getElementById("deleteModal");
  /** @type {HTMLButtonElement} */
  const cancelButton = document.getElementById("cancelModal");
  /** @type {HTMLDivElement} */
  const itemList = document.getElementById("item-list");

  modal.style.display = "block";
  saveJournal.disabled = true;

  if (!quill) {
    quill = new Quill("#editor", { theme: "snow" });
  }

  let noteObject;
  let isNewJournal = false;

  if (id === undefined) {
    isNewJournal = true;
    id = new Date().getTime();
    noteObject = {
      timestamp: id,
      editTime: id,
      title: "",
      tags: [],
      //delta: undefined,
      delta: { ops: [] },
    };

    quill.setText("\n");
    journalList.push(noteObject);
    saveJournalList(journalList);
  }

  noteObject = getJournalByTimestamp(id);

  const noteID = noteObject.timestamp;

  let contentScreenShot = noteObject.delta;
  let titleScreenshot = noteObject.title;

  quill.setContents(contentScreenShot);
  titleBar.value = noteObject.title;

  quill.on("text-change", quillUpdateTextHandler);

  titleBar.oninput = updateTitleHandler;


  // Delete current journal
  deleteButton.onclick = (event) => {
    if (
      window.confirm(
        `Are you sure you would like to delete the "${noteObject.title}"?`,
      )
    ) {
      deleteJournal(noteID);
      modal.style.display = "none";
      itemList.innerHTML = "";
      displayList(journalList);
      quill.off("text-change", quillUpdateTextHandler);
    }
    event.stopPropagation();
  };

  // Cancel changes and revert notebook
  cancelButton.onclick = (event) => {
    let tempTitle = noteObject.title;
    noteObject.delta = contentScreenShot;
    noteObject.title = titleScreenshot;

    if (isNewJournal) {
      noteObject.title = tempTitle;

      if (
        window.confirm(
          `Are you sure you would like to delete the "${noteObject.title}"?`,
        )
      ) {
        deleteJournal(noteID);
        modal.style.display = "none";
        itemList.innerHTML = "";
        displayList(journalList);
        quill.off("text-change", quillUpdateTextHandler);
      }
      event.stopPropagation();
    }
    else {
      modal.style.display = "none";
      itemList.innerHTML = "";
      displayList(journalList);
      quill.off("text-change", quillUpdateTextHandler);
    }
  }


  saveJournal.onclick = (event) => {
      updateTitleHandler();
      quillUpdateTextHandler();
      modal.style.display = "none";
      itemList.innerHTML = "";
      displayList(journalList);
      quill.off("text-change", quillUpdateTextHandler);
  };

  /**
   * Updates journal entry title with current contents in the title input bar.
   */
  function updateTitleHandler() {
    let title = titleBar.value;
    noteObject.title = title;

    if (isTitleValid(title)) {
      // don't save if title is empty
      saveJournalList(journalList);

      saveJournal.disabled = false;
    } else {
      saveJournal.disabled = true;
      saveJournal.title = "Title cannot be empty";
    }
  }

  /**
   * Updates journal entry with current contents of the Quill editor.
   */
  function quillUpdateTextHandler() {
    const newDelta = quill.getContents();
    let title = titleBar.value;
    
    noteObject.delta = newDelta;

    if (isTitleValid(title)) {
      // don't save if title is empty
      saveJournalList(journalList);

      saveJournal.disabled = false;
    } else {
      saveJournal.disabled = true;
      saveJournal.title = "Title cannot be empty";
    }
    noteObject.editTime = new Date().getTime();
  }
}

/**
 * Searches all journal entries for a string only if the entries include all the specified tags and is within the time period filter.
 * @param {string} query - exact string to search for
 * @param {string[]} tags - list of exact tags to include
 * @param {string} startDate - start date formatted yyyy-mm-dd
 * @param {string} endDate - end date formatted yyyy-mm-dd
 * @returns {any} matching entries
 */
function searchJournal(query, tags, startDate, endDate) {
  let filteredList = journalList;

  // Filter by tags, case-sensitive
  tags.forEach((tag) => {
    filteredList = filteredList.filter((entry) => entry.tags.includes(tag));
  });

  // Filter by date range
  let startMilliseconds = Date.parse(startDate + "T00:00:00"); // Use user's local timezone
  let endMilliseconds = Date.parse(endDate + "T00:00:00");
  // Only filter if date was correctly formatted
  if (!isNaN(startMilliseconds)) {
    filteredList = filteredList.filter(
      (entry) => entry.timestamp >= startMilliseconds,
    );
  }
  if (!isNaN(endMilliseconds)) {
    filteredList = filteredList.filter(
      (entry) => entry.timestamp <= endMilliseconds,
    );
  }

  return getMatchingEntries(filteredList, query);
}

/**
 * Searches a list of entries for a case-insensitive string.
 * @param {Array.Object} list - list of entries
 * @param {string} query - exact string to search for
 * @returns matching entries
 */
function getMatchingEntries(list, query) {
  query = query.toLowerCase();

  let matchingEntriesByTitle = [];
  let matchingEntriesByContent = [];

  list.forEach((entry) => {
    if (entry.title.toLowerCase().includes(query)) {
      matchingEntriesByTitle.push(entry);
    } else if (getTextFromDelta(entry.delta).toLowerCase().includes(query)) {
      matchingEntriesByContent.push(entry);
    }
  });

  return matchingEntriesByTitle.concat(matchingEntriesByContent);
}

/**
 * Extracts all the text in a Quill delta.
 * @param {Object} delta - Quill delta containing text operations
 * @returns all the text in a Quill delta
 */
function getTextFromDelta(delta) {
  if (!delta || !delta.ops) {
    return "";
  }

  let text = "";
  delta.ops.forEach((op) => {
    text += op.insert;
  });
  return text;
}

/**
 * Parses a string of comma-separated tags into an array.
 * @param {string} tagsString - string of comma-separated tags
 * @returns array of tags
 */
function parseTags(tagsString) {
  return tagsString.split(",").filter((tag) => tag.length > 0);
}

/**
 * Gets the search field value.
 * @returns {string} - search field value
 */
function getSearchField() {
  return searchBar.value.trim();
}

/** @type {HTMLInputElement} */
const searchBar = document.getElementById("search-bar");
const tagsBar = document.getElementById("tags-bar");
const startDate = document.getElementById("start-date");
const endDate = document.getElementById("end-date");

function updateDisplay() {
  const searchResults = searchJournal(
      searchBar.value,
      parseTags(tagsBar.value),
      startDate.value,
      endDate.value,
  );

  if (sortMode === "name") {
    searchResults.sort((a, b) => {
      if (sortDirection.name) {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    });
  } else if (sortMode === "timestamp") {
    searchResults.sort((a, b) => {
      if (sortDirection.editTime) {
        return a.editTime - b.editTime;
      } else {
        return b.editTime - a.editTime;
      }
    });
  }

  displayList(searchResults);
}

/**
 * Prepares search functionality on the page.
 */
function setUpSearch() {

  const searchElements = [searchBar, tagsBar, startDate, endDate];
  const itemList = document.getElementById("item-list");

  // EventListener: After typing in any input, filter items to those that match search
  searchElements.forEach((element) => {
    element.oninput = () => {
      itemList.replaceChildren(); // Empty item list
      updateDisplay();
    };
  });
}

export { getTextFromDelta, getMatchingEntries };
