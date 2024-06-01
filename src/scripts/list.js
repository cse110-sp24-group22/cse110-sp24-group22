//Store the data into localStorage before staring all the things.
let journalList = getJournalList();

document.addEventListener("DOMContentLoaded", init);

let quill;

let sortDirection = {
  name: true,
  timestamp: true
};

function init() {
  const newJournalButton = document.querySelector(".new-journal-button");
  displayList(journalList);
  setUpSearch();
  newJournalButton.addEventListener("click", function () {
    editJournal();
  });
}

document.getElementById("sort-name").addEventListener("click", () => {
  sortByCategory("name");
});
document.getElementById("sort-timestamp").addEventListener("click", () => {
  sortByCategory("timestamp");
});

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

function displayList(list) {
  //Iterate through list and append them to HTML
  const itemList = document.getElementById("item-list");
  itemList.innerHTML = "";

  list.forEach((item) => {
    createListItem(item);
  });
}

function createListItem(item) {
  //Get the essential elements
  const itemList = document.getElementById("item-list");
  const listItem = document.createElement("li");
  
  const title = document.createElement("div");
  title.textContent = item.title;
  title.className = "title";
  listItem.appendChild(title);

  // Generate tags
  const tagsContainer = document.createElement("div");
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

  let timestamp = parseInt(item.timestamp);
  const timestampText = document.createElement("div");
  timestampText.textContent = `     ${new Date(
    timestamp
  ).toLocaleString()}`;
  timestampText.className = "timestamp";
  listItem.appendChild(timestampText);

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.className = "delete-button";
  deleteButton.style.display = "none";

  // EventListener: When clicking delete, delete from page and LocalStorage
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

  // Append the entire list item into the list
  itemList.appendChild(listItem);
}

function getJournalList() {
  if (!localStorage.getItem("GarlicNotes")) {
    return [];
  } else {
    return JSON.parse(localStorage.getItem("GarlicNotes"));
  }
}

function getJournalByTimestamp(timestamp) {
  journal = journalList.find((entry) => entry.timestamp == timestamp);
  if (journal === undefined) {
    console.error(`Error: No journal entry found with timestamp ${timestamp}`);
    return undefined;
  } else return journal;
}

function deleteJournal(timestamp) {
  journalList = journalList.filter((entry) => entry.timestamp != timestamp);
  saveJournalList(journalList);
}

function saveJournalList(journalList) {
  localStorage.setItem("GarlicNotes", JSON.stringify(journalList));
}

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
function saveJournal(journalList) {
  localStorage.setItem("GarlicNotes", JSON.stringify(journalList));
}
/**
 * Searches all journal entries for a string only if the entries include all the specified tags and is within the time period filter.
 * @param {string} query - exact string to search for 
 * @param {Array.string} tags - list of exact tags to include
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
