/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Picture = require('./picture.model');

exports.register = function(socket) {
  Picture.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Picture.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('picture:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('picture:remove', doc);
}