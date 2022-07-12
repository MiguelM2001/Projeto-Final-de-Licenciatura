const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
var db = require("../../database");

//Registar user
router.post("/", (req, res) => {
  const nome = req.body.nome;
  const email = req.body.email;
  const password = req.body.password;

  verficar_user(nome, email, password, res)
    .then(() => {})
    .catch(() => {});
});

//Validar user
async function verficar_user(nome, email, password, res) {
  let users_iguais = false;
  StoredValuesEmail = [];
  let limit;
  let users = "SELECT email FROM users";

  await new Promise((resolve, reject) =>
    db.query(users, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
        //Tamanho do array
        limit = result.length;
        //Obter Users
        for (let i = 0; i < limit; i++) {
          //Meter os valores da base de dados num array
          StoredValuesEmail.push(result[i].email);
        }
      }
    })
  );

  // Verificar se não mais do que user com o mesmo email
  for (let i = 0; i < limit; i++) {
    if (email === StoredValuesEmail[i]) {
      users_iguais = true;
    }
  }

  if (!users_iguais) {
    inserir(nome, email, password);
    console.log("User inserido com sucesso");
    res.send("1");
  } else {
    console.log("Ja existe um user com email igual");
    res.send("0");
  }
}

//Inserir user validado na base de dados
function inserir(nome, email, password) {
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.log(err);
    } else {
      const sqlInsert =
        "INSERT INTO users (nome, password,email,profile_pic) VALUES (?,?,?,'/profile_pictures/default_image.png')";
      db.query(sqlInsert, [nome, hash, email]);
    }
  });
}

module.exports = router;
