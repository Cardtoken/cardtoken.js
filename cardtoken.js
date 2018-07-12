/*
* (c)CardToken object.
* May 2018
*/
var CardToken = (function (key) {
  // flexible constructor
	if (!(this instanceof CardToken)) return new MyObject(key);
  if ("undefined" == typeof window || "undefined" == typeof document) alert('err 1');
  //if (window.MyObject) alert('err 2 - global object already exists (double load?)');

	// private starts
  function findForm(o) {
    if ("string" == typeof o) return document.querySelector(o);
    if (!o) throw new Error('Unable to find form "' + o + '"');
    return o
  }
  // @c = code
  // @m = message
  // return new HttpError
  function HttpError(c, m) {
    this.code = c;
    this.message = m;
  }
  // @respFunc (err, r)
  function xhr(method, url, body, respFunc) {
  	try {
  		var req = new XMLHttpRequest();
      if ("withCredentials" in xhr) {
        // XHR for Chrome/Firefox/Opera/Safari.
        req.open(method, url, true);
      } else {
        req.open(method, url);
      }
      req.onreadystatechange = () => {
        console.log(req.status+'||'+req.readyState);
        if (req.readyState === 4) {
          var s, r; // status, response
          try {
            s = req.status;
          } catch(e) {
            s = 0;
          }
          try {
            r = JSON.parse(req.responseText);
          } catch(e) {
            //r = {};
            return respFunc(new HttpError(s + 1001, 'Generic error'), null);
          }
          //var o = s && 2 === (s / 100 | 0);
          //respFunc && respFunc(o ? null : new HttpError(s, req.statusText || "Connection lost"), r;
          //(req.status >= 200 | req.status <=210) 
          //	? console.log(xhr.responseText) 
          //  : console.error('error not 200');
          return respFunc(null, r);
        }
      }
      // req.withCredentials = true;
      req.setRequestHeader( 'Content-Type', 'application/json' );
      req.setRequestHeader( 'Authorization', 'Basic ' + encode( self.key + ':' ) );

      req.send(JSON.stringify(body));
    }
    catch (ne) {
    	return respFunc(new HttpError(s + 5001, 'Connection closed'), null);
    }
  }
  /*
  * @param {String} str The string to be encoded as base-64
  * @param {Boolean} [utf8encode=false] Flag to indicate whether str is Unicode string to be encoded 
  *   to UTF8 before conversion to base64; otherwise string is assumed to be 8-bit characters
  * @returns {String} Base64-encoded string
  */
  encode = function(str, utf8encode) {
  	var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    utf8encode = (typeof utf8encode == 'undefined') ? false : utf8encode;
    var o1, o2, o3, bits, h1, h2, h3, h4, e=[], pad = '', c, plain, coded;
    var b64 = code;

    plain = utf8encode ? Utf8.encode(str) : str;

    c = plain.length % 3;  // pad string to length of multiple of 3
    if (c > 0) { while (c++ < 3) { pad += '='; plain += '\0'; } }
    // note: doing padding here saves us doing special-case packing for trailing 1 or 2 chars

    for (c=0; c<plain.length; c+=3) {  // pack three octets into four hexets
      o1 = plain.charCodeAt(c);
      o2 = plain.charCodeAt(c+1);
      o3 = plain.charCodeAt(c+2);

      bits = o1<<16 | o2<<8 | o3;

      h1 = bits>>18 & 0x3f;
      h2 = bits>>12 & 0x3f;
      h3 = bits>>6 & 0x3f;
      h4 = bits & 0x3f;

      // use hextets to index into code string
      e[c/3] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    }
    coded = e.join('');  // join() is far faster than repeated string concatenation in IE

    // replace 'A's from padded nulls with '='s
    coded = coded.slice(0, coded.length-pad.length) + pad;

    return coded;
  }
  // private ends
  
	// members
	var self = this;
  
  // prototypes start
  CardToken.prototype.key = key;
  // e = call back function (err, r)
  // o = form
  CardToken.prototype.tokenize = function(o, e) {
  	if ("function" != typeof e) throw new Error("Missing callback for CardToken.tokenize.");

	var form = findForm(o);
    var f1 = form.querySelector("input.card-number");
    var f2 = form.querySelector("input.card-expiry"); // mm-yy, mm/yy mmyy syntax
    var f3 = form.querySelector("input.card-code");
    var f4 = form.querySelector("input.card-expirymonth");
    var f5 = form.querySelector("input.card-expiryyear");

	if (f1 == null || f2 == null || f3 == null)
    	return e('no input fields', null);      

    var queryData = { 
        number: f1.value,
        expmonth: 10,
        expyear: 30,
        cvc: f3.value
    };
    
    // post
    xhr('POST', 'https://api.cardtoken.io/cards/', queryData, function(err, r) {
      return e(err, r);
    });
  }
  return this;
});
