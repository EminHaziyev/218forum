require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require('cors');
const app = express();
app.set('view engine', 'ejs');
const multer = require("multer");
const fs = require("fs");
const path = require('path');
mongoose.connect(process.env.MONGO, { useNewUrlParser: true });
app.use(bodyParser.urlencoded({ extended: true }))

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(cors());
const post = new mongoose.Schema({
  username: String,
  time: String,
  content: String,
  likes: Number,
  id: String,
  img: {
    data: Buffer,
    contentType: String
  },
  comments: [
    {
      author: {
        type: String,
        required: true,
      },
      text: {
        type: String,
        required: true,
      }

    }
  ]
})
const Post = mongoose.model("Post", post);
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function(req, file, cb) {
    cb(null, "postimg" + '-' + Math.floor(Math.random() * 100000))
  }
})

var upload = multer({ storage: storage })



app.get("/", async (req, res) => {
  const posts = await Post.find();
  posts.reverse();
  res.render("i", { posts: posts });
})

app.post("/like", (req, res) => {
  const post = req.body.postid;

  Post.findOneAndUpdate(
    { id: post },
    { $inc: { likes: 1 } }, 
    { new: true } 
  )
    .then(up => {
      res.redirect("/")
    })
    .catch(err => {
      res.send(err)
    })
})


app.post("/uploadphoto", upload.single('myImage'), async (req, res) => {

  try {
    const img = fs.readFileSync(req.file.path);
    const encode_img = img.toString('base64');
    const final_img = {
      contentType: req.file.mimetype,
      data: Buffer.from(encode_img, 'base64')
    };

    const id = Math.floor(Math.random() * 90000) + 10000;
    const now = new Date();
    const date = now.toDateString();
    const t = now.toTimeString().slice(0, 8);
    const time = date + " " + t;
    const username = req.body.author;
    const content = req.body.text;

    const newPost = new Post({
      username: username,
      time: time,
      content: content,
      likes: 0,
      id: id,
      img: final_img

    })
    newPost.save()
      .then(saved => {
        console.log("post")
        res.redirect("/")
      })
      .catch(err => {
        res.send(err)
      })
  }
  catch (err) {
    const id = Math.floor(Math.random() * 90000) + 10000;
    const now = new Date();
    const date = now.toDateString();
    const t = now.toTimeString().slice(0, 8);
    const time = date + " " + t;
    const username = req.body.author;
    const content = req.body.text;

    const newPost = new Post({
      username: username,
      time: time,
      content: content,
      likes: 0,
      id: id,

    })
    newPost.save()
      .then(saved => {
        console.log("post")
        res.redirect("/")
      })
      .catch(err => {
        res.send(err)
      })

  }



});


app.post("/comment", async (req, res) => {
  const author = req.body.author;
  const postId = req.body.postId;
  const text = req.body.text;
  console.log(author, postId, text);
  const post = await Post.findOne({ id: postId });

  post.comments.push({ author, text: text })
  post.save();
  res.redirect("/")

})
app.listen(3000, () => {
  console.log("listening on 3000")
})
