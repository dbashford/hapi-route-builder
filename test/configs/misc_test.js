var noop = function(){};
  ;

describe("path tests", function() {
  it("will build a path config", function() {
    expect(new RouteBuilder().path("/foo/bar/baz").build()).to.eql({path:"/foo/bar/baz"});
  })
});

describe("vhost tests", function() {
  it("will build a vhost config", function() {
    expect(new RouteBuilder().vhost("foo").build()).to.eql({vhost:"foo"});
  })
});

describe("handler tests", function() {
  it("will build a handler config", function() {
    expect(new RouteBuilder().handler(noop).build().handler).to.eql(noop);
  });
});