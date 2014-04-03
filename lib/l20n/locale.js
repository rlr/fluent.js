'use strict';

var Entity = require('./compiler').Entity;
var parse = require('./parser').parse;
var io = require('./platform/io');
var getPluralRule = require('./plurals').getPluralRule;

function Locale(id, ctx) {
  this.id = id;
  this.ctx = ctx;
  this.isReady = false;
  this.entries = {
    __plural: getPluralRule(id)
  };
}

Locale.prototype.getEntry = function L_getEntry(id) {
  /* jshint -W093 */

  var entries = this.entries;

  if (!entries.hasOwnProperty(id)) {
    return undefined;
  }

  if (entries[id] instanceof Entity) {
    return entries[id];
  }

  return entries[id] = new Entity(id, entries[id], entries);
};

Locale.prototype.build = function L_build(callback) {
  var sync = !callback;
  var ctx = this.ctx;
  var self = this;

  var l10nLoads = ctx.resLinks.length;

  function onL10nLoaded(err) {
    if (err) {
      ctx._emitter.emit('error', err);
    }
    if (--l10nLoads <= 0) {
      self.isReady = true;
      if (callback) {
        callback();
      }
    }
  }

  if (l10nLoads === 0) {
    onL10nLoaded();
    return;
  }

  function onJSONLoaded(err, json) {
    if (!err && json) {
      self.addAST(json);
    }
    onL10nLoaded(err);
  }

  function onPropLoaded(err, source) {
    if (!err && source) {
      var ast = parse(ctx, source);
      self.addAST(ast);
    }
    onL10nLoaded(err);
  }


  for (var i = 0; i < ctx.resLinks.length; i++) {
    var path = ctx.resLinks[i].replace('{{locale}}', this.id);
    var type = path.substr(path.lastIndexOf('.') + 1);

    switch (type) {
      case 'json':
        io.loadJSON(path, onJSONLoaded, sync);
        break;
      case 'properties':
        io.load(path, onPropLoaded, sync);
        break;
    }
  }
};

Locale.prototype.addAST = function(ast) {
  for (var id in ast) {
    if (ast.hasOwnProperty(id)) {
      this.entries[id] = ast[id];
    }
  }
};

Locale.prototype.getEntity = function(id, ctxdata) {
  var entry = this.getEntry(id);

  if (entry === null) {
    return null;
  }
  return entry.valueOf(ctxdata);
};

exports.Locale = Locale;