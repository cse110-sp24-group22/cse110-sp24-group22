/**
 * Dummy function for JSDoc
 */
function dummy() {}

// Globals
let journalList;
let quill;

document.addEventListener("DOMContentLoaded", function() {
    init()
});

function init() {
    const dateElement = document.getElementById('date');
    journalList = getJournalList();
    // Function to update the date continuously
    function updateDate() {
        const currentDate = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = currentDate.toLocaleDateString('en-US', options);
        dateElement.textContent = formattedDate;
    }

    // Update the date immediately when the script is run
    updateDate();

    // Update the date every minute??
    setInterval(updateDate, 60000);
    newListOnCanClick();
    setUpHomeSearch();
}

function newListOnCanClick() {
    let can = document.getElementById("can-container");
    can.addEventListener("click", () => {
        editJournal();
    })
}

// DROPDOWN FUNCTIONS
const entryDropdownList = document.getElementById("entry-dropdown");

/**
 * Displays a list of journal entries on the page.
 * @param list {JournalEntry[]} - list of journal entries
 */
function displayEntryDropdownList(list) {
  //Iterate through list and append them to HTML
  entryDropdownList.innerHTML = "";

  list.forEach((item) => {
    createEntryDropdownItem(item);
  });
}

function createEntryDropdownItem(item) {
  // Get the essential elements for the dropdown
  const entryItem = document.createElement("li");
  
  // Make interactable entry keyboard-focusable for accessibility
  entryItem.setAttribute("tabindex", "0");
  
  // Create title container
  const title = document.createElement("div");
  title.setAttribute("id", "entry-title");
  title.textContent = item.title;
  title.className = "title";
  
  entryItem.appendChild(title);

  //Create timestamp container
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

  entryItem.appendChild(timestampText);

  // Add entry to dropdown
  entryDropdownList.appendChild(entryItem);
}

function setUpHomeSearch() {
  const searchBar = document.getElementById("search-bar");
  const entryDropdownList = document.getElementById("entry-dropdown");

  searchBar.oninput = () => {
    let query = searchBar.value;
    let matchingEntries = getMatchingEntries(journalList, query);
    if (query.length > 0 && matchingEntries.length > 0) {
      entryDropdownList.style.display = "inline";
      searchBar.style.borderRadius = "12px 12px 0px 0px";
      displayEntryDropdownList(matchingEntries);
    } else {
      entryDropdownList.style.display = "none";
      searchBar.style.borderRadius = "12px";
    }
  }
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

// MODAL FUNCTIONS

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
          quill.off("text-change", quillUpdateTextHandler);
        }
        event.stopPropagation();
      }
      else {
        modal.style.display = "none";
        quill.off("text-change", quillUpdateTextHandler);
      }
    }
  
  
    saveJournal.onclick = (event) => {
        updateTitleHandler();
        quillUpdateTextHandler();
        modal.style.display = "none";
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
 * Saves the list of journal entries to localStorage.
 * @param journalList {JournalEntry[]} - list of journal entries
 */
function saveJournalList(journalList) {
    localStorage.setItem("GarlicNotes", JSON.stringify(journalList));
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

    function deleteJournal(timestamp) {
    journalList = journalList.filter((entry) => entry.timestamp != timestamp);
    saveJournalList(journalList);
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