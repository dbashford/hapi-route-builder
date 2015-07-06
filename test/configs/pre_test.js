var noop = function(){};

describe("pre tests", function() {

  it("pre config will be set whole", function() {
    var config = new RouteBuilder().pre(["foo", "bar"]).build();
    expect(config).to.eql({config: { pre:["foo", "bar"]}});
  });

  describe("pre builder", function() {
    it("0 arguments", function() {
      var func = function(){
        RouteBuilder._buildPre();
      };
      expect(func).to.throw(Error);
    });

    it("1 argument, array", function() {
      var arr = ["foo", "bar"];
      expect(RouteBuilder._buildPre(arr)).to.eql(arr);
    });

    it("1 argument, function", function() {
      var func = function(){return "foo";};
      expect(RouteBuilder._buildPre(func)).to.eql({method:func});
    });

    it("1 argument, string", function() {
      expect(RouteBuilder._buildPre("foo")).to.eql("foo");
    });

    it("1 argument, object", function() {
      expect(RouteBuilder._buildPre({bar:"foo"})).to.eql({bar:"foo"});
    });

    it("2 arguments", function() {
      expect(RouteBuilder._buildPre("foo", noop)).to.eql({assign:"foo", method:noop});
    });

    it("3 arguments", function() {
      expect(RouteBuilder._buildPre("foo", noop, "bar")).to.eql({assign:"foo", method:noop, failAction:"bar"});
    });

    it("4 arguments", function() {
      var func = function(){
        RouteBuilder._buildPre("foo", "func", "bar", "baz")
      };
      expect(func).to.throw(Error);
    });
  });

  describe("serial pre", function() {
    it("0 arguments", function() {
      var func = function() {
        new RouteBuilder().preSerial().build();
      }
      expect(func).to.throw(Error);
    });

    it("1 argument, array", function() {
      var arr = ["foo", "bar"];
      var config = new RouteBuilder().preSerial(arr).build();
      expect(config.config.pre).to.eql([arr]);
    });

    it("1 argument, function", function() {
      var config = new RouteBuilder().preSerial(noop).build();
      expect(config.config.pre).to.eql([{method:noop}]);
    });

    it("1 argument, string", function() {
      var config = new RouteBuilder().preSerial("foo").build();
      expect(config.config.pre).to.eql(["foo"]);
    });

    it("1 argument, object", function() {
      var config = new RouteBuilder().preSerial({bar:"foo"}).build();
      expect(config.config.pre).to.eql([{bar:"foo"}]);
    });

    it("2 arguments", function() {
      var config = new RouteBuilder().preSerial("foo", noop).build();
      expect(config.config.pre).to.eql([{assign:"foo", method:noop}]);
    });

    it("3 arguments", function() {
      var config = new RouteBuilder().preSerial("foo", noop, "bar").build();
      expect(config.config.pre).to.eql([{assign:"foo", method:noop, failAction:"bar"}]);
    });

    it("4 arguments", function() {
      var func = function(){
        new RouteBuilder().preSerial("foo", func, "bar", "baz").build();
      };
      expect(func).to.throw(Error);
    });

    it("can place the pre into the array at the correct place", function() {
      var config = new RouteBuilder()
        .preSerial("foo", noop)
        .preSerial("bar", noop)
        .preSerial(0, "baz", noop)
        .build();

      expect(config.config.pre[0].assign).to.eql("baz");
      expect(config.config.pre[1].assign).to.eql("foo");
      expect(config.config.pre[2].assign).to.eql("bar");

      config = new RouteBuilder()
        .preSerial("foo", noop)
        .preSerial("bar", noop)
        .preSerial(1, "baz", noop)
        .build();

      expect(config.config.pre[0].assign).to.eql("foo");
      expect(config.config.pre[1].assign).to.eql("baz");
      expect(config.config.pre[2].assign).to.eql("bar");
    });
  });

  describe("parallel pre", function() {
    it("0 arguments", function() {
      var func = function() {
        new RouteBuilder().preParallel().build();
      }
      expect(func).to.throw(Error);
    });

    it("1 argument, array with array", function() {
      var arr = ["foo", "bar"];
      var config = new RouteBuilder().preParallel([arr]).build();
      expect(config.config.pre).to.eql([[arr]]);
    });

    it("1 argument, array with function", function() {
      var config = new RouteBuilder().preParallel([noop]).build();
      expect(config.config.pre).to.eql([[{method:noop}]]);
    });

    it("1 argument, array with string", function() {
      var config = new RouteBuilder().preParallel(["foo"]).build();
      expect(config.config.pre).to.eql([["foo"]]);
    });

    it("1 argument, array with object", function() {
      var config = new RouteBuilder().preParallel([{bar:"foo"}]).build();
      expect(config.config.pre).to.eql([[{bar:"foo"}]]);
    });

    it("2 argument array", function() {
      var config = new RouteBuilder().preParallel(["foo", noop]).build();
      expect(config.config.pre).to.eql([[{assign:"foo", method:noop}]]);
    });

    it("3 argument array", function() {
      var config = new RouteBuilder().preParallel(["foo", noop, "bar"]).build();
      expect(config.config.pre).to.eql([[{assign:"foo", method:noop, failAction:"bar"}]]);
    });

    it("4 argument array", function() {
      var func = function(){
        new RouteBuilder().preParallel(["foo", func, "bar", "baz"]).build();
      };
      expect(func).to.throw(Error);
    });

    it("multiple arrays", function() {
      var config = new RouteBuilder().preParallel(
        [noop], ["foo"], ["foo", noop]).build();
      expect(config.config.pre).to.eql([[{method:noop}, "foo", {assign:"foo", method:noop}]]);
    });

    it("can place the pre into the array at the correct place", function() {
      var config = new RouteBuilder()
        .preParallel(["foo", noop])
        .preParallel(["bar", noop])
        .preParallel(0, ["baz", noop])
        .build();

      expect(config.config.pre[0][0].assign).to.eql("baz");
      expect(config.config.pre[1][0].assign).to.eql("foo");
      expect(config.config.pre[2][0].assign).to.eql("bar");

      config = new RouteBuilder()
        .preParallel(["foo", noop])
        .preParallel(["bar", noop])
        .preParallel(1, ["baz", noop])
        .build();

      expect(config.config.pre[0][0].assign).to.eql("foo");
      expect(config.config.pre[1][0].assign).to.eql("baz");
      expect(config.config.pre[2][0].assign).to.eql("bar");
    });
  });

});