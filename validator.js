const Joi = require('joi')

const validateTodo = (req, res, next) =>{
    const schema = Joi.object({
        task: Joi.string().min(3).max(100).required(),
        completed : Joi.boolean().default(false)
    });

    const {error} = schema.validate(req.body);
    if (error){
        return res.status(400).json({error : error.details[0].message });
    }

    next();
};

module.exports = validateTodo;