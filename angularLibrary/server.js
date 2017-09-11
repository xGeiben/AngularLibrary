// set up ========================
var mongoose = require('mongoose'); // mongoose for mongodb
var express = require('express');
var Book = require('./models/book');
var Category = require('./models/category');
var User = require('./models/user');
var app = express(); // create our app w/ express
var morgan = require('morgan'); // log requests to the console (express4)
var bodyParser = require('body-parser'); // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var fs = require("fs");

// configuration =================
var config = JSON.parse(fs.readFileSync("config.json"));
mongoose.connect(config.db); //conectar con el servidor de base de datos
app.use('/node_modules', express.static(__dirname + '/node_modules/')); //set the route from where the JS libraries will be.
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({
  'extended': 'true'
})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({
  type: 'application/vnd.api+json'
})); // parse application/vnd.api+json as json
app.use(methodOverride());
var router = express.Router();
// routes ======================================================================


app.get('/api/books', function(req, res) {
  Book.find().
  populate({
    path: 'currentUser',
    select: 'name'
  }).
  populate({
    path: 'category',
    select: 'name'
  }).
  sort({
    name: 1
  }).
  exec(function(err, books) {
    if (err)
      res.send(err);

    res.json(books);
  })
})
app.post('/api/books', function(req, res) {
  Book.create({
    name: req.body.name,
    author: req.body.author,
    category: req.body.category,
    published: req.body.published,
    blurb: req.body.blurb,
  }, function(err, book) {
    if (err)
      res.send(err);

    //get and return all the books
    Book.find(function(err, books) {
      if (err)
        res.send(err)
      res.json(books);
    })
  })
})
app.put('/api/books', function(req, res) {
  Book.findByIdAndUpdate(req.body._id, {
    name: req.body.name,
    author: req.body.author,
    category: req.body.category,
    published: req.body.published,
    blurb: req.body.blurb
  }, function(err, result) {
    if (err)
      res.send(err);

    Book.find().
    populate({
      path: 'currentUser',
      select: 'name'
    }).
    populate({
      path: 'category',
      select: 'name'
    }).
    sort({
      name: 1
    }).
    exec(function(err, books) {
      if (err)
        res.send(err);

      res.json(books);
    })
  })
})
app.delete('/api/books/:id', function(req, res) {
  Book.deleteOne({
    _id: req.params.id
  }, function(err, result) {
    if (err)
      res.send(err)
    Book.find().
    populate({
      path: 'currentUser',
      select: 'name'
    }).
    populate({
      path: 'category',
      select: 'name'
    }).
    sort({
      name: 1
    }).
    exec(function(err, books) {
      if (err)
        res.send(err);

      res.json(books);
    })
  })
})
app.get('/api/users', function(req, res) {
  User.find().
  populate({
    path: 'books',
    select: 'name'
  }).
  exec(function(err, users) {
    if (err)
      res.send(err);

    res.json(users);
  })
})
app.get('/api/categories', function(req, res) {
  Category.find(function(err, categories) {
    if (err)
      res.send(err);
    res.json(categories);
  })
});
app.post('/api/assign', function(req, res) {
  User.findByIdAndUpdate(req.body.userID, {
    $push: {
      books: req.body.bookID
    }
  }, function(err, result) {
    if (err)
      res.send(err)
    Book.findByIdAndUpdate(req.body.bookID, {
      currentUser: req.body.userID
    }, function(err, book) {
      if (err)
        res.send(err)
      Book.find({
        _id: book._id
      }).
      populate({
        path: 'currentUser',
        select: 'name'
      }).
      populate({
        path: 'category',
        select: 'name'
      }).
      exec(function(err, updatedBook) {
        if (err)
          res.send(err)
        res.json(updatedBook);
      })

    })
  })
})
app.post('/api/unassign', function(req, res) {
  User.findByIdAndUpdate(req.body.userID, {
    $pull: {
      books: req.body.bookID
    }
  }, function(err, result) {
    if (err)
      res.send(err)
    Book.findByIdAndUpdate(req.body.bookID, {
      $unset: {
        currentUser: true
      }
    }, function(err, book) {
      if (err)
        res.send(err)
      Book.find({
        _id: book._id
      }).
      populate({
        path: 'currentUser',
        select: 'name'
      }).
      populate({
        path: 'category',
        select: 'name'
      }).
      exec(function(err, updatedBook) {
        if (err)
          res.send(err)
        res.json(updatedBook);
      })
    })
  })
})
app.post('/api/categories', function(req, res) {
  Category.create({
    name: "TestName",
    description: "DescriptionTest",
    books: []
  }, function(err, response) {
    if (err)
      console.log(err);
    console.log(res);
  })
})

// end of routes ===============================================================
// application -------------------------------------------------------------
app.get('*', function(req, res) {
  res.sendfile('./public/views/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

// listen (start app with node server.js) ======================================
app.listen(config.api_port);
console.log("App listening on port 8080");
