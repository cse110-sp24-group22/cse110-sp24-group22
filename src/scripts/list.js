let journalList = getJournalList();

document.addEventListener("DOMContentLoaded", init);

let quill;

function init() {
  const newJournalButton = document.querySelector(".new-journal-button");
  displayList(journalList);
  setUpSearch();

  newJournalButton.addEventListener("click", function () {
    editJournal();
  });
}

function displayList(journalList) {
  const itemList = document.getElementById("item-list");
  itemList.innerHTML = "";

  journalList.forEach((item) => {
    createListItem(item);
  });
}

function createListItem(item) {
  const itemList = document.getElementById("item-list");
  const listItem = document.createElement("li");

  const title = document.createElement("div");
  title.setAttribute("id", "entry-title");
  title.textContent = item.title;
  listItem.appendChild(title);
  
  const details = document.createElement("div");
  details.style.fontSize = "small";

  let timestamp = parseInt(item.timestamp);
  const timestampText = document.createElement("div");
  timestampText.setAttribute("id", "entry-timestamp");
  timestampText.textContent = `Timestamp: ${new Date(
    timestamp
  ).toLocaleString()}`;
  details.appendChild(timestampText);

  const tagsContainer = document.createElement("div");
  tagsContainer.setAttribute("id", "entry-tags");
  tagsContainer.textContent = "Tags: ";

  item.tags.forEach((tag) => {
    const tagElement = document.createElement("span");
    tagElement.textContent = tag;
    tagElement.className = "tag";
    tagElement.onclick = () => {
      // Future feature for filter search
    };
    tagsContainer.appendChild(tagElement);
    tagsContainer.appendChild(document.createTextNode(" ")); // Add space between tags
  });

  details.appendChild(tagsContainer);
  listItem.appendChild(details);

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.className = "delete-button";
  deleteButton.style.display = "none";

  deleteButton.onclick = (event) => {
    if(window.confirm(`Are you sure you would like to delete the "${item.title}"?`)) {
      event.stopPropagation();
      listItem.remove();
      deleteJournal(timestamp);
    }
    event.stopPropagation();
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
  journal = journalList.find((entry) => entry.timestamp == timestamp);
  if (journal === undefined) {
    console.error(`Error: No journal entry found with timestamp ${timestamp}`);
    return undefined;
  } else return journal;
}

function deleteJournal(timestamp) {
  journalList = journalList.filter((entry) => entry.timestamp != timestamp);
  saveJournalList(journalList);
}

function saveJournalList(journalList) {
  localStorage.setItem("GarlicNotes", JSON.stringify(journalList));
}

function editJournal(id) {
  const modal = document.getElementById("journalModal");
  const closeModal = document.getElementById("closeModal");
  const saveJournal = document.getElementById("saveJournal");
  const titleBar = document.getElementById("journalTitle");

  modal.style.display = "block";

  if (!quill) {
    quill = new Quill("#editor", { theme: "snow" });
  }

  closeModal.addEventListener("click", function () {
    modal.style.display = "none";
    displayList(journalList);
  });

  window.addEventListener("click", function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });

  saveJournal.addEventListener("click", function () {
    const journalContent = quill.root.innerHTML;
    console.log(journalContent);
    modal.style.display = "none";
  });

  if (id === undefined) {
    id = new Date().getTime();
    let noteObject = {
      timestamp: id,
      title: "",
      tags: [],
      delta: undefined,
    };

    quill.setText("\n");
    journalList.push(noteObject);
    saveJournalList(journalList);
  }

  noteObject = getJournalByTimestamp(id);

  quill.setContents(noteObject.delta);
  titleBar.value = noteObject.title;

  quill.on("text-change", () => {
    const newDelta = quill.getContents();
    noteObject.delta = newDelta;
    saveJournalList(journalList);
  });

  titleBar.addEventListener("input", () => {
    let title = titleBar.value;
    noteObject.title = title;
    saveJournalList(journalList);
  });
}

function saveJournal(journalList) {
  localStorage.setItem("GarlicNotes", JSON.stringify(journalList));
}

function getMatchingEntries(list, query) {
  query = query.toLowerCase();

  if (query.startsWith("#")) {
    return searchByTags(list, query.slice(1));
  }

  let matchingEntriesByTitle = [];
  let matchingEntriesByContent = [];
  let matchingEntriesByTimestamp = [];

  list.forEach((entry) => {
    if (entry.title.toLowerCase().includes(query)) {
      matchingEntriesByTitle.push(entry);
    } else if (getTextFromDelta(entry.delta).toLowerCase().includes(query)) {
      matchingEntriesByContent.push(entry);
    } else if (
      new Date(parseInt(entry.timestamp))
        .toLocaleString()
        .toLowerCase()
        .includes(query)
    ) {
      matchingEntriesByTimestamp.push(entry);
    }
  });

  return matchingEntriesByTitle.concat(
    matchingEntriesByContent,
    matchingEntriesByTimestamp
  );
}

function getTextFromDelta(delta) {
  let text = "";
  delta.ops.forEach((op) => {
    text += op.insert;
  });
  return text;
}

function searchByTags(list, query) {
  query = query.toLowerCase();
  return list.filter((entry) => {
    return entry.tags.some((tag) => tag.toLowerCase().includes(query));
  });
}

function setUpSearch() {
  const searchBar = document.getElementById("search-bar");
  searchBar.oninput = () => {
    const itemList = document.getElementById("item-list");
    itemList.replaceChildren();
    displayList(getMatchingEntries(journalList, searchBar.value));
  };
}
