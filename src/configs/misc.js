var RouteBuilder = require("../route_builder")
  ;

RouteBuilder.prototype.path = function(path) {
  this.route.path = path;
  return this;
};

RouteBuilder.prototype.handler = function(handler) {
  this.route.handler = handler;
  return this;
};
