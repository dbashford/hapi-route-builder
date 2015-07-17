exports.ensure = function(obj, key) {
  if(obj[key]) {
    return;
  }

  var keys = key.split(".")
    , firstKey = keys.shift()
    ;

  if (!obj[firstKey]) {
    obj[firstKey] = {};
  }

  if (keys.length === 0) {
    return;
  } else {
    exports.ensure(obj[firstKey], keys.join("."));
  }
};

exports.isExcluded = exports.isIncluded = function(path, items) {

  for (var i = 0, iLen = items.length;  i < iLen; i++ ) {
    var item = items[i];
    if (typeof item === "string") {
      if (path === item) {
        return true;
      }
    }

    if (item instanceof RegExp) {
      if (item.test(path)) {
        return true;
      }
    }

  }
  return false;
};

exports.isFunction = function(f) {
  return typeof f === "function";
};

exports.isObject = function(o) {
  return o !== null && typeof(o) === 'object' && !Array.isArray(o);
};

exports.isString = function(s) {
  return typeof(s) === 'string';
};

exports.isNumber = function(n) {
  return typeof(n) === "number";
};