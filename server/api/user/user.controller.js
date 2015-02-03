'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var fs = require('fs');


var validationError = function(res, err) {
  return res.json(422, err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return res.send(500, err);
    res.json(200, users);
  });
};

exports.file = function(req, res) {
  res.set({
  'Content-Type': 'image/png',
  'Content-Disposition': 'attachment'
})
    // stream the file
    fs.createReadStream('name.png', 'base64').pipe(res);
};


exports.test = function(req, res){
   User.findOne({email:'test@test.com'},function(err,user){
    user.addFile(fs.createReadStream(req.files.file.path), req.files.file.name,function(id){
      user.profile_picture = id;
      //res.writeHead(200, {'Content-Type': 'image/png'});
      //res.end(data); // Send the file data to the browser.
      user.getFile().pipe(res);
     //res.json(user.getFile())
    })
   });
};
/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  // newUser.addFile(fs.createReadStream(req.files.file.path), req.files.file.name,function(id){
  //     newUser.provider = 'local';
  //     newUser.role = 'user';
  //     newUser.profile_picture  = id;
  //     console.log(newUser)
  //     newUser.save(function(err, user) {
  //       console.log(err)
  //       if (err) return validationError(res, err);
  //       var token = jwt.sign({_id: user._id }, config.secrets.session);
  //       res.json({ token: token });
  //     });
  // });
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    var token = jwt.sign({_id: user._id }, config.secrets.session);
    res.json({ token: token });
  });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(401);
    res.json(user.profile);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.send(500, err);
    return res.send(204);
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.send(200);
      });
    } else {
      res.send(403);
    }
  });
};

exports.download = function(req,res,next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt

    if (err) return next(err);
    if (!user) return res.json(401);
    res.contentType("image/png");
    res.setHeader('Content-disposition', 'attachment; filename=dramaticpenguin.png');
    user.getFile().pipe(res);
  });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt

    if (err) return next(err);
    if (!user) return res.json(401);
    res.json(user);
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
