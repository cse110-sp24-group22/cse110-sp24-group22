window.addEventListener("DOMContentLoaded", init);

let journalList = []

function init() {
    journalList = getJournals();


    const quill = new Quill("#editor", {
        theme: "snow",
    });

    // Retrieve the saved content from localStorage and set it to the editor if available
    var savedContent = localStorage.getItem("GarlicNotes");
    if (savedContent) {
        quill.setContents(JSON.parse(savedContent), "api");
    }

    quill.on("text-change", function () {
        delta = quill.getContents();
        localStorage.setItem(
            "quillContent",
            JSON.stringify({ timeHash: quill.getContents() })
        );
    });
}

function getJournals() {
    if (localStorage.length === 0) {
        return [];
    }
    else { return JSON.parse(localStorage.getItem('GarlicNotes')); }
}

function getJournalByTimeHash() {

}

function createJournal() {

}

function addJournal() {
    
}

function removeJournal() { }
