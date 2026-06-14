const API_URL = "http://localhost:3000/inventory";

// Store locally for fast filtering
let inventoryData = [];

// DOM Elements
const themeToggleBtn = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const activeItemsCount = document.getElementById("active-items-count");
const inventoryGrid = document.getElementById("inventory-grid");
const filterCategory = document.getElementById("filter-category");
const addItemForm = document.getElementById("add-item-form");
const nameInput = document.getElementById("name");
const skuInput = document.getElementById("sku");
const categoryInput = document.getElementById("category");
const priceInput = document.getElementById("price");
const stockInput = document.getElementById("stock");
const errName = document.getElementById("err-name");
const errSku = document.getElementById("err-sku");
const errCategory = document.getElementById("err-category");
const errPrice = document.getElementById("err-price");
const errStock = document.getElementById("err-stock");

// DOMContentLoaded event listener to initialize the app
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  fetchinventory();
});

// Initialize dark mode based on user preference
function initTheme() {
  // Check localStorage for saved preference, light is default
  const savedTheme = localStorage.getItem("app-theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  themeIcon.textContent = savedTheme === "dark" ? "light_mode" : "dark_mode";

  themeToggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    // Apply new theme and save to localStorage
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("app-theme", newTheme);

    // Swap the icon
    themeIcon.textContent = newTheme === "dark" ? "light_mode" : "dark_mode";
  });
}

// Fetch inventory data from the API (GET)
async function fetchinventory() {
  try {
    const response = await fetch(API_URL);
    inventoryData = await response.json();
    activeItemsCount.textContent = inventoryData.length;
    renderGrid(inventoryData);
  } catch (error) {
    console.error("Error fetching data", error);
    inventoryGrid.innerHTML =
      '<div class="error-message-grid">Error loading data. Ensure JSON Server is running.</div>';
  }
}
// Render inventory items grid
function renderGrid(data) {
  inventoryGrid.innerHTML = "";
  if (data.length === 0) {
    inventoryGrid.innerHTML =
      '<div class="empty-message-grid">No items found in this  category.</div>';
    return;
  }
  data.forEach((item) => {
    const maxStock = item.maxStock || 100;
    const stockPct = Math.min((item.stock / maxStock) * 100, 100); // Stock percentage calculation
    // badge style and text logic
    let badgeClass = "in-stock";
    let badgeText = "In Stock";

    if (item.stock === 0 || item.status === "Discontinued") {
      badgeClass = "discontinued";
      badgeText =
        item.status === "Discontinued" ? "Discontinued" : "Out of Stock";
    } else if (item.stock < 10 || item.status === "Low Stock") {
      badgeClass = "low-stock";
      badgeText = "Low Stock";
    }
    const card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML = `
            <img src="${item.imageUrl || "https://via.placeholder.com/400"}" alt="${item.name}" class="item-img">
            <div class="item-details">
            <div class="item-card-header">
            <span class="item-category-label">${item.category}</span>
                                <span class="badge ${badgeClass}">${badgeText}</span>
                </div>
                <h3 class="item-title">${item.name}</h3>
                
                <div class="item-pricing">
                    <span class="item-sku">SKU: ${item.sku}</span>
                    <span class="item-price-val">$${parseFloat(item.price).toFixed(2)}</span>
                </div>

                <div class="stock-bar-container">
                    <div class="stock-bar" style="width: ${stockPct}%;"></div>
                </div>
                <div class="item-stock-info">
                    <span>Stock: ${item.stock} units</span>
                    <span>${Math.round(stockPct)}%</span>
                </div>
            </div>
        `;
    inventoryGrid.appendChild(card);
  });
}
// Handle category filtering
filterCategory.addEventListener("change", (e) => {
  const selectedCategory = e.target.value;
  if (selectedCategory === "All") {
    renderGrid(inventoryData);
  } else {
    const filteredData = inventoryData.filter(
      (item) => item.category === selectedCategory,
    );
    renderGrid(filteredData);
  }
});

// Handle new item submission (POST)
document
  .getElementById("add-item-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const sku = skuInput.value.trim();
    const category = categoryInput.value;
    const price = parseFloat(priceInput.value);
    const stock = parseInt(stockInput.value);

    // Reset error messages
    document
      .querySelectorAll(".error-msg")
      .forEach((el) => (el.style.display = "none"));
    let isValid = true;

    // Validate inputs
    if (!name) {
      errName.style.display = "block";
      isValid = false;
    }
    if (!sku) {
      errSku.style.display = "block";
      isValid = false;
    }
    if (!category) {
      errCategory.style.display = "block";
      isValid = false;
    }
    if (isNaN(price) || price <= 0) {
      errPrice.style.display = "block";
      isValid = false;
    }
    if (isNaN(stock) || stock < 0) {
      errStock.style.display = "block";
      isValid = false;
    }
    if (!isValid) return;

    const newItem = {
      id: `INV-${Math.floor(1000 + Math.random() * 9000)}`, // random id generation
      name,
      sku,
      category,
      price,
      stock,
      maxStock: 100, // Default max stock for percentage calculations
      status: stock > 0 ? "In Stock" : "Out of Stock",
      imageUrl:
        "https://images.unsplash.com/photo-1580169980114-ccd0babfa840?auto=format&fit=crop&q=80&w=400", // Fallback image
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) throw new Error("Failed to save item");

      // Refresh the inventory viewer after adding the item
      addItemForm.reset();
      await fetchinventory();
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Unable to add the item. Check the console for details.");
    }
  });
