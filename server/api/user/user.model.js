'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var Grid = require('gridfs-stream');
var GridFS = Grid(mongoose.connection.db, mongoose.mongo);
var fs = require('fs');

var UserSchema = new Schema({
  first_name: String,
  last_name: String,
  email: { type: String, lowercase: true },
  role: {
    type: String,
    default: 'user'
  },
  hashedPassword: String,
  provider: String,
  salt: String,
  phone: String,
  projects: [{
    type : Schema.Types.ObjectId,
    ref : 'Project'
  }],
  profile_picture: Schema.Types.ObjectId
});

/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

// Public profile information
UserSchema
  .virtual('profile')
  .get(function() {
    return {
      'first_name': this.first_name,
      'last_name' : this.last_name,
      'phone' : this.phone,
      'role': this.role,
      'profile_picture' : this.profile_picture
    };
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function() {
    return {
      '_id': this._id,
      'role': this.role
    };
  });

/**
 * Validations
 */

// Validate empty email
UserSchema
  .path('email')
  .validate(function(email) {
    return email.length;
  }, 'Email cannot be blank');

// Validate empty password
UserSchema
  .path('hashedPassword')
  .validate(function(hashedPassword) {
    return hashedPassword.length;
  }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({email: value}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
}, 'The specified email address is already in use.');

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function(next) {
    if (!this.isNew) return next();

    if (!validatePresenceOf(this.hashedPassword))
      next(new Error('Invalid password'));
    else
      next();
  });

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  getFile : function() {
      // GridFS.files.find({ _id : this.profile_picture}).toArray(function (err, files) {
      // });
   var data = '';
      var readstream = GridFS.createReadStream({
        _id : this.profile_picture,
   });

      //return readstream;
      //console.log(readstream)
     //var f=fs.createWriteStream('name.png');
     // readstream.pipe(f);
      return readstream;
     


  },
  addFile : function(file, name, callback) {
      var user = this;
  //  UserSchema.findOne({_id:id},function(err,user){
      var id = mongoose.Types.ObjectId();
      var writestream = GridFS.createWriteStream({
        _id : id,
        filename : name,
        mode: 'W'
      });
      writestream.on('close' ,function(file){
        callback(id);
        // user.profile_picture = id;
        // user.save(function(err){
        //   console.log('user profile pic saved!');
        // });
      });
      file.pipe(writestream);
   // });
  },
  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function(password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  }
};

module.exports = mongoose.model('User', UserSchema);
