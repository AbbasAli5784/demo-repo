const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { uniqueId, update } = require("lodash");
const uuid = require("uuid");
const mongoose = require("mongoose");
const Models = require("./models.js");
const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;
mongoose.connect("mongodb://localhost:27017/MyFlixDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Allows a new user to regiester
app.post("/users", (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + "already exists");
      } else {
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        })
          .then((user) => {
            res.status(201).json(user);
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send("Error: " + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});
//Returns a list of all users
app.get("/users", (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error:" + err);
    });
  //Get a user by username
  app.get("/users/:Username", (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error:" + err);
      });
  });
});
//update a user's info, by username

app.put("/users/:id", (req, res) => {
  console.log("Updating user:", req.params.id);
  console.log("New user data:", req.body);

  Users.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      },
    },
    { new: true }
  )
    .then((updatedUser) => {
      console.log(updatedUser);
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error:" + err);
    });
});

//Add a movie to a user's list of favorites
app.post("/users/:Username/movies/:MovieID", (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    { $push: { FavoriteMovies: req.params.MovieID } },
    { new: true }
  )
    .then((updateUser) => {
      res.json(updateUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//Allow a user to deregiester 
app.delete("/users/:Username", (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + "was not found");
      } else {
        res.status(200).send(req.params.Username + " was deleted.");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//Allow users to remove a movie from there list

app.put("/users/:Username/movies/:MovieID", (req, res) => {
  Users.updateOne(
    { Username: req.params.Username },
    { $pull: { FavoriteMovies: req.params.MovieID } },
    { new: true }
  )
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Returns list of ALL movies to user
app.get("/movies", (req, res) => {
  Movies.find().then((movies) => {
    res.status(201).json(movies);
  });
});

//Returns data about a single movie by Title to the user
app.get("/movies/:title", (req, res) => {
  Movies.findOne({ Name: req.params.title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error:" + err);
    });
});

//Get movies by Genre name
app.get("/movies/genre/:genreName", (req, res) => {
  Genres.findOne({ Name: req.params.genreName })
    .then((genres) => {
      res.json(genres);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error:" + err);
    });
});

app.get("/movies/directors/:directorName", (req, res) => {
  Directors.findOne({ Name: req.params.directorName })
    .then((directors) => {
      res.json(directors);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error:" + err);
    });
});

app.get("/genres", (req, res) => {
  Genres.find()
    .then((genres) => {
      res.status(201).json(genres);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error:" + err);
    });
});

app.listen(8080, () => console.log("listening on 8080"));
