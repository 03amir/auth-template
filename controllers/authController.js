const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const UserVarificationModel = require("../models/userVarification");
const sendEmail = require("../utils/sendEmail");
const generateString = require("../utils/generateOtp");
const crypto = require("crypto");


// ROUTE FOR SIGNUP USERS

exports.signUp = async (req, res, next) => {

  const { email, password, firstName, lastName } = req.body;

  try {

    const savedUser = await User.find({ email: email });

    if (savedUser.length > 0) {
      return res.status(400).send("already have an account")
    }

    const newUser = new User({
      firstName, lastName, email, password, verified: false
    })

    const signedUpUser =  await newUser.save();



   let otp = generateString(); // generating the otp
  

    const message = `
    <h1>You have to verify your email</h1>
    <p>your otp is ${otp} , verify whithin 1minute </p>
    <p>your id is ${signedUpUser._id} </p>
  `;


    const newVerification = new UserVarificationModel({

      userId: signedUpUser._id,
      otp: otp,
      otpExpiery: Date.now() + 10 * (60 * 1000) // setting the expiry time

    })

    //saving user to the verify model
    const newuser = await newVerification.save();
  
    try {

      sendEmail({

        to:email,
        subject: "Password verify your email",
        text: message,

      });


      res.status(200).send("Please check your email");


    } catch (err) {

      console.log(err);

      res.status(500).send("Email could not be sent")

    }

    // res.status(200).json({ signedUpUser })

  } catch (error) {

    res.send(error)

  }

}

// ROUTE FOR VERIFY THE OTP

exports.vrifyUser = async (req, res) => {

  const { otp, id } = req.body;

  try {

    const user = await UserVarificationModel.find({ userId: id })

    console.log(user.length)


    if (user.length <= 0) {
      res.status(400).send("User is verified or does not have an account")
    }

    const expireAt = user[0].otpExpiery;

    console.log(user[0].otp)

    if (expireAt < Date.now()) {
      try {

        const deletedUser = await UserVarificationModel.deleteOne({ userId: id });

        const deleteActualUser= await User.deleteOne({ _id: id });

        res.status(400).send("verification time out, sign up again")

      }
      catch (error) {
        console.log(error)
      }
    }

    const databaseOtp = user[0].otp;

    if (databaseOtp != otp) {
      res.status(400).send("wrong otp, please check inbox")
    }

    try {

      const updateduser = await User.updateOne({ _id: id }, { verified: true });
      const deletedUser = await UserVarificationModel.deleteOne({ userId: id });


      res.status(200).send("user verified . please login")

    } catch (error) {

      console.log(error)

    }

  } catch (error) {

   console.log(error);


  }
}

// ROUTE FOR LOGIN USERS

exports.login = async (req, res, next) => {

  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).send("Provide all the credentials")
  }

  try {

    // Check that user exists by email
    const user = await User.findOne({ email }).select("+password");


    if (!user) {
      return res.status(401).send("Invalid credentials")
    }

    if(!user.verified){
      res.status(400).send("verify first to login")
    }

    console.log(user)

    // Check that password match
    const isMatch = await user.verifyPassword(password);

    console.log(isMatch)

    if (!isMatch) {
      return res.status(401).send("Invalid credentials")
    }

    res.status(200).json(user)

  } catch (err) {

    
    console.log(err)

  }
}

//  ROUTER FOR FORGET PASSWORD
exports.forgetPassword = async (req, res) => {

  const { email } = req.body;

  if(!email){
    res.status(400).send("provide the email")
  }

  try {

    const user = await User.find({ email });

    if (user.length <= 0) {
      res.status(400).send("no existing account")
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
  
    // Hash token (private key) and save to database
    resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
  
    // Set token expire date
   resetPasswordExpire = Date.now() + 10 * (60 * 1000); // Ten Minutes

    const updatedUser = await User.updateOne({email:email},{resetPasswordToken,resetPasswordExpire});


    const resetUrl = `http://where-the-frontend-is/passwordreset/${resetPasswordToken}`;

    // HTML Message
    const message = `
     <h1>You have requested a password reset</h1>
     <p>Please go to the link below and change your password within 10minutes:</p>
     <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
   `;


    try {

       sendEmail({
        to:user[0].email,
        subject: "Password Reset Request",
        text: message,
      });

      res.status(200).send("Please check your email");


    } catch (err) {

      console.log(err);

      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      res.status(500).send("Email could not be sent")

    }

  } catch (error) {
    console.log(error)
  }

}

// ROUTER TO RESET PASSWORD

exports.resetPassword = async (req, res) => {

  const resetTokenn = req.params.resetToken;

  try {
    

    const user = await User.find({
      resetPasswordToken:resetTokenn
      
    })


    if (user.length<=0) {
    return  res.status(400).send("invalid token")
    }

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(req.body.password, salt);

  const updatedUser = await User.updateOne({resetPasswordToken:resetTokenn},{resetPasswordToken:"",resetPasswordExpire:"",password:password});

  res.status(200).send("password updated successfully")

  } catch (error) {

    console.log(error)

  }

}





