var dbDetails = require("./dbDetails"); //Imports database details from the dbDetails file

var mysql = require("mysql2");  //Imports mtsql2 library which is used to connect to the MySQL database

var bodyParser = require("body-parser");    //Imports body-parser which is used parse data

//Exports this module as a function which contains the details required to access the database
module.exports = {
    getConnection:() => {
        return mysql.createConnection({
            host:dbDetails.host,
            user:dbDetails.user,
            password:dbDetails.password,
            database:dbDetails.database
        });
    }
}