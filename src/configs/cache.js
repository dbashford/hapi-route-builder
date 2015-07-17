var RouteBuilder = require("../route_builder")
  , utils = require("../utils")
  ;

var determineKey = function(val) {
  
  if (utils.isString(val)) {
    return "expiresAt";
  }

  if (utils.isNumber(val)) {
    return "expiresIn";
  }

  throw new Error("cache called with bad parameter", val);
};

/**
 * Function can take an object, string or number.
 * Object is full cache config, string is expiresAt
 * and number is expiresIn
 */

RouteBuilder.prototype.cache = function(cache) {
  utils.ensure(this.route, "config.cache");
  try {
    var key = determineKey(cache);
    this.route.config.cache[key] = cache;
  } catch (err) {
    if (utils.isObject(cache)) {
      this.route.config.cache = cache;
    } else {
      throw err;
    }
  }

  return this;
};

RouteBuilder.prototype._setCache = function(expires, privacy) {
  utils.ensure(this.route, "config.cache");
  this.route.config.cache.privacy = privacy;
  this.route.config.cache[determineKey(expires)] = expires;
};

RouteBuilder.prototype.cachePrivate = function(expires) {
  this._setCache(expires, "private");
  return this;
};

RouteBuilder.prototype.cachePublic = function(expires) {
  this._setCache(expires, "public");
  return this;
};