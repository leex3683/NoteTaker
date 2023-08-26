const express = require('express');
const path = require('path');

const fs = require('fs');
const util = require('util');
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
app.get('/notes',(req, res) =>
res.sendFile(path.join(__dirname, './public/notes.html'))
);

//on /api/notes route, show notes in the browser
app.get('/api/notes', (req, res) => {
    readFromFile('./db/db.json').then((data) =>
      res.json(JSON.parse(data))
    );
  });

//post routing
app.post('/api/notes', (req, res) => {

    fs.writeFile('./db/db.json', JSON.stringify(res, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to './db/db.json'`)
  );

});

app.get('*',(req, res) =>
res.sendFile(path.join(__dirname, './public/index.html'))
);


//run server on PORT 3001
app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);
