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


// Fetch and display fundraisers when the page loads
window.onload = fetchAllFundraisers;