const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongose = require('passport-local-mongoose')

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
})

userSchema.plugin(passportLocalMongose)

module.exports = mongoose.model('User', userSchema)