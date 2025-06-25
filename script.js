// Load existing quotes from localStorage or use default quotes
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success usually comes to those who are too busy to be looking for it.", category: "Success" }
];

// DOM references
const quoteDisplay = document.getElementById('quoteDisplay');
const categorySelector = document.getElementById('categorySelector');
const newQuoteButton = document.getElementById('newQuote');

// Save current quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Update category dropdown options
function updateCategoryOptions() {
  const categories = new Set(quotes.map(q => q.category));
  categorySelector.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categorySelector.appendChild(option);
  });
}

// Show random quote based on selected category
function showRandomQuote() {
  const selectedCategory = categorySelector.value;
  const filteredQuotes = selectedCategory === 'all'
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];
  quoteDisplay.textContent = `"${randomQuote.text}" — [${randomQuote.category}]`;

  // Save last viewed quote in sessionStorage
  sessionStorage.setItem('lastQuote', JSON.stringify(randomQuote));
}

// Add a new quote from user input
function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();

  if (!text || !category) {
    alert("Please fill in both quote and category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  updateCategoryOptions();
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
  alert("Quote added successfully!");
}

// Export current quotes to downloadable JSON file
function exportToJsonFile() {
  const jsonBlob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(jsonBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from uploaded JSON file
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid JSON structure");
      quotes.push(...imported);
      saveQuotes();
      updateCategoryOptions();
      alert("Quotes imported successfully!");
    } catch (error) {
      alert("Failed to import: Invalid JSON file.");
    }
  };
  reader.readAsText(file);
}

// Load the last quote viewed from sessionStorage
function loadLastViewedQuote() {
  const last = sessionStorage.getItem('lastQuote');
  if (last) {
    const quote = JSON.parse(last);
    quoteDisplay.textContent = `"${quote.text}" — [${quote.category}]`;
  }
}

// Initialize app
newQuoteButton.addEventListener('click', showRandomQuote);
updateCategoryOptions();
loadLastViewedQuote();
