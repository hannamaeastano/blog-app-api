// [SECTION] Dependencies and Modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// [SECTION] Routes
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
const commentRoutes = require('./routes/comment');

// [SECTION] Environment Setup
const app = express();
const corsOptions = {
    origin: ['http://localhost:3000',
        'https://blog-app-api-q23z.onrender.com',
        'https://blog-app-client-two-swart.vercel.app'], 
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));


// [SECTION] Backend Routes
app.use('/users', userRoutes);     
app.use('/posts', postRoutes);     
app.use('/comments', commentRoutes); 

// [SECTION] Database Connection
mongoose.connect(process.env.MONGODB_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas.'));
mongoose.connection.on('error', (err) => console.error('MongoDB connection error:', err));

// [SECTION] Server Gateway Response
if (require.main === module) {
    app.listen(process.env.PORT || 5000, () => {
        console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
}

module.exports = { app, mongoose };
