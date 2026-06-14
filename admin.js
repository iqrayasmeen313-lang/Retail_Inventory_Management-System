// API configuration
const API_URL = "http://localhost:3000/inventory";

// DOM Elements
const themeToggleBtn = document.getElementById("admin-theme-toggle");
const themeIcon = document.getElementById("admin-theme-icon");
const adminTbody = document.getElementById("admin-tbody");
const editModal = document.getElementById("edit-modal");
const editForm = document.getElementById("edit-form");
const editIdInput = document.getElementById("edit-id");
const editNameInput = document.getElementById("edit-name");
const editPriceInput = document.getElementById("edit-price");
const editStockInput = document.getElementById("edit-stock");
const statTotalItems = document.getElementById("stat-total-items");
const statTotalValue = document.getElementById("stat-total-value");
const statLowStock = document.getElementById("stat-low-stock");

// Initialize dark mode based on user preference
function initAdminTheme() {
  // Check localStorage
  const savedTheme = localStorage.getItem("app-theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  themeIcon.textContent = savedTheme === "dark" ? "light_mode" : "dark_mode";

  themeToggleBtn.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent the <a> tag from jumping to top of page
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("app-theme", newTheme);
    themeIcon.textContent = newTheme === "dark" ? "light_mode" : "dark_mode";
  });
}

// Fetch inventory data from the API and render the table (GET)
async function fetchAdminInventory() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }

    const data = await response.json();

    renderTable(data);
    updateStats(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    adminTbody.innerHTML = `<tr><td colspan="7" class="error-message">Error connecting to server. Ensure JSON server is running.</td></tr>`;
  }
}

function renderTable(data) {
  adminTbody.innerHTML = "";

  if (data.length === 0) {
    adminTbody.innerHTML = `<tr><td colspan="7" class="empty-message">No inventory items found.</td></tr>`;
    return;
  }

  data.forEach((item) => {
    // Status Badge Logic
    let badgeStyle =
      "background: var(--status-success-bg); color: var(--status-success);"; // Default: In Stock
    let statusText = `${item.stock} In Stock`;

    if (item.stock === 0) {
      badgeStyle =
        "background: var(--status-danger-bg); color: var(--status-danger);";
      statusText = "Out of Stock";
    } else if (item.stock < 10) {
      badgeStyle =
        "background: var(--status-warning-bg); color: var(--status-warning);";
      statusText = `${item.stock} Low Stock`;
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td class="id-cell">${item.id}</td>
            <td class="product-cell">
                <img src="${item.imageUrl || "https://via.placeholder.com/40"}" class="product-image">
                ${item.name}
            </td>
            <td class="id-cell">${item.sku}</td>
            <td><span class="category-badge">${item.category}</span></td>
            <td class="price-cell">$${parseFloat(item.price).toFixed(2)}</td>
            <td><span class="badge" style="${badgeStyle}">${statusText}</span></td>
            <td>
                <button class="action-btn edit-btn" data-id="${item.id}" title="Edit (Coming Day 6)"><span class="material-symbols-outlined">edit</span></button>
                <button class="action-btn delete-btn" data-id="${item.id}" title="Delete"><span class="material-symbols-outlined">delete</span></button>
            </td>
        `;
    adminTbody.appendChild(tr);
  });

  // Attach action listeners dynamically after rendering
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) =>
      deleteItem(e.currentTarget.getAttribute("data-id")),
    );
  });
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", (e) =>
      openEditModal(e.currentTarget.getAttribute("data-id")),
    );
  });
}
// Handle item deletion with confirmation (DELETE)
async function deleteItem(id) {
  const confirmed = confirm(
    "Are you sure you want to delete this inventory item? This action cannot be undone.",
  );
  if (!confirmed) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      // Re-fetch the data to refresh the table automatically
      fetchAdminInventory();
    } else {
      throw new Error("Failed to delete item");
    }
  } catch (error) {
    console.error("Error deleting item:", error);
    alert("Unable to delete item. Please try again.");
  }
}

/* --- INITIALIZATION --- */
document.addEventListener("DOMContentLoaded", () => {
  initAdminTheme();
  fetchAdminInventory();
});
// Open the edit modal and populate data (PUT/PATCH)
async function openEditModal(id) {
  try {
    // Fetch the specific item's current data
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error("Failed to fetch item details");

    const item = await response.json();

    // Populate the modal inputs with the fetched data
    editIdInput.value = item.id;
    editNameInput.value = item.name;
    editPriceInput.value = item.price;
    editStockInput.value = item.stock;

    // Display the native HTML dialog
    editModal.showModal();
  } catch (error) {
    console.error("Error loading item:", error);
    alert("Could not load item details.");
  }
}

editForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // Stop page reload

  const id = editIdInput.value;
  const newStock = parseInt(editStockInput.value);

  const updatedData = {
    name: editNameInput.value.trim(),
    price: parseFloat(editPriceInput.value),
    stock: newStock,
    status: newStock > 0 ? "In Stock" : "Out of Stock",
  };

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) throw new Error("Failed to update item");

    editModal.close();
    fetchAdminInventory();
  } catch (error) {
    console.error("Error updating item:", error);
    alert("Unable to save changes. Check the console for details.");
  }
});
// Update dashboard statistics
function updateStats(data) {
  const totalItems = data.length;

  const totalValue = data.reduce((sum, item) => {
    return sum + parseFloat(item.price) * parseInt(item.stock);
  }, 0);

  const lowStockCount = data.filter(
    (item) => item.stock > 0 && item.stock < 10,
  ).length;

  // Update the DOM elements
  statTotalItems.textContent = totalItems;

  // Format the value as currency
  statTotalValue.textContent = `$${totalValue.toFixed(2)}`;

  statLowStock.textContent = lowStockCount;
}
