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
