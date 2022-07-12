const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
var db = require("../../database");

// Verificar se o access token é valido
router.use("/", function authenticate(req, res) {
  //Dar Request ao header
  const authHeader = req.headers.authorization;
  //Check bearer/token is undefined
  if (typeof authHeader !== "undefined") {
    //Obter token
    const token = authHeader && authHeader.split(" ")[1];
    //Verificar a validade do token
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      async (expired, UserData) => {
        // Se houver algum erro significa que o token está invalido
        if (expired) {
          console.log("Access token expirou/está mal formatado");
          res.send("-1");
        }
        // Se não ocorrer erros significa que está válido
        else {
          res.send("1");
        }
      }
    );
  } // Se o token não estiver definido é porque o utilizador não deu login
  // Redirecionar para a pagina login
  else {
    res.send("-2");
  }
});

module.exports = router;
