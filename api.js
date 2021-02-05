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
        id: Math.max(...allPokemons.map((pokemon) => pokemon.id)) + 1,
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

//DELETE
api.delete("/api/pokemons", (request, response) => {
  const id = Number.parseInt(request.body.id);
  if (!id) {
    response.status(400).send({
      success: false,
      url: "/api/pokemons",
      method: "DELETE",
      message: "Id is required",
    });
  } else {
    fs.readFile("db/dbPokemon.json", (error, data) => {
      if (error) throw error;
      const allPokemons = JSON.parse(data);
      const deletedIndex = allPokemons.findIndex(
        (pokemon) => pokemon.id === id
      );
      allPokemons.splice(deletedIndex, 1);
      //También se puede hacer un filter a la inversa para obtener todos los elementos menos el que hay que eliminar

      fs.writeFile(
        "db/dbPokemon.json",
        JSON.stringify(allPokemons),
        (error) => {
          if (error) {
            response.status(400).send({
              success: false,
              url: "/api/pokemons",
              method: "DELETE",
              message: "Delete pokemon failed!",
              error: error,
            });
          } else {
            response.status(200).send({
              success: true,
              url: "/api/pokemons",
              method: "DELETE",
              message: "Pokemon deleted successfully!",
              pokemonId: id,
            });
          }
        }
      );
    });
  }
});

//GET ONE POKEMON. CON PARAMS
api.get("/api/onepokemon", (request, response) => {
  const id = Number.parseInt(request.query.id);
  if (!id) {
    response.status(400).send({
      success: false,
      url: "/api/pokemons",
      method: "GET",
      message: "id is required",
    });
  } else {
    fs.readFile("db/dbPokemon.json", (error, data) => {
      if (error) throw error; //Similar al console.error. Elevar o notificar una excepción.
      const pokemonJSON = JSON.parse(data); //Data no lo lee como un JSON, sino como texto plano.
      const onePokemon = pokemonJSON.filter((pokemon) => pokemon.id === id);
      if (onePokemon.length === 0) {
        response.status(200).send({
          success: true,
          url: "/api/onepokemon",
          method: "GET",
          message: "Pokemon not found!",
        });
      } else {
        response.status(200).send({
          success: true,
          url: "/api/onepokemon",
          method: "GET",
          message: "Pokemon found!",
          pokemon: onePokemon, //Ojo devuelve un array con un objeto dentro.
        });
      }
    });
  }
});

//GET UN POKEMON PERO POR UN MÉTODO MEJOR. Usar url con params más elegantes. Buenas prácticas.
api.get("/api/pokemons/:id", (request, response) => {
  console.log(request.params); //Nuestro ID está en la propiedad PARAMS de la REQUEST.
  let id = Number.parseInt(request.params.id);
  fs.readFile("db/dbPokemon.json", (error, data) => {
    if (error) throw error;
    let pokemonList = JSON.parse(data);
    let pokemon = pokemonList.filter((pokemon) => pokemon.id === id);
    if (pokemon.length === 0) {
      response.status(200).send({
        success: true,
        url: "/api/pokemons",
        method: "GET",
        message: "Pokemon not found!",
      });
    } else {
      response.status(200).send({
        success: true,
        url: "/api/pokemons",
        method: "GET",
        message: "Pokemon found!",
        pokemon: pokemon, //Ojo devuelve un array con un objeto dentro.
      });
    }
  });
});

api.put("/api/pokemons/:id", (request, response) => {
  let id = Number.parseInt(request.params.id);
  fs.readFile("db/dbPokemon.json", (error, data) => {
    if (error) throw error;
    let pokeList = JSON.parse(data);
    let pokeIndex = pokeList.findIndex((pok) => pok.id === id);
    let pokemonWanted = pokeList.find((pok) => pok.id === id);
    let modifiedData = request.body;
    //Se podría intentar hacer con un map para que, si se hace match, que se cambie todo.
    for (let prop in pokemonWanted) {
      for (let modProp in modifiedData) {
        if (modProp === prop) {
          pokemonWanted[prop] = modifiedData[modProp];
        }
      }
    }
    pokeList[pokeIndex] = pokemonWanted;

    fs.writeFile("db/dbPokemon.json", JSON.stringify(pokeList), (error) => {
      if (error) {
        response.status(400).send({
          success: false,
          url: `/api/pokemons/${id}`,
          method: "PUT",
          message: "Can not modify this pokemon!",
        });
      } else {
        response.status(200).send({
          success: true,
          url: `/api/pokemons/${id}`,
          method: "PUT",
          message: "Pokemon modified!",
        });
      }
    });
  });
});

api.listen(1212, () => {
  console.log("API running in port 1212");
});
