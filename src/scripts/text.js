window.addEventListener("DOMContentLoaded", init);

let journalList = [{
        timestamp: "1716097247973", // Example timestamp
        title: "Journal Entry 1",
        tags: [],
        delta: { ops: [{ insert: 'Initial content' }] }, // Example delta
    },
    {
        timestamp: "1723097247973", // Example timestamp
        title: "Journal Entry 2",
        tags: [],
        delta: { ops: [{ insert: 'Initial content' }] }, // Example delta
    },
    {
        timestamp: "1736097247973", // Example timestamp
        title: "Journal Entry 3",
        tags: [],
        delta: { ops: [{ insert: 'Initial content' }] }, // Example delta
    }
];

let currentQuill = null; // Maintain reference to current Quill instance

function init() {
    const listElement = document.getElementById("journalList");
    const closeButton = document.getElementById("closeJournal");
    const journalContainer = document.querySelector(".journal");
    const titleInput = document.getElementById("titleInput");
    const saveButton = document.getElementById("saveJournal");

    // Load journal list from localStorage
    //journalList = getJournalList();

    listElement.addEventListener("click", function(event) {
        if (event.target.tagName === "LI") {
            // Show the journal container
            journalContainer.style.visibility = "visible";

            const timestamp = event.target.getAttribute("data-timestamp");
            var noteObject = getJournalByTimestamp(timestamp);

            if (noteObject) {
                // Reset previous Quill instance if exists
                if (currentQuill) {
                    currentQuill.setContents([]);
                    currentQuill.off("text-change");
                }

                currentQuill = displayJournal(timestamp, "#editor");

                currentQuill.on("text-change", () => {
                    const newDelta = currentQuill.getContents();
                    noteObject.delta = newDelta;
                    saveJournal(journalList);
                });

                titleInput.value = noteObject.title;

                closeButton.addEventListener("click", function(event) {
                    journalContainer.style.visibility = "hidden";
                    noteObject = null;
                });

                saveButton.addEventListener("click", function(event) {
                    updateTitleAndSave(timestamp, titleInput.value);
                    // Update UI after saving the title
                    updateUI();
                });
            }
        }
    });

    titleInput.addEventListener("input", function(event) {
        // Update title in JournalList when title input changes
        const noteObject = getJournalByTimestamp(event.target.innerText);
        if (noteObject) {
            updateTitle(noteObject.timestamp, titleInput.value);
            updateUI(); // Update UI after updating the title
        }
    });

    // Function to update UI with the latest journal list
    function updateUI() {
        listElement.innerHTML = ""; // Clear previous entries
        journalList.forEach(entry => {
            const listItem = document.createElement("li");
            listItem.textContent = entry.title;
            listItem.setAttribute("data-timestamp", entry.timestamp);
            listElement.appendChild(listItem);
        });
    }

    // Initial update of UI
    updateUI();
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
}

function updateTitleAndSave(timestamp, newTitle) {
    updateTitle(timestamp, newTitle);
    saveJournal(journalList);
}