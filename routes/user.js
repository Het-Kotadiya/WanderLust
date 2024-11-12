const express = require('express')
const router = express.Router()
const wrapAsync = require('../utils/wrapAsync')
const passport = require('passport')
const { saveRedirectUrl } = require('../middleware.js')
const userController = require('../controllers/users.js')

router.route('/signup')
    .get(userController.renderSignUpform)
    .post(wrapAsync(userController.signUp))

router.route('/login')
    .get(userController.renderLogInform)
    .post(
        saveRedirectUrl,
        passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), wrapAsync(userController.logIn))

router.get('/logout', userController.logOut)
module.exports = router