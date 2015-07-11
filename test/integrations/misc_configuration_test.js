var TestServer = new require("../util").TestServer
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
          expect(res.result.foo).to.equal("bar_returned");
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
      expect(res.statusCode).to.equal(200);
      stop();
    });
  });
};

describe("paths configured", function() {
  it("will be reached", function(done) {
    basicallyShitWorks(done);
  });
});

describe("handlers configured", function() {
  it("will be called", function(done) {
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
          'Host': 'foo.example.com'
        }
      }, function(res) {
        expect(res.statusCode).to.equal(200);
        expect(res.payload).to.equal("foooooo")
        stop();
      });
    });
  });

  it("will not be reached when not hitting vhost", function(done) {
    opts.done = done;
    new TestServer(opts).andTest(function(server, stop) {
      server.inject({
        method: 'GET',
        url: path
      }, function(res) {
        expect(res.statusCode).to.equal(404);
        stop();
      });
    });
  });
});

describe("config.app", function() {
  it("will be passed to the route", function(done) {

    var path = "/api/foo";

    var appConfig = {
      foo: "bar",
      baz:  false
    };

    var config = new RouteBuilder()
      .get()
      .path(path)
      .app(appConfig)
      .handler(function(request, reply){
        reply(request.route.settings.app);
      })
      .build();

    new TestServer({routeConfig: config, done: done}).andTest(function(server, stop) {
      server.inject({
        method: 'GET',
        url: path
      }, function(res) {
        expect(res.payload).to.equal(JSON.stringify(appConfig))
        stop();
      });
    });
  });
});