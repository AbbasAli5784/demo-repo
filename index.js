const express = require('express');
const app = express();
const morgan  = require('morgan');
const fs = require('fs');
const path = require('path');
const { Stream } = require('stream');
const accessLogStreamm = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

let favouritemovies = [
  {
    Title: "SuperBad",
    Director: "Greg Mottola",
  },
  { Title: "Titanic", Director: "James Cameron" },
  { Title: "The Godfather", Director: "Frabcus Fird Coppola" },
  {
    Title: "Forrest Gump",
    Director: "Robert Zemeckis",
  },
  { Title: "The Dark Knight", Director: "Christopher Nolan" },
  { Title: "The Lord of the rings", Director: "Peter Jackson" },
  {
    Title: "Pulp fiction",
    Director: "Quentin Tarantino",
  },
  {
    Title: "Star Wars",
    Director: "George Lucas",
  },
  {
    Title: "The Matrix",
    Director: "The Wachowskis",
  },
  {
    Title: "The Avengers",
    Director: "Anthony Russo",
  },
];

app.use(morgan('combined', {stream: accessLogStreamm}));

app.get('/movies', (req,res) => {
  res.json(favouritemovies);
});

app.get('/', (req,res) => {
  res.send("Welcome to MyFlix!")
});

app.use(express.static('Public'));

app.use((err,req,res, next) => {
  console.error(err.stack);
  res.status(500).send("Something Broke!")
})