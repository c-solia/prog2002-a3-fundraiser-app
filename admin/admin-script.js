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
        listItem.textContent = `ID: ${fundraiser.FUNDRAISER_ID} - ${fundraiser.CAPTION} (Organiser: ${fundraiser.ORGANIZER})`;

        fundraiserItems.appendChild(listItem);
    });
}

// Function to fetch categories and populate the dropdown in new form
async function fetchCategories() {
    try {
        const response = await fetch(`${apiUrl}/category`);
        const categories = await response.json();

        const categorySelect = document.getElementById('new-category'); 
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.CATEGORY_ID; 
            option.textContent = category.NAME;
            categorySelect.appendChild(option);

        });

        // Store categories data globally
        window.categoriesData = categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

// Function to fetch categories and populate the dropdown in update form
async function fetchCategoriesForUpdate() {
    try {
        const response = await fetch(`${apiUrl}/category`);
        const categories = await response.json();

        const categorySelect = document.getElementById("update-category"); 
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.CATEGORY_ID; 
            option.textContent = category.NAME;
            categorySelect.appendChild(option);

        });

        // Store categories data globally
        window.categoriesData = categories;
    } catch (error) {
        console.error('Error fetching categories for update form:', error);
    }
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
        CATEGORY_ID: category,
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

// show "update fundraiser" form and populate it with data
async function showUpdateForm(fundraiserId) {
    try {
        // fetch fundraiser details using the API
        const response = await fetch(`${apiUrl}/fundraiser/${fundraiserId}`);
        const fundraiser = await response.json();

        // fetch categories for the dropdown
        await fetchCategoriesForUpdate();

        // populate the form fields with the fundraiser data
        document.getElementById('update-fundraiser-id').value = fundraiser.fundraiser_id;
        document.getElementById('update-organizer').value = fundraiser.organizer;
        document.getElementById('update-caption').value = fundraiser.caption;
        document.getElementById('update-target-funding').value = fundraiser.target_funding;
        document.getElementById('update-current-funding').value = fundraiser.current_funding;
        document.getElementById('update-city').value = fundraiser.city;
        document.getElementById('update-active').value = fundraiser.active ? 'true' : 'false';
        document.getElementById('update-category').value = fundraiser.category_id;
        document.getElementById('update-img-url').value = fundraiser.img_url;

        // fetch and display donations for selected fundraiser
        fetchAndDisplayDonations(fundraiser.donations); // pass donations array

        // show the update form section
        document.getElementById('update-fundraiser').style.display = 'block';
    } catch (error) {
        console.error('Error fetching fundraiser details for update:', error);
        alert("Couldn't fetch fundraiser details for update.");
    }
}

// fetch and display donations for the selected fundraiser to update
function fetchAndDisplayDonations(donations) { // accept donations array directly
    const donationList = document.getElementById('donation-list');
    donationList.innerHTML = '';

    if (donations && donations.length > 0) {
        donations.forEach(donation => {
            const listItem = document.createElement('li');
            
            // format donation date
            const donationDate = new Date(donation.date);
            const formattedDate = donationDate.toLocaleDateString();

            listItem.textContent = `$${donation.amount} on ${formattedDate} by ${donation.giver}`;
            donationList.appendChild(listItem);
        });
    } else {
        donationList.innerHTML = '<li>No donations yet.</li>';
    }
}

// Handle the "Update Fundraiser" form submission
async function handleUpdateFundraiserSubmit() {
    // get updated values from the form fields
    const fundraiserId = document.getElementById('update-fundraiser-id').value;
    const organizer = document.getElementById('update-organizer').value;
    const caption = document.getElementById('update-caption').value;
    const targetFunding = parseFloat(document.getElementById('update-target-funding').value); 
    const currentFunding = parseFloat(document.getElementById('update-current-funding').value);
    const city = document.getElementById('update-city').value;
    const active = document.getElementById('update-active').value === 'true';
    const categoryId = document.getElementById('update-category').value;
    const imgUrl = document.getElementById('update-img-url').value;
    // validation
    if (organizer === '' || caption === '' || isNaN(targetFunding) || isNaN(currentFunding) || categoryId === '') {
        alert('Please fill in all required fields and ensure numerical values for funding.');
        return; 
    }
    // prepare updated data object
    const updatedFundraiserData = {
        FUNDRAISER_ID: fundraiserId, 
        ORGANISER: organizer,
        CAPTION: caption,
        TARGET_FUNDING: targetFunding,
        CURRENT_FUNDING: currentFunding,
        CITY: city,
        ACTIVE: active ? 1 : 0,
        CATEGORY_ID: categoryId, 
        IMG_URL: imgUrl
    };

    try {
        // make the PUT request
        const response = await fetch(`${apiUrl}/update-fundraiser`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedFundraiserData)
        });

        if (response.ok) {
            alert("Fundraiser updated successfully!");
            fetchAllFundraisers(); // refresh list
            document.getElementById('update-fundraiser').style.display = 'none';
        } else {
            console.error('Error updating fundraiser:', response.statusText);
            alert('Error updating fundraiser. Please try again later.');
        }
    } catch (error) {
        console.error('Error updating fundraiser:', error);
        alert('Error updating fundraiser. Please try again later.');
    }
}

// get category ID based on category name
function getCategoryID(categoryName) {
    // first check that categories data is available
    if (window.categoriesData) {
        console.log("Categories data is available.")
        const matchingCategory = window.categoriesData.find(category => category.NAME === categoryName);
        console.log("Matching category:", matchingCategory);
        return matchingCategory ? matchingCategory.CATEGORY_ID : null; // return ID if found, otherwise null
    } else {
        // if categories data not available, fetch from the API
        //console.log("Categories data was not available, fetching...")
        return fetch(`${apiUrl}/categories`)
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

// Attach event listener to the "Save" button
document.getElementById('save-new-fundraiser').addEventListener('click', handleNewFundraiserSubmit);

// Attach event listener to the "Edit" button
document.getElementById('edit-fundraiser').addEventListener('click', () => {
    const fundraiserIdToUpdate = document.getElementById('fundraiser-to-update').value;

    // Validate that an ID is entered
    if (fundraiserIdToUpdate === '') {
        alert('Please enter a Fundraiser ID to update.');
        return;
    }

    // Call the showUpdateForm function with the provided ID
    showUpdateForm(fundraiserIdToUpdate);
});

// Attach event listener to the "Update" button
document.getElementById('save-updated-fundraiser').addEventListener('click', handleUpdateFundraiserSubmit);

// Fetch categories and fundraisers when the page loads
window.onload = () => {
    fetchAllFundraisers();
    fetchCategories();
};