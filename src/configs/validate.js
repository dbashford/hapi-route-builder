var utils = require("../utils")
  , RouteBuilder = require("./route_builder")
  ;

/**
 * Sets the entire payload validation object
 * @param obj - The JSON object
 */
RouteBuilder.prototype.validatePayload = function(obj) {
  utils.ensure(this.route, "config.validate");
  this.route.config.validate.payload = obj;
  return this;
};

RouteBuilder.prototype.validatePayloadKey = function(key, val) {
  utils.ensure(this.route, "config.validate.payload");
  this.route.config.validate.payload[key] = val;
  return this;
};