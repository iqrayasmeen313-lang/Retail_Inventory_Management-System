const API_URL = 'http://localhost:3000?inventory';
let inventoryData = [];              //store locally for fast filtering
//get inventory
// async: Prepend this to a function to make it automatically return a Promise
// await: Use this inside an async function to pause code execution until a Promise resolves, seamlessly unwrapping its value right into a variable
async function fetchinventory(){
    try{
    const response = await fetch(API_URL);
    const inventoryData = await response.json();
    //update 
    document.getElementById('active-items-count').textContent=inventoryData.length;
    //render initial grid
    renderGrid(inventoryData);
}
catch(error){
    console.error("Error fetching data",error)
    document.getElementById('inventory-grid').innerHTML='<div style="color: var(--status-danger);grid-column: 1/-1;">Error loading data. Ensure JSON Server is running.</div>';
}
}
// rener grid function receives data (array of items) and displays them on the webpage.
//render grid html
function renderGrid(data){
    const grid = document.getElementById('inventory-grid');
    grid.innerHTML=";"       //clear existing items
    if(data.length===0){
        grid.innerHTML = '<div style="color:var(--text-secondary);grid-column:1/-1;">No items found in this  category.</div>';
        return;
    }
    data.forEach(item =>{
        const maxStock= item.maxStock||100;
        const stockPct= Math.min((item.stock/maxStock)*100,100);
        //badge style
        let badgeClass='in-stock';
        if(item.stock ===0||item.status==='Discontinued')badgeClass='discontinued';
        else if(item.stock<10||item.status==='Low Stock')badgeClass='Low-stock';
        const card = document.createElement('div');
        card.className='item-card';
                card.innerHTML = `
            <img src="${item.imageUrl || 'https://via.placeholder.com/400'}" alt="${item.name}" class="item-img">
            <div class="item-details">
            <div style="display:flex;justify-content:space-between;alighn-items:start; margin-bottom:0.5rem;">
            <span style="font-size:0.75rem;color:var(--text-secondary);text-transform:uppercase;">${item.category}</span>
                                <span class="badge ${badgeClass}">${item.status || (item.stock > 0 ? 'In Stock' : 'Out of Stock')}</span>
                </div>
                <h3 style="margin-bottom: 0.25rem;">${item.name}</h3>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                    <span style="font-size: 0.875rem; color: var(--text-secondary);">SKU: ${item.sku}</span>
                    <span style="font-weight: 700; color: var(--text-primary);">$${parseFloat(item.price).toFixed(2)}</span>
                </div>

                <div class="stock-bar-container">
                    <div class="stock-bar" style="width: ${stockPct}%;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">
                    <span>Stock: ${item.stock} units</span>
                    <span>${Math.round(stockPct)}%</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}
//filter listener
document.getElementById('filter-category').addEventListener('change',(e)=>{
    const selectedCategory= e.target.value;
    if (selectedCategory==='All') {
        renderGrid(inventoryData);      //show all items
    }
    else{
        const filteredData = inventoryData.filter(item=> item.category===selectedCategory);
        renderGrid(filteredData);
    }
});
 //fetch data when html is fully loaded
 document.addEventListener('DOMContentLoaded',()=>{
    fetchinventory();
 });
//create post and check inline property
document.getElementById('add-item-form').addEventListener('submit',async(e)=>{
    e.preventDefault();
    // gather all inputs 
    const name= document.getElementById('name').value.trim();
    const sku= document.getElementById('sku').value.trim()
    const category= document.getElementById('category').value;
    const price= parseFloat(document.getElementById('price').value);
    const stock= parseInt(document.getElementById('stock').value);

    //reset error msgs(at begining we hide the error)
    document.querySelectorAll('.error-msg').forEach(el=>el.style.display='none')
    let isValid= true;
        // Custom Inline Validation checks
if (!name) { document.getElementById('err-name').style.display = 'block'; isValid = false; }
    if (!sku) { document.getElementById('err-sku').style.display = 'block'; isValid = false; }
    if (!category) { document.getElementById('err-category').style.display = 'block'; isValid = false; }
    if (isNaN(price) || price <= 0) { document.getElementById('err-price').style.display = 'block'; isValid = false; }
    if (isNaN(stock) || stock < 0) { document.getElementById('err-stock').style.display = 'block'; isValid = false; }    
        if (!isValid) return; 

    // Construct the new data object
    const newItem = {
        id: `INV-${Math.floor(1000 + Math.random() * 9000)}`, // Generate random 4-digit ID
        name,
        sku,
        category,
        price,
        stock,
        maxStock: 100, // Default max stock for percentage calculations
        status: stock > 0 ? "In Stock" : "Out of Stock",
        imageUrl: "https://images.unsplash.com/photo-1580169980114-ccd0babfa840?auto=format&fit=crop&q=80&w=400" // Fallback image
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newItem)
        });

        if (!response.ok) throw new Error('Failed to save item');

        // Reset the form inputs
        document.getElementById('add-item-form').reset();
        
        // Re-fetch and re-render the grid automatically
        fetchInventory(); 
        
    } catch (error) {
        console.error("Error posting data:", error);
        // Display error visually instead of an alert box
        const errBlock = document.createElement('div');
        errBlock.style = 'color: white; background: var(--status-danger); padding: 1rem; border-radius: 6px; margin-top: 1rem;';
        errBlock.textContent = "Failed to submit data. Check server connection.";
        document.getElementById('add-item-form').appendChild(errBlock);
        setTimeout(() => errBlock.remove(), 4000); // Remove after 4 seconds
    }
 
})