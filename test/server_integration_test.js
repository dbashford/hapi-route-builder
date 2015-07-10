var TestServer = new require("./util").TestServer
  , Joi = require("joi")
  ;

describe("routes with method will call handler", function() {

  var test = function(meth) {
    it(meth.toUpperCase(), function(done) {
      var config = new RouteBuilder().path("/api/test_path")[meth]().handler(function(request, reply) {
        // get does not have payload
        if (meth === "get") {
          request.payload = { foo: "bar"};
        }
        var returned = request.payload.foo + "_returned";
        reply({foo:returned});
      }).build();

      new TestServer({routeConfig: config, done: done}).andTest(function(server, stop) {
        server.inject({
          method: meth.toUpperCase(),
          url: "/api/test_path",
          payload: {foo:"bar"}
        }, function(res) {
          expect(res.result.foo).to.eql("bar_returned");
          stop();
        });
      });
    });
  };

  test("post");
  test("delete");
  test("get");
  test("put");
  test("patch");
  test("options");
});

var basicallyShitWorks = function(done) {
  var path = "/api/test_path";
  var config = new RouteBuilder().path(path).post().handler(function(request, reply) {
    reply();
  }).build();

  new TestServer({routeConfig: config, done: done}).andTest(function(server, stop) {
    server.inject({
      method: "POST",
      url: path,
      payload: {foo:"bar"}
    }, function(res) {
      expect(res.statusCode).to.eql(200);
      stop();
    });
  });
};

  describe("paths configured", function() {
  it("will be reached", function(done) {
    basicallyShitWorks(done);
  });
});

describe("vhost configured", function() {

  var path = "/api/test_path";
  var config = new RouteBuilder()
    .path(path)
    .get()
    .vhost("foo.example.com")
    .handler(function(request, reply) {
      reply("foooooo");
    })
    .build();

  var opts = {
    routeConfig: config,
    host: "example.com"
  };

  it("will be reached", function(done) {
    opts.done = done;
    new TestServer(opts).andTest(function(server, stop) {
      server.inject({
        method: 'GET',
        url: path,
        headers: {
          'Set-Cookie': 'mycookie=test',
          'Host': 'foo.example.com'
        }
      }, function(res) {
        expect(res.statusCode).to.eql(200);
        expect(res.payload).to.eql("foooooo")
        stop();
      });
    });
  });

  it("will not be reached when not hitting vhost", function(done) {
    opts.done = done;
    new TestServer(opts).andTest(function(server, stop) {
      server.inject({
        method: 'GET',
        url: path,
        headers: {
          'Set-Cookie': 'mycookie=test'
        }
      }, function(res) {
        expect(res.statusCode).to.eql(404);
        stop();
      });
    });
  });
});


describe("handlers configured", function() {
  it("will be called", function(done) {
    basicallyShitWorks(done);
  });
});

describe("valiation", function() {
  var test= function(done, func, payload) {
    var builder = new RouteBuilder()
      .path("/api/foo")
      .post()

    var config = builder[func].apply(builder, payload)
      .handler(function(request, reply) {
        reply();
      })
      .build();

    new TestServer({routeConfig: config, done: done}).andTest(function(server, stop) {
      server.inject({
        method: "POST",
        url: "/api/foo",
        payload: {name:5}
      }, function(res) {
        expect(res.statusCode).to.eql(400);
        expect(res.result.message).to.eql("child \"name\" fails because [\"name\" must be a string]");
        stop();
      });
    });
  };


  it("will be executed via payload", function(done) {
    test(done, "validatePayload", [{ name: Joi.string().required() }]);
  });

  it("will be executed via payload key", function(done){
    test(done, "validatePayloadKey", ["name", Joi.string().required()]);
  });

});

describe("pre", function() {

  var called = false;

  beforeEach(function() {
    called = false;
  })

  var preFunc = function(req, reply) {
    called = true;
    reply("foo-bar");
  };

  var handler = function(req, reply) {
    reply(req.pre.testVar);
  };

  var buildPreTestConfig = function(pre) {
    return new RouteBuilder()
      .path("/api/foo")
      .get()
      .pre(pre)
      .handler(handler)
      .build();
  };

  var test = function(done, config, testPre, matcher) {
    new TestServer({routeConfig: config, done: done}).andTest(function(server, stop) {
      server.inject({
        method: "GET",
        url: "/api/foo?bar=bar",
        payload: {name:5}
      }, function(res) {
        if (testPre) {
          expect(res.payload).to.eql(matcher || "foo-bar");
        }
        expect(called).to.be.true;
        stop();
      });
    });
  };

  it("will be executed", function(done) {

    var config = new RouteBuilder()
      .path("/api/foo")
      .get()
      .pre([{
        assign:"foo",
        method: function(request, reply) {
          reply("barrrrrr");
        }
      }])
      .handler(function(request, reply) {
        reply(request.pre.foo);
      })
      .build();

    new TestServer({routeConfig: config, done: done}).andTest(function(server, stop) {

      server.inject({
        method: "GET",
        url: "/api/foo"
      }, function(res) {
        expect(res.payload).to.eql("barrrrrr")
        stop();
      });
    });
  });


  describe("built direct", function() {
    it("1 argument, array", function(done) {
      var pre = RouteBuilder._buildPre([{assign:"testVar", method:preFunc}]);
      var config = buildPreTestConfig(pre)
      test(done, config, true);
    });

    it("1 argument, function", function(done) {
      var pre = [RouteBuilder._buildPre(preFunc)];
      var config = buildPreTestConfig(pre)
      test(done, config, false);
    });

    it("1 argument, object", function(done) {
      var pre = [RouteBuilder._buildPre({assign:"testVar", method:preFunc})];
      var config = buildPreTestConfig(pre)
      test(done, config, true);
    });

    it("2 arguments", function(done) {
      var pre = [RouteBuilder._buildPre("testVar", preFunc)];
      var config = buildPreTestConfig(pre)
      test(done, config, true);
    });

    it("3 arguments", function(done) {
      var preFunc = function(req, reply) {
        called = true;
        throw new Error("foo-bar");
      };
      var pre = [RouteBuilder._buildPre("testVar", preFunc, "ignore")];
      var config = buildPreTestConfig(pre)
      test(done, config, true, '{"statusCode":500,"error":"Internal Server Error","message":"An internal server error occurred"}');
    });

    it("1 argument, string", function(done){
      called = true;
      var pre = [RouteBuilder._buildPre("testVar(query.bar)")];
      var config = buildPreTestConfig(pre)
      test(done, config, true);
    });
  });

  var buildPreSerialTestConfig = function(pre1, pre2, pre3) {
    var config = new RouteBuilder()
      .path("/api/foo")
      .get();

    if (pre3) {
      config = config.preSerial(pre1, pre2, pre3)
    } else if (pre2) {
      config = config.preSerial(pre1, pre2)
    } else {
      config = config.preSerial(pre1)
    }

    return config.handler(handler)
      .build();
  };

  var suite = function(buildPre) {
    it("1 argument, array", function(done) {
      var config = buildPre([{assign:"testVar", method:preFunc}]);
      test(done, config, true);
    });

    it("1 argument, function", function(done) {
      var config = buildPre(preFunc);
      test(done, config, false);
    });

    it("1 argument, object", function(done) {
      var config = buildPre({assign:"testVar", method:preFunc})
      test(done, config, true);
    });

    it("1 argument, string", function(done){
      called = true;
      var config = buildPre("testVar(query.bar)")
      test(done, config, true);
    });

    it("2 arguments", function(done) {
      var config = buildPre("testVar", preFunc);
      test(done, config, true);
    });
  };

  describe("serial", function() {

    suite(buildPreSerialTestConfig);

    it("3 arguments", function(done) {
      var preFunc = function(req, reply) {
        called = true;
        throw new Error("foo-bar");
      };
      var config = new RouteBuilder()
        .path("/api/foo")
        .get()
        .preSerial("testVar", preFunc, "ignore")
        .handler(handler)
        .build();
      test(done, config, true, '{"statusCode":500,"error":"Internal Server Error","message":"An internal server error occurred"}');
    });

    it("2 serials", function(done) {
      var config = new RouteBuilder()
        .path("/api/foo")
        .get()
        .preSerial("testVar", preFunc)
        .preSerial("testVar", function(request, reply) {
          reply(request.pre.testVar + "-baz");
        })
        .handler(handler)
        .build();
      test(done, config, true, "foo-bar-baz");
    });

  });

  var buildPreParalellTestConfig = function(pre1, pre2, pre3) {
    var config = new RouteBuilder()
      .path("/api/foo")
      .get();

    if (pre3) {
      config = config.preParallel([pre1, pre2, pre3])
    } else if (pre2) {
      config = config.preParallel([pre1, pre2])
    } else {
      var p = Array.isArray(pre1) ? pre1 : [pre1];
      config = config.preParallel(p)
    }

    return config.handler(handler)
      .build();
  };

  describe("parallel", function() {
    suite(buildPreParalellTestConfig);

    it("3 arguments", function(done) {
      var preFunc = function(req, reply) {
        called = true;
        throw new Error("foo-bar");
      };
      var config = new RouteBuilder()
        .path("/api/foo")
        .get()
        .preParallel(["testVar", preFunc, "ignore"])
        .handler(handler)
        .build();
      test(done, config, true, '{"statusCode":500,"error":"Internal Server Error","message":"An internal server error occurred"}');
    });

    it("2 parallels", function(done) {
      var config = new RouteBuilder()
        .path("/api/foo")
        .get()
        .preParallel(["testVar", preFunc])
        .preParallel(["testVar", function(request, reply) {
          reply(request.pre.testVar + "-baz");
        }])
        .handler(handler)
        .build();
      test(done, config, true, "foo-bar-baz");
    });

    it("1 parallel, 2 pres", function(done) {

      var preFunc1 = function(request, reply) {
        reply("fooooo");
      };

      var preFunc2 = function(request, reply) {
        reply("barrrr");
      };

      var config = new RouteBuilder()
        .path("/api/foo")
        .get()
        .preParallel(["testVar1", preFunc1], ["testVar2", preFunc2])
        .handler(function(request, reply){
          reply(request.pre.testVar1 + "-" + request.pre.testVar2);
        })
        .build();

      new TestServer({routeConfig: config, done: done}).andTest(function(server, stop) {

        server.inject({
          method: "GET",
          url: "/api/foo"
        }, function(res) {
          expect(res.payload).to.eql("fooooo-barrrr")
          stop();
        });
      });

    });
  });
})

