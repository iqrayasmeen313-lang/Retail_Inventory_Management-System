/* --- GLOBAL SETTINGS --- */
const API_URL = 'http://localhost:3000/inventory';

/* --- READ (GET) & RENDER TABLE --- */
async function fetchAdminInventory() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        renderTable(data);
    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById('admin-tbody').innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--status-danger);">Error connecting to server. Ensure JSON server is running.</td></tr>`;
    }
}

function renderTable(data) {
    const tbody = document.getElementById('admin-tbody');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--text-secondary); padding: 2rem;">No inventory items found.</td></tr>`;
        return;
    }

    data.forEach(item => {
        // Status Badge Logic
        let badgeStyle = 'background: rgba(16, 185, 129, 0.1); color: var(--status-success);'; // Default: In Stock
        let statusText = `${item.stock} In Stock`;
        
        if (item.stock === 0) {
            badgeStyle = 'background: rgba(239, 68, 68, 0.1); color: var(--status-danger);';
            statusText = 'Out of Stock';
        } else if (item.stock < 10) {
            badgeStyle = 'background: rgba(245, 158, 11, 0.1); color: var(--status-warning);';
            statusText = `${item.stock} Low Stock`;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-family: monospace; color: var(--text-secondary);">${item.id}</td>
            <td style="display: flex; align-items: center; gap: 1rem; font-weight: 500;">
                <img src="${item.imageUrl || 'https://via.placeholder.com/40'}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;">
                ${item.name}
            </td>
            <td style="font-family: monospace; color: var(--text-secondary);">${item.sku}</td>
            <td><span style="background: var(--bg-secondary); padding: 0.25rem 0.75rem; border-radius: 99px; font-size: 0.75rem;">${item.category}</span></td>
            <td style="font-weight: 600;">$${parseFloat(item.price).toFixed(2)}</td>
            <td><span class="badge" style="${badgeStyle}">${statusText}</span></td>
            <td>
                <button class="action-btn edit-btn" data-id="${item.id}" title="Edit (Coming Day 6)"><span class="material-symbols-outlined">edit</span></button>
                <button class="action-btn delete-btn" data-id="${item.id}" title="Delete"><span class="material-symbols-outlined">delete</span></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Attach action listeners dynamically after rendering
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => deleteItem(e.currentTarget.getAttribute('data-id')));
    });
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => openEditModal(e.currentTarget.getAttribute('data-id')));
    });
}
/* --- DELETE OPERATION --- */
async function deleteItem(id) {
    // Rubric strict requirement: Confirmation dialog before deletion
    const confirmed = confirm("Are you sure you want to delete this inventory item? This action cannot be undone.");
    if (!confirmed) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            // Re-fetch the data to refresh the table automatically
            fetchAdminInventory(); 
        } else {
            throw new Error('Failed to delete item');
        }
    } catch (error) {
        console.error("Error deleting item:", error);
        alert("Error deleting item. Check console for details.");
    }
}

/* --- INITIALIZATION --- */
document.addEventListener('DOMContentLoaded', () => {
    fetchAdminInventory();
});
/* --- UPDATE (PUT/PATCH) OPERATION --- */
async function openEditModal(id) {
    try {
        // Fetch the specific item's current data
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch item details');
        
        const item = await response.json();

        // Populate the modal inputs with the fetched data
        document.getElementById('edit-id').value = item.id;
        document.getElementById('edit-name').value = item.name;
        document.getElementById('edit-price').value = item.price;
        document.getElementById('edit-stock').value = item.stock;

        // Display the native HTML dialog
        document.getElementById('edit-modal').showModal();
    } catch (error) {
        console.error("Error loading item:", error);
        alert("Could not load item details.");
    }
}

document.getElementById('edit-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Stop page reload
    
    const id = document.getElementById('edit-id').value;
    const newStock = parseInt(document.getElementById('edit-stock').value);
    
    // We use PATCH because we are only updating specific fields, not replacing the whole object
    const updatedData = {
        name: document.getElementById('edit-name').value.trim(),
        price: parseFloat(document.getElementById('edit-price').value),
        stock: newStock,
        // Automatically calculate status based on the new stock quantity
        status: newStock > 0 ? "In Stock" : "Out of Stock"
    };

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH', // Allowed by the rubric
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        if (!response.ok) throw new Error('Failed to update item');

        document.getElementById('edit-modal').close();
        fetchAdminInventory();
    } catch (error) {
        console.error('Error updating item:', error);
        alert('Unable to save changes. Check the console for details.');
    }
});