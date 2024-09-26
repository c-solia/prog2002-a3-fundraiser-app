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

// Fetch and display fundraisers when the page loads
window.onload = fetchAllFundraisers;