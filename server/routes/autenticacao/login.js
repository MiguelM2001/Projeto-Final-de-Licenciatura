const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var db = require("../../database");

////////////////////////////////////////////////////////////////////

// Verificar credenciais

router.post("/", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  verificar_user(email, password, res).then(() => {});
});

////////////////////////////////////////////////////////////////////

// Verificar se utilizador existe

async function verificar_user(email, password, res) {
  let get_password = "";
  const sqlUser = "SELECT password,id,nome from users WHERE email=?";

  // Devolver tudo do user com aquele email
  await new Promise((resolve, reject) =>
    db.query(sqlUser, email, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
        // Caso não encontre o user
        // Significa que o mail está errado
        if (result.length === 0) {
          console.log("tudo errado");
          res.json({
            auth: false,
          });
        } else {
          // Caso encontre o user guardar a pass da base de dados
          // Numa variavel
          get_password = result[0].password;
          id = result[0].id;
          nome = result[0].nome;
          validar_credenciais(nome, email, id, get_password, password, res);
        }
      }
    })
  );
}

////////////////////////////////////////////////////////////////////

// Ver se a pass da base de dados
// É igual à pass introduzida

function validar_credenciais(nome, email, id, get_password, password, res) {
  bcrypt.compare(password, get_password, (error, final) => {
    if (error) {
      console.log(error);
    } else {
      // Se as passwords forem iguais
      if (final) {
        console.log("tudo certo");

        let user = {
          id: id,
          email: email,
          nome: nome,
        };

        //Assinar tokens
        const access_token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "1y",
        });
        const refresh_token = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
          expiresIn: "1y",
        });

        //accessToken enviado devolta para o user
        //refreshToken é guardado na base de dados
        guardar_token(refresh_token, email);
        let objeto = {
          nome: nome,
          token: access_token,
        };
        res.json(objeto);
      } else {
        // Se as passwords não forem iguais
        console.log("pass errada");

        res.json({
          auth: false,
        });
      }
    }
  });
}

async function guardar_token(refresh_token, email) {
  //Guardar refresh token na base de dados
  let sqlToken = "Update users SET RefreshToken = ? WHERE email = ?";
  //Storing ...
  let ResultsDB = await new Promise((resolve, reject) =>
    db.query(sqlToken, [refresh_token, email], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    })
  );
}
// Quando se confirma que o user é válido criamos um objeto (com o mail e id do utilizador)
// Assinamos esse objeto com o refresh token e guardamos o refresh token na base de dados
// Assinamos esse objeto com o access token e mandamos para o front-end para depois guardamos no localStorage

module.exports = router;
