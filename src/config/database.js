const { default: mongoose } = require("mongoose")

const connectDB = async () =>{
    await mongoose.connect("mongodb+srv://zamam:Zamam123@namastenode.vmwld.mongodb.net/devTinders")
}

module.exports = connectDB