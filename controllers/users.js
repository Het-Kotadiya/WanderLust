const User = require('../models/user.js')

module.exports.renderSignUpform = (req, res) => {
    res.render('users/signup.ejs')
}

module.exports.signUp = async (req, res) => {
    try {
        let { username, email, password } = req.body
        const newUser = new User({ email, username })
        const registerdUser = await User.register(newUser, password)
        console.log(registerdUser)
        req.login(registerdUser, (err) => {
            if (err) {
                return next(err)
            }
            req.flash('success', 'Welcom to Wanderlust')
            res.redirect('/listings')
        })

    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/signup')
    }
}

module.exports.renderLogInform = (req, res) => {
    res.render('users/login.ejs')
}

module.exports.logIn = async (req, res) => {
    req.flash('success', 'Welcome back to Wanderlust')
    let redirectUrl = res.locals.redirectUrl || '/listings';
    res.redirect(redirectUrl)

}

module.exports.logOut = (req, res, next) => {
    req.logout(err => {
        if (err) {
            return next(err)
        }
        req.flash('success', 'Log Out Successfull')
        res.redirect('/listings')
    })
}