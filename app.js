require('dotenv').config();

const PORT = process.env.PORT
const express = require('express');
const app = express();
const cors = require('cors');
const logRequest = require('./middleware/logger.js');
const validateTodo = require('./middleware/validator.js');
const validatePatch = require('./middleware/validatePatch.js');
const errorHandler = require('./middleware/errorHandler.js');
const connectDB = require('./database/db.js');
const Todo = require('./models/todoModel.js')

app.use(express.json());

app.use(cors('*'));

/*const corsOptions = {
  origin: 'http://example.com',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
  */

app.use(logRequest);

connectDB();

app.listen(PORT, () =>{
    console.log(`App is running on ${PORT}`);
});

app.get('/todos', async (req, res, next) => {
    const query = req.query.completed;

    const todos = await Todo.find({completed: query});
    
    res.status(200).json(todos);
});

app.get('/todos/completed', async (req, res, next) =>{
    try {
       const completed = await Todo.find({completed : true});
       res.json(completed); 
    } catch (error) {
        next (error);
    }
})

app.get('/todos/:id', async (req, res, next) =>{
try {
        
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
        return res.status(404).json({message: 'Todo not found'});
    }

    res.status(200).json(todo);
} catch (error) {
    next (error);
}
});

app.post('/todos', validateTodo, async (req, res, next) => {
    const { task, completed } = req.body;
    const newTodo = new Todo({
        task,
        completed
    });

    await newTodo.save();
    
    try {
        res.status(201).json(newTodo);
    } catch (error) {
        next(error);
    } 
});

app.patch('/todos/:id', validatePatch, async (req,res, next) =>{
    try {
         const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
            new: true
         });
         
        
    if (!todo) {
        return res.status(404).json({message: 'Todo not found'});
    }

    res.status(200).json(todo);
    } catch (error) {
        next(error); 
    }

});

app.delete('/todos/:id', async(req,res, next) => {
    try {
           
            const todo = await Todo.findByIdAndDelete(req.params.id);

            if (!todo) {
        return res.status(404).json({message: 'Todo not found'});
    }
    res.status(200).json({message: `Todo ${req.params.id} deleted`});

    } catch (error) {
        next (error);
    }
});

app.use(errorHandler);