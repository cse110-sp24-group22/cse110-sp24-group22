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
  timestamp: true
};

/**
 * Called on page load.
 */
function init() {
  // Store the data into localStorage before starting all the things.
  journalList = getJournalList();
  const newJournalButton = document.querySelector(".new-journal-button");
  const filterButton = document.querySelector(".filter-button");
  displayList(journalList);

  setUpSearch();

  newJournalButton.addEventListener("click", function () {
    editJournal();
  });

  // Animation for the filter dropdown
  filterButton.addEventListener("click", function () {
    const filterHeader = document.querySelector('.filter-container');
    const entryHeader = document.querySelector('.entry-header');
    if(filterHeader.classList.contains('show')) {
      filterHeader.classList.remove('show');
      entryHeader.style.marginTop = '75px'; // adjust based on filterHeader height
      setTimeout(function() {
        filterHeader.style.display = 'none';
      }, 500);
    } else {
      filterHeader.style.display = 'grid';
      setTimeout(() => {
        filterHeader.classList.add('show');
        entryHeader.style.marginTop = '105px'; // adjust based on filterHeader height
      }, 0);
    }
  });

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
function sortByCategory(category) {
  if (category === "name") {
    journalList.sort((a, b) => {
      if (sortDirection.name) {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    });
    sortDirection.name = !sortDirection.name;
  } else if (category === "timestamp") {
    journalList.sort((a, b) => {
      if (sortDirection.timestamp) {
        return a.timestamp - b.timestamp;
      } else {
        return b.timestamp - a.timestamp;
      }
    });
    sortDirection.timestamp = !sortDirection.timestamp;
  }
  updateSortArrows(category);
  displayList(journalList);
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
    timestampSortArrow.innerHTML = sortDirection.timestamp ? "&#9650;" : "&#9660;";
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
  timestampText.textContent = `${new Date(
    timestamp
  ).toLocaleString()}`;
  listItem.appendChild(timestampText);

  //Create delete button
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.className = "delete-button";
  deleteButton.style.display = "none";

  // EventListener: When clicking delete, delete from page and LocalStorage
  deleteButton.onclick = (event) => {
    if(window.confirm(`Are you sure you would like to delete the "${item.title}"?`)) {
      event.stopPropagation();
      listItem.remove();
      deleteJournal(timestamp);
    }
    event.stopPropagation();
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
 * Opens a modal to edit a journal entry.
 * @param id {number} - unique identifier and time it was created
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
    if (event.target == modal) {
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

  let noteObject;
  if (id === undefined) {
    id = new Date().getTime();
    noteObject = {
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
 * Searches all journal entries for a string only if the entries include all the specified tags and is within the time period filter.
 * @param {string} query - exact string to search for
 * @param {string[]} tags - list of exact tags to include
 * @param {string} startDate - start date formatted yyyy-mm-dd
 * @param {string} endDate - end date formatted yyyy-mm-dd
 * @returns matching entries
 */
function searchJournal(query, tags, startDate, endDate) {
  let filteredList = journalList;

  // Filter by tags, case-sensitive
  tags.forEach(tag => {
    filteredList = filteredList.filter(entry => entry.tags.includes(tag));
  });

  // Filter by date range
  let startMilliseconds = Date.parse(startDate + "T00:00:00"); // Use user's local timezone
  let endMilliseconds = Date.parse(endDate + "T00:00:00");
  // Only filter if date was correctly formatted
  if (!isNaN(startMilliseconds)) {
    filteredList = filteredList.filter(entry => entry.timestamp >= startMilliseconds);
  }
  if (!isNaN(endMilliseconds)) {
    filteredList = filteredList.filter(entry => entry.timestamp <= endMilliseconds);
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
  return tagsString.split(",").filter(tag => tag.length > 0);
}

/**
 * Prepares search functionality on the page.
 */
function setUpSearch() {
  const searchBar = document.getElementById("search-bar");
  const tagsBar = document.getElementById("tags-bar");
  const startDate = document.getElementById("start-date");
  const endDate = document.getElementById("end-date");

  const searchElements = [searchBar, tagsBar, startDate, endDate];
  const itemList = document.getElementById("item-list");

  // EventListener: After typing in any input, filter items to those that match search
  searchElements.forEach(element => {
    element.oninput = () => {
      itemList.replaceChildren(); // Empty item list
      displayList(searchJournal(searchBar.value, parseTags(tagsBar.value), startDate.value, endDate.value));
    };
  });
}

export {getTextFromDelta, getMatchingEntries};