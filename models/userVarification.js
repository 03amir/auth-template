const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;


const UserVerificationSchema = new mongoose.Schema({
   userId: {
      type: ObjectId,
      ref: "User",
   }
   ,
   otp: {
      type: String
   }
   ,
   otpExpiery: {
      type: Date
   }
})


const UserVerificationModel = mongoose.model("UserVerificationModel", UserVerificationSchema);
module.exports = UserVerificationModel 