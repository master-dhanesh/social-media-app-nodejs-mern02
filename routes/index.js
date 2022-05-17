var express = require("express");
var router = express.Router();
const Todo = require("../models/todoModel");

/* GET home page. */
router.get("/", function (req, res, next) {
    Todo.find()
        .then((todos) => res.render("index", { todos, todo: null }))
        .catch((err) => res.send(err));
});

/* POST todoadd page. */
router.post("/todoadd", function (req, res, next) {
    // const newtodo = { ...req.body, id: uuid() };
    // todos_db.push(newtodo);
    Todo.create(req.body)
        .then(() => res.redirect("/"))
        .catch((err) => res.send(err));
});

/* GET delete/:id page. */
router.get("/delete/:id", function (req, res, next) {
    Todo.findByIdAndDelete(req.params.id)
        .then(() => res.redirect("/"))
        .catch((err) => res.send(err));

    // todos_db.splice(req.params.index, 1);
});

/* GET desc/:id page. */
router.get("/desc/:id", function (req, res, next) {
    Todo.findById(req.params.id)
        .then((todo) => res.render("desc", { todo, todos: null }))
        .catch((err) => res.send(err));
    // const todo = { ...todos_db[req.params.index] };
});

/* POST desc/:id page. */
router.post("/desc/:id", function (req, res, next) {
    // const activetodo = { ...todos_db[req.params.index] };
    // const updatedtodo = { ...activetodo, ...req.body };
    // todos_db[req.params.index] = updatedtodo;
    const updatedTodo = req.body;
    Todo.findByIdAndUpdate(req.params.id, { $set: updatedTodo }, { new: true })
        .then(() => res.redirect("/"))
        .catch((err) => res.send(err));
});

module.exports = router;
