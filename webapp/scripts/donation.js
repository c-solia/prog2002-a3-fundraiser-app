//Validate user inputs and display a confirmation message
function validate() {

}

//Sends the request
function donate() {





}

function clearTextBoxes() {
    document.getElementById("searchform").reset();
    document.getElementById("errorMessage").innerHTML = "";
}



const id = window.location.pathname.split("/").pop();

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
            <h2>Donating to ${data.organizer}!</h2>
            <div class="row">
                <div class="column">
                    <img id="donationimage" src="${data.img_url}"> 
                </div>

                <div class="column">
                    <p id="desc"><strong>${data.caption}</strong></p>
                    <p><strong>Funds Raised:</strong> $${data.current_funding} / $${data.target_funding}</p>
                    <p><strong>City:</strong> ${data.city}</p>
                    <p><strong>Category:</strong> ${data.category_name}</p>
                    <p><strong>Active:</strong> ${data.active ? 'Yes' : 'No'}</p>
                    <p><strong>Fundraiser #</strong>${data.fundraiser_id}</p>
                </div>
            </div>
        `;
        dataDiv.appendChild(newFund);   //Adds this new div into the 'data' div

    })
    //Error handling
    .catch(error => {
        console.error("Error occured while fetching data", error);
        document.getElementById('data').textContent = "Failed to load data";
    });