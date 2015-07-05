var utils = require("./utils");

function RouteBuilder() {
  this.route = {};
  this.configs = [];
  this.defaults = [];
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

RouteBuilder.prototype.build = function() {
  this._applyDefaults();
  var that = this;
  this.configs.forEach(function(func) {
    func(that.route);
  });
  return this.route;
};

RouteBuilder.prototype.config = function(func) {
  this.configs.push(func);
  return this;
};

module.exports = RouteBuilder;