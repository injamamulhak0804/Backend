const express = require("express")
const app = express()
const User = require("./models/user")
const connectDB = require("./config/database")
const Readcookie = require("cookie-parser")
const authRouter = require("./router/auth.js")
const profileRouter = require("./router/profile.js")
const requestRouter = require("./router/request.js")
const userRouter = require("./router/user.js")
const cors = require("cors")

app.use(Readcookie())
app.use(express.json())

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.use("/", authRouter)
app.use("/", profileRouter)
app.use("/", requestRouter)
app.use("/", userRouter)


app.get("/feed", async (req, res) => {
    try {
        const feedAll = await User.find({})
        res.send(feedAll)
    } catch (err) {
        res.status(400).send("ERROR: ", err.message);
    }
})

app.get("/user", async (req, res) => {
    const userId = req.body._id
    try {
        const users = await User.findById(userId)
        if (!users) {
            res.status(400).send("ERROR: User is not Found")
        } else {
            res.send(users)
        }
    } catch (error) {
        res.status(400).send("ERROR: ", error.message)
    }
})

app.delete("/user", async (req, res) => {
    const userEmail = req.body.emailId;
    try {
        await User.findOneAndDelete({ emailId: userEmail })
        res.send("user is Deleted")
    } catch (error) {
        res.status(400).send("ERROR: " + error.message)
    }
})

app.patch("/user/:_id", async (req, res) => {
    const userData = req.body;
    const userId = req.params._id;
    const ALLOWED_UPDATES = ["skills", "firstName", "lastName", "age", "photoUrl", "password", "about", "gender"]
    try {
        const isAllowedUpdates = Object.keys(userData).every((k) => ALLOWED_UPDATES.includes(k))
        if (!isAllowedUpdates) throw new Error("Update is not allowed")
        await User.findByIdAndUpdate(userId, userData, { runValidators: true })
        res.send("user updated Successfully")
    } catch (error) {
        res.status(401).send("ERROR: " + error.message)
    }
})


connectDB()
    .then(() => {
        console.log("Connect to DB");
        app.listen(3000, () => {
            console.log("Server is listening on port 3000");
        })
    })
    .catch((err) => {
        console.log("ERROR: ", err);
    })