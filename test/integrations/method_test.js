var TestServer = new require("../util").TestServer
  ;

describe("routes with method will call handler", function() {

  var handler = function(meth) {
    return function(request, reply) {
      // get does not have payload
      if (meth === "get") {
        request.payload = { foo: "bar"};
      }
      var returned = request.payload.foo + "_returned";
      reply({foo:returned});
    };
  };

  var runServer = function(config, done) {
    new TestServer({routeConfig: config, done: done}).andTest(function(server, stop) {
      server.inject({
        method: config.method,
        url: "/api/test_path",
        payload: {foo:"bar"}
      }, function(res) {
        expect(res.result.foo).to.equal("bar_returned");
        stop();
      });
    });
  };

  var runTests = function(test) {
    test("post");
    test("delete");
    test("get");
    test("put");
    test("patch");
    test("options");
  }

  describe("no params", function() {

    var test = function(meth) {
      it(meth.toUpperCase(), function(done) {
        var config = new RouteBuilder()
          .path("/api/test_path")
          [meth]()
          .handler(handler(meth))
          .build();

        runServer(config, done);
      });
    };
    runTests(test);
  });

  describe("passing path", function() {
    var test = function(meth) {
      it(meth.toUpperCase(), function(done) {
        var config = new RouteBuilder()
          [meth]("/api/test_path")
          .handler(handler(meth))
          .build();

        runServer(config, done);
      });
    };
    runTests(test);
  });

  describe("passing path and handler", function() {
    var test = function(meth) {
      it(meth.toUpperCase(), function(done) {
        var config = new RouteBuilder()
          [meth]("/api/test_path", handler(meth))
          .build();

        runServer(config, done);
      });
    };
    runTests(test);
  });

});