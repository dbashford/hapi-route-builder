var RouteBuilder = require("../route_builder")
  ;

RouteBuilder.prototype.vhost = function(vhost) {
  this.route.vhost = vhost;
  return this;
};

RouteBuilder.prototype.path = function(path) {
  this.route.path = path;
  return this;
};

RouteBuilder.prototype.handler = function(handler) {
  this.route.handler = handler;
  return this;
};
