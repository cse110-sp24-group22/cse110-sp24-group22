//Store the data into localStorage before staring all the things.
let journalList = getJournalList();

document.addEventListener("DOMContentLoaded", init());

let quill;

function init() {
  const newJournalButton = document.querySelector(".new-journal-button");
  displayList(journalList);
  newJournalButton.addEventListener("click", function() {editJournal()});
}

function displayList (journalList){
    //Iterate through list and append them to HTML
    journalList.forEach((item) => {
        createListItem(item);
    });
}


function createListItem(item) {
  //Get the essential elements
  const itemList = document.getElementById("item-list");
  const listItem = document.createElement("li");
  const title = document.createElement("div");


  title.textContent = item.title;
  listItem.appendChild(title);

  const details = document.createElement("div");
  details.style.fontSize = "small";

//   Get and set timestamp
  let timestamp = parseInt(item.timestamp)
  const timestampText = document.createElement("div");
  timestampText.textContent = `Timestamp: ${new Date(timestamp).toLocaleString()}`;
  details.appendChild(timestampText);

  // Generate tags
  const tagsContainer = document.createElement("div");
  tagsContainer.textContent = "Tags: ";

  item.tags.forEach((tag) => {
    const tagElement = document.createElement("span");
    tagElement.textContent = tag;
    tagElement.className = "tag";
    tagElement.onclick = () => {
    // Event triggered when clicking into tag. Future feature for filter search
    };
    tagsContainer.appendChild(tagElement);
    tagsContainer.appendChild(document.createTextNode(" ")); // Add space between tags
  });




  details.appendChild(tagsContainer);
  listItem.appendChild(details);

  // Delete button
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.className = "delete-button";
  deleteButton.style.display = "none";

// EventListener: When clicking delete, delete from page and LocalStorage
  deleteButton.onclick = () => {
    listItem.remove();
    deleteJournal(item.timestamp);
  };

  listItem.appendChild(deleteButton);
  listItem.onmouseover = () => {
    deleteButton.style.display = "inline";
  };
  listItem.onmouseout = () => {
    deleteButton.style.display = "none";
  };
  listItem.onclick = () => {
    editJournal(timestamp);
  };

//   Append the entire list item into the list
  itemList.appendChild(listItem);
}

function getJournalList() {
    if (!localStorage.getItem("GarlicNotes")) {
        return [];
    } else {
        return JSON.parse(localStorage.getItem("GarlicNotes"));
    }
}

function getJournalByTimestamp(timestamp) {
  journal = journalList.find((entry) => entry.timestamp == timestamp)
  if (journal === undefined) {
    console.error(`Error: No journal entry found with timestamp ${timestamp}`);
    return undefined;
  }
  else return journal;
}

function deleteJournal(timestamp) {
    journalList = journalList.filter(entry => entry.timestamp != timestamp);
    saveJournal(journalList);
}

function saveJournal(journalList) {
    localStorage.setItem("GarlicNotes", JSON.stringify(journalList));
}

function editJournal (id) {

  const modal = document.getElementById("journalModal");
  const closeModal = document.getElementById("closeModal");
  const saveJournal = document.getElementById("saveJournal");
  
  modal.style.display = "block";


  if (!quill) {
    quill = new Quill('#editor', {
      theme: 'snow'
    });
  }


  closeModal.addEventListener("click", function() {
    modal.style.display = "none";
  });

  window.addEventListener("click", function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });

  saveJournal.addEventListener("click", function() {
    const journalContent = quill.root.innerHTML;
    console.log(journalContent);
    // Add your logic to save the journal content
    modal.style.display = "none";
  });
  
  if (id !== undefined){
    journal = getJournalByTimestamp(id);
    quill.setContents(journal.delta);
  }
  else{
    quill.setText('\n');
  }
}
