var noop = function(){};
  ;

describe("path tests", function() {
  it("will build a path config", function() {
    expect(new RouteBuilder().path("/foo/bar/baz").build()).to.eql({path:"/foo/bar/baz"});
  })
});

describe("handler tests", function() {
  it("will build a handler config", function() {
    expect(new RouteBuilder().handler(noop).build().handler).to.eql(noop);
  });
});