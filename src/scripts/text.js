window.addEventListener("DOMContentLoaded", init);

let journalList = [];

function init() {
    journalList = getJournalList();

    const listElement = document.getElementById('journalList');
    const closeButton = document.getElementById('closeJournal');
    const journalContainer = document.querySelector('.journal');

    listElement.addEventListener('click', function(event) {
      if (event.target.tagName === 'LI') {
        // Show the journal container
        journalContainer.style.visibility = "visible";
      }
    });

    closeButton.addEventListener('click', function(event) {
        journalContainer.style.visibility = "hidden";
    });
}


function getJournalList() {
    if (!localStorage.getItem("GarlicNotes")) {
        return [];
    } else {
        return JSON.parse(localStorage.getItem("GarlicNotes"));
    }
}

function getJournalByID(id) {
    return getJournalList().find((item) => item.id === id);
}

function loadJournal(id) { 

}

function createJournal() {
    const quill = new Quill("#editor", {
        theme: "snow",
    });

    const stamp = new Date().getTime();

    const noteObject = {
        timestamp: stamp,
        "title": "",
        tags: [],
        delta: JSON.stringify(quill.getContents()),
    };

    journalList.push(noteObject);
    saveJournal(journalList);
}

function saveJournal(journalList) {
    localStorage.setItem("GarlicNotes", JSON.stringify(journalList));
}

function removeJournal() { }

function clearLocalStorage() { }
