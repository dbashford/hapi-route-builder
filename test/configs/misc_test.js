var noop = function(){};
  ;

describe("url tests", function() {
  it("will build a url config", function() {
    expect(new RouteBuilder().url("/foo/bar/baz").build()).to.eql({path:"/foo/bar/baz"});
  })
});

describe("handler tests", function() {
  it("will build a handler config", function() {
    expect(new RouteBuilder().handler(noop).build().handler).to.eql(noop);
  });
});