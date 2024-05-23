let journalList = JSON.parse(localStorage.getItem("GarlicNotes"));

document.addEventListener("DOMContentLoaded", init());

function init() {
  displayList(journalList);
}

function displayList (journalList){
    journalList.forEach((item) => {
        createListItem(item);
    });
}

// Create list elements and append them to the list
function createListItem(item) {
    const itemList = document.getElementById("item-list");
  const listItem = document.createElement("li");
  const title = document.createElement("div");

  title.textContent = item.title;
  listItem.appendChild(title);

  const details = document.createElement("div");
  details.style.fontSize = "small";

  const timestamp = new Date(parseInt(item.timestamp)).toLocaleString();
  const timestampText = document.createElement("div");
  timestampText.textContent = `Timestamp: ${timestamp}`;
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

  itemList.appendChild(listItem);
}

function getJournalList() {
    if (!localStorage.getItem("GarlicNotes")) {
        return [];
    } else {
        return JSON.parse(localStorage.getItem("GarlicNotes"));
    }
}

function deleteJournal(timestamp) {
    journalList = journalList.filter(entry => entry.timestamp != timestamp);
    saveJournal(journalList);
}

function saveJournal(journalList) {
    localStorage.setItem("GarlicNotes", JSON.stringify(journalList));
}
