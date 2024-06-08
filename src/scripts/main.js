// Import utility functions
import { getMatchingEntries, saveJournalList, isTitleValid, getJournalList, createTag, saveJournalTags, getJournalTags, parseTags } from "./util.js";

/**
 * Dummy function for JSDoc
 */
function dummy() {}

// Globals
let quill;
let journalList;
let journalTags = getJournalTags();
let tagsList = [];
let DEFAULT_TITLE = "Untitled";
let currentPlantStage = localStorage.getItem('currentPlantStage') ? parseInt(localStorage.getItem('currentPlantStage')) : 0;

document.addEventListener("DOMContentLoaded", function() {
    init();
    displayPlantImage();
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

  /* Tags */
  /** @type {HTMLButtonElement} */
  const tagAdd = document.getElementById("tag-plus-button");    // button for adding tags
  /** @type {HTMLDivElement} */
  const tagInput = document.getElementById("tag-input");        // tags input segment
  /** @type {HTMLInputElement} */
  const tagInputBar = document.getElementById("tag-input-bar"); // input bar for tags
  /** @type {HTMLDataListElement} */
  const tagList = document.getElementById("tag-list");          // dropdown list for global tags
  /** @type {HTMLButtonElement} */
  const tagSave = document.getElementById("save-tag");          // button for saving tags
  /** @type {HTMLDivElement} */
  const tagsWrapper = document.getElementById("tag-plus");      // tag buttons segment

  tagInput.style.display = "none";
  tagAdd.style.display = "block";

  /* Displays modal */
  modal.style.display = "block";
  saveJournal.disabled = false;

  /* Opens Quill */
  if (!quill) {
    quill = new Quill("#editor", { theme: "snow" });
  }

  /* Closes modal */
  closeModal.addEventListener("click", function () {
    modal.style.display = "none";
    renderRoots();
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
      renderRoots();
    }
  }

  /* Saves journal */
  saveJournal.onclick = () => {
    updateTitleHandler();
    quillUpdateTextHandler();
    modal.style.display = "none";
    quill.off("text-change", quillUpdateTextHandler);
    updateDropdown();
  };
  
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
  let editTimeScreenshot = noteObject.editTime;

  quill.setContents(contentScreenShot);
  titleBar.value = noteObject.title;

  quill.on("text-change", quillUpdateTextHandler);

  /* Adds or modifies title */
  titleBar.oninput = updateTitleHandler;

  /* Delete current journal */
  deleteButton.onclick = (event) => {
    if (
      window.confirm(
        `Are you sure you would like to delete "${noteObject.title}"?`,
      )
    ) {
      deleteJournal(noteID);
      modal.style.display = "none";
      quill.off("text-change", quillUpdateTextHandler);
      updateDropdown();
    }
    event.stopPropagation();
  };

  /* Cancel changes and revert notebook */
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
    renderRoots();
  }



  saveJournal.onclick = (event) => {
    updateTitleHandler();
    quillUpdateTextHandler();
    modal.style.display = "none";
    quill.off("text-change", quillUpdateTextHandler);
    updateDropdown();
    updatePlantImage();
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


/* PLANT FUNCTIONALITY*/
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
  return {...plantStages[Math.min(stageIdx, plantStages.length - 1)], stageIdx};
}

/**
 *This should be called whenever journal entries number is 
 changed, including adding journal entries and removing them
 */
function updatePlantImage() {
  const entryCount = getJournalEntryCount();
  const { src, class: plantClass, stageIdx } = getPlantImage(entryCount);
  const plantImageElement = document.getElementById('plant-container');

  //disables transition for initial load to prevent unnecessary slide motion
  plantImageElement.style.transition = 'none';

  if (stageIdx <= currentPlantStage) {
    //no animation when stage did not increase
    plantImageElement.src = src;
    plantImageElement.className = plantClass;
    currentPlantStage = stageIdx;
    localStorage.setItem('currentPlantStage', currentPlantStage);
  }    
  else {
    //plays little animation if stage increased
    plantImageElement.classList.add('rumble');
    setTimeout(() => {
      // Remove the animation class after the animation completes
      plantImageElement.src = src;
      plantImageElement.className = plantClass;
      
      setTimeout(() => {
        plantImageElement.classList.remove('rumble');
      }, 2000); // duration of the animation
      currentPlantStage = stageIdx;
      localStorage.setItem('currentPlantStage', currentPlantStage);
    }, 1000); 
  }
}

/**
 * Function to display the plant image immediately on page load
 */
function displayPlantImage() {
  const entryCount = getJournalEntryCount();
  const { src, class: plantClass } = getPlantImage(entryCount);
  const plantImageElement = document.getElementById('plant-container');
  plantImageElement.src = src;
  plantImageElement.className = plantClass;
}

/**
 * ROOT FUNCTIONALITY
 */

/** @type {Object.<"January" | "February" | "March" | "April" | "May" | "June" | "July" | "August" | "September" |
 * "October" | "November" | "December", number[]> | null} */
let rootNodeData = null;

/** @type {HTMLDivElement} */
const rootNodeContainer = document.getElementById("root-nodes");

const containerResizeObserver = new ResizeObserver(() => {
    renderRoots();
});
containerResizeObserver.observe(rootNodeContainer);

async function loadRoots() {
  const text = await fetch("../assets/positions.json");
  rootNodeData = await text.json();

  renderRoots();
}

const COLORS = [];

function getColor() {
  let R = 0xdb / 255;
  let G = 0x9e / 255;
  let B = 0x3a / 255;

  R += (Math.random() - 0.5) * 0.2;
  G += (Math.random() - 0.5) * 0.2;
  B += (Math.random() - 0.5) * 0.1;

  return "#" + Math.floor(R * 255).toString(16) + Math.floor(G * 255).toString(16) + Math.floor(B * 255).toString(16);
}

for (let i = 0; i < 400; ++i) {
  COLORS.push(getColor());
}

async function loadExampleEntries() {
  // Load from exampleEntries.json and save into GarlicNotes
    const text = await fetch("../assets/exampleEntries.json");
    const exampleEntries = await text.json();
    journalList = exampleEntries;
    saveJournalList(journalList);
}

// For debugging purposes
globalThis.loadExampleEntries = loadExampleEntries;

function filterJournalsByDate(date) {
  return journalList.filter((journal) => {
    const journalDate = new Date(journal.timestamp);
    return journalDate.getDate() === date.getDate() && journalDate.getMonth() === date.getMonth();
  });
}

function renderRoots() {
  if (!rootNodeData) {
    return;
  }
  const rootRect = document.getElementById("root-container").getBoundingClientRect();

  const width = rootRect.width;
  const height = rootRect.height;

  function createNodeAt(x, y) {
    const node = document.createElement("div");
    node.className = "root-node";
    node.style.position = "absolute";

    // Move things so that they align correcrtly
    const SCALE_X = 0.00190;
    const SCALE_Y = 0.00128;

    node.style.left = `${x * SCALE_X * width}px`;
    node.style.top = `${y * SCALE_Y * height}px`;

    return node;
  }

  rootNodeContainer.innerHTML = "";

  let nodeI = 0;
  for (const [ month, positions ] of Object.entries(rootNodeData)) {
    const nodes = [];

    for (let i = 0; i < positions.length; i += 2) {
      if (month === "February" && i === 28 * 2) {
        break;
      }

      const MIDWAY = month === "February" ? 14 : 15;

      const YEAR = 2023;
      // construct from month, year and i
      const date = new Date(YEAR,
          ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
              .indexOf(month), (i / 2) + 1);

      const entries = filterJournalsByDate(date);

      if (entries.length === 0) continue;

      const node = createNodeAt(positions[i], positions[i + 1]);
      const labelText = document.createElement("div");

      labelText.className = "root-node-label";
      labelText.textContent = `${month} ${date.getDate()}`;
      node.appendChild(labelText);

      function hideLabel() {
        labelText.style.display = "none";
      }

      hideLabel();

      node.style.backgroundColor = COLORS[nodeI++];
      node.onclick = () => {
        editJournal(entries[0].timestamp);
      };

      node.onmouseenter = () => {
        labelText.style.display = "block";
      };

      if (i / 2 < MIDWAY) { // Put label text on the bottom left
        labelText.style.left = "10px";
        labelText.style.bottom = "20px";
      } else {
        labelText.style.right = "100%";
        labelText.style.top = "0px";
      }


      node.onmouseleave = hideLabel;

      nodes.push(node);
    }

    for (const node of nodes) {
      rootNodeContainer.appendChild(node);
    }
  }
}

loadRoots();
