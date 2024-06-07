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
}

function newListOnCanClick() {
    let can = document.getElementById("can-container");
    can.addEventListener("click", () => {
        editJournal();
    })
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