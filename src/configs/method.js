var RouteBuilder = require("../route_builder")
  ;

RouteBuilder.prototype.method = function(method) {
  this.route.method = method;
  return this;
};

var methods = ["post", "get", "delete", "put", "patch", "options"];
methods.forEach(function(_method) {
  RouteBuilder.prototype[_method] = function(_path, _handler) {
    if (_path) {
      this.path(_path);
    }

    if (_handler) {
      this.handler(_handler);
    }

    this.method(_method.toUpperCase());
    return this;
  };
});