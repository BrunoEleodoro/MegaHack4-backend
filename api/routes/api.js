var express = require("express");
var authRouter = require("./auth");
var bookRouter = require("./book");
var dicasRouter = require("./dicas");

var app = express();

app.use("/auth/", authRouter);
app.use("/book/", bookRouter);
app.use("/dicas/", dicasRouter);

module.exports = app;