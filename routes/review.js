const express = require('express')
const wrapAsync = require('../utils/wrapAsync.js')
const router = express.Router({ mergeParams: true })
const { validateReview, isLoggedIn, isAuthor } = require('../middleware.js')
const reviewcontroller = require('../controllers/reviews.js')

// Reviews Route
router.post('/',
    isLoggedIn,
    validateReview,
    wrapAsync(reviewcontroller.createReview))

// Delete review route
router.delete('/:reviewId',
    isLoggedIn,
    isAuthor,
    wrapAsync(reviewcontroller.deleteReview))

module.exports = router