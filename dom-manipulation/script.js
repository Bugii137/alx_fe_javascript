// Retrieve existing quotes from localStorage or use defaults
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The journey of a thousand miles begins with a single step.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");

// Event listeners
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
categoryFilter.addEventListener("change", filterQuotes);

// Display a random quote from the selected category
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const selectedQuote = filteredQuotes[randomIndex];
  quoteDisplay.textContent = `"${selectedQuote.text}" - (${selectedQuote.category})`;
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Add a new quote
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
  filterQuotes(); // refresh view

  // Reset inputs
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added successfully!");
}

// Populate category dropdown from quotes
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

// Save selected filter & display filtered quote
function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem('selectedCategory', selected);
  showRandomQuote();
}

// Dynamically generate the add-quote form
function createAddQuoteForm() {
  const container = document.getElementById("formContainer");

  const title = document.createElement("h3");
  title.textContent = "Add a New Quote";

  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.addEventListener("click", addQuote);

  container.appendChild(title);
  container.appendChild(quoteInput);
  container.appendChild(categoryInput);
  container.appendChild(addBtn);
}

// Initialize the app
createAddQuoteForm();
populateCategories();
filterQuotes(); // load with last saved filter
