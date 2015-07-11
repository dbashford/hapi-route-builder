var noop = function(){};
  ;

describe("path tests", function() {
  it("will build a path config", function(done) {
    expect(new RouteBuilder().path("/foo/bar/baz").build()).to.deep.equal({path:"/foo/bar/baz"});
    done();
  })
});

describe("vhost tests", function() {
  it("will build a vhost config", function(done) {
    expect(new RouteBuilder().vhost("foo").build()).to.deep.equal({vhost:"foo"});
    done();
  })
});

describe("handler tests", function() {
  it("will build a handler config", function(done) {
    expect(new RouteBuilder().handler(noop).build().handler).to.deep.equal(noop);
    done();
  });
});

describe("config.app tests", function() {
  it("will build a config.app", function(done) {
    var appConfig = {
      foo: "bar",
      baz:  false
    };
    expect(new RouteBuilder().app(appConfig).build().config.app).to.deep.equal(appConfig);
    done();
  });
});