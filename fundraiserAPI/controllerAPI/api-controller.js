var dbcon = require("../crowdfunding_db.js");
var express = require("express");
var router = express.Router();


var connection = dbcon.getConnection();

//Connects to the database
connection.connect();

//Get request 1 - Returns details of all ACTIVE fundraisers
router.get("/",(req,res) =>{
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
router.get("/category",(req,res) =>{
    connection.query(`SELECT NAME FROM CATEGORY;`,(err,records, fields) =>{
        if(err){
            console.log("Error while retrieving categories");   //Logs an error message
        }
        else{
            res.send(records);  //Sends the returned records as a response
        }
    })
})

//Get request 3 - Used by the search page to return results that match user-inputted criteria. This API get method is able to handle one or multiple search criteria
router.get("/search",(req,res) =>{

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
        console.log("Error while retrieving fundraisers", err); //Logs an error message and error
        console.log("cat = " + category + ", city = "+ city + "  , org = "+ organiser); //Logs the user inputs used in api call - keep for troubleshooting
        console.log(req.query); //Logs the request query - keep for troubleshooting
    }
    else {
        res.send(records);  //Sends the returned records as a response
    }
    })
})

//Get request 4 - Used to retrive details of a fundraiser which is specified by the (id) protion of the request URL
router.get("/fundraiser/:id",(req,res) =>{
        connection.query(`SELECT FUNDRAISER.FUNDRAISER_ID, FUNDRAISER.ORGANIZER, FUNDRAISER.CAPTION, FUNDRAISER.TARGET_FUNDING, FUNDRAISER.CURRENT_FUNDING, FUNDRAISER.CITY, FUNDRAISER.ACTIVE, FUNDRAISER.IMG_URL, CATEGORY.NAME AS CATEGORY_NAME 
        FROM FUNDRAISER INNER JOIN CATEGORY ON FUNDRAISER.CATEGORY_ID = CATEGORY.CATEGORY_ID WHERE FUNDRAISER.FUNDRAISER_ID =` + req.params.id,(err,records, fields) =>{
    if(err){
        console.log("Error while retrieving active fundraisers");   //Logs an error
    }
    else{
        res.send(records);  //Sends the returned records as a response
    }
    })
})

//Exports the module - must go at end of file
module.exports = router;