const express = require("express");
const router = express.Router();
var db = require("../../database");

// Ver o estado de amizade entre dois utilizadores
router.post("/", async (req, res) => {
  const id_pessoa1 = req.user.id;
  const id_pessoa2 = req.body.id;

  // Se for  2       significa aceitar o pedido de amizade
  // Se for  1       significa mandar pedido de amizade
  // Se for  0       significa cancelar o pedido de amizade
  // Se for -1       significa remover utilizador como amigo

  if (req.body.opcao === 1) {
    await enviar_pedido_amigo(id_pessoa1, id_pessoa2);
    res.send("1");
  }

  if (req.body.opcao === 0) {
    await cancelar_pedido_amigo(id_pessoa1, id_pessoa2);
    res.send("1");
  }

  if (req.body.opcao === -1) {
    await remover_amigo(id_pessoa1, id_pessoa2);
    res.send("1");
  }

  if (req.body.opcao === 2) {
    await adicionar_amigo(id_pessoa1, id_pessoa2);
    res.send("1");
  }
});

async function enviar_pedido_amigo(id_pessoa1, id_pessoa2) {
  let enviar_pedido =
    "INSERT INTO pedidos_amizade (id_pessoa_envia,id_pessoa_recebe) VALUES(?,?)";

  await new Promise((resolve, reject) =>
    db.query(enviar_pedido, [id_pessoa1, id_pessoa2], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    })
  );
}

async function cancelar_pedido_amigo(id_pessoa1, id_pessoa2) {
  let cancelar_pedido =
    "DELETE FROM pedidos_amizade WHERE (id_pessoa_envia = ? and id_pessoa_recebe = ?) or (id_pessoa_envia = ? and id_pessoa_recebe = ?)";

  await new Promise((resolve, reject) =>
    db.query(
      cancelar_pedido,
      [id_pessoa1, id_pessoa2, id_pessoa2, id_pessoa1],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    )
  );
}

async function remover_amigo(id_pessoa1, id_pessoa2) {
  let remover_amigo =
    "DELETE FROM amigos WHERE (id_pessoa1 = ? and id_pessoa2 = ?) or (id_pessoa1 = ? and id_pessoa2 = ?)";

  await new Promise((resolve, reject) =>
    db.query(
      remover_amigo,
      [id_pessoa1, id_pessoa2, id_pessoa2, id_pessoa1],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    )
  );
}

async function adicionar_amigo(id_pessoa1, id_pessoa2) {
  let aceitar_pedido = "INSERT INTO amigos (id_pessoa1,id_pessoa2) VALUES(?,?)";

  await new Promise((resolve, reject) =>
    db.query(aceitar_pedido, [id_pessoa1, id_pessoa2], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
        cancelar_pedido_amigo(id_pessoa1, id_pessoa2);
      }
    })
  );
}

module.exports = router;
