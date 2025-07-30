let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The journey of a thousand miles begins with a single step.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const syncStatus = document.getElementById("syncStatus");

// Restore saved category
const savedFilter = localStorage.getItem('selectedCategory');
if (savedFilter) categoryFilter.value = savedFilter;

// Bind all events
document.getElementById("newQuote").addEventListener("click", displayRandomQuote);
document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
document.getElementById("exportBtn").addEventListener("click", exportToJsonFile);
document.getElementById("importFile").addEventListener("change", importFromJsonFile);
categoryFilter.addEventListener("change", filterQuote);

populateCategories();
filterQuote(); // Show first quote based on selected category
syncQuotes();  // Sync immediately on load

function displayRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerText = "No quotes available in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const selectedQuote = filteredQuotes[randomIndex];
  quoteDisplay.innerText = `"${selectedQuote.text}" - (${selectedQuote.category})`;
}

function addQuote() {
  const textInput = document.getElementById("newQuoteText").value.trim();
  const categoryInput = document.getElementById("newQuoteCategory").value.trim();

  if (!textInput || !categoryInput) {
    alert("Both quote and category are required.");
    return;
  }

  const newQuote = { text: textInput, category: categoryInput };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuote();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added!");
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function populateCategories() {
  const categories = ["all", ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = categories.map(cat =>
    `<option value="${cat}">${cat}</option>`
  ).join("");

  const saved = localStorage.getItem('selectedCategory');
  if (saved && categories.includes(saved)) {
    categoryFilter.value = saved;
  }
}

function filterQuote() {
  const selected = categoryFilter.value;
  localStorage.setItem('selectedCategory', selected);
  displayRandomQuote();
}

function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid format");

      // Validate each quote
      const validQuotes = imported.filter(q => q.text && q.category);
      if (validQuotes.length === 0) throw new Error("No valid quotes found.");

      quotes.push(...validQuotes);
      saveQuotes();
      populateCategories();
      filterQuote();
      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Import failed: " + err.message);
    }
  };
  reader.readAsText(event.target.files[0]);
}

// ---- Server Sync ----

async function fetchQuotesFromServer() {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts');
  const data = await response.json();
  return data.slice(0, 5).map(post => ({
    text: post.title,
    category: "Server"
  }));
}

async function postQuoteToServer(quote) {
  await fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    body: JSON.stringify(quote),
    headers: { 'Content-Type': 'application/json' }
  });
}

async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();

    // Remove existing server quotes before adding new ones
    quotes = quotes.filter(q => q.category !== "Server").concat(serverQuotes);

    saveQuotes();
    populateCategories();
    filterQuote();
    updateSyncStatus("✔ Synced with server at " + new Date().toLocaleTimeString());
  } catch (err) {
    updateSyncStatus("❌ Sync failed: " + err.message);
  }
}

// Periodic sync every 30 seconds
setInterval(syncQuotes, 30000);

function updateSyncStatus(message) {
  if (syncStatus) {
    syncStatus.textContent = message;
  }
}
