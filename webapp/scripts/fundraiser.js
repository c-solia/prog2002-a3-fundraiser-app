//Error alert when user clicks donate button
function donateMessage() {
    alert("This feature is under construction");
}

//Runs when the page is loaded. Extracts the id from the url and uses it for an api call
function loadPage() {
    //Extracts id from the url
    const id = window.location.pathname.split("/").pop();

    console.log(id);

    //Uses the id for api call
    fetch("http://localhost:3060/api/fundraiser/" + id)
        .then(response => response.json())
        .then(data => {
            console.log(data);

            //Sets the 'data' div block to empty
            const dataDiv = document.getElementById('data');
            dataDiv.innerHTML = "";

            const newFund = document.createElement("div");  //Creates new div
            newFund.className = 'fund'; //Sets the class name of the new div

            //Sets the innerHTML of the new div
            newFund.innerHTML = `
                <br>
                <h2>${data.organizer} needs your support!</h2>
                <br>
                <div class="row">
                    <div class="column">
                       <img src="${data.img_url}"> 
                    </div>
                    <div class="column">
                        <p id="desc"><strong>${data.caption}</strong></p>
                        <p><strong>Funds Raised:</strong> $${data.current_funding} / $${data.target_funding}</p>
                        <p><strong>City:</strong> ${data.city}</p>
                        <p><strong>Category:</strong> ${data.category_name}</p>
                        <p><strong>Active:</strong> ${data.active ? 'Yes' : 'No'}</p>
                        <p><strong>Fundraiser #</strong>${data.fundraiser_id}</p>
                        <button id="donateButton" onclick="location.href='http://localhost:3030/donation/${data.fundraiser_id}'" type="button">DONATE NOW</button>
                    </div>
                </div>
                `;
            dataDiv.appendChild(newFund);   //Adds this new div into the 'data' div

            //Sets the 'dynamicdonations' div block to empty
            const donations = document.getElementById('dynamicdonations');
            donations.innerHTML = "";

            //For-each loops through the donations array and adds a new row to the table for each donation
            data.donations.forEach(d => {
                const newRow = document.createElement("div"); //Creates a new div
                newRow.className = 'newrow'; //Sets the class name of the new div

                //Creates a new row for each donation and populates the columns with donation data. Datetime is converted into a simple date.
                newRow.innerHTML = `
                    <div class="drow">
                        <div class="dcolumn">${d.giver}</div>
                        <div class="dcolumn">$${d.amount}</div>
                        <div class="dcolumn date">${new Date(d.date).toLocaleDateString('en-GB')}</div>
                    </div>
                `;

                donations.appendChild(newRow);//Adds the new row to the table   
            });
        })
        //Error handling
        .catch(error => {
            console.error("Error occured while fetching data", error);
            document.getElementById('data').textContent = "Failed to load data";
        });
}

//When the page first loads, calls the loadPage() function to fetch API data and populate the page
window.onload = loadPage();