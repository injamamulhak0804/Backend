const express = require("express");
const authRouter = express.Router();
const { validateSignUpdata } = require("../utils/validate");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const validator = require("validator");


authRouter.post("/signup", async (req, res) => {

    try {
        validateSignUpdata(req) // validate the data
        const { firstName, lastName, password, emailId, age, gender, skills, about, photoUrl } = req.body
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

        const savedUser = await user.save()

        const token = await savedUser.getJWT()
        res.cookie("token", token, { expires: new Date(Date.now() + 8 * 3600000) });
        res.json({ message: "user signup succcessfully", data: savedUser })
    } catch (err) {
        res.status(401).send("ERROR: " + err.message);
    }
})

authRouter.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body

        if (!validator.isEmail(emailId)) throw new Error("Enter a valid Email")
        const user = await User.findOne({ emailId: emailId })
        if (!user) throw new Error("Invalid Credentials")
        if (!validator.isStrongPassword(password)) throw new Error("Enter a Strong Password")
        const isPasswordValid = await user.passwordValid(password)
        if (!isPasswordValid) throw new Error("Invalid Credentials")
        else {
            const token = await user.getJWT()
            res.cookie("token", token, { expires: new Date(Date.now() + 8 * 3600000) });
            res.send(user)
        }

    } catch (err) {
        res.status(401).send("ERROR: " + err.message);
    }
})

authRouter.post("/logout", (req, res) => {
    res.cookie("token", null, { expires: new Date() })
        .send("user Logout Successfully")
})

module.exports = authRouter