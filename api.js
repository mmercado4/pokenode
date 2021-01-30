const express = require("express");
const fs = require("fs");

const api = express();

api.get("/api/pokemons", (request, response) => {
  fs.readFile("db/dbPokemon.json", (error, data) => {
    if (error) throw error; //Similar al console.error. Elevar o notificar una excepción.
    const pokemonJSON = JSON.parse(data); //Data no lo lee como un JSON, sino como texto plano.
    response.status(200).send({
      success: true,
      message: "/api/pokemons",
      method: "GET",
      pokemons: pokemonJSON,
    });
  });
});

api.listen(1212, () => {
  console.log("API running in port 1212");
});
