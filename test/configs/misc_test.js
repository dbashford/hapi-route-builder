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