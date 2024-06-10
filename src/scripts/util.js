// Export utility functions
export { 
  getMatchingEntries, 
  saveJournalList, 
  isTitleValid, 
  getJournalList, 
  createTag, 
  saveJournalTags, 
  getJournalTags, 
  parseTags 
};

// Search-related utility functions

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

// journalList/editing-related utility functions. These functions don't require looking into a global journalList object.

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

/**
 * Saves the list of journal entries to localStorage.
 * @param list {JournalEntry[]} - list of journal entries
 */
function saveJournalList(list) {
  localStorage.setItem("GarlicNotes", JSON.stringify(list));
}

// Tags-related utility functions

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
    }
  }
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
 * Gets tags from localStorage
 * @return new set or tags from localStorage parsed as set
 */
function getJournalTags() {
  if(!localStorage.getItem("GarlicNotesTags")) {
    return new Set();
  }
  return new Set(JSON.parse(localStorage.getItem("GarlicNotesTags")));
}

/**
 * Saves tags into localStorage
 * @param {Set} journalTags 
 */
function saveJournalTags(journalTags) {
  localStorage.setItem("GarlicNotesTags", JSON.stringify(journalTags));
}