var noop = function(){};

describe("pre tests", function() {

  it("pre config will be set whole", function(done) {
    var config = new RouteBuilder().pre(["foo", "bar"]).build();
    expect(config).to.deep.equal({config: { pre:["foo", "bar"]}});
    done();
  });

  describe("pre builder", function() {
    it("0 arguments", function(done) {
      var func = function(){
        RouteBuilder._buildPre();
      };
      expect(func).to.throw(Error);
      done();
    });

    it("1 argument, array", function(done) {
      var arr = ["foo", "bar"];
      expect(RouteBuilder._buildPre(arr)).to.deep.equal(arr);
      done();
    });

    it("1 argument, function", function(done) {
      var func = function(){return "foo";};
      expect(RouteBuilder._buildPre(func)).to.deep.equal({method:func});
      done();
    });

    it("1 argument, string", function(done) {
      expect(RouteBuilder._buildPre("foo")).to.equal("foo");
      done();
    });

    it("1 argument, object", function(done) {
      expect(RouteBuilder._buildPre({bar:"foo"})).to.deep.equal({bar:"foo"});
      done();
    });

    it("2 arguments", function(done) {
      expect(RouteBuilder._buildPre("foo", noop)).to.deep.equal({assign:"foo", method:noop});
      done();
    });

    it("3 arguments", function(done) {
      expect(RouteBuilder._buildPre("foo", noop, "bar")).to.deep.equal({assign:"foo", method:noop, failAction:"bar"});
      done();
    });

    it("4 arguments", function(done) {
      var func = function(){
        RouteBuilder._buildPre("foo", "func", "bar", "baz")
      };
      expect(func).to.throw(Error);
      done();
    });
  });

  describe("serial pre", function() {
    it("0 arguments", function(done) {
      var func = function() {
        new RouteBuilder().preSerial().build();
      }
      expect(func).to.throw(Error);
      done();
    });

    it("1 argument, array", function(done) {
      var arr = ["foo", "bar"];
      var config = new RouteBuilder().preSerial(arr).build();
      expect(config.config.pre).to.deep.equal([arr]);
      done();
    });

    it("1 argument, function", function(done) {
      var config = new RouteBuilder().preSerial(noop).build();
      expect(config.config.pre).to.deep.equal([{method:noop}]);
      done();
    });

    it("1 argument, string", function(done) {
      var config = new RouteBuilder().preSerial("foo").build();
      expect(config.config.pre).to.deep.equal(["foo"]);
      done();
    });

    it("1 argument, object", function(done) {
      var config = new RouteBuilder().preSerial({bar:"foo"}).build();
      expect(config.config.pre).to.deep.equal([{bar:"foo"}]);
      done();
    });

    it("2 arguments", function(done) {
      var config = new RouteBuilder().preSerial("foo", noop).build();
      expect(config.config.pre).to.deep.equal([{assign:"foo", method:noop}]);
      done();
    });

    it("3 arguments", function(done) {
      var config = new RouteBuilder().preSerial("foo", noop, "bar").build();
      expect(config.config.pre).to.deep.equal([{assign:"foo", method:noop, failAction:"bar"}]);
      done();
    });

    it("4 arguments", function(done) {
      var func = function(){
        new RouteBuilder().preSerial("foo", func, "bar", "baz").build();
      };
      expect(func).to.throw(Error);
      done();
    });

    it("can place the pre into the array at the correct place", function(done) {
      var config = new RouteBuilder()
        .preSerial("foo", noop)
        .preSerial("bar", noop)
        .preSerial(0, "baz", noop)
        .build();

      expect(config.config.pre[0].assign).to.equal("baz");
      expect(config.config.pre[1].assign).to.equal("foo");
      expect(config.config.pre[2].assign).to.equal("bar");

      config = new RouteBuilder()
        .preSerial("foo", noop)
        .preSerial("bar", noop)
        .preSerial(1, "baz", noop)
        .build();

      expect(config.config.pre[0].assign).to.equal("foo");
      expect(config.config.pre[1].assign).to.equal("baz");
      expect(config.config.pre[2].assign).to.equal("bar");
      done();
    });
  });

  describe("parallel pre", function() {
    it("0 arguments", function(done) {
      var func = function() {
        new RouteBuilder().preParallel().build();
      }
      expect(func).to.throw(Error);
      done();
    });

    it("1 argument, array with array", function(done) {
      var arr = ["foo", "bar"];
      var config = new RouteBuilder().preParallel([arr]).build();
      expect(config.config.pre).to.deep.equal([[arr]]);
      done();
    });

    it("1 argument, array with function", function(done) {
      var config = new RouteBuilder().preParallel([noop]).build();
      expect(config.config.pre).to.deep.equal([[{method:noop}]]);
      done();
    });

    it("1 argument, array with string", function(done) {
      var config = new RouteBuilder().preParallel(["foo"]).build();
      expect(config.config.pre).to.deep.equal([["foo"]]);
      done();
    });

    it("1 argument, array with object", function(done) {
      var config = new RouteBuilder().preParallel([{bar:"foo"}]).build();
      expect(config.config.pre).to.deep.equal([[{bar:"foo"}]]);
      done();
    });

    it("2 argument array", function(done) {
      var config = new RouteBuilder().preParallel(["foo", noop]).build();
      expect(config.config.pre).to.deep.equal([[{assign:"foo", method:noop}]]);
      done();
    });

    it("3 argument array", function(done) {
      var config = new RouteBuilder().preParallel(["foo", noop, "bar"]).build();
      expect(config.config.pre).to.deep.equal([[{assign:"foo", method:noop, failAction:"bar"}]]);
      done();
    });

    it("4 argument array", function(done) {
      var func = function(){
        new RouteBuilder().preParallel(["foo", func, "bar", "baz"]).build();
      };
      expect(func).to.throw(Error);
      done();
    });

    it("multiple arrays", function(done) {
      var config = new RouteBuilder().preParallel(
        [noop], ["foo"], ["foo", noop]).build();
      expect(config.config.pre).to.deep.equal([[{method:noop}, "foo", {assign:"foo", method:noop}]]);
      done();
    });

    it("can place the pre into the array at the correct place", function(done) {
      var config = new RouteBuilder()
        .preParallel(["foo", noop])
        .preParallel(["bar", noop])
        .preParallel(0, ["baz", noop])
        .build();

      expect(config.config.pre[0][0].assign).to.equal("baz");
      expect(config.config.pre[1][0].assign).to.equal("foo");
      expect(config.config.pre[2][0].assign).to.equal("bar");

      config = new RouteBuilder()
        .preParallel(["foo", noop])
        .preParallel(["bar", noop])
        .preParallel(1, ["baz", noop])
        .build();

      expect(config.config.pre[0][0].assign).to.equal("foo");
      expect(config.config.pre[1][0].assign).to.equal("baz");
      expect(config.config.pre[2][0].assign).to.equal("bar");
      done();
    });
  });

});