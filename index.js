const express = require("express");
const app = express();
//const morgan = require("morgan");
//const fs = require("fs");
//const path = require("path");
//const { Stream } = require("stream");
/*const accessLogStreamm = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});*/
const bodyParser = require("body-parser");
const { uniqueId } = require("lodash");
const uuid = require("uuid");
//const { allowedNodeEnvironmentFlags } = require("process");
//const res = require("express/lib/response");
//const { redirect } = require("express/lib/response");

app.use(bodyParser.json());

let users = [
  { id: 1, name: "Katie", movie: [] },
  { id: 2, name: "John", movie: ["SuperBad"] },
];

let favouritemovies = [
  {
    Title: "SuperBad",
    DirectorInfo: {
      Name: "Greg Mottola",
      Bio: "asfasfhasjf",
      BirthYear: 1972,
      DeathYear: 2000,
    },
    Genre: "Comedy",
    Description:
      "Two high school seniors embark on a wild night of adventure in an attempt to buy alcohol for a party.",
  },
  {
    Title: "Titanic",
    DirectorInfo: {
      Name: "James Cameron",
      Bio: "asfasfhasjf",
      BirthYear: 1972,
      DeathYear: 2000,
    },
    Genre: "Drama/Romance",
    Description:
      "A love story between a wealthy woman and a poor artist on the ill-fated maiden voyage of the RMS Titanic.",
  },
  {
    Title: "The Godfather",
    DirectorInfo: {
      Name: "Francis Ford Coppola",
      Bio: "asfasfhasjf",
      BirthYear: 1972,
      DeathYear: 2000,
    },
    Genre: "Crime/Drama",
    Description:
      "The story of a powerful Italian-American mafia family and their patriarch, Vito Corleone.",
  },
  {
    Title: "Forrest Gump",
    DirectorInfo: {
      Name: "Robert Zemeckis",
      Bio: "asfasfhasjf",
      BirthYear: 1972,
      DeathYear: 2000,
    },
    Genre: "Drama/Comedy",
    Description:
      "A simple man with a low IQ experiences several key historical events and influences popular culture.",
  },
  {
    Title: "The Dark Knight",
    DirectorInfo: {
      Name: "Christopher Nolan",
      Bio: "asfasfhasjf",
      BirthYear: 1972,
      DeathYear: 2000,
    },
    Genre: "Action/Crime",
    Description:
      "Batman faces off against his greatest enemy, the Joker, in a battle to save Gotham City.",
  },
  {
    Title: "The Lord of the Rings",
    DirectorInfo: {
      Name: "Peter Jackson",
      Bio: "asfasfhasjf",
      BirthYear: 1972,
      DeathYear: 2000,
    },
    Genre: "Fantasy/Adventure",
    Description:
      "A young hobbit named Frodo Baggins must destroy an evil ring and save Middle-earth from darkness.",
  },
  {
    Title: "Pulp Fiction",
    DirectorInfo: {
      Name: "Quentin Tarantino",
      Bio: "asfasfhasjf",
      BirthYear: 1972,
      DeathYear: 2000,
    },
    Genre: "Crime/Drama",
    Description:
      "The intersecting stories of several characters in the criminal underworld of Los Angeles.",
  },
  {
    Title: "Star Wars",
    DirectorInfo: {
      Name: "George Lucas",
      Bio: "asfasfhasjf",
      BirthYear: 1972,
      DeathYear: 2000,
    },
    Genre: "Science Fiction",
    Description:
      "A group of rebels fight against the evil Empire in a galaxy far, far away.",
  },
  {
    Title: "The Matrix",
    DirectorInfo: {
      Name: "The Wachowskis",
      Bio: "asfasfhasjf",
      BirthYear: 1972,
      DeathYear: 2000,
    },
    Genre: "Science Fiction",
    Description:
      "A computer hacker learns the truth about reality and leads a rebellion against machines that have enslaved humanity.",
  },
  {
    Title: "The Avengers",
    DirectorInfo: {
      Name: "Anthony Russo",
      Bio: "asfasfhasjf",
      BirthYear: 1972,
      DeathYear: 2000,
    },
    Genre: "Action/Science Fiction",
    Description:
      "A team of superheroes, including Iron Man, Captain America, and Thor, team up to save the world from a powerful threat.",
  },
];

//Exercise 2.4
/*app.use(morgan("combined", { stream: accessLogStreamm }));

app.get("/movies", (req, res) => {
  res.json(favouritemovies);
});

app.get("/", (req, res) => {
  res.send("Welcome to MyFlix!");
});

app.use(express.static("Public"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something Broke!");
});*/

//allow a new user to regiester

app.post("/users", (req, res) => {
  const newUser = req.body;
  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.json(newUser);
  }
});
//allow users to update username
app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const updateUser = req.body;
  let user = users.find((user) => user.id == id);
  res.status(200).json(user);
});

//allow users to add a list of movies to there favourites

app.post("/movies/:id/:movieTitle", (req, res) => {
  const { id, movieTitle } = req.params;
  const user = users.find((user) => user.id == id);
  if (user) {
    user.movie.push(movieTitle);
    res.send("movie has been added to user!");
  }
});

//Allow users to remove a movie from there list

app.delete("/movies/:id/:movieTitle", (req, res) => {
  res.send("Movie has been removed from list");
});

//Allow a user to deregiester
app.delete("/users/:id", (req, res) => {
  res.send("User has been deleted");
});

// Returns list of ALL movies to user
app.get("/movies", (req, res) => {
  res.status(200).json(favouritemovies);
});

//Returns data about a single movie by Title to the user
app.get("/movies/:title", (req, res) => {
  const { title } = req.params;
  console.log(title);
  const movie = favouritemovies.find((movie) => movie.Title === title);
  res.json(movie);
});

//Get movies by Genre name
app.get("/movies/genre/:genreName", (req, res) => {
  const { genreName } = req.params;
  const genre = favouritemovies.filter((movie) => movie.Genre === genreName);
  res.status(200).json(genre);
});



app.get("/movies/directors/:directorName", (req, res) => {
  const { directorName } = req.params;
  const director = favouritemovies.find(
    (movie) => movie.DirectorInfo.Name === directorName
  );
  res.status(200).json(director.DirectorInfo);
  console.log(director);
});



app.listen(8080, () => console.log("listening on 8080"));
