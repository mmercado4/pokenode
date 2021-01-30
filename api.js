const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");

const api = express();

api.use(bodyParser.urlencoded({ extended: true })); //Decodificamos la info del body.

//GET
api.get("/api/pokemons", (request, response) => {
  fs.readFile("db/dbPokemon.json", (error, data) => {
    if (error) throw error; //Similar al console.error. Elevar o notificar una excepción.
    const pokemonJSON = JSON.parse(data); //Data no lo lee como un JSON, sino como texto plano.
    response.status(200).send({
      success: true,
      url: "/api/pokemons",
      method: "GET",
      pokemons: pokemonJSON,
    });
  });
});

//POST por parámetros "api/pokemons?name=pikachu&type=electrico"
api.post("/api/pokemons", (request, response) => {
  if (!request.body.name || !request.body.type) {
    response.status(400).send({
      success: false,
      url: "/api/pokemons",
      method: "POST",
      message: "Name and Type are required",
    });
  } else {
    // En request.query tenemos todos los parámetros que se envíen al microservicio.
    fs.readFile("db/dbPokemon.json", (error, data) => {
      if (error) throw error;
      const allPokemons = JSON.parse(data);
      const newPokemon = {
        id: allPokemons.length + 1,
        name: request.body.name,
        type: request.body.type,
      };
      allPokemons.push(newPokemon);

      fs.writeFile(
        "db/dbPokemon.json",
        JSON.stringify(allPokemons),
        (error) => {
          if (error) {
            response.status(400).send({
              success: false,
              url: "/api/pokemons",
              method: "POST",
              message: "Fallo al añadir el pokemon",
              error: error,
            });
          } else {
            response.status(201).send({
              success: true,
              url: "/api/pokemons",
              method: "POST",
              message: "Pokemon añadido correctamente",
              newPokemon: newPokemon,
            });
          }
        }
      );
    });
  }
});

api.listen(1212, () => {
  console.log("API running in port 1212");
});
