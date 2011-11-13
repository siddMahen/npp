var vows = require("vows"),
		assert = require("assert"),
		npp = require("../lib/npp"),
		http = require("http"),
		events = require("events");

// Constants
var prefix = "./test/fixtures/";
var port = 9876;
var options = { host: "localhost", port: port, path: "/" };

// Macros
var startServer = function(file){	
	http.createServer(function(req, res){
		npp(prefix+file, res);
	}).listen(port);
};

// Tests
var suite = vows.describe("Basic functionality");

suite.addBatch({
	"npp in stream mode": {
		topic: function(){ 
			var promise = new events.EventEmitter();		
			
			startServer("test-npp.html");

			var data = "";

			http.get(options, function(res){
				res.setEncoding("utf8");
				res.on("data", function(chunk){
					data += chunk;
				});

				res.on("end", function(){
					promise.emit('success', res, data);
				});

			}).on("error", function(e){
				promise.emit('error', e);
			});

			return promise;
		},
		"should work": function(err, res, data){
			assert.isNull(err);
			assert.equal("200", res.statusCode);
			assert.isString(data);
		},
		"should work correctly": function(err, res, data){
			assert.isNull(err);
			assert.equal("<html><head><script type='npp'></script></head><body></body></html>", data);
		}
	}
}).export(module);

