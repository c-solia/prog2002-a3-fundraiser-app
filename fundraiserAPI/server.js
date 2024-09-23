var express = require('express');       //Imports express framework
var bodyparser = require("body-parser");    //Imports body-parser
const cors = require("cors");       //Imports CORS

var app = express();        //Creates an instance of express

var fundraiserAPI = require("./controllerAPI/api-controller");  //Imports the api-controller file which contains API calls

const port = 3060;  //port number to be used

app.use(cors());    //Tells express to use cors

app.use(bodyparser.urlencoded({extended:false}));   //Tells express to use body-parser to handle url-encoded requests

app.use("/", fundraiserAPI);    //Tells express to use the API's in the api-controller file

app.listen(port);   //Listens out on the defined port

console.log(`Server up and running on port ${port}`);   //Logs a message to the console confirming when the server is working