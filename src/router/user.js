const express = require("express")
const { userAuth } = require("../middleware/Auth");
const ConnectionRequest = require("../models/connectionRequest");
const userRouter = express.Router()
const User = require("../models/user")

const USER_SAFE_DATA = "firstName lastName age gender skills about photoUrl"

// Connection request received => some one send a connection request to you

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const connectionRequest = await ConnectionRequest.find({ toUserId: loggedInUser._id, status: "interested" }).populate("fromUserId", USER_SAFE_DATA)

        res.send(connectionRequest)
    } catch (err) {
        res.status(400).json({ message: `${err.message}` })
    }
})

// Your are sending a connection request and know that some one accept your connection request

userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const connectionRequest = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id, status: "accepted" },
                { toUserId: loggedInUser._id, status: "accepted" }
            ]
        })
            .populate("fromUserId", USER_SAFE_DATA)
            .populate("toUserId", USER_SAFE_DATA)

        const data = connectionRequest.map((row) => {
            if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
                return row.toUserId
            }
            return row.fromUserId
        })

        res.json({ message: `${loggedInUser.firstName} connections`, data })
    } catch (err) {
        res.status(400).json({ message: `${err.message}` })
    }
})


userRouter.get("/feed", userAuth, async (req, res) => {
    try {

        // User cannot see his own card;
        // user cannot see whether he (send or recive) connnection request
        // status should not be intrested, ignored $ accepted and rejected.
        let page = req.query.skip || 1;
        let limit = req.query.limit || 10;
        let skip = (page - 1) * limit;
        limit = limit > 20 ? 20 : limit;



        const loggedInUser = req.user
        const connectionRequest = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id },
                { toUserId: loggedInUser._id }
            ]
        }).select("fromUserId toUserId")

        const hideUserFromFeed = new Set()

        connectionRequest.forEach((req) => {
            hideUserFromFeed.add(req.fromUserId.toString())
            hideUserFromFeed.add(req.toUserId.toString())
        })


        const users = await User.find({
            $and: [
                { _id: { $nin: Array.from(hideUserFromFeed) } },
                { _id: { $ne: loggedInUser._id } }
            ]
        }).select(USER_SAFE_DATA).skip(skip).limit(limit)

        res.json({ data: users })
    } catch (err) {
        res.status(400).json({ message: `${err.message}` })
    }
})


module.exports = userRouter