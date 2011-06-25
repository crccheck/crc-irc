// utilities

// String.split, but preserves all the characters
// makes split behave more like python's split and php's explode
String.prototype.psplit = function(sep, limit){
  if (typeof sep != "string") {
    // silently behave like .split if sep is not a string
    return this.split(sep, limit);
  }
  var tokens = this.split(sep);
  var n = tokens.length;
  if (limit < n){
    var partial = tokens.slice(limit - 1);
    tokens.splice(limit - 1, n - limit + 1, partial.join(sep));
  }
  return tokens;
};

// temporary console.log-like function
function dump(){
  document.getElementById('status-content').innerHTML += this.line + "\n";
}

function ignore(){
  // do nothing
}

function implementlater(){
  // do nothing
}

function notimplemented(){
  console.log("NOT IMPLEMENTED: (" + this.type + ") source: (" + this.source + ") target: (" + this.target + ") args:", this.args);
  console.log("\t", this.line);
}

function BaseIRCObject(){
  this._bind = {};
  this.bind = function(eventName, func){
    if (!this._bind[eventName]) {
      this._bind[eventName] = [];
    }
    this._bind[eventName].push(func);
  };
  this.trigger = function(eventName){
    if (this._bind[eventName] && this._bind[eventName].length){
      this._bind[eventName].forEach(function(f){
        f();
      });
    }
  };
}

/* The Crock's JavaScript Class Inheritance */
Function.prototype.method = function (name, func) {
    this.prototype[name] = func;
    return this;
};
Function.method('inherits', function (parent) {
    var d = {}, p = (this.prototype = new parent());
    this.method('uber', function uber(name) {
        if (!(name in d)) {
            d[name] = 0;
        }
        var f, r, t = d[name], v = parent.prototype;
        if (t) {
            while (t) {
                v = v.constructor.prototype;
                t -= 1;
            }
            f = v[name];
        } else {
            f = p[name];
            if (f == this[name]) {
                f = v[name];
            }
        }
        d[name] += 1;
        r = f.apply(this, Array.prototype.slice.apply(arguments, [1]));
        d[name] -= 1;
        return r;
    });
    return this;
});

