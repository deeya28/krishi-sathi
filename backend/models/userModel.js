const mongoose = require('mongoose');

// The Schema is the blueprint for our data
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'], // The array allows us to provide a custom error message
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true, // No two users can have the same email
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
        },
        isAdmin: {
            type: Boolean,
            required: true,
            default: false, // By default, new users are NOT admins
        },
    },
    {
        // This automatically adds 'createdAt' and 'updatedAt' timestamps to every user document!
        timestamps: true, 
    }
);

// We export the model so we can use it in our controllers
module.exports = mongoose.model('User', userSchema);