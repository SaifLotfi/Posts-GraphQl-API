const host = 'localhost';
const port = 8080;
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');

const app = express();

const feedRouter = require('./routes/feed.js');
const authRouter = require('./routes/auth.js');
const userRouter = require('./routes/user.js');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now().toString();
        cb(null,uniqueSuffix  + '-' + file.originalname);
    },
});
const fileFilter = (req,file,cb)=>{
    if(file.mimetype==='image/png'||file.mimetype==='image/jpg'||file.mimetype==='image/jpeg'){
        cb(null,true);
    }else{
        cb(null,false);
    }
};

app.use(bodyParser.json());

app.use('/images',express.static(path.join(__dirname,'images')));

app.use(multer({ storage:storage,fileFilter:fileFilter }).single('image'));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
    );
    next();
    
});
app.use('/user',userRouter);

app.use('/feed', feedRouter);

app.use('/auth', authRouter);


app.use((err,req,res,next)=>{
    console.log(err);
    const message = err.message;
    const statusCode = err.statusCode || 500;
    const data = err.data;
    res.status(statusCode).json({
        message:message,
        data:data
    });
});

mongoose
    .connect(
        'mongodb+srv://swaifweaa:qGVa7jBPu4hDiNmh@cluster0.waorgrg.mongodb.net/?retryWrites=true&w=majority',
        {
            dbName: 'messages',
        }
    )
    .then((result) => {
        app.listen(port, () => {
            console.log(`Server is running on http://${host}:${port}`);
        });
    }).catch(err=>{
        console.log(err);
    })
