const mongoose = require('mongoose');

// Define your roles as a frozen object to use as an enum
const Roles = Object.freeze({
    ADMIN: 'admin',
    FARMER: 'farmer',
    EXPERT: 'agricultural_expert',
    COMMUNITY: 'community_user'
});

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
        },
        role: {
            type: String,
            required: true,
            enum: Object.values(Roles), // Restricts values to ['admin', 'farmer', 'agricultural_expert', 'community_user']
            default: Roles.COMMUNITY,   // Sets default role if none is provided
        },
        isVerified: {
            type: Boolean,
            default: false,
            // true once an admin has verified this expert's credentials
            // (only meaningful for role === "agricultural_expert", but safe to have on everyone)
        },
        location: {
            type: String,
            default: '',
        },
        bio: {
            type: String,
            default: '',
        },
        resetPasswordToken: {
       type: String,
   },
   resetPasswordExpire: {
       type: Date,
   },
    },    {
        timestamps: true, 
    }
);

// Optional: Export Roles alongside the model for easy use in controllers
module.exports = {
    User: mongoose.model('User', userSchema),
    Roles
};