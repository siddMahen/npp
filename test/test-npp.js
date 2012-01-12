var stest = require("stest"),
	assert = require("assert"),
    npp = stest.cover("../lib/npp.js");

// Constants
var pre = __dirname+"/fixtures/";
var html = "<html><head></head><body></body></html>";

var opts = { timeout: 0 };

stest
.addCase("npp - stream mode", opts, {
	setup: function(promise){
		var data = "";
		var stream = {};
		stream.writable = true;
		stream.write = function(chunk){ data += chunk; };
		stream.end = function(){ promise.emit("data", data); };
		npp(pre+"test-npp.html", stream);
	},
	data: function(data){
        // Bad practice, remove spaces from parsing
		assert.equal(html, data.replace(/\s/g,""));
	}
})
.addCase("npp - callback mode", opts, {
	setup: function(promise){
		npp(pre+"test-npp.html", function(data){
			promise.emit("data", data);
		});
        npp(pre+"test-npp.html", function(data){
            promise.emit("data", data);
        });
	},
	data: function(data){
		assert.equal(html, data.replace(/\s/g,""));
	}
})
.addCase("npp - edge cases", opts, {
	setup: function(promise){
		promise.emit("invalid");
		promise.emit("nothing");
		promise.emit("noarg");
	},
    invalid: function(){
        assert.throws(function(){
            npp({}, function(){});
        });
    },
    nothing: function(){
        assert.throws(function(){
            npp();
        });
    },
    noarg: function(){
        assert.throws(function(){
            npp(pre+"test-npp.html");
        });
    }
})
.run();
