//[SECTION] Dependencies and Modules
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const { verify, verifyAdmin } = require('../auth');

//[SECTION] User Routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/details', verify, userController.getUserDetails);
router.get('/', verify, verifyAdmin, userController.getAllUsers);
router.delete('/:userId', verify, verifyAdmin, userController.deleteUser);

module.exports = router;