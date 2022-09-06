const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    }
    ,
    email: {
        type: String,
        required: true,
    }
    , password: {
        type: String,
        required: true,
        minLength: 8,
        select: false
    },

    verified:{
        type:Boolean
    },
    resetPasswordToken: {
        type: String
    }
    ,  resetPasswordExpire: {
        type: Date
    }
})

// hashing the password before saving it to the database

userSchema.pre("save", async function (next) {

    if (!this.isModified("password")) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();

});

// verifing the password with user given password

userSchema.methods.verifyPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

const User = mongoose.model("User", userSchema);
module.exports = User;