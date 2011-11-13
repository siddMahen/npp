var vows = require("vows"),
		assert = require("assert"),
		npp = require("npp");

vows.describe("Basic functionality").addBatch({
	"npp": {
		topic: function(){ return typeof npp; },
		"is installed correctly": function(npp){
			assert.equal("function", npp);
		}
	}
}).export(module);

