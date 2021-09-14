const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { findOne } = require('../models/user');
const jwt = require('jsonwebtoken')
const router = express.Router()
const authConfig = require("../config/auth.json")

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 84600
    })
}

router.post("/register", async (req, res) => {
        
    const { email } = req.body;
    
    try{

        if(await User.findOne({email})){
            return res.status(400).send({ error: "User already exists"})
        }

         const user = await  User.create(req.body)

         user.password = undefined;

         return res.json({
             user,
             token: generateToken({ id: user.id })})
     }catch(err){
         return res.status(400).json({
             error: "Registration failed"
         })
     }
})

router.post("/autenticate", async(req, res) => {
    const { email , password } = req. body;

    const user = await User.findOne({ email }).select('+password');
    
    if(!user){
      return res.status(400).json({
          error: "User not found"
      })
    }

    if(!await bcrypt.compare(password, user.password)){
        return res.status(400).json({
            error: "Invalid password"
        })
    }
    user.password = undefined;

    const token = jwt.sign({ id: user.id}, authConfig.secret, {
        expiresIn: 86400
    })

    res.send({
        user,
        token: generateToken({ id: user.id })
    })

})

module.exports = app => app.use('/auth', router)