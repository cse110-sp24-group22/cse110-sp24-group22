// store the data into localStorage before starting
let journalList = getJournalList();
let journalTags = getJournalTags();
var tagSet = new Set();
let tagsList = [];
let DEFAULT_TITLE = "Untitled";

document.addEventListener("DOMContentLoaded", init);

let quill;

function init() {
  const newJournalButton = document.querySelector(".new-journal-button");
  displayList(journalList);
  setUpSearch();

  newJournalButton.addEventListener("click", function () {
    editJournal();
  });

  // Animation for the filter dropdown
  const filterButton = document.getElementById("filter-button");
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

  document.getElementById("sort-name").addEventListener("click", () => {
    sortByCategory("name");
  });
  document.getElementById("sort-timestamp").addEventListener("click", () => {
    sortByCategory("timestamp");
  });  
}

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
      if (sortDirection.editTime) {
        return a.editTime - b.editTime;
      } else {
        return b.editTime - a.editTime;
      }
    });
    sortDirection.editTime = !sortDirection.editTime;
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

function createListItem(item) {
  //Get the essential elements
  const itemList = document.getElementById("item-list");
  const listItem = document.createElement("li");

  const title = document.createElement("div");
  title.textContent = item.title;
  listItem.appendChild(title);

  const details = document.createElement("div");
  details.style.fontSize = "small";
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
  const journal = journalList.find((entry) => entry.timestamp == timestamp);
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
 * Displays modal and edits journal entry
 * @param {*} id 
 */
function editJournal(id) {
  const modal = document.getElementById("journalModal");
  /** @type {HTMLButtonElement} */
  const saveJournal = document.getElementById("closeModal");
  /** @type {HTMLInputElement} */
  const titleBar = document.getElementById("journalTitle");
  /** @type {HTMLDivElement} */
  const itemList = document.getElementById("item-list");
  const cancelButton = document.getElementById("cancelModal");
  const deleteModal = document.getElementById("deleteModal");

  /* Tags */
  const tagAdd = document.getElementById("tag-plus-button");    // button for adding tags
  const tagInput = document.getElementById("tag-input");        // tags input segment
  const tagInputBar = document.getElementById("tag-input-bar"); // input bar for tags 
  const tagList = document.getElementById("tag-list");          // dropdown list for global tags
  const tagSave = document.getElementById("save-tag");          // button for saving tags 
  const tagsWrapper = document.getElementById("tag-plus");          // tag buttons segment

  tagInput.style.display = "none";
  tagAdd.style.display = "block";

  /* Displays modal */
  modal.style.display = "block";

  /* Opens Quill */
  if (!quill) {
    quill = new Quill("#editor", { theme: "snow" });
  }

  /* Closes modal */    //FIX
  closeModal.addEventListener("click", function () {
    modal.style.display = "none";
    displayList(journalList);
  });

  window.addEventListener("click", function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });

  /* Deletes journal inside modal */
  deleteModal.onclick = () => {
    if (window.confirm(`Are you sure you would like to delete ${titleBar.value}?`)) {
      modal.style.display = "none";
      deleteJournal(id);  
      saveJournalList(journalList);
      displayList(journalList);
    }
  }

  /* Saves journal */
  saveJournal.onclick = () => {
    // updateTitleHandler(); FIX
    const journalContent = quill.root.innerHTML;
    console.log(journalContent);
    modal.style.display = "none";
    itemList.innerHTML = "";
    displayList(journalList);
  };

  // saveJournal.addEventListener(
  //   "click",
  //   function () {
  //     updateTitleHandler();
  //     quillUpdateTextHandler();
  //     modal.style.display = "none";
  //     itemList.innerHTML = "";
  //     displayList(journalList);
  //     //removeJournalEventListeners();
  //   },
  //   { once: true },
  // );

  /* Uses timestamp as id, Creates new noteObject*/

  let noteObject;
  if (id === undefined) {
    id = new Date().getTime();
    let noteObject = {
      timestamp: id,
      title: "",
      editTime: id,
      title: DEFAULT_TITLE,
      tags: [],
      //delta: undefined,
      delta: { ops: [] },
    };

    quill.setText("\n");
    journalList.push(noteObject);
    saveJournalList(journalList);
  }

  noteObject = getJournalByTimestamp(id);

  let contentScreenShot = noteObject.delta;

  quill.setContents(contentScreenShot);
  titleBar.value = noteObject.title;

  quill.on("text-change", () => {
    const newDelta = quill.getContents();
    noteObject.delta = newDelta;
    saveJournalList(journalList);
  });


  /* Adds or modifies title */
  titleBar.onchange = () => {
    let title = titleBar.value;
    noteObject.title = title;
    saveJournalList(journalList);
  }

  // Cancel changes and revert notebook
  cancelButton.onclick = () => {
    noteObject.delta = contentScreenShot;

    // if (contentScreenShot.ops == [] && !isTitleValid(titleBar.value)) { //FIX: no isTitleValid function
    //   deleteJournal(noteObject.timestamp);
    // } else if (!isTitleValid(titleBar.value)) {
    //   cancelButton.disabled = true;
    // } else {
    //   cancelButton.disabled = false;
    // }

    modal.style.display = "none";
    itemList.innerHTML = "";
    displayList(journalList);
  };

  /**
   * Updates journal entry title with current contents in the title input bar.
   */
  function updateTitleHandler() {
    if (isTitleValid(title)) {
      // don't save if title is empty
      saveJournalList(journalList);

      saveJournal.disabled = false;
    } else {
      saveJournal.disabled = true;
      saveJournal.title = "Title cannot be empty";
    }
  }; 

  /* Adds or modifies tags */
  tagAdd.onclick = () => {
    journalTags = getJournalTags();
    tagInput.style.display = "block";
    tagAdd.style.display = "none";
    journalTags.forEach(tag => {
      const tagItem = document.createElement("option"); // display tag as part of the dropdown list 
      // populate tag with info 
      tagItem.value = tag;  
      tagItem.className = "tag-item";
      tagList.appendChild(tagItem);
    })
  };

  /* Displays tag buttons */
  const tagsTextNode = tagsWrapper.childNodes[0]; // Get the "Tags: " text node

  let currentNode = tagsTextNode.nextSibling; // Iterate over child nodes and remove dynamically added tags
  while (currentNode && currentNode !== tagAdd) {
      const nextNode = currentNode.nextSibling;
      tagsWrapper.removeChild(currentNode);
      currentNode = nextNode;
  }
  
  noteObject.tags.forEach(tag => {
    createTag(tag, tagsWrapper, noteObject, tagAdd);
  });

  /* Saves tags to each entry and globally */
  tagSave.onclick = () => {
    journalTags = getJournalTags();
    tagsList = parseTags(tagInputBar.value);  // parse input into array
    tagsList.forEach(tag => {
      journalTags.add(tag); // add tag to global set
      if(noteObject.tags.includes(tag)) { // check if tags already added to the entry
        alert(`${tag} already added!`);
        return;
      }
      createTag(tag, tagsWrapper, noteObject, tagAdd);  // create new tag buttons and populate with info
    });
    noteObject.tags = [...new Set([...noteObject.tags, ...tagsList])]; // save as note's tags
    saveJournalTags([...journalTags]);
    saveJournalList(journalList);
    tagInputBar.value = ""; // clear input bar
    tagInput.style.display = "none";
    tagAdd.style.display = "block";
  };
}

/**
 * Creates tag buttons 
 * @param {string} tag - tag name
 * @param {object} tagsWrapper - HTML element
 * @param {object} noteObject - entry
 * @param {object} tagAdd - tag plus button
 */
function createTag(tag, tagsWrapper, noteObject, tagAdd) {
  const newTagElement = document.createElement("div");  // creates HTML element
  newTagElement.className = "colored-tag";
  newTagElement.textContent = tag;
  tagsWrapper.insertBefore(newTagElement, tagAdd);
  
  newTagElement.onclick = function() {  // remove tag buttons when clicked
    if(window.confirm(`Are you sure you would like to delete the "${newTagElement.textContent}"?`)) {
      noteObject.tags = noteObject.tags.filter(t => t != tag);
      newTagElement.remove();
      saveJournalList(journalList);
    }

    noteObject.editTime = new Date().getTime();
  }
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