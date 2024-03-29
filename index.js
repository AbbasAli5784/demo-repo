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

/**
 * @route POST /users
 * @group Users - Operations related to users
 * @param {string} Username.body.required - Username must be alphanumeric and at least 5 characters long
 * @param {string} Password.body.required - Password is required
 * @param {string} Email.body.required - Email must be a valid email address
 * @returns {Object} 201 - JSON object representing the created user
 * @returns {Object} 400 - Username already exists
 * @returns {Object} 422 - Validation error
 * @returns {Object} 500 - Error message
 */


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

/**
 * @route GET /users
 * @group Users - Operations related to users
 * @returns {Object[]} 201 - Array of user objects
 * @returns {Object} 500 - Error message
 */


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

/**
 * @route GET /users/{Username}
 * @group Users - Operations related to users
 * @param {string} Username.path.required - Username of the user
 * @returns {Object} 200 - JSON object representing the user
 * @returns {Object} 500 - Error message
 */

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


/**
 * @route PUT /users/{Username}
 * @group Users - Operations related to users
 * @param {string} Username.path.required - Username must be alphanumeric and at least 5 characters long
 * @param {string} Email.body.required - Email must be a valid email address
 * @returns {Object} 200 - JSON object representing the updated user
 * @returns {Object} 422 - Validation error
 * @returns {Object} 500 - Error message
 */

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

// Add a movie object to a user's list of favorites

/**
 * @route POST /users/{Username}/movies/{MovieID}
 * @group Users - Operations related to users
 * @param {string} Username.path.required - Username of the user
 * @param {string} MovieID.path.required - ID of the movie
 * @returns {Object} 200 - JSON object representing the updated user
 * @returns {Object} 404 - Movie not found
 * @returns {Object} 500 - Error message
 */


app.post("/users/:Username/movies/:MovieID", (req, res) => {
  // First, fetch the movie object using the provided MovieID
  Movies.findById(req.params.MovieID)
    .then((movie) => {
      if (!movie) {
        return res.status(404).send("Movie not found");
      }
      // Update the user's FavoriteMovies array by pushing the fetched movie object
      Users.findOneAndUpdate(
        { Username: req.params.Username },
        { $push: { FavoriteMovies: movie } }, // Push the entire movie object
        { new: true }
      )
        .then((updatedUser) => {
          res.json(updatedUser);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("Error updating user's favorite movies: " + err);
        });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error fetching movie: " + err);
    });
});

//Allow a user to deregiester

/**
 * @route DELETE /users/{Username}
 * @group Users - Operations related to users
 * @param {string} Username.path.required - Username of the user
 * @returns {string} 200 - Username was deleted
 * @returns {string} 400 - Username was not found
 * @returns {Object} 500 - Error message
 */

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

/**
 * @route DELETE /users/{Username}/movies/{MovieID}
 * @group Users - Operations related to users
 * @param {string} Username.path.required - Username of the user
 * @param {string} MovieID.path.required - ID of the movie
 * @returns {Object} 200 - JSON object representing the updated user
 * @returns {Object} 500 - Error message
 */

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

/**
 * @route PUT /users/{Username}/movies/{MovieID}
 * @group Users - Operations related to users
 * @param {string} Username.path.required - Username of the user
 * @param {string} MovieID.path.required - ID of the movie
 * @returns {Object} 200 - JSON object representing the updated user
 * @returns {Object} 500 - Error message
 */


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


/**
 * @route GET /movies
 * @group Movies - Operations related to movies
 * @returns {Object[]} 201 - Array of movie objects
 */
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

/**
 * @route GET /movies/{title}
 * @group Movies - Operations related to movies
 * @param {string} title.path.required - Title of the movie
 * @returns {Object} 200 - JSON object representing the movie
 * @returns {Object} 500 - Error message
 */


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

/**
 * @route GET /movies/genre/{genreName}
 * @group Movies - Operations related to movies
 * @param {string} genreName.path.required - Name of the genre
 * @returns {Object} 200 - JSON object representing the genre
 * @returns {Object} 500 - Error message
 */

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

/**
 * @route GET /movies/directors/{directorName}
 * @group Movies - Operations related to movies
 * @param {string} directorName.path.required - Name of the director
 * @returns {Object} 200 - JSON object representing the director
 * @returns {Object} 500 - Error message
 */

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

/**
 * @route GET /genres
 * @group Genres - Operations related to genres
 * @returns {Object[]} 201 - Array of genre objects
 * @returns {Object} 500 - Error message
 */

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

/**
 * @route POST /users/verifyPassword/{id}
 * @group Users - Operations related to users
 * @param {string} id.path.required - ID of the user
 * @param {string} password.body.required - Password to verify
 * @returns {string} 200 - Password verified
 * @returns {string} 400 - Incorrect password
 * @returns {Object} 500 - Error message
 */


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

/**
 * @route PUT /users/updatePassword/{id}
 * @group Users - Operations related to users
 * @param {string} id.path.required - ID of the user
 * @param {string} password.body.required - New password
 * @returns {Object} 200 - JSON object representing the updated user
 * @returns {Object} 500 - Error message
 */

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

/**
 * @route GET /users/:Username/favoritemovies
 * @group Users - Operations related to users
 * @param {string} Username.path.required - Username of the user
 * @returns {Object[]} 200 - Array of user's favorite movies
 * @returns {Object} 500 - Error message
 * @security JWT
 * @description This endpoint returns a list of a user's favorite movies.
 */

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

/**
 * @route GET /movies/{MovieID}/favoriteMovies
 * @group Movies - Operations related to movies
 * @param {string} MovieID.path.required - ID of the movie
 * @returns {Object} 200 - JSON object representing the movie
 * @returns {string} 404 - Movie not found
 * @returns {Object} 500 - Error message
 */

app.get("/movies/:MovieID/favoriteMovies", (req, res) => {
  console.log("Fetching movie with ID:", req.params.MovieID); // Log the movie ID being requested

  Movies.findById(req.params.MovieID)
    .then((movie) => {
      if (!movie) {
        console.log("No movie found with ID:", req.params.MovieID); // Log if no movie is found
        return res.status(404).send("Movie not found");
      }
      res.json(movie);
    })
    .catch((err) => {
      console.error("Error fetching movie:", err);
      res.status(500).send("Error fetching movie: ", err);
    });
});

/**
 * @route LISTEN {port}
 * @group Server - Operations related to server
 * @param {number} port - Port number on which the server is running. Defaults to 8080 if not provided.
 * @returns {string} 200 - Listening on Port {port}
 */

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port" + port);
});
