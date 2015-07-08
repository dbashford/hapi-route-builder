var utils = require("./utils")
  ;

/**
 * Creates a Defaults object using the function passed in.
 *
 * @param func - The defaults function that is called when the configuration
 *   is created.  That function is passed the RouteBuilder instance.
 */
function RBDefault(func) {
  this.func = func;
  this.excludes = [];
  this.includes = [];
  this.atBuild = false;
}

/**
 * Indicates the the RBDefault is to be applied when build is run
 */
RBDefault.prototype.applyAtBuild = function() {
  this.atBuild = true;
  return this;
};

RBDefault.prototype.not = function(exclude) {
  if (!this.atBuild) {
    throw new Error("Cannot call not without first calling applyAtBuild");
  }
  if (this.includes.length) {
    throw new Error("Used only and not on same default, this is not allowed");
  }
  this.excludes.push(exclude);
  return this;
};

RBDefault.prototype.only = function(include) {
  if (!this.atBuild) {
    throw new Error("Cannot call only without first calling applyAtBuild");
  }
  if (this.excludes.length) {
    throw new Error("Used only and not on same default, this is not allowed");
  }
  this.includes.push(include);
  return this;
};

module.exports = RBDefault;
