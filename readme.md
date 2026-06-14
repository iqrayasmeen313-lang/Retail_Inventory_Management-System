# Capstone Project: Retail Inventory Management

**Course:** Web Technologies SP26  
**Student:** Iqra Yasmeen (Roll No: F24BDOCS1M01058)  
**Semester:** 4th Semester - 2M

---

## About The Project

A Retail Inventory Management web app built with HTML, CSS, and plain JavaScript. It demonstrates dynamic DOM updates, form validation, and CRUD operations using a local database (`json-server`).

## Project Architecture

### 1. The Storefront (User View)

**Files:** `index.html` & `app.js`

- Displays available inventory in a responsive grid layout.
- Includes a dropdown for real-time category filtering.
- Allows adding new products via a form that features strict client-side validation.
- Products display smart, color-coded badges that automatically adjust based on stock levels (In Stock, Low Stock, Discontinued).
- Includes a dark/light mode toggle that saves your preference to `localStorage`.

### 2. The Management Dashboard (Admin View)

**Files:** `admin.html` & `admin.js`

- Table view of all products.
- Live stats (Total Value, Total Items, Low Stock).
- Built-in `<dialog>` modals to edit items.
- Secure delete with browser confirmation.

## Async/Await and CRUD Fetch Requests

The app uses modern `fetch` requests with `async`/`await` to communicate with the `json-server` backend. This makes the asynchronous API flow easier to read and maintain.

- `GET` requests load product data for the storefront and admin dashboard.
- `POST` requests add new inventory items from the add product form.
- `PATCH` requests update product details in the admin edit dialog.
- `DELETE` requests remove items from inventory with a browser confirmation step.

All API calls are handled in plain JavaScript with `async` functions, `await` to pause until the network response is ready, and error handling to keep the UI stable.

- Table view of all products.
- Live stats (Total Value, Total Items, Low Stock).
- Built-in `<dialog>` modals to edit items.
- Secure delete with browser confirmation.

## How to Run

Ensure Node.js is installed.

**Step 1: Clone the Repository**

```bash
git clone https://github.com/iqrayasmeen313-lang/Retail_Inventory_Management-System.git
cd Retail_Inventory_Management-System
```

**Step 2: Start the Database**
Run `json-server` to serve `db.json`:

```bash
npx json-server --watch db.json --port 3000
```

**Step 3: Launch the App**
Open `index.html` directly in your web browser. Navigate to `admin.html` for the dashboard.
