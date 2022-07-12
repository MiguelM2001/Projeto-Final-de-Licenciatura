const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
var db = require("../../database");

// Obter informações do user
router.post("/", async (req, res) => {
  try {
    const nome = req.body.username;
    let user_info =
      "SELECT id,nome,idade,email,bio,profile_pic FROM users WHERE nome=?;";
    await new Promise((resolve, reject) =>
      db.query(user_info, nome, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);

          // Enviar informações
          if (result[0] === undefined || result[0] === null) {
            res.send("-1");
          } else {
            let count = obter_numero_amigos(result[0].id);

            let numero_amigos;

            count.then(function (resultado) {
              numero_amigos = resultado;
            });

            let lista_amigos_final;

            amigos = obter_amigos(result[0].id);
            amigos.then((lista_amigos) => {
              lista_amigos_final = lista_amigos;

              let objeto = {
                utilizador: result[0],
                count: numero_amigos,
                lista_amigos: lista_amigos_final,
              };

              res.json(objeto);
            });
          }
        }
      })
    );
  } catch {}
});

async function obter_numero_amigos(id) {
  let resultado_final;
  let contar_amigos =
    "SELECT COUNT(id) as count FROM amigos WHERE (id_pessoa1 = ? OR id_pessoa2 = ?);";
  await new Promise((resolve, reject) =>
    db.query(contar_amigos, [id, id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result[0].count);
        if (result[0].count === "undefined") {
          resultado_final = 0;
        } else {
          resultado_final = result[0].count;
        }
      }
    })
  );
  return resultado_final;
}

async function obter_amigos(id) {
  let lista_utilizadores;
  // Selecionar o nome e profil_pic de todos os utilizadores que são amigos do utilizador indicado
  let obter_amigos =
    "SELECT users.nome, users.profile_pic FROM amigos INNER JOIN users ON (amigos.id_pessoa1=users.id OR amigos.id_pessoa2=users.id) WHERE (id_pessoa1=? OR id_pessoa2=?) AND (users.id <> ?)";
  await new Promise((resolve, reject) =>
    db.query(obter_amigos, [id, id, id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result[0]);
        lista_utilizadores = result;
      }
    })
  );
  return lista_utilizadores;
}

module.exports = router;
