const express = require('express')
const wrapAsync = require('../utils/wrapAsync.js')
const router = express.Router()
const { isLoggedIn, isOwner, validateListing } = require('../middleware.js')
const listingController = require('../controllers/listings.js')


const multer = require('multer')
const { storage } = require('../cloudConfig.js')
const upload = multer({ storage })

router.route('/')
    // Index Route
    .get(wrapAsync(listingController.index))

    // Create Route
    .post(
        isLoggedIn,
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingController.createListing)
    )

// New Route
router.get('/new', isLoggedIn, listingController.renderNewForm)

router.route('/:id')
    // Update Route
    .put(isLoggedIn,
        isOwner,
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingController.updateListing))

    // Delete Route
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing), validateListing)

    // Show Route
    .get(wrapAsync(listingController.showListing))

// Edit Route
router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(listingController.editListing))

module.exports = router