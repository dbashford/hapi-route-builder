var RouteBuilder = require("../route_builder")
  ;

RouteBuilder.prototype.method = function(method) {
  this.route.method = method;
  return this;
};

var methods = ["post", "get", "delete", "put", "patch", "options"];

methods.forEach(function(_method) {
  RouteBuilder.prototype[_method] = function() {
    this.method(_method.toUpperCase());
    return this;
  };
});