//Resets the form and clears error messages
function clearTextBoxes() {
    document.getElementById("searchform").reset();
    document.getElementById("errorMessage").innerHTML = "";
}

//Main search function used to process user inputs in the api call and format the response into HTML code
function search() {
    //creates the querystring to be used for the API
    var cat = document.getElementById("category").value;
    var city = document.getElementById("city").value;
    var org = document.getElementById("organiser").value;

    //Contructs the url used for API call
    var url = "category=" + cat + "&city=" + city + "&organiser=" + org;

    //Regex containing only letters and white space
    const regex = /^[a-zA-Z\s]*$/;

    //Rests error message
    document.getElementById("errorMessage").innerHTML = "";

    //Input validation - Checks to see if all 3 search criteria are empty. If empty, displays alert with error.
    if (cat === '' && city === '' && org === '') {
        alert("Please enter at least 1 criteria");  //Alert with error message
    }
    //Input validation - uses the regex to ensure the city field only contains letters and whitespace
    else if (!regex.test(city)) {
        document.getElementById("errorMessage").innerHTML = "Please ensure the City contains only letters";  //Error message
    }
    //If validation is passed, use the search parameters for an api call
    else {
        console.log("http://localhost:3060/api/search?" + url);   //Logs the url - used for troubleshooting

        //call GET API to retrive fundraiser info based on user input
        fetch("http://localhost:3060/api/search?" + url)
            .then(response => response.json())
            .then(fund => {
                const fundDiv = document.getElementById('data');
                fundDiv.innerHTML = "";

                //If a matching fundraiser is found, Use the data to construct HTML code
                if (fund.length > 0) {
                    fund.forEach(f => {
                        const newCard = document.createElement("div");
                        newCard.className = 'card';

                        //All images were generated using Canvas' magic maker tool
                        //Constructs the HTML code to be used in the 'data' div
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
                        fundDiv.appendChild(newCard); //Adds the newCard div into the 'data' div
                    });
                }
                //If no matching fundraisers are found, display an error
                else {
                    document.getElementById("errorMessage").innerHTML = "No matching fundraisers found";
                }
            })
            //Error handling
            .catch(error => {
                console.error("Error occured while fetching data", error);
                document.getElementById("errorMessage").innerHTML = "Error occured while fetching data";
            });
    }
}

//call GET api to retrieve list of categories from database and populate the options in the search form
fetch("http://localhost:3060/api/category")
    .then(response => response.json())
    .then(categories => {
        const options = document.getElementById('category');
        options.innerHTML = "";

        //Creates a default option in the select list with text "Choose" and no value
        const opt = document.createElement("option");
        opt.text = "Choose";
        opt.value = "";

        //Adds the option to the select list
        options.appendChild(opt);

        //For each category returned in the API call, create a new option
        if (categories.length > 0) {
            categories.forEach(c => {
                const newOpt = document.createElement("option");

                newOpt.text = c.NAME;
                newOpt.value = c.NAME;

                //Adds each option to the select list
                options.appendChild(newOpt);
            })
        }
    })
    //Error Handling
    .catch(error => {
        console.error("Error occured while fetching categories", error);
        document.getElementById('categories').textContent = "Failed to load categories";
    });