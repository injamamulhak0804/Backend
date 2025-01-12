const validator = require("validator")

const validateSignUpdata = (req) =>{
    const {firstName, emailId, password} = req.body 
    if(!firstName) throw new Error("Enter your first name")
    else if(!(firstName.length > 2 || firstName.length < 25)) throw new Error("Enter a valid name")
    if(!validator.isEmail(emailId)) throw new Error("Enter a valid Email");
    if(!validator.isStrongPassword(password)) throw new Error("Enter a Strong Password")
}

const validateEditProfile = (req) =>{
    const allowedUpdates  = ["firstName", "lastName", "photoUrl", "gender", "age", "about", "skills"];
    const isEditAllowed = Object.keys(req.body).every(field => allowedUpdates.includes(field))
    return isEditAllowed
}

const validateForgotPassword = (req) =>{
    const allowedUpdates = ["password"];
    const isUpdatePasswordAllowed = Object.keys(req.body).every((field)=> allowedUpdates.includes(field))
    return isUpdatePasswordAllowed
}

module.exports = {
    validateSignUpdata,
    validateEditProfile,
    validateForgotPassword
}