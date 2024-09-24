//call GET api to the the list of active fundraisers and display the results on the website
fetch("http://localhost:3060/api")
    .then(response => response.json())
    .then(data => {

        //Sets the 'data' div block to empty
        const dataDiv = document.getElementById('data');
        dataDiv.innerHTML = "";

        //If a fundraiser is returned, create a html card for each fundraiser
        if (data.length > 0) {
            data.forEach(f => {
                const newCard = document.createElement("div"); //Creates a new div
                newCard.className = 'card'; //Sets the class name of the new div

                //All images were generated using Canvas' magic maker tool
                //Sets the innerHTML of the new div
                newCard.innerHTML = `
                        <h3>Help Support </h3>
                        <h2> ${f.ORGANIZER}</h2>
                        <div class="fundraiser-info">
                            <img src="${f.IMG_URL}"> 
                            <p> <strong>${f.CAPTION}</strong></p>
                            <p><strong>Funding Goal:</strong> $${f.TARGET_FUNDING}</p>
                            <p><strong>Money Raised:</strong> $${f.CURRENT_FUNDING}</p>
                            <p><strong>City:</strong> ${f.CITY}</p>
                            <p><strong>Active:</strong> ${f.ACTIVE ? 'Yes' : 'No'} &nbsp;&nbsp;&nbsp; <strong>Fundraiser #</strong>${f.FUNDRAISER_ID}</p>
                            <p><strong>Category:</strong> ${f.CATEGORY_NAME}</p>
                            <button onclick="location.href='http://localhost:3030/fundraiser/${f.FUNDRAISER_ID}'" type="button">Find Out More</button>
                        </div>
                    `;

                //Adds this new div to the 'data' div
                dataDiv.appendChild(newCard);
            })
        }
    })
    //Error handling
    .catch(error => {
        console.error("Error occured while fetching data", error);
        document.getElementById('data').textContent = "Failed to load data";
    });