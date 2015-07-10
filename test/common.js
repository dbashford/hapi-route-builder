global.expect = require('code').expect;
global.RBDefault = require("../index").RBDefault;
global.RouteBuilder = require("../index").RouteBuilder;

var Lab = require('lab');
var lab = exports.lab = Lab.script({cli:{leaks:false}});

global.describe = lab.describe;
global.it = lab.it;
global.before = lab.before;
global.after = lab.after;
global.beforeEach = lab.beforeEach;
global.afterEach = lab.afterEach;
