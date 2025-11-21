require('dotenv').config();

const PORT = process.env.PORT

const express = require('express');

const app = express();

const cors = require('cors');

const logRequest = require('./logger.js');

const validateTodo = require('./validator.js');

const errorHandler = require('./errorHandler.js')

app.use(express.json());

app.use(cors());

/*const corsOptions = {
  origin: 'http://example.com',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
  */

app.use(logRequest);

app.listen(PORT, () =>{
    console.log(`App is running on ${PORT}`);
});

let todos = [ 
    { id: 1, task: 'Learn Node.js', completed: false},
    { id: 2, task: 'Build CRUD API', completed: false},
    { id: 3, task: 'Make video', completed: true}
];

app.get('/todos', (req,res) => {
    res.status(200).json(todos);
});

app.get('/todos/:id', (req, res, next) =>{
try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            throw new Error ('Invalid ID');
        }
    const todo = todos.find((t) => t.id ===id);

    if (!todo) {
        return res.status(404).json({message: 'Todo not found'});
    }

    res.status(200).json(todo);
} catch (error) {
    next (error);
}
});

app.get('/todo/active', (req, res) => {
    const activeTodos = todos.filter((t) => t.completed === false);
    res.status(200).json(activeTodos);
});

app.post('/todos', validateTodo, (req,res, next) => {
    try {
            const {task} = req.body

    if (!task || task.length <= 2) {
        return res.status(400).json({message: 'Please provide the task'});
    }

    const newTodo = {id: todos.length + 1, ...req.body};
    todos.push(newTodo);
    res.status(201).json(newTodo);
    } catch (error) {
        next(error);
    } 
});

app.patch('/todos/:id', (req,res, next) =>{
    try {
            const id = parseInt(req.params.id)
    const todo = todos.find(t => t.id ===parseInt(req.params.id));
    if (!todo) return res.status(404).json({message: 'Todo not found'});
    Object.assign(todo, req.body);
    res.status(200).json(todo);
    } catch (error) {
        next(error); 
    }

});

app.delete('/todos/:id', (req,res, next) => {
    try {
            const id = parseInt(req.params.id);
    const initialLength = todos.length;
     todos = todos.filter((t) => t.id !== id); 
     if (todos.length === initialLength)
        return res.status(404).json({error: 'Not found'});
    res.status(204).send();
    } catch (error) {
        next (error);
    }
});

app.get('/todos/compleed', (req, res, next) =>{
    try {
       const completed = todos.filter((t) => t.completed);
       res.json(completed); 
    } catch (error) {
        next (error);
    }
})

app.use(errorHandler);