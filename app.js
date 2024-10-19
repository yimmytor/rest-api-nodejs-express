const express = require("express");
const crypto = require("node:crypto");
const app = express();
const PORT = process.env.PORT ?? 1234;
const moviesJson = require("./movies.json");
const cors = require("cors");
const { validateMovie, validatePartialMovie } = require("./schemas/movies.js");
const { off } = require("node:process");

app.disable("x-powered-by");
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      const ACEPTED_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:1234",
        "http://127.0.0.1:5500",
      ];

      if (ACEPTED_ORIGINS.includes(origin) || !origin) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  }),
);

// metodos normales: GET/HEAD/POST
// metodos especiales: PUT/PATCH/DELETE

// CORS PRE-flight
// OPTIONS

app.get("/", (req, res) => {
  res.json({ message: "Hola mundo" });
});

app.get("/movies/:id", (req, res) => {
  //path to regexp
  const { id } = req.params;
  const movie = moviesJson.find((movie) => movie.id === id);

  return movie
    ? res.json(movie)
    : res.status(404).json({ message: "Película no encontrada." });
});

app.get("/movies", (req, res) => {
  // Para usar sin el Middleware cors
  /*const origin = req.header("origin");

  // si la peticion viene de un origen igual al destino
  // la cabecera "origin" no viene y por eso se valida !origin
  if (!origin || ACEPTED_ORIGINS.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin); // * para todos
  }*/

  const { genre } = req.query;
  let movies;

  if (genre) {
    movies = moviesJson.filter((movie) =>
      movie.genre.some(
        (movieGenre) => movieGenre.toLowerCase() === genre.toLowerCase(),
      ),
    );
  } else {
    movies = moviesJson;
  }

  res.json(movies);
});

app.post("/movies", (req, res) => {
  const result = validateMovie(req.body);

  if (result.error) {
    return res.status(422).json({ error: JSON.parse(result.error.message) });
  }

  const newMovie = {
    id: crypto.randomUUID(), //uuid v4
    ...result.data,
  };

  moviesJson.push(newMovie);

  res.status(201).json(newMovie);
});

app.patch("/movies/:id", (req, res) => {
  const { id } = req.params;
  const movieIndex = moviesJson.findIndex((movie) => movie.id === id);
  const result = validatePartialMovie(req.body);

  if (result.error) {
    return res.status(422).json({ error: JSON.parse(result.error.message) });
  }

  if (movieIndex === -1) {
    return res.status(404).json({ message: "Movie not found" });
  }

  const movieUpdate = {
    ...moviesJson[movieIndex],
    ...result.data,
  };

  moviesJson[movieIndex] = movieUpdate;

  return res.status(200).json(movieUpdate);
});

app.delete("/movies/:id", (req, res) => {
  // Para usar sin el middleware cors
  /*const origin = req.header("origin");

  if (!origin || ACEPTED_ORIGINS.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin); // * para todos
  }*/

  const { id } = req.params;
  const movieIndex = moviesJson.findIndex((movie) => movie.id === id);

  if (movieIndex == -1) {
    return res.status(404).json({ message: "Movie not found" });
  }

  moviesJson.splice(movieIndex, 1);

  return res.status(204).json({ message: "Movie deleted" });
});

// Para usar sin el Middleware cors
/*// CORS
app.options("/movies/:id", (req, res) => {
  const origin = req.header("origin");

  if (ACEPTED_ORIGINS.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header(
      "Access-Control-Allow-Methods",
      "GET,HEAD,PUT,PATCH,POST,DELETE",
    );

    res.sendStatus(200);
  }
});*/

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
