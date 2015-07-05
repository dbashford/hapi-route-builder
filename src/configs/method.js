var acceptableMethods = ["PUT", "POST", "DELETE", "GET", "OPTIONS", "PATCH"]
  , RouteBuilder = require("../route_builder")
  ;

RouteBuilder.prototype.method = function(method) {
  if (acceptableMethods.indexOf(method) === -1) {
    throw new Error("Unacceptable method used", method);
  }
  this.route.method = method;
  return this;
};

RouteBuilder.prototype.post = function() {
  this.method("POST");
  return this;
};

RouteBuilder.prototype.get = function() {
  this.method("GET");
  return this;
};

RouteBuilder.prototype.delete = function() {
  this.method("DELETE");
  return this;
};

RouteBuilder.prototype.put = function() {
  this.method("PUT");
  return this;
};

RouteBuilder.prototype.patch = function() {
  this.method("PATCH");
  return this;
};

RouteBuilder.prototype.options = function() {
  this.method("OPTIONS");
  return this;
};