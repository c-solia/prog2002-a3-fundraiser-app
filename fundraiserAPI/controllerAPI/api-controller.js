var dbcon = require("../crowdfunding_db.js");
var express = require("express");
var router = express.Router();

router.use(express.json());

var connection = dbcon.getConnection();

//Connects to the database
connection.connect();

//Get request 1 - Returns details of all ACTIVE fundraisers
router.get("/api/",(req,res) =>{
    connection.query(`SELECT FUNDRAISER.FUNDRAISER_ID, FUNDRAISER.ORGANIZER, FUNDRAISER.CAPTION, FUNDRAISER.TARGET_FUNDING, FUNDRAISER.CURRENT_FUNDING, FUNDRAISER.CITY, FUNDRAISER.ACTIVE, FUNDRAISER.IMG_URL, CATEGORY.NAME AS CATEGORY_NAME 
        FROM FUNDRAISER INNER JOIN CATEGORY ON FUNDRAISER.CATEGORY_ID = CATEGORY.CATEGORY_ID WHERE FUNDRAISER.ACTIVE = TRUE`,(err,records, fields) =>{
    if(err){
        console.log("Error while retrieving active fundraisers");   //Logs an error message
    }
    else{
        res.send(records);  //Sends the returned records as a response
    }
    })
})

//GET request 2 - Returns all fundariser categories in the database
router.get("/api/category",(req,res) =>{
    connection.query(`SELECT CATEGORY_ID, NAME FROM CATEGORY;`,(err,records, fields) =>{
        if(err){
            console.log("Error while retrieving categories");   //Logs an error message
        }
        else{
            res.send(records);  //Sends the returned records as a response
        }
    })
})

//Get request 3 - Used by the search page to return results that match user-inputted criteria. This API get method is able to handle one or multiple search criteria
router.get("/api/search",(req,res) =>{

    const category = req.query.category;    //Extracts the CATEGORY entry from the query string
    const city = req.query.city;            //Extracts the CITY entry from the query string
    const organiser = req.query.organiser;  //Extracts the ORGANISER entry from the query string

    //The MySQL query - Caan be appended based on the request query string
    let query = `SELECT FUNDRAISER.FUNDRAISER_ID, FUNDRAISER.ORGANIZER, FUNDRAISER.CAPTION, FUNDRAISER.TARGET_FUNDING, FUNDRAISER.CURRENT_FUNDING, FUNDRAISER.CITY, FUNDRAISER.ACTIVE, FUNDRAISER.IMG_URL, CATEGORY.NAME AS CATEGORY_NAME 
        FROM FUNDRAISER INNER JOIN CATEGORY ON FUNDRAISER.CATEGORY_ID = CATEGORY.CATEGORY_ID WHERE FUNDRAISER.ACTIVE = TRUE`

        //These if statements check to see if the request query contains the parameter. If it does, then appends the MySQL query with the appropriate statement
        //If the request query contains an empty parameter, the MySQL query will not be appended

        if (category != '') {                               //If category is not empty
            query += ` AND CATEGORY.NAME = '${category}'`;  //Adds the category to the MySQL query
        }
        if (city != '') {                                   //If city is not empty
            query += ` AND FUNDRAISER.CITY = '${city}'`;    //Adds the city to the MySQL query
        }
        if (organiser != '') {                              //If organiser is not empty
            query += ` AND FUNDRAISER.ORGANIZER = '${organiser}'`;  //Adds the organiser to the MySQL query
        }

    //Executes the query
    connection.query(query,(err,records, fields) =>{
    if(err){
        console.log("Error while retrieving fundraisers", err);                         //Logs an error message and error
        console.log("cat = " + category + ", city = "+ city + "  , org = "+ organiser); //Logs the user inputs used in api call - keep for troubleshooting
        console.log(req.query); //Logs the request query - keep for troubleshooting
    }
    else {
        res.send(records);  //Sends the returned records as a response
    }
    })
})

//Get request 4 - Used to retrive details of a fundraiser which is specified by the (id) protion of the request URL. Used for Assessment 2. Replaced by the next Get Request below for Assessment 3.
// router.get("/api/fundraiser/:id",(req,res) =>{
//         connection.query(`SELECT FUNDRAISER.FUNDRAISER_ID, FUNDRAISER.ORGANIZER, FUNDRAISER.CAPTION, FUNDRAISER.TARGET_FUNDING, FUNDRAISER.CURRENT_FUNDING, FUNDRAISER.CITY, FUNDRAISER.ACTIVE, FUNDRAISER.IMG_URL, CATEGORY.NAME AS CATEGORY_NAME 
//         FROM FUNDRAISER INNER JOIN CATEGORY ON FUNDRAISER.CATEGORY_ID = CATEGORY.CATEGORY_ID WHERE FUNDRAISER.FUNDRAISER_ID =` + req.params.id,(err,records, fields) =>{
//     if(err){
//         console.log("Error while retrieving active fundraisers");   //Logs an error
//     }
//     else{
//         res.send(records);  //Sends the returned records as a response
//     }
//     })
// })

//Assessment 3 API's below

/** Get Request - Retrieve fundraiser details by ID, including list of donations. Each donation id will cause this API to return another fundraiser and will return an array of fundraisers.
*   To fix this, I create a single fundraiser object which contains all the properties of a fundraiser, but the donations property is converted to an array.
*   A for-each loop is run over all of the returned fundraisers and their donation data is pushed in the fundraiser object's donations array.
*   By doing this, I can return only a single object, and not an array of multiple fundraisers. This makes response handling much easier on the client side. 
*/
router.get("/api/fundraiser/:id",(req,res) =>{
    connection.query(`SELECT FUNDRAISER.FUNDRAISER_ID,FUNDRAISER.ORGANIZER,FUNDRAISER.CAPTION, FUNDRAISER.TARGET_FUNDING, FUNDRAISER.CURRENT_FUNDING, FUNDRAISER.CITY, FUNDRAISER.ACTIVE, FUNDRAISER.CATEGORY_ID, FUNDRAISER.IMG_URL,
                    CATEGORY.NAME AS CATEGORY_NAME, DONATION.DONATION_ID, DONATION.DATE, DONATION.AMOUNT, DONATION.GIVER FROM FUNDRAISER
                    INNER JOIN CATEGORY ON FUNDRAISER.CATEGORY_ID = CATEGORY.CATEGORY_ID LEFT JOIN DONATION ON FUNDRAISER.FUNDRAISER_ID = DONATION.FUNDRAISER_ID 
                    WHERE FUNDRAISER.FUNDRAISER_ID =` + req.params.id,(err,records, fields) =>{
        if(err){
            console.log("Error while retrieving fundraiser data");   //Logs an error
        }
        else {
            //Create an object with multiple properties. These properties are set using the API response. In the case that multiple fundraisers are returned due to multiple donations,
            //The fundraiser object will take the properties of the first fundraiser returned.

            const fundraiser = {
                fundraiser_id: records[0].FUNDRAISER_ID,
                organizer: records[0].ORGANIZER,
                caption: records[0].CAPTION,
                target_funding: records[0].TARGET_FUNDING,
                current_funding: records[0].CURRENT_FUNDING,
                city: records[0].CITY,
                active: records[0].ACTIVE,
                img_url: records[0].IMG_URL,
                category_name: records[0].CATEGORY_NAME,
                category_id: records[0].CATEGORY_ID, // added this for update for dropdown
                donations: []       //An array that will be populated with donation data from each fundraiser returned
              };
        
            //Loops through each fundraiser response and pushes the donation data into the fundraiser object 'donations' array
            records.forEach(record => {
                fundraiser.donations.push({
                    donation_id: record.DONATION_ID,
                    date: record.DATE,
                    amount: record.AMOUNT,
                    giver: record.GIVER
                });
            });

        res.send(fundraiser);  //Sends the fundraiser object as a response
        }
    })
})

//Get request 2 - Returns details of ALL fundraisers, regardless of active status
router.get("/api/get-all",(req,res) =>{
    connection.query(`SELECT FUNDRAISER.FUNDRAISER_ID, FUNDRAISER.ORGANIZER, FUNDRAISER.CAPTION, FUNDRAISER.TARGET_FUNDING, FUNDRAISER.CURRENT_FUNDING, FUNDRAISER.CITY, FUNDRAISER.ACTIVE, FUNDRAISER.IMG_URL, CATEGORY.NAME AS CATEGORY_NAME 
        FROM FUNDRAISER INNER JOIN CATEGORY ON FUNDRAISER.CATEGORY_ID = CATEGORY.CATEGORY_ID`,(err,records, fields) =>{
    if(err){
        console.log("Error while retrieving active fundraisers");   //Logs an error message
    }
    else{
        res.send(records);  //Sends the returned records as a response
    }
    })
})

//POST Request 1 - Adding donations - Tested and working on Postman
router.post("/api/donation", (req,res) =>{

    const id = req.query.id;            //FUNDRAISER_ID
    const amount = req.query.amount;    //AMOUNT
    const giver = req.query.giver;      //GIVER

    //MySQL Query - the now() function is supposed to log current date/time. Added auto-increment to database for donation ID Hope this works >.>
    let query = `INSERT INTO DONATION (DATE, AMOUNT, GIVER, FUNDRAISER_ID) 
    VALUES (now(), '${amount}', '${giver}', '${id}');`

    connection.query(query,(err) => {
        if(err){
            res.sendStatus(400);                                          //Sends a bad request status code
            console.log(err, "Error while entering new donation data");   //Logs an error
        }
        else {
            res.sendStatus(201);                                          //Sends a successful status code
        }
    })
})

//POST Request 2 - TESTING JSON BODY FORMAT - Now with Validation
router.post("/api/add-fundraiser", (req,res) =>{

    console.log(req.body);

    //The JSON body sent by the admin-side website should have the body params listed below
    const organiser = req.body.ORGANISER;
    const caption = req.body.CAPTION;
    const target = req.body.TARGET_FUNDING;
    const current = req.body.CURRENT_FUNDING;
    const city = req.body.CITY;
    const active = req.body.ACTIVE;             //This is boolean in MySQL, should be able to accept TRUE / FALSE or 1 / 0 respectively
    const cat_id = req.body.CATEGORY_ID;   
    const imgUrl = req.body.IMG_URL || '';       //OPTIONAL - if not included, will revert to an empty string\\

    // Validation
    if (!organiser || !caption || !target || isNaN(target) || !cat_id || isNaN(cat_id) || !city || !active) {
        return res.status(400).json({ error: 'Invalid or missing data. Please provide all required fields with valid values.' });
    }

    // Additionally, escape single quotes in strings (preventing SQL injection)
    const escapedOrganiser = organiser.replace(/'/g, "''");
    const escapedCaption = caption.replace(/'/g, "''");
    const escapedCity = city.replace(/'/g, "''");

    //MySQL Query (using parameterised query for security)
    let query = `INSERT INTO FUNDRAISER (ORGANIZER, CAPTION, TARGET_FUNDING, CURRENT_FUNDING, CITY, ACTIVE, CATEGORY_ID, IMG_URL) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;

    connection.query(query, [escapedOrganiser, escapedCaption, target, current, escapedCity, active, cat_id, imgUrl], (err) => {
        if (err) {
            console.error(err, "Error while adding new fundraiser");

            // Check for duplicate error
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'Duplicate entry. A fundraiser with the same details might already exist.' });
            }

            return res.sendStatus(400); // not successful
        } else {
            res.sendStatus(201); // successful
        }
    });
});

//PUT Request - Updating existing fundraiser based on fundraiser ID - Tested with postman and working
router.put("/api/update-fundraiser", (req, res) => {

    //The JSON body sent by the admin-side website should have the body params listed below
    const fund_id = req.body.FUNDRAISER_ID;
    const organiser = req.body.ORGANISER;
    const caption = req.body.CAPTION;
    const target = req.body.TARGET_FUNDING;
    const current = req.body.CURRENT_FUNDING;
    const city = req.body.CITY;
    const active = req.body.ACTIVE;             //This is boolean in MySQL, should be able to accept TRUE / FALSE or 1 / 0 respectively
    const cat_id = req.body.CATEGORY_ID;   
    const imgUrl = req.body.IMG_URL || '';       //OPTIONAL - if not included, will revert to an empty string

    // Validation
    if (!fund_id || isNaN(fund_id) || (!organiser && !caption && !target && !current && !city && active === '' && !cat_id && !imgUrl)) {
        return res.status(400).json({ error: 'Invalid or missing data. Please provide at least one field to update and ensure valid values.' });
    }

    // Additionally, escape single quotes in strings (preventing SQL injection)
    const escapedOrganiser = organiser ? organiser.replace(/'/g, "''") : null;
    const escapedCaption = caption ? caption.replace(/'/g, "''") : null;
    const escapedCity = city ? city.replace(/'/g, "''") : null;
    const escapedImgUrl = imgUrl ? imgUrl.replace(/'/g, "''") : null;

    // Build the SET clause dynamically (using prepared values from validation and escape)
    let setClause = [];
    let queryParams = [];
    if (escapedOrganiser) {
        setClause.push('ORGANIZER = ?');
        queryParams.push(escapedOrganiser);
    }
    if (escapedCaption) {
        setClause.push('CAPTION = ?');
        queryParams.push(escapedCaption);
    }
    if (target !== null && target !== '') { // Check for null and empty string
        setClause.push('TARGET_FUNDING = ?');
        queryParams.push(target);
    }
    if (current !== null && current !== '') { // Check for null and empty string
        setClause.push('CURRENT_FUNDING = ?');
        queryParams.push(current);
    }
    if (escapedCity) {
        setClause.push('CITY = ?');
        queryParams.push(escapedCity);
    }
    if (active !== '') {
        setClause.push('ACTIVE = ?');
        queryParams.push(active);
    }
    if (cat_id !== null && cat_id !== '') { // Check for null and empty string
        setClause.push('CATEGORY_ID = ?');
        queryParams.push(cat_id);
    }
    if (escapedImgUrl) {
        setClause.push('IMG_URL = ?');
        queryParams.push(escapedImgUrl);
    }

    // MySQL Query (using prepared statement)
    let query = `UPDATE FUNDRAISER SET ${setClause.join(', ')} WHERE FUNDRAISER_ID = ?`;
    queryParams.push(fund_id); // Add the fundraiser ID to the parameters

    connection.query(query, queryParams, (err) => {
        if (err) {
            console.error(err, "Error while updating fundraiser");

            // Check for duplicate error
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'Duplicate entry. A fundraiser with the same details might already exist.' });
            }

            return res.sendStatus(400); // Sends a bad request status code
        } else {
            res.sendStatus(200); // Sends a successful status code
        }
    });
});

//DELETE Request - Admin-side - Tested on postman
//Send this API a fundraiser ID once checking to ensure it has no donations. Use the /api/get-all request to check if fundraiser_id exists before calling this
router.delete("/api/delete-fundraiser", (req,res) => {
    
    let fundraiser_id = req.query.id;   //Fundraiser_ID

    let query = `DELETE FROM FUNDRAISER WHERE FUNDRAISER_ID = '${fundraiser_id}';`
    
    connection.query(query, (err) => {
        if(err){
            res.sendStatus(400);                               //Sends a bad request status code
            console.log(err, "Unable to delete fundraiser");   //Logs an error
        }
        else {
            res.sendStatus(200);                               //Sends a successful status code
        }
    });
})

//Exports the module - must go at end of file
module.exports = router;