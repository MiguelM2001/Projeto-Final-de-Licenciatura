const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
var db = require("../../database");

// Temos duas opções
// Temos o Refresh token válido e podemos criar outro access token a partir dele
// Não temos o Refresh token válido e temos de criar um novo refresh token e access token caso seja isso dar redirect para o login

router.use("/", async (req, res) => {
  let RefreshToken;
  let UserData;
  let token = req.body.token;
  let UserId;
  try {
    //Dar decode ao access token para obter o id do utilizador
    UserId = jwt.decode(token).id;

    // Ir buscar o Refresh Token do utilizador com base no id obtido
    let sqlToken = "SELECT RefreshToken FROM users WHERE  id = ?";

    await new Promise((resolve, reject) =>
      db.query(sqlToken, UserId, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
          RefreshToken = result[0].RefreshToken;
        }
      })
    );
    // Verificar se o Refresh Token é válido
    jwt.verify(
      RefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (expired, TokenData) => {
        // Se o refresh token for inválido
        if (expired) {
          console.log(
            "Refresh Token está mal mas o access token está bem apenas expirou"
          );
          resposta = -1;
          res.send("-1");
        }
        // Se o refresh token for válido
        else {
          console.log("Access token renovado");
          // Como o refresh token é válido vamos retirar as suas informações
          UserData = {
            email: TokenData.email,
            id: TokenData.id,
          };
          // Assinar um novo access token
          const access_token = jwt.sign(
            UserData,
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1y" }
          );

          // Mandar o novo token
          resposta = 1;
          res.json(access_token);
        }
      }
    );
  } catch {
    console.log("Access Token está mal");
    res.send("-1");
  }
});
module.exports = router;
