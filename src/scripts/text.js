window.addEventListener("DOMContentLoaded", init);

let journalList = [];

function init() {
    journalList = getJournalList();
    

    const listElement = document.getElementById("journalList");
    const closeButton = document.getElementById("closeJournal");
    const journalContainer = document.querySelector(".journal");
    const titleInput = document.getElementById("titleInput");

    listElement.addEventListener("click", function (event) {
        if (event.target.tagName === "LI") {
            // Show the journal container
            journalContainer.style.visibility = "visible";

            const noteObject = getJournalByTimestamp(event.target.innerText);
            let quill = displayJournal(noteObject.timestamp, "#editor");

            quill.on("text-change", () => {
                const newDelta = quill.getContents();
                noteObject.delta = newDelta;
                saveJournal(journalList);
            });
        }
    });
    
    titleInput.addEventListener("input", function (event) {
        // Update title in JournalList when title input changes
        const noteObject = getJournalByTimestamp(event.target.innerText);
        updateTitle(noteObject.timestamp, titleInput.value);
    });


    closeButton.addEventListener("click", function (event) {
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

function getJournalByTimestamp(timestamp) {
    return journalList.find((entry) => entry.timestamp == timestamp);
}

function displayJournal(timestamp, bindingElement) {
    const quill = new Quill(bindingElement, {
        theme: "snow",
    });

    let delta = getJournalByTimestamp(timestamp).delta.ops;
    quill.setContents(delta, "api");
    return quill;
}

function createJournal() {
    const quill = new Quill("#editor", {
        theme: "snow",
    });

    const stamp = new Date().getTime();

    const noteObject = {
        timestamp: stamp,
        title: "",
        tags: [],
        delta: quill.getContents(),
    };

    journalList.push(noteObject);
    saveJournal(journalList);
}

function saveJournal(journalList) {
    localStorage.setItem("GarlicNotes", JSON.stringify(journalList));
}

function updateTitle(timestamp, newTitle) {
    const noteObject = getJournalByTimestamp(timestamp);
    noteObject.title = newTitle;
    saveJournal(journalList);
}


function removeJournal() { }

function clearLocalStorage() { }
