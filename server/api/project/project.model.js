'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var Grid = require('gridfs-stream');
var GridFS = Grid(mongoose.connection.db, mongoose.mongo);
var ProjectSchema = new Schema({
  number: Number,
  address: String,
  city: String,
  state: String,
  zip: String,
  name: String,
  files: [mongoose.Schema.Mixed]
});

ProjectSchema.methods.addFile = function(id,name,file){
	ProjectSchema.findOne({_id:id},function(err,project){
		var id = mongoose.Types.ObjectId();
		var writestream = GridFS.createWriteStream({
			_id : id,
			filename : name,
			mode: 'W'
		});
		writestream.on('close' ,function(file){
			project.files.push(file._id);
			procject.save(function(err){
				console.log('file saved!');
			});
		});
		file.pipe(writestream);
	});
}
module.exports = mongoose.model('Project', ProjectSchema);