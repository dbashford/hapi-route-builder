var utils = require("../utils")
  , RouteBuilder = require("./route_builder");
  ;

/**
 * Used to ensure pre block is in place before populating it
 */
RouteBuilder.prototype._ensurePre = function(obj) {
  utils.ensure(this.route, "config.pre");
  if (utils.isObject(this.route.config.pre)) {
    this.route.config.pre = [];
  }
};

RouteBuilder._buildPre = function() {
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

  throw new Error("_buildPre called with bad set of arguments", arguments);
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

  this._ensurePre();

  var index
    , args = Array.prototype.slice.call(arguments);
  if (typeof args[0] === "number") {
    index = args.shift();
  }

  var pre = RouteBuilder._buildPre.apply(this, args);

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

  this._ensurePre();

  var index
    , args = Array.prototype.slice.call(arguments);
  if (typeof args[0] === "number") {
    index = args.shift();
  }

  var pres = [];
  for (var i = 0, argLen = args.length; i < argLen; i++) {
    var pre = RouteBuilder._buildPre.apply(this, args[i]);
    pres.push(pre);
  }

  if(index !== undefined) {
    this.route.config.pre.splice(index, 0, pres);
  } else {
    this.route.config.pre.push(pres);
  }

  return this;
};
