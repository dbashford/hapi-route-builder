var RouteBuilder = require("../route_builder")
  , utils = require("../utils")
  ;

RouteBuilder.prototype.vhost = function(_vhost) {
  this.route.vhost = _vhost;
  return this;
};

RouteBuilder.prototype.path = function(_path) {
  this.route.path = (RouteBuilder._rootPath || "") + _path;
  return this;
};

RouteBuilder.prototype.handler = function(_handler) {
  this.route.handler = _handler;
  return this;
};

RouteBuilder.prototype.app = function(_app) {
  utils.ensure(this.route, "config");
  this.route.config.app = _app;
  return this;
};
