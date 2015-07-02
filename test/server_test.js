var TestServer = new require("./util").TestServer
  ;

describe("routes with method will call handler", function() {

  var test = function(meth) {
    it(meth.toUpperCase(), function(done) {
      var config = new RouteBuilder().url("/api/test_url")[meth]().handler(function(request, reply) {
        // get does not have payload
        if (meth === "get") {
          request.payload = { foo: "bar"};
        }
        var returned = request.payload.foo + "_returned";
        reply({foo:returned});
      }).build();

      new TestServer(config, done).andTest(function(request, stop) {
        request
         [meth]("/api/test_url")
         .send({foo:"bar"})
         .end(function(err, res) {
           expect(res.body.foo).to.eql("bar_returned");
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
  var url = "/api/test_url";
  var config = new RouteBuilder().url(url).post().handler(function(request, reply) {
    expect(true).to.be.true;
    reply();
  }).build();

  new TestServer(config, done).andTest(function(request, stop) {
    request
      .post(url)
      .send({foo:"bar"})
      .end(function(err, res) {
        stop();
      });
  });
};

describe("urls configured", function() {
  it("will be reached", function(done) {
    basicallyShitWorks(done);
  });
});

describe("handlers configured", function() {
  it("will be called", function(done) {
    basicallyShitWorks(done);
  });
});

