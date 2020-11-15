var express = require("express");
var authRouter = require("./auth");
var bookRouter = require("./book");
var dicasRouter = require("./dicas");
const { tabelaPrecosList } = require("../globals/Globals");

var app = express();

app.use("/auth/", authRouter);
app.use("/book/", bookRouter);
app.use("/dicas/", dicasRouter);
app.use("/tabela_precos", (req, res) => res.send({ tabela: tabelaPrecosList }));

module.exports = app;