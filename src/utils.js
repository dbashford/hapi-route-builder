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
    ensure(obj[firstKey], keys.join("."));
  }
};

exports.isExcluded = exports.isIncluded = function(url, items) {

  for (var i = 0, iLen = items.length;  i < iLen; i++ ) {
    var item = items[i];
    if (typeof item === "string") {
      if (url === item) {
        return true;
      }
    }

    if (item instanceof RegExp) {
      if (item.test(url)) {
        return true;
      }
    }

  }
  return false;
};

exports.isFunction = function(f) {
  return typeof(f) === "function";
};

exports.isObject = function(o) {
  return o !== null && typeof o === 'object' && !Array.isArray(o);
};

exports.isString = function(s) {
  return typeof s === 'string';
};