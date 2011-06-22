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

