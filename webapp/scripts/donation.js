//extracts the fundraiser_id from the url
const id = window.location.pathname.split("/").pop();

//Sends the request
function donation() {
    //create querystring elements
    var amount = document.getElementById("amount").value;
    var name = document.getElementById("yourname").value;

    //Validation for amount field - Only accepts donations of $5 or more
    if (amount < 5) {
        alert("Minimum donation amount is AUD $5");
    }
    if (name == '') {        //Alert message if name field is empty
        alert("Please your name and donation amount");
    } else {
        //Adds the donation to the database
        let url = "id=" + id + "&amount=" + amount + "&giver=" + name;

        fetch("http://localhost:3060/api/donation?" + url, {
            method: 'POST'
        }).then(response => {
            if (response.status === 201) {  //Successful response status
                alert("Thank you for your donation to " + document.getElementById("fund_name").innerHTML);  //Success alert
                window.location.href = "/fundraiser/" + id;     //Redirects to the fundraiser page after acknowledging the donation alert
            } else {
                alert("Error adding donation. Please try again.");       // Error alert
            }
        }).catch(error => {
            console.error("Error:", error);
            alert("An unexpected error occurred. Please try again.");
        });
    }
}

//Clears inout fields 
function clearTextBoxes() {
    document.getElementById("donateform").reset();  //Resets the form
}

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
            <h2 id="fund_name">${data.organizer}!</h2>
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