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

//route /notes to notes.html file
app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "./public/notes.html"))
);

//on /api/notes route, show notes in the browser
app.get("/api/notes", (req, res) => {
  readFromFile("./db/db.json").then((data) => res.json(JSON.parse(data)));
});

//post routing
app.post("/api/notes", (req, res) => {
  //read the file. If successful, create an array from the data and push the
  //new note object 'req.body'. Convert the result to a string and save as db.json
  fs.readFile("./db/db.json", "utf8", (err, data) => {
    
    const { title, text } = req.body;
    const newNote = {
      title,
      text,
      noteID: uuidv4(),
    };

    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
      parsedData.push(newNote);
      fs.writeFile("./db/db.json", JSON.stringify(parsedData, null, 4), (err) =>
        err
          ? console.error(err)
          : console.info(`\nData written to './db/db.json'`)
      );
    }
  });
});

app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "./public/index.html"))
);

//run server on PORT 3001
app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);
