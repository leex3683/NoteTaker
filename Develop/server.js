const express = require("express");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const fs = require("fs");
const util = require("util");
// Promise version of fs.readFile
const readFromFile = util.promisify(fs.readFile);

const PORT = process.env.PORT || 3001;

//call express function
const app = express();

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

//route to get from /notes
app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "./public/notes.html"))
);

//Route to get from api/notes
app.get("/api/notes", (req, res) => {
  readFromFile("./db/db.json").then((data) => res.json(JSON.parse(data)));
});

//Rout to Post
app.post("/api/notes", (req, res) => {
  //read the file
  fs.readFile("./db/db.json", "utf8", (err, data) => {
    const { title, text } = req.body;
    const newNotes = {
      title,
      text,
      id: uuidv4(),
    };
    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
      parsedData.push(newNotes);
      fs.writeFile("./db/db.json", JSON.stringify(parsedData, null, 4), (err) =>
        err
          ? console.error(err)
          : console.info(`\nData written to './db/db.json'`)
      );
    }
  });
  res.json("added");
});

//Route to Delete:
//reads file, deletes array item with matching id
app.delete("/api/notes/:id", (req, res) => {
  //store ID to delete in a variable
  let dId = req.params.id;

  //get the db file open
  fs.readFile("./db/db.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
    } else {
      //Turn the db into an array of objects
      const parsedData = JSON.parse(data);
      //Find the element whose id is equal to the one we clicked
      const i = parsedData.findIndex((e) => e.id === dId);
      //Delete that object by index
      parsedData.splice(i, 1);
      //Stringify the result, write and save
      fs.writeFile("./db/db.json", JSON.stringify(parsedData, null, 4), (err) =>
        err
          ? console.error(err)
          : console.info(`\nData written to './db/db.json'`)
      );
    }
  });
  //Resolve promise
  res.json("deleted");
});

//Route to get all else
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "./public/index.html"))
);

//run server on PORT 3001
app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);
