var stest = require("stest"),
	assert = require("assert"),
	npp = require("../lib/npp");

// Constants
var pre = __dirname+"/fixtures/";
var html = "<html><head><script type='npp'></script></head><body></body></html>";

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
		assert.equal(html, data);
	}
})
.addCase("npp - callback mode", opts, {
	setup: function(promise){
		npp(pre+"test-npp.html", function(data){
			promise.emit("data", data);
		});
	},
	data: function(data){
		assert.equal(html, data);
	}
})
.run();

