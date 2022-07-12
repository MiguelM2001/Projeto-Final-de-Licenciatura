const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
var db = require("../../database");

// Obter informações do user
router.post("/", async (req, res) => {
  const id = req.user.id;
  const nome = req.body.username;
  const idade = req.body.idade;
  const bio = req.body.bio;
  let todos_users;
  let allowed = 1;

  let all = "SELECT nome FROM users WHERE NOT id=?";

  await new Promise((resolve, reject) =>
    db.query(all, [id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
        todos_users = result;
      }
    })
  );

  for (i = 0; i < todos_users.length; i++) {
    if (todos_users[i].nome === nome) {
      allowed = -1;
      res.send("-1");
    }
  }

  if (allowed === 1) {
    let user_info = "UPDATE users set nome=?, idade=?, bio=? WHERE id=?";

    await new Promise((resolve, reject) =>
      db.query(user_info, [nome, idade, bio, id], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
          res.send("1");
        }
      })
    );
  }
});

module.exports = router;
