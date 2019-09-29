const x = [1, 2, 3];

// Should not be fixed
var a = x.map(v => v * 2);

let varb;
if (Array.isArray(y)) {
  varb = y.map(cb);
} else {
  varb = _.map(y, cb);
}

// Should be fixed
var test = _.map([1,2,3], v => v * 3);

var test2 = _.map(getItems(), v => v.toString());

var test3 = _.map({a: 'b', c: 'd'}, v => {});

var test4 = _.map([{a: 'b'}, {c: 'd'}], () => {});

function doit(x, cb) {
  return _.map(x, cb);
}

var test5 = _.map(new Array(5), () => {});

var test6 = _.map(Array.from([1,2,3]), () => {});