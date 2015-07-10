var Hapi = require("hapi")
  ;

  var testVar = function (a, next) {
    return next(null, "foo-" + a);
  };


function TestServer (opts) {
  this.done = opts.done;

  this.server = new Hapi.Server({debug:false});
  this.server.method('testVar', testVar);

  this.server.connection({
    host: opts.host || "localhost",
    //port: 3000
  });
  this.server.route(opts.routeConfig);

  var that = this;
  this.server.start(function(){
    process.nextTick(that.runTest.bind(that));
  }.bind(this));
}

TestServer.prototype.andTest = function(cb) {
  this.test = cb;
};

TestServer.prototype.runTest = function() {
  if (this.test) {
    this.test(this.server, this.stop.bind(this));
  } else {
    console.log("No test registered");
    this.stop();
  }
};

TestServer.prototype.stop = function(err) {
  this.server.stop(function() {
    this.done(err);
  }.bind(this));
};

exports.TestServer = TestServer;