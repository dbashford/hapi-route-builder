var RouteBuilder = require("./route_builder");

RouteBuilder.prototype.url = function(url) {
  this.route.path = url;
  return this;
};

RouteBuilder.prototype.handler = function(handler) {
  this.route.handler = handler;
  return this;
};
