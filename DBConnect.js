const mongoose = require('mongoose');
const DBConnect = async () =>{
     try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database is Connected!");
     } catch (error) {
        console.log("Database Connection Failed", error);
     }
}

module.exports = DBConnect;