const mongoose = require('mongoose');

const User = require('./user');

const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String ,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
},{timestamps:true});

postSchema.post("findOneAndDelete",doc=>{
    const postId = doc._id;
    User.findOne({_id:doc.creator}).then(user=>{
        user.posts.pull(doc);
        return user.save();
    }).catch(err=>console.log(err));
});

module.exports = mongoose.model('Post',postSchema);
