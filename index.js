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
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const corsOptions = {
  origin: (origin, callback) => {
    callback(null, true);
  },
  methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

const cors = require("cors");
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const { check, validationResult } = require("express-validator");

let auth = require("./auth")(app);
const passport = require("passport");
require("./passport");

//Allows a new user to regiester
app.get("/", (req, res) => {
  res.send("Welcome to MyFlix");
});

app.post(
  "/users",
  [
    check("Username", "username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + "already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: Users.hashPassword(req.body.Password),
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
  }
);
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

//update a user's info, by username

app.put(
  "/users/:Username",
  [
    check("Username", "username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed"
    ).isAlphanumeric(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    console.log("Updating user:", req.params.Username);
    console.log("New user data:", req.body);

    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
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
  }
);

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

app.delete(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $pull: { FavoriteMovies: req.params.MovieID } },
      { new: true }
    )
      .then((user) => {
        res.status(200).json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error:", err);
      });
  }
);
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
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find().then((movies) => {
      res.status(201).json(movies);
    });
  }
);

//Returns data about a single movie by Title to the user
app.get(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ Name: req.params.title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error:" + err);
      });
  }
);

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

//Verify passowrd endpoint
app.post(
  "/users/verifyPassword/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findById(req.params.id)
      .then((user) => {
        if (user.validatePassword(req.body.password)) {
          res.status(200).send("Password verified");
        } else {
          res.status(400).send("Incorrect password");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error:", err);
      });
  }
);
//Update password endpoint
app.put(
  "/users/updatePassword/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const hashedPassword = Users.hashPassword(req.body.password);
    Users.findByIdAndUpdate(
      req.params.id,
      { $set: { Password: hashedPassword } },
      { new: true }
    )
      .then((updatedUser) => {
        res.status(200).json(updatedUser);
      })
      .catch((Err) => {
        res.status(500).send("Error", Err);
      });
  }
);

app.get(
  "/users/:Username/favoritemovies",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user.FavoriteMovies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: ", err);
      });
  }
);

app.get("/movies/:movieId", (req, res) => {
  console.log("Fetching movie with ID:", req.params.movieId); // Log the movie ID being requested

  Movies.findById(req.params.movieId)
    .then((movie) => {
      if (!movie) {
        console.log("No movie found with ID:", req.params.movieId); // Log if no movie is found
        return res.status(404).send("Movie not found");
      }
      res.json(movie);
    })
    .catch((err) => {
      console.error("Error fetching movie:", err);
      res.status(500).send("Error fetching movie: ", err);
    });
});

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port" + port);
});
