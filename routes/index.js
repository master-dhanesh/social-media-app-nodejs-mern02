var express = require("express");
var router = express.Router();
const uuid = require("uuid").v4;

const todos_db = [
    {
        id: "8974jkd",
        todo: "Item 1",
        description:
            "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Odio, repellat!",
    },
    {
        id: "iurkj39",
        todo: "Item 2",
        description:
            "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Odio, repellat!",
    },
];

/* GET home page. */
router.get("/", function (req, res, next) {
    res.render("index", { todos: todos_db, index: "", todo: "" });
});

/* POST todoadd page. */
router.post("/todoadd", function (req, res, next) {
    const newtodo = { ...req.body, id: uuid() };
    todos_db.push(newtodo);
    res.redirect("/");
});

/* GET delete/:id page. */
router.get("/delete/:index", function (req, res, next) {
    todos_db.splice(req.params.index, 1);
    res.redirect("/");
});

/* GET desc/:id page. */
router.get("/desc/:index", function (req, res, next) {
    const todo = { ...todos_db[req.params.index] };
    res.render("desc", { todo, todos: "", index: req.params.index });
});

/* POST desc/:id page. */
router.post("/desc/:index", function (req, res, next) {
    const activetodo = { ...todos_db[req.params.index] };
    const updatedtodo = { ...activetodo, ...req.body };
    todos_db[req.params.index] = updatedtodo;
    res.redirect("/");
});

module.exports = router;
