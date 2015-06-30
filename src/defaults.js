/**
 * Creates a Defaults object using the function passed in.
 *
 * @param func - The defaults function that is called when the configuration
 *   is created.  That function is passed the RouteBuilder instance.
 */
function RBDefaults(func) {
  this.func = func;
  this.excludes = [];
  this.includes = [];
}

RBDefaults.prototype.not = function(exclude) {
  if (this.includes.length) {
    throw new Error("Used only and not on same default, this is not allowed");
  }
  this.excludes.push(exclude);
  return this;
};

RBDefaults.prototype.only = function(include) {
  if (this.excludes.length) {
    throw new Error("Used only and not on same default, this is not allowed");
  }
  this.includes.push(include);
  return this;
};

module.exports = RBDefaults;