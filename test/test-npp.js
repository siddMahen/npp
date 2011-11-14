var vows = require("vows"),
		assert = require("assert"),
		npp = require("../lib/npp"),
		http = require("http"),
		events = require("events");

// Constants
var prefix = "./test/fixtures/";
var port = 9876;
var options = { host: "localhost", port: port, path: "/" };
var html = "<html><head><script type='npp'></script></head><body></body></html>";

// Macros
var startServer = function(file){	
	http.createServer(function(req, res){
		npp(prefix+file, res);
	}).listen(port);
};

var setupGet = function(promise){
	// Assuming promise is an EventEmitter
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
};


// Tests
var suite = vows.describe("npp - Basic Functionality");

suite.addBatch({
	"npp in stream mode": {
		topic: function(){ 
			var promise = new events.EventEmitter();		
			
			startServer("test-npp.html");
			setupGet(promise);

			return promise;
		},
		"should work as expected": function(err, res, data){
			assert.isNull(err);
			assert.equal("200", res.statusCode);
			assert.isString(data);
				//TODO: completely remove <script type='npp'>
			assert.equal(html, data);
		}
	}
})
.addBatch({
	"npp in callback mode":{
		topic: function(){
			var promise = new events.EventEmitter();
			http.createServer(function(req, res){
				npp(prefix+"test-npp.html", function(data){
					res.write(data);
					res.end();
				});
			}).listen(port+1);
			setupGet(promise);

			return promise;
		},
		"should work as expected": function(err, res, data){
			assert.isNull(err);
			assert.equal("200", res.statusCode);
			assert.isString(data);
				//Same as above
			assert.equal(html, data);
		}
	}
}).export(module);

