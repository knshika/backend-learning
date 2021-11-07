const router = require('express').Router();
const User = require('../model/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { registerValidation, loginValidation } = require('../validation');


router.post("/register",async (req,res)=>{
    // console.log("Register");
    // res.send("Registered");

    //validating the data of user
    const {error} = registerValidation(req.body);
    if(error){
        res.status(400).send(error.details[0].message)
    }
    //checking if email already exists
    const emailExists = await User.findOne({email:req.body.email});
    if (emailExists) return res.status(400).send('email already exists');
    
    //hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password,salt)

    //else send this
    const user = new User({
        name:req.body.name,
        email:req.body.email,
        password:hashedPassword
    });
    try{
        const savedUser = await user.save();
        res.send({user:user._id});
    }catch(err){
        res.status(400).send(err)
    }
})

//user login 
router.post('/login',async  (req,res)=>{
    //validating the data of user
    const {error} = loginValidation(req.body);
    if(error){
        res.status(400).send(error.details[0].message)
    }

    //checking if email  exists
    const user = await User.findOne({email:req.body.email});
    if (!user) return res.status(400).send('email does not exists');
    
    //checking if password is correct using bcrypt
    const validPass = await bcrypt.compare(req.body.password,user.password);
    if(!validPass) return res.status(400).send('Invalid password');

    const token = jwt.sign({_id:user._id},process.env.TOKEN_SECRET);
    res.header('auth-token',token).send(token);
})

module.exports = router;