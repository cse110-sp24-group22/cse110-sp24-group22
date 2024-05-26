
//Store the data into localStorage before staring all the things.
let journalList = getJournalList();

document.addEventListener("DOMContentLoaded", init());

function init() {
  displayList(journalList);
  setUpSearch();
}

function displayList(list) {
  //Iterate through list and append them to HTML
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
  listItem.appendChild(title);

  const details = document.createElement("div");
  details.style.fontSize = "small";

  //Get and set timestamp
  const timestamp = new Date(parseInt(item.timestamp)).toLocaleString();
  const timestampText = document.createElement("div");
  timestampText.textContent = `Timestamp: ${timestamp}`;
  details.appendChild(timestampText);

  // Generate tags
  const tagsContainer = document.createElement("div");
  tagsContainer.textContent = "Tags: ";

  item.tags.forEach((tag) => {
    const tagElement = document.createElement("span");
    tagElement.textContent = tag;
    tagElement.className = "tag";
    tagElement.onclick = () => {
      // Event triggered when clicking into tag. Future feature for filter search
    };
    tagsContainer.appendChild(tagElement);
    tagsContainer.appendChild(document.createTextNode(" ")); // Add space between tags
  });

  details.appendChild(tagsContainer);
  listItem.appendChild(details);

  // Delete button
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.className = "delete-button";
  deleteButton.style.display = "none";

  // EventListener: When clicking delete, delete from page and LocalStorage
  deleteButton.onclick = () => {
    listItem.remove();
    deleteJournal(item.timestamp);
  };

  listItem.appendChild(deleteButton);
  listItem.onmouseover = () => {
    deleteButton.style.display = "inline";
  };
  listItem.onmouseout = () => {
    deleteButton.style.display = "none";
  };

  //   Append the entire list item into the list
  itemList.appendChild(listItem);
}

function getJournalList() {
  if (!localStorage.getItem("GarlicNotes")) {
    return [];
  } else {
    return JSON.parse(localStorage.getItem("GarlicNotes"));
  }
}

function deleteJournal(timestamp) {
  journalList = journalList.filter((entry) => entry.timestamp != timestamp);
  saveJournal(journalList);
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

  // Prioritize entries matching on title before matching on content.
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
  // Include each string in insert operations within a Quill Delta
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