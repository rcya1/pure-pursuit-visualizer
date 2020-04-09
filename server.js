const express = require("express");
const app = express();

app.use("/public", express.static(__dirname + "/public"))

app.get("/", (request, response) => {
    response.sendFile(__dirname + "/index.html");
})

app.listen(1257, () => {
    console.log("Server is now running...");
});
