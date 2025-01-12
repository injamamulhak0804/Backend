const express = require("express");
const authRouter = express.Router();
const { validateSignUpdata } = require("../utils/validate");
const bcrypt = require("bcrypt") ;
const User = require("../models/user");
const validator = require("validator");

authRouter.post("/signup", async (req, res)=>{
    
    try{
        validateSignUpdata(req) // validate the data
        const {firstName, lastName, password, emailId, age, gender, skills, about, photoUrl} = req.body
        const passwordHash = await bcrypt.hash(password, 10)
        const user = new User({
            firstName,
            lastName,
            password: passwordHash,
            emailId,
            age, 
            gender,
            skills,
            about,
            photoUrl
        })
        await user.save()
        res.send("User Added Successfully")
    }catch(err){
        res.status(401).send("ERROR: " + err.message);
    }
}) 

authRouter.post("/login", async (req, res)=>{
    try{
        const {emailId, password} = req.body
        if(!validator.isEmail(emailId)) throw new Error("Enter a valid Email")
        const user = await User.findOne({emailId: emailId}) 
        if(!user) throw new Error("Invalid Credentials")
        const isPasswordValid = await user.passwordValid(password)
        if(!isPasswordValid) throw new Error("Invalid Credentials") 
        else {
            const token = await user.getJWT()
            res.cookie("token", token,  { expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)});
            res.send("login Successfully")
        }

    }catch(err){
        res.status(401).send("ERROR: " + err.message);
    }
})

authRouter.post("/logout", (req, res)=>{
    res.cookie("token", null, {expires: new Date()})
    .send("user Logout Successfully")
})

module.exports = authRouter