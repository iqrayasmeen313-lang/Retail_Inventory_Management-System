# Retail Inventory Management System
**Author:** [Iqra yasmeen]  
**Roll Number:** [F24BDOCS1M01058]  
**Course:** Web Technologies SP26 Capstone Project

## Project Description
This is a comprehensive Retail Inventory Management dashboard built entirely in plain JavaScript. The application demonstrates DOM manipulation, event handling, inline form validation, and full CRUD (Create, Read, Update, Delete) capabilities communicating with a mock REST API via JSON Server. 

## Features
* **User Panel:** * View inventory grid fetching live data via GET request.
  * Filter items dynamically by category.
  * Securely add new items using a POST form with strict custom inline validation.
* **Admin Dashboard:** * Dedicated management panel with distinct visual navigation.
  * High-density data table displaying all inventory items.
  * Edit existing items via a native HTML dialog modal (PATCH request).
  * Delete items securely with a browser confirmation dialog.
  * Real-time summary statistics calculating Total Items, Inventory Value, and Low Stock Alerts.
* **Resiliency:** Implements `async/await` with comprehensive `try/catch` error handling and visual loading states.

## Setup and Installation Instructions
1. Ensure you have [Node.js](https://nodejs.org/) installed on your machine.
2. Extract the project folder and open a terminal inside the root directory.
3. Start the mock backend server by running the following command:
   `npx json-server --watch db.json`
4. Keep the terminal open. Open `index.html` in your preferred web browser to view and interact with the application.

## Screenshots
*(Ensure `user-panel.png` and `admin-panel.png` are in the same folder)*
![User Panel Screenshot](./user-panel.png)
![Admin Panel Screenshot](./admin-panel.png)