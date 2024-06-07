import { journalList } from "./main.js";

export { getMatchingEntries, saveJournalList, getJournalByTimestamp, deleteJournal, isTitleValid, getJournalList, journalList };

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

// journalList/editing-related utility functions

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