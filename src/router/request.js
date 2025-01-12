const express = require("express");
const ConnectionRequest = require("../models/connectionRequest");
const { userAuth } = require("../middleware/Auth");
const requestRouter = express.Router();
const User = require("../models/user")

requestRouter.post("/request/sent/:status/:toUserId", userAuth ,async (req, res)=>{
    try{
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        //validate Staus
        const allowedStatus = ["interested", "ignored"]
        if(!allowedStatus.includes(status)){
            throw new Error("status is not allowed")
        }

        //validate toUserId
        const isToUser = await User.findById(toUserId);
        if(!isToUser) throw new Error("User is not found")
        
        //validate the connection made to himself 
        // In pre. mathod
        
        
        // Check if there is existing Connection between two users or not;

        const isExistingConnectionRequest = await ConnectionRequest.findOne({
            $or:[
                {fromUserId, toUserId},
                {fromUserId: toUserId, toUserId: fromUserId}
            ]
        });

        if(isExistingConnectionRequest) throw new Error("connection is already exists")
        
        const connectionRequestData = new ConnectionRequest({fromUserId, toUserId, status});
        await connectionRequestData.save()
        res.json({message:`${req.user.firstName} is ${status} in ${isToUser.firstName}`, data: connectionRequestData})
    }catch(err){
        res.status(400).json({message: `${err.message}`})
    }
})

requestRouter.post("/request/received/:status/:requestId", userAuth, async (req, res)=>{
    try{
        const loggedInUser = req.user;
        const {status, requestId} = req.params

        //Validate Status
        const allowedStatus = ["accepted", "rejected"];
        const isStatusAllowed = allowedStatus.includes(status)
        if(!isStatusAllowed){
            throw new Error("Status is Invalid")
        }
        
        const connectionRequest = await ConnectionRequest.findOne({_id: requestId, status: "interested", toUserId: loggedInUser._id});
        
        //validate request Id
        if(!connectionRequest){
            throw new Error("Connection request is Not Found")
        }

        connectionRequest.status = status;
        connectionRequest.save();

        res.json({
            message: `${loggedInUser.firstName} is ${status}`,
            data:connectionRequest
        })

    }catch(err){
        res.status(400).json({message: `${err.message}`})
    }
})


module.exports = requestRouter