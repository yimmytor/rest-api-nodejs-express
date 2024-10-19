const zod = require("zod");

const movieSchema = zod.object({
  title: zod
    .string({
      invalid_type_error: "Movie title must be a string",
      required_error: "Movie title is required",
    })
    .min(1),
  year: zod.number().int().positive(),
  director: zod.string().min(1),
  duration: zod.number().int().positive(),
  rate: zod.number().positive().min(0).max(10).default(0),
  poster: zod.string().url({
    message: "Poster must be a valid URL",
  }),
  genre: zod.array(
    zod.enum([
      "Drama",
      "Action",
      "Adventure",
      "Comedy",
      "Crime",
      "Romance",
      "Sci-Fi",
    ]),
  ),
});

function validateMovie(object) {
  return movieSchema.safeParse(object);
}

function validatePartialMovie(object) {
  return movieSchema.partial().safeParse(object);
}

module.exports = {
  validateMovie,
  validatePartialMovie,
};
