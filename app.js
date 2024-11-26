// Load environment variables from a .env file if not in production
if (process.env.NODE_ENV != 'production') {
    require('dotenv').config()
}

// Import required modules
const express = require('express') // Express framework
const app = express()
const mongoose = require('mongoose') // MongoDB object modeling tool
const path = require('path') // Utilities for working with file and directory paths
const ejsMate = require('ejs-mate') // Template engine for EJS
const methodOverride = require('method-override') // Middleware for HTTP verbs like PUT/DELETE
const ExpressError = require('./utils/ExpressError.js') // Custom error handler
const session = require('express-session') // Session management
const MongoStore = require('connect-mongo') // Store session in MongoDB
const flash = require('connect-flash') // Flash messages middleware
const passport = require('passport') // Authentication library
const LocalStrategy = require('passport-local') // Local authentication strategy
const User = require('./models/user.js') // User model

// Import routers
const listingRouter = require('./routes/listing.js') // Router for listings
const reviewRouter = require('./routes/review.js') // Router for reviews
const userRouter = require('./routes/user.js') // Router for user-related routes

const port = 8080 // Server port

// Set up EJS as the templating engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Middleware configuration
app.use(express.urlencoded({ extended: true })) // Parse URL-encoded data
app.use(methodOverride('_method')) // Support PUT/DELETE via query string
app.engine('ejs', ejsMate) // Use EJS-mate for enhanced layouts
app.use(express.static(path.join(__dirname, '/public'))) // Serve static files

// Connect to MongoDB using Mongoose
main()
    .then(() => {
        console.log('Connection Successful')
    })
    .catch((err) => {
        console.log(err)
    })

async function main() {
    await mongoose.connect(process.env.ATLASDB_URL) // Connect to the database using Atlas URL
}

// Configure MongoDB session store
const store = MongoStore.create({
    mongoUrl: process.env.ATLASDB_URL,
    crypto: {
        secret: process.env.SECRET, // Encryption secret for sessions
    },
    touchAfter: 24 * 3600, // Limit session updates to once per day
})

// Handle session store errors
store.on('error', () => {
    console.log('Error in Mongo session store', err)
})

// Session configuration
const sessionOptions = {
    store, // Use the configured store
    secret: process.env.SECRET, // Encryption secret
    resave: false, // Avoid unnecessary session resaving
    saveUninitialized: true, // Save uninitialized sessions
    cookie: {
        expire: Date.now() + 7 * 24 * 60 * 60 * 1000, // Expiration time (7 days)
        maxAge: 7 * 24 * 60 * 60 * 1000, // Maximum age of the cookie
        httpOnly: true, // Prevent client-side JavaScript access to the cookie
    },
}

// Use session and flash middleware
app.use(session(sessionOptions))
app.use(flash())

// Initialize Passport for authentication
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate())) // Use local strategy for User model
passport.serializeUser(User.serializeUser()) // Serialize user info to session
passport.deserializeUser(User.deserializeUser()) // Deserialize user info from session

// Middleware to set flash messages and current user in local variables
app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    res.locals.currentUser = req.user
    next()
})

// Use imported routers for specific routes
app.use('/listings', listingRouter) // Routes for listings
app.use('/listings/:id/reviews', reviewRouter) // Routes for reviews
app.use('/', userRouter) // Routes for user-related actions

// Catch-all route for handling undefined routes
app.all('*', (req, res, next) => {
    next(new ExpressError(404, 'Page Not Found')) // Pass error to error handler
})

// Global error handler middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = 'Something Went Wrong' } = err
    res.status(statusCode).render('error.ejs', { err }) // Render error page
    // res.status(statusCode).send(message) // Alternative for plain text response
})

// Start the server on the specified port
app.listen(port, () => {
    console.log('Listening on port', port)
})
