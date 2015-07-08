var utils = require("./utils")
  , traverse = require('traverse')
  , replaceCheck = /^%.*%$/
  ;

function RouteBuilder() {
  this.route = {};
  this.replaces = [];
}

RouteBuilder.defaultsArray = [];

/**
 * Allows adding a defaults object to the creating of route
 * configurations
 *
 * @param {Defaults} defaults object
 */
RouteBuilder.addDefault = function(configDefault) {
  RouteBuilder.defaultsArray.push(configDefault);
};

RouteBuilder.clearDefaults = function() {
  this.defaultsArray = [];
};

RouteBuilder.prototype._applyDefaults = function() {
  if (RouteBuilder.defaultsArray.length) {
    var url = this.route.path
      , that = this
      ;

    RouteBuilder.defaultsArray.forEach(function(_default) {
      // if includes exist, only using it
      if (_default.includes && _default.includes.length) {
        if (utils.isIncluded(url, _default.includes || [])) {
          (_default.func || _default)(that);
        }
      } else if (!utils.isExcluded(url, _default.excludes || [])) {
        (_default.func || _default)(that);
      }
    });
  }
};

var findReplaceValue = function(replacers, key) {
  for (var i = 0, iLen = replacers.length; i < iLen; i++) {
    var r = replacers[i];
    if (JSON.stringify(r.key) === key) {
      return r.val;
    }
  }
};

RouteBuilder.prototype._applyReplaces = function() {
  var that = this;
  var replaceMatchers = this.replaces.map(function(replacer) {
    return JSON.stringify(replacer.key);
  });
  if (replaceMatchers && replaceMatchers.length) {
    traverse(this.route).forEach(function (x) {
      x = JSON.stringify(x);
      if(replaceMatchers.indexOf(x) > -1) {
        this.update(findReplaceValue(that.replaces, x));
      }
    });
  }
};

RouteBuilder.prototype._checkForcedReplaces = function() {
  traverse(this.route).forEach(function (x) {
    if (typeof x === "string" && replaceCheck.test(x)) {
      throw new Error("String " + x + " not replaced in the configuration.");
    }
  });
};

RouteBuilder.prototype.replace = function(key, val) {
  this.replaces.push({key:key, val:val});
  return this;
};

RouteBuilder.prototype.build = function() {
  this._applyDefaults();
  this._applyReplaces();
  this._checkForcedReplaces();
  return this.route;
};

module.exports = RouteBuilder;