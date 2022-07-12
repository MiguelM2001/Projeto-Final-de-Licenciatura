const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
var db = require("../../database");

// Verificar se o access token é valido
// Se for vai para a proxima função visto que isto é middleware
// Se não dá return a varias failed messages para depois serem tratadas de forma adequada

router.use("/", function authenticate(req, res, next) {
  //Obter o header
  const authHeader = req.headers.authorization;
  //Verificar se o token esta indefinido
  if (typeof authHeader !== "undefined") {
    //Obter o token
    const token = authHeader && authHeader.split(" ")[1];
    //Verificar a validade do access token
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      async (expired, UserData) => {
        // Se ocorrer um erro
        if (expired) {
          res.send("-1");
        }
        // Se não ocorrer erro nenhum passamos para a próxima função
        else {
          req.user = UserData;
          next();
        }
      }
    );
  } else {
    // Se o token não estiver definido é porque o utilizador não deu login
    // Redirecionar para a pagina login
    console.log("redirect para login...");
    res.send("-2");
  }
});

module.exports = router;
