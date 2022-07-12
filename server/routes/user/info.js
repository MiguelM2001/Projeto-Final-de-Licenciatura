const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
var db = require("../../database");

// Obter informações do user
router.post("/", async (req, res) => {
  try {
    const id = req.user.id;
    let user_info =
      "SELECT nome,idade,email,bio,profile_pic FROM users WHERE id=?";
    await new Promise((resolve, reject) =>
      db.query(user_info, id, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);

          // Enviar informações
          if (result[0] === undefined || result[0] === null) {
            res.send("-1");
          } else {
            res.json(result[0]);
          }
        }
      })
    );
  } catch {}
});

router.post("/all", async (req, res) => {
  try {
    const id = req.user.id;
    let user_info = "SELECT id,nome,profile_pic FROM users";
    await new Promise((resolve, reject) =>
      db.query(user_info, id, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);

          // Enviar informações
          if (result[0] === undefined || result[0] === null) {
            res.send("-1");
          } else {
            res.json(result);
          }
        }
      })
    );
  } catch {}
});

router.post("/notifications", async (req, res) => {
  let objeto_final;
  let contagem;

  try {
    const id = req.user.id;

    let user_info =
      "SELECT COUNT(id) as count FROM pedidos_amizade WHERE id_pessoa_recebe = ?";
    await new Promise((resolve, reject) =>
      db.query(user_info, id, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
          contagem = result[0].count;
          if (contagem === 0) {
            res.json({ count: 0 });
          }
        }
      })
    );
    if (contagem !== 0) {
      let user_notis =
        "SELECT users.nome, users.profile_pic, users.id FROM pedidos_amizade INNER JOIN users ON (pedidos_amizade.id_pessoa_envia=users.id) WHERE id_pessoa_recebe=?";
      await new Promise((resolve, reject) =>
        db.query(user_notis, id, (err, result) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            resolve(result);

            objeto_final = {
              count: contagem,
              pedidos: result,
            };
            res.json(objeto_final);
          }
        })
      );
    }
  } catch {}
});

module.exports = router;
