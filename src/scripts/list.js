//Store the data into localStorage before staring all the things.
let journalList = getJournalList();
let journalTags = getJournalTags();
var tagSet = new Set();
let tagsList = [];

document.addEventListener("DOMContentLoaded", init);

let quill;

function init() {
  const newJournalButton = document.querySelector(".new-journal-button");
  displayList(journalList);
  setUpSearch();

  newJournalButton.addEventListener("click", function () {
    editJournal();
  });
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
  listItem.appendChild(title);

  const details = document.createElement("div");
  details.style.fontSize = "small";

  let timestamp = parseInt(item.timestamp);
  const timestampText = document.createElement("div");
  timestampText.textContent = `Timestamp: ${new Date(
    timestamp
  ).toLocaleString()}`;
  details.appendChild(timestampText);

  // Generate tags
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

function getJournalTags() {
  if(!localStorage.getItem("GarlicNotesTags")) {
    return tagSet;
  }
  return new Set(JSON.parse(localStorage.getItem("GarlicNotesTags")));
}

function deleteTag(tag) {
  journalTags = journalTags.filter((entry) => entry != tag);
  saveJournalTags(journalTags);
}

// storage of tags on localStorage
function saveJournalTags(journalTags) {
  localStorage.setItem("GarlicNotesTags", JSON.stringify(journalTags));
}

function saveJournalList(journalList) {
  localStorage.setItem("GarlicNotes", JSON.stringify(journalList));
}

/**
 * Display tag buttons
 * @param {string[]} tags 
 */
function createTags(tags) {
  const tagsWrapper = document.getElementById("tags");

  const children = [...tagsWrapper.children];
  for (let i = 0; i < children.length - 1; ++i) {
    children[i].remove();
  }

  for (let tagName of tags.reverse()) {
    const tagElement = document.createElement("div");
    tagElement.classList.add("colored-tag");
    tagElement.innerText = tagName;

    tagsWrapper.insertBefore(tagElement, tagsWrapper.firstChild);
  }
}

function editJournal(id) {
  const modal = document.getElementById("journalModal");
  const closeModal = document.getElementById("closeModal");
  const saveJournal = document.getElementById("saveJournal");
  const titleBar = document.getElementById("journalTitle");
  const itemList = document.getElementById("item-list");
  const tagAdd = document.getElementById("tag-plus-button");
  const tagInput = document.getElementById("tag-input");
  const tagInputBar = document.getElementById("tag-input-bar");
  const tagList = document.getElementById("tag-list");
  const tagSave = document.getElementById("save-tag");
  const tagsWrapper = document.getElementById("colored-tag");

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

  tagInput.value = noteObject.tags; // populate input bar with tags from the note

  tagAdd.addEventListener("click", () => {
    tagInput.style.display = "block";
  });

  tagSave.addEventListener("click", () => {
    tagsList = parseTags(tagInputBar.value);  // parse input into array
    tagsList.forEach(tag => {
      journalTags.add(tag);
      const tagItem = document.createElement("option");
      tagItem.value = tag;
      tagItem.className = 'tag-item';
      tagList.appendChild(tagItem);
    });
    noteObject.tags = tagsList; // save as note's tags
    saveJournalTags([...journalTags]);
  })

  tagsWrapper.addEventListener("click", () => {
    tagsWrapper.remove();
  })
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
 * Create HTML corresponding to some tags.
 * @param {string[]} tags 
 * @returns {string} The corresponding HTML
 */
function createTagHtml(tags) {

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

function onTagPlusButton() {

}

function onSaveTagButton() {

}

function onTagClicked(tag) {

}

document.getElementById("tag-plus-button").addEventListener("click", onTagPlusButton);
document.getElementById("tag-plus-button").addEventListener("click", onSaveTagButton);