const apiUrl = 'http://localhost:3060/api';

// Fetch all fundraisers
async function fetchAllFundraisers() {
    try {
        const response = await fetch(`${apiUrl}/get-all`);
        const fundraisers = await response.json();

        displayFundraisers(fundraisers);
    } catch (error) {
        console.error('Error fetching all fundraisers:', error);
    }
}

// Display the list of fundraisers
function displayFundraisers(fundraisers) {
    const fundraiserItems = document.getElementById('fundraiser-items');
    fundraiserItems.innerHTML = '';

    fundraisers.forEach(fundraiser => {
        const listItem = document.createElement('li');
        listItem.textContent = `ID: ${fundraiser.FUNDRAISER_ID} - ${fundraiser.CAPTION} (Organiser: ${fundraiser.ORGANISER})`;

        fundraiserItems.appendChild(listItem);
    });
}

// Handle new fundraiser using form submission
async function handleNewFundraiserSubmit() {
    // Get values from form
    const organiser = document.getElementById('new-organiser').value;
    const caption = document.getElementById('new-caption').value;
    const targetFunding = document.getElementById('new-target-funding').value;
    const city = document.getElementById('new-city').value;
    const category = document.getElementById('new-category').value;
    const imgUrl = document.getElementById('new-img-url').value;

    // simple validation, might need to improve
    if (organiser === '' || caption === '' || targetFunding === '' || city === '' || category === '') {
        alert('Please fill in all required fields.')
        return;
    }


    // Prepare data to send in request body
    const newFundraiserData = {
        ORGANISER: organiser,
        CAPTION: caption,
        TARGET_FUNDING: targetFunding,
        CURRENT_FUNDING: 0, // bold assumption here
        CITY: city,
        ACTIVE: true, // another assumption
        CATEGORY_ID: getCategoryID(category),
        IMG_URL: imgUrl
    };

    try {
        const response = await fetch(`${apiUrl}/add-fundraiser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newFundraiserData)
        });

        if (response.ok) {
            alert('New fundraiser added successfully!');
        } else {
            console.error('Error adding fundraiser:', response.statusText);
            alert('Error adding fundraiser. Please try again later.');
        }
    } catch (error) {
        console.error('Error adding fundraiser:', error);
        alert('Error adding fundraiser. Please try again later.');
    }
}

// get category ID based on category name
function getCategoryID(categoryName) {
    // first check that categories data is available
    if (window.categoriesData) {
        const matchingCategory = window.categoriesData.find(category => category.NAME === categoryName);
        return matchingCategory ? matchingCategory.CATEGORY_ID : null; // return ID if found, otherwise null
    } else {
        // if categories data not available, fetch from the API
        return fetch(`${apiURL}/categories`)
            .then(response => response.json())
            .then(categories => {
                const matchingCategory = categories.find(category => category.NAME === categoryName);
                return matchingCategory ? matchingCategory.CATEGORY_ID : null;
            })
            .catch(error => {
                console.error('Error fetching categories:', error);
                alert("Could not fetch categories.")
                return null;
            })
    }
}


// Fetch and display fundraisers when the page loads
window.onload = fetchAllFundraisers;