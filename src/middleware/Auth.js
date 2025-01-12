const express = require("express")
const app = express()
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const cookieParse = require("cookie-parser")
app.use(cookieParse())

const userAuth = async (req, res, next) =>{
    try{
        const {token} = req.cookies
        if(!token) throw new Error("Cookie is invalid");
        const DecodedData = jwt.verify(token, "Zamam@123");
        const {email} = DecodedData 
        const user = await User.findOne({ emailId: email })
        if(!user) throw new Error ("User Not Found")
        req.user = user;
        next()
    }catch(err){
        console.log(err.message);
        res.status(401).send("ERROR: " + err.message);
    }
}

module.exports = {userAuth}