const mongoose = require("mongoose")
const { Schema } = mongoose
const validator = require("validator")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const userSchema = new Schema({
    firstName: {
        type: String,
        trim: true,
        minLength: 3,
        maxLength: 24
    },
    lastName: {
        type: String,
        trim: true,
        maxLength: 24
    },
    emailId: {
        type: String,
        trim: true,
        lowercase: true,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) throw new Error("Email is not valid")
        }
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if (!validator.isStrongPassword(value)) throw new Error("Enter a Strong password")
        }
    },
    age: {
        type: Number,
        min: 18
    },
    gender: {
        type: String,
        lowercase: true,
        validate(value) {
            if (!["male", "female", "others"].includes(value)) {
                throw new Error("Gender is not valid")
            }
        }
    },
    about: {
        type: String,
        default: "This is a Default User Description"
    },
    skills: {
        type: [String],
    },
    photoUrl: {
        type: String,
        default: "https://static-00.iconduck.com/assets.00/profile-circle-icon-512x512-zxne30hp.png",
        validate(value) {
            if (!validator.isURL(value)) throw new Error("Enter a valid URL")
        }
    }
}, { timestamps: true })

userSchema.methods.getJWT = async function () {
    const JWT_Token = jwt.sign({ email: this.emailId }, "Zamam@123", { expiresIn: "7d" })
    return JWT_Token
}

userSchema.methods.passwordValid = async function (userInputPassword) {
    const user = this
    const passwordHash = user.password
    const isPasswordValid = bcrypt.compare(userInputPassword, passwordHash)
    return isPasswordValid
}

module.exports = mongoose.model("User", userSchema)
