const express = require("express")
const { userAuth } = require("../middleware/Auth")
const { validateEditProfile, validateForgotPassword } = require("../utils/validate")
const profileRouter = express.Router()
const User = require("../models/user")
const validator = require("validator")
const bcrypt = require("bcrypt")

profileRouter.get("/profile/view", userAuth, async (req, res)=>{
    try{
        const user = req.user
        res.json({message: `${user.firstName}, is viewed profile successfully,`, data: user})
    }catch(err){
        res.status(401).send("ERROR: " + err.message);
    }
})

profileRouter.patch("/profile/edit", userAuth, async (req, res)=>{
    try {
        if(!validateEditProfile(req)){
            throw new Error("Invalid Edit request")
        }
        const user = req.body;
        // Object.keys(req.body).forEach((key)=> user[key] = req.body[key])
        // user.save()
        const {_id} = req.user;
        const updatedProfile = await User.findByIdAndUpdate(_id, user, {runValidators: true});
        res.json({message:`${user.firstName}, your profile was updated successfully`, data: updatedProfile})

    } catch (err) {
        res.status(400).send("ERROR: " + err.message)
    }
})

profileRouter.patch("/profile/forgotpassword", userAuth, async (req, res)=>{
    try{
        if(!validateForgotPassword(req)){
            throw new Error("Edit is not allowed")
        }
        const user = req.user
        const userPassword = req.body 
        const {password} = userPassword
        if(!validator.isStrongPassword(password)){
            throw new Error("Enter a Strong Password");
        }
        const hashPassword = await bcrypt.hash(password, 10)
        const afterUpdatedProfile =  await User.findByIdAndUpdate(user._id, {password: hashPassword}, {returnDocument: 'after'})
        res.json({message: `${user.firstName} profile updated successfully`, data: afterUpdatedProfile})
    }catch(err){
        res.status(400).send(err.message);
    }
})

module.exports = profileRouter