# MyFlix API

MyFlix API is a RESTful API developed using Node.js and Express. It serves as the backend for the MyFlix web application, providing endpoints to interact with the movie database, user authentication, and user data management.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [API Endpoints](#api-endpoints)


## Features

- **User Authentication:** Secure user registration and login.
- **Movie Data Management:** Retrieve details about movies, genres, and directors.
- **User Data Management:** Allow users to update their information, add or remove favorite movies.

## Technologies Used

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)

## Getting Started

### Prerequisites

- Node.js
- MongoDB

### Installation

1. **Clone the Repository:**

git clone https://github.com/AbbasAli5784/demo-repo.git
Navigate to the Project Directory: cd demo-repo
Install Dependencies: npm install
Start the API Server: npm start


## API Endpoints
User Registration: POST /users
User Login: POST /login
Get All Movies: GET /movies
Get Movie by Title: GET /movies/:title
Get Genre by Name: GET /genres/:name
Get Director by Name: GET /directors/:name
Update User Info: PUT /users/:username
Add Movie to Favorites: POST /users/:username/movies/:movieID
Remove Movie from Favorites: DELETE /users/:username/movies/:movieID
