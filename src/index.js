var util = require("util")
  , utils = require("./utils")
  , RBDefaults = require("./defaults")
  , acceptableMethods = ["PUT", "POST", "DELETE", "GET", "OPTIONS", "PATCH"]
  ;

function RouteBuilder() {
  this.route = {};
  this.configs = [];
  this.defaults = [];
}

/* output functions */

/**
 * Assembles list of config functions that can act
 * upon the config prior to output/print.
 */
RouteBuilder.prototype.prepareConfig = function() {
  // execute all the configs functions
  this.applyDefaults();
  var that = this;
  this.configs.forEach(function(func) {
    func(that.route);
  });
};

RouteBuilder.prototype.build = function() {
  this.prepareConfig();
  return this.route;
};

RouteBuilder.prototype.print = function() {
  this.prepareConfig();
  var output = util.inspect(this.route);
  console.log(output);
  return this;
};

RouteBuilder.prototype.config = function(func) {
  this.configs.push(func);
  return this;
};

/* end output functions */

/* Begin Method related functions */

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

/* End Method related functions */

RouteBuilder.prototype.url = function(url) {
  this.route.path = url;
  return this;
};

RouteBuilder.prototype.handler = function(handler) {
  this.route.handler = handler;
  return this;
};

/* Begin defaults functionality */

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

RouteBuilder.prototype.applyDefaults = function() {
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

/* end default functions */

/* begin validate related functions */

/**
 * Will handle logging/response that an unexpected error has
 * occurred and optionally handle replying to the client (500)
 *
 * @param request - the original hapi request
 * @param reply - the original hapi reply
 * @param {object} data - any pertinent data to be logged for the request
 * that had the unexpected error
 */

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

/* end validate related functions */

/* begin pre related functions */

RouteBuilder.buildPre = function() {
  if (arguments.length === 1) {
    var arg = arguments[0];

    if (Array.isArray(arg)) {
      // is either top level or nested array, leave alone
      return arg;
    }

    if (utils.isFunction(arg)) {
      // If just function, is same as object with just method
      // http://hapijs.com/api#route-prerequisites
      // So make more clear
      return {
        method:arguments[0]
      };
    }

    if (utils.isObject(arg) || utils.isString(arg)) {
      // is already an object/string, can leave alone
      return arg;
    }
  }

  if (arguments.length === 2) {
    return {
      assign: arguments[0],
      method: arguments[1]
    };
  }

  if (arguments.length === 3) {
    return {
      assign: arguments[0],
      method: arguments[1],
      failAction: arguments[2]
    };
  }

  throw new Error("buildPre called with bad set of arguments", arguments);
};

/**
 * Sets the entire pre block
 */
RouteBuilder.prototype.pre = function(pre) {
  utils.ensure(this.route, "config");
  this.route.config.pre = pre;
  return this;
};

/**
 * Used to ensure pre block is in place before populating it
 */
RouteBuilder.prototype.ensurePre = function(obj) {
  utils.ensure(this.route, "config.pre");
  if (utils.isObject(this.route.config.pre)) {
    this.route.config.pre = [];
  }
};

/**
 * Takes any of the possible pre setups as input.
 * http://hapijs.com/api#route-prerequisites
 * 1) Objects taking form of {method:, assign:, failAction:}
 * 2) Function (which == {assign:})
 * 3) String which uses server method
 *
 * 4) Can also take an array, which is handled as a pre array
 * and used directly.
 *
 * Also takes as convienence:
 * 5) string, function. shorthand for {assign:, method:}
 * 6) string, function, string. shorthand for {assign:, method:, failAction:}
 *
 * Can optionally take an index (a number) as the first parameter
 * which will force the serial pres into the [index] location
 * of the pre array
 */
RouteBuilder.prototype.preSerial = function() {
  if(arguments.length === 0) {
    throw new Error("preSerial called with no arguments");
  }

  this.ensurePre();

  var index
    , args = Array.prototype.slice.call(arguments);
  if (typeof args[0] === "number") {
    index = args.shift();
  }

  var pre = RouteBuilder.buildPre.apply(this, args);

  if(index !== undefined) {
    this.route.config.pre.splice(index, 0, pre);
  } else {
    this.route.config.pre.push(pre);
  }

  return this;
};

/**
 * Takes n number of arrays as parameters, each array is comprised
 * of parameters as passed to preSerial.  Each array represents a pre
 * to be executed in parallel with the rest of the pre(s) passed in.
 *
 * Can optionally take an index (a number) as the first parameter
 * which will force the parallel pres into the [index] location
 * of the pre array.
 */
RouteBuilder.prototype.preParallel = function() {

  if(arguments.length === 0) {
    throw new Error("preParallel called with no arguments");
  }

  this.ensurePre();

  var index
    , args = Array.prototype.slice.call(arguments);
  if (typeof args[0] === "number") {
    index = args.shift();
  }

  var pres = [];
  for (var i = 0, argLen = args.length; i < argLen; i++) {
    var pre = RouteBuilder.buildPre.apply(this, args[i]);
    pres.push(pre);
  }

  if(index !== undefined) {
    this.route.config.pre.splice(index, 0, pres);
  } else {
    this.route.config.pre.push(pres);
  }

  return this;
};

/* end pre related functions */

exports.RouteBuilder = RouteBuilder;
exports.RBDefaults = RBDefaults;

