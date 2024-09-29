const express = require('express');
const path = require('path');

const app = express();
const port = 3001;

//Serves static files
app.use(express.static(__dirname));

//Routing for admin.html
app.get("/", (req,res) => {
    res.sendFile(path.join(__dirname, "admin.html"));
});

app.listen(port, () => {
    console.log(`Admin server is running on http://localhost:${port}`);
});