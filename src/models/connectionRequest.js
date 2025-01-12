const mongoose = require("mongoose");

const connectionRequestModel = new mongoose.Schema({
    fromUserId: {
        ref:"User",
        type: mongoose.Schema.Types.ObjectId,
        required:true
    },
    toUserId: {
        ref:"User",
        type: mongoose.Schema.Types.ObjectId,
        required:true
    },
    status:{
        type:String,
        required:true,
        enum:{
            values:["interested", "ignored", "accepted", "rejected"],
            message:`{VALUE} is Invalid`
        }
    }
}, {timestamps:true})

connectionRequestModel.index({fromUserId: 1, toUserId: 1})

connectionRequestModel.pre("save", function (next){
    const connectionRequest = this
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        throw new Error("User Connection is Not valid") 
    }
    next()
})

module.exports = mongoose.model("ConnectionRequest", connectionRequestModel)