const express = require("express");
const router = express.Router();
var db = require("../../database");

// Ver o estado de amizade entre dois utilizadores
router.post("/", async (req, res) => {
  const id_pessoa1 = req.user.id;
  const id_pessoa2 = req.body.id;

  // Se for -2       significa que a pessoa que está ver o perfil é o dono dele
  // Se for  1       significa que são amigos
  // Se for -1       significa que não são amigos nem nenhum pedido foi enviado
  // Se for  0       significa que o perfil de quem enviou o pedido está a ser visto
  // Se for  0.5     significa que o perfil para quem se enviou o pedido está ser visto pela pessoa que enviou
  let resposta_final;

  let amigos =
    "SELECT * FROM amigos WHERE ((id_pessoa1 = ? AND id_pessoa2= ?) OR (id_pessoa1=? AND id_pessoa2=?))";

  await new Promise((resolve, reject) =>
    db.query(
      amigos,
      [id_pessoa1, id_pessoa2, id_pessoa2, id_pessoa1],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
          if (result.length == 0) {
            resposta_final = "-1";
          } else {
            resposta_final = "1";
          }
        }
      }
    )
  );

  let convites =
    "SELECT * FROM pedidos_amizade WHERE (id_pessoa_envia = ? AND id_pessoa_recebe= ?) OR (id_pessoa_envia=? AND id_pessoa_recebe=?)";

  await new Promise((resolve, reject) =>
    db.query(
      convites,
      [id_pessoa1, id_pessoa2, id_pessoa2, id_pessoa1],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
          if (result.length == 0 && resposta_final != 1) {
            resposta_final = "-1";
          } else {
            if (resposta_final != 1) {
              if (
                result[0].id_pessoa_envia == id_pessoa1 &&
                result[0].id_pessoa_recebe == id_pessoa2
              ) {
                resposta_final = "0.5";
              }

              if (
                result[0].id_pessoa_envia == id_pessoa2 &&
                result[0].id_pessoa_recebe == id_pessoa1
              ) {
                resposta_final = "0";
              }
            }
          }
        }
      }
    )
  );

  if (id_pessoa1 === id_pessoa2) {
    resposta_final = "-2";
  }

  res.send(resposta_final);
});

module.exports = router;
