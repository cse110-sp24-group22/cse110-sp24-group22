// Import utility functions
import { getMatchingEntries, saveJournalList, isTitleValid, getJournalList } from "./util.js";

/**
 * Dummy function for JSDoc
 */
function dummy() {}

// Globals
let quill;
let journalList;

document.addEventListener("DOMContentLoaded", function() {
    init()
});

/**
 * Called on page load.
 */
function init() {
    const dateElement = document.getElementById('date');
    const weekDayElement = document.getElementById('weekday');
    journalList = getJournalList();
    // Function to update the date continuously
    function updateDate() {
        const currentDate = new Date();
        weekDayElement.textContent = currentDate.toLocaleString('en-us', {weekday: 'long'});
        dateElement.textContent = currentDate.toLocaleDateString('en-US');
    }

    // Update the date immediately when the script is run
    updateDate();

    // Update the date every minute??
    setInterval(updateDate, 60000);
    newListOnCanClick();
    setUpHomeSearch();
    updatePlantImage();
}

/**
 * Set up click on watering can to bring up editJournal modal.
 */
function newListOnCanClick() {
    let can = document.getElementById("can-container");
    can.onclick = () => {
        editJournal();
    };
}

// Dropdown functions
/** @type {HTMLDivElement} */
const entryDropdownList = document.getElementById("entry-dropdown");
/** @type {HTMLInputElement} */
const searchBar = document.getElementById("search-bar");

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

/**
 * Creates a list item for a journal entry within home page dropdown.
 * @param item {JournalEntry} - journal entry
 */
function createEntryDropdownItem(item) {
  // Get the essential elements for the dropdown
  const entryItem = document.createElement("li");
  
  // Add accessibility through tabindex
  entryItem.setAttribute("tabindex", "0");

  // Create title container
  const title = document.createElement("div");
  title.setAttribute("id", "entry-title");
  title.className = "title";
  displayTitle();

  entryItem.appendChild(title);

  // Create timestamp container
  const timestampText = document.createElement("div");
  timestampText.setAttribute("id", "entry-timestamp");
  displayDateModified();

  entryItem.appendChild(timestampText);

  let timestamp = item.timestamp;

  // Set up click and Space/Enter on entry dropdown item to bring up editJournal modal
  entryItem.onclick = () => {
    editJournal(timestamp);
  };
  entryItem.onkeydown = (event) => {
    if (event.code == "Space" || event.key == "Enter") {
      event.preventDefault();
      editJournal(timestamp);
    }
  };
  
  // Add entry to dropdown container
  entryDropdownList.appendChild(entryItem);

  /**
   * Displays the current entry's title.
   */
  function displayTitle() {
    title.textContent = item.title;
  }
  
  /**
   * Displays the current entry's last modified date.
   */
  function displayDateModified() {
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
    timestampText.textContent = "Edited " + date
      .toLocaleString("en-GB", options)
      .replace(",", "");
  }
}

/**
 * Prepares search bar functionality for displaying dropdown with matching entries.
 */
function setUpHomeSearch() {
  searchBar.oninput = updateDropdown;
}

/**
 * Updates the dropdown with currently matching entries.
 */
function updateDropdown() {
  let query = searchBar.value;
  let matchingEntries = getMatchingEntries(journalList, query);
  if (query.length > 0 && matchingEntries.length > 0) {
    // Display dropdown with the search bar looking connected to the dropdown through shifting where the border roundness/radius is.
    entryDropdownList.style.display = "inline";
    searchBar.style.borderRadius = "12px 12px 0px 0px";
    displayEntryDropdownList(matchingEntries);
  } else {
    // Hide dropdown and reset the border radius to normal.
    entryDropdownList.style.display = "none";
    searchBar.style.borderRadius = "12px";
  }
}

// Modal functions

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
    updatePlantImage()
  }

  noteObject = getJournalByTimestamp(id);

  const noteID = noteObject.timestamp;

  let contentScreenShot = noteObject.delta;
  let titleScreenshot = noteObject.title;
  let editTimeScreenshot = noteObject.editTime;

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
      updateDropdown();
    }
    event.stopPropagation();
  };

  // Cancel changes and revert notebook
  cancelButton.onclick = (event) => {
    let tempTitle = noteObject.title;
    noteObject.delta = contentScreenShot;
    noteObject.title = titleScreenshot;
    noteObject.editTime = editTimeScreenshot;

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
    updateDropdown();
  };

  /**
   * Updates journal entry title with current contents in the title input bar.
   */
  function updateTitleHandler() {
    let title = titleBar.value;
    noteObject.title = title;

    if (isTitleValid(title)) {
      // don't save if title is empty
      noteObject.editTime = new Date().getTime();
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
      noteObject.editTime = new Date().getTime();
      saveJournalList(journalList);

      saveJournal.disabled = false;
    } else {
      saveJournal.disabled = true;
      saveJournal.title = "Title cannot be empty";
    }
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
  updatePlantImage()
}

/**
 * Function to get the count of journal entries.
 * @returns {number} - number of journal entries
 */
function getJournalEntryCount() {
  return journalList.length;
}

/**
 * Function to determine the plant image based on entry count.
 * @param {number} entryCount - number of journal entries
 * @returns {string} - path to the plant image
 */
function getPlantImage(entryCount) {
  const plantStages = [
    { src: '../assets/SVGPlantFiles/Plant/S0.svg', class: 'plant-stage-0' },
    { src: '../assets/SVGPlantFiles/Plant/S1.svg', class: 'plant-stage-1' },
    { src: '../assets/SVGPlantFiles/Plant/S2.svg', class: 'plant-stage-2' },
    { src: '../assets/SVGPlantFiles/Plant/S3.svg', class: 'plant-stage-3' },
    { src: '../assets/SVGPlantFiles/Plant/S4.svg', class: 'plant-stage-4' },
    { src: '../assets/SVGPlantFiles/Plant/S5.svg', class: 'plant-stage-5' }
  ];
  //entryThreshold deciphers how many journal entries must be made to move onto the next stage.
  const entryThreshold = 3
  const stageIdx = Math.floor(entryCount / entryThreshold);
  return plantStages[Math.min(stageIdx, plantStages.length - 1)];
}

/**
 *This should be called whenever journal entries number is changed, including adding journal entries and removing them
 */
function updatePlantImage() {
  const entryCount = getJournalEntryCount();
  const { src, class: plantClass } = getPlantImage(entryCount);
  const plantImageElement = document.getElementById('plant-container');
  plantImageElement.src = src;
  plantImageElement.className = plantClass;
}