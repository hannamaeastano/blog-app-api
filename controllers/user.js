//[SECTION] Dependencies and Modules
const bcrypt = require('bcrypt');
const User = require('../models/user');
const auth = require('../auth');

//[SECTION] User Registration
module.exports.registerUser = (req, res) => {
    if (!req.body.email.includes('@')) {
        return res.status(400).send({ message: 'Invalid email format' });
    } else if (req.body.password.length < 8) {
        return res.status(400).send({ message: 'Password must be at least 8 characters long' });
    } else if (!req.body.username) {
        return res.status(400).send({ message: 'Username is required' });
    } else {
        const newUser = new User({
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            isAdmin: req.body.isAdmin || false
        });

        return newUser.save()
            .then((result) => {
                result.password = '';
                res.status(201).send({ 
                    message: 'User registered successfully', 
                    user: result 
                });
            })
            .catch((error) => auth.errorHandler(error, req, res));
    }
};

//[SECTION] User Login
module.exports.loginUser = (req, res) => {
    if (!req.body.email.includes('@')) {
        return res.status(400).send({ message: 'Invalid email format' });
    } else {
        return User.findOne({ email: req.body.email })
            .then((user) => {
                if (!user) {
                    return res.status(404).send({ message: 'Email not found' });
                } else {
                    const isPasswordCorrect = bcrypt.compareSync(req.body.password, user.password);
                    if (isPasswordCorrect) {
                        const token = auth.createAccessToken(user);
                        return res.status(200).send({ 
                            access: token,
                            user: {
                                id: user._id,
                                username: user.username,
                                email: user.email,
                                isAdmin: user.isAdmin
                            }
                        });
                    } else {
                        return res.status(401).send({ message: 'Incorrect email or password' });
                    }
                }
            })
            .catch((error) => auth.errorHandler(error, req, res));
    }
};

//[SECTION] Get User Details
module.exports.getUserDetails = (req, res) => {
    return User.findById(req.user.id)
        .then((user) => {
            if (!user) {
                return res.status(404).send({ message: 'User not found' });
            } else {
                user.password = '';
                return res.status(200).send(user);
            }
        })
        .catch((error) => auth.errorHandler(error, req, res));
};

module.exports.getAllUsers = (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).send({ message: 'Admin access required' });
    }
    
    User.find({})
        .select('-password') // Exclude sensitive information
        .then(users => {
            res.status(200).send(users);
        })
        .catch(error => {
            auth.errorHandler(error, req, res);
        });
};

//[SECTION] Delete User (Admin Only)
module.exports.deleteUser = (req, res) => {
    // Prevent admins from deleting themselves
    if (req.user.id === req.params.userId) {
        return res.status(403).send({ message: 'Admins cannot delete themselves' });
    }

    User.findByIdAndDelete(req.params.userId)
        .then(deletedUser => {
            if (!deletedUser) {
                return res.status(404).send({ message: 'User not found' });
            }
            res.status(200).send({ 
                message: 'User deleted successfully',
                deletedUser: {
                    id: deletedUser._id,
                    username: deletedUser.username,
                    email: deletedUser.email
                }
            });
        })
        .catch(error => auth.errorHandler(error, req, res));
};