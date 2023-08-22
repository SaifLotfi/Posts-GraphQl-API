const host = process.env.HOST;
const port = process.env.PORT||8080;
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');

const app = express();

const { createHandler } = require('graphql-http/lib/use/express');

const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');

const auth = require('./middleware/auth');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now().toString();
        cb(null, uniqueSuffix + '-' + file.originalname);
    },
});
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

app.use(bodyParser.json());

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(multer({ storage: storage, fileFilter: fileFilter }).single('image'));

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
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(auth);

app.put('/post-image', (req, res, next) => {
    console.log('reached post image');
    if (!req.isAuth) {
        const error = new Error('Not Authenticated!');
        error.statusCode = 401;
        throw error;
    }
    if (!req.file) {
        console.log('No Image Provided!')
        return res.status(200).json({ message: 'No Image Provided!' });
    }
    const oldPath = req.body.oldPath;
    if (oldPath) {
        deleteFile(oldPath);
    }
    console.log('req.file.path : ',req.file.path);
    console.log('req.file',req.file);
    return res.status(201).json({
        message: 'File stored.',
        filePath: req.file.path.replace('\\','/'),
    });
});

app.all('/graphql', (req, res) =>
    createHandler({
        schema: graphqlSchema,
        rootValue: {
            createUser: (args) => graphqlResolver.createUser(args, req),
            login: (args) => graphqlResolver.login(args, req),
            createPost: (args) => graphqlResolver.createPost(args, req),
            posts: (args) => graphqlResolver.posts(args, req),
            post: (args) => graphqlResolver.post(args, req),
            updatePost: (args) => graphqlResolver.updatePost(args, req),
            deletePost: (args) => graphqlResolver.deletePost(args, req),
            user: (args) => graphqlResolver.user(args, req),
            updateStatus: (args) => graphqlResolver.updateStatus(args, req),
        },
        formatError(err) {
            if (!err.originalError) {
                //a technical error : like missing a charcter or something in your query | not an error thrown by you or by a package
                return err;
            }
            console.log('This is the error', err.originalError);
            return {
                data: err.originalError.data,
                message: err.message || 'An error occurred.',
                statusCode: err.originalError.code || 500,
            };
        },
    })(req, res)
);

// app.all(
//     '/graphql',
//     createHandler({
//         schema: graphqlSchema,
//         rootValue: graphqlResolver,
//         formatError(err) {
//             if (!err.originalError) {
//                 //a technical error : like missing a charcter or something in your query | not an error thrown by you or by a package
//                 return err;
//             }
//             console.log('This is the error',err.originalError);
//             return {
//                 data: err.originalError.data,
//                 message: err.message || 'An error occurred.',
//                 statusCode: err.originalError.code || 500,
//             };
//         },
//     })
// );
/*
{
    data:
        [
            {
                message: 'Password too short!' 
            }
        ],
    statusCode: 422
}
*/
// app.use(
//     '/graphql',
//     graphqlHTTP({
//         schema: graphqlSchema,
//         rootValue: graphqlResolver,
//         graphiql: true,
//     })
// );

app.use((err, req, res, next) => {
    console.log(err);
    const message = err.message;
    const statusCode = err.statusCode || 500;
    const data = err.data;
    res.status(statusCode).json({
        message: message,
        data: data,
    });
});

mongoose
    .connect(
        process.env.MONGO_URI,
        {
            dbName: 'messages',
        }
    )
    .then((result) => {
        app.listen(port, () => {
            console.log(`Server is running on http://${host}:${port}`);
        });
    })
    .catch((err) => {
        console.log(err);
    });

const deleteFile = (filePath) => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, (err) => {
        console.log(err);
    });
};
