var stest = require("stest"),
	assert = require("assert")
	nppdom = require("../lib/nppdom");

var opts = { timeout: 300 };
var basicIn = "<html><head></head><body><p id='text'></p></body></html>";

stest.addCase("nppdom - basic", opts, {
	setup: function(promise){
		var dom = new nppdom(basicIn);

		dom.getElements({ tag_name:"body" }, function(elems){
			var elem = elems[0];
			promise.emit("getElements", elem);
		});

		dom.getElementById("text", function(text){
			promise.emit("getElementById", text);
			var tag = dom.createTag("h1","Hello World!");
			promise.emit("createTag", tag);
			text.append(tag);
			promise.emit("append", text);
		});

		var data = "";
		dom.on("data", function(chunk){ data += chunk; });
		dom.on("end", function(){ promise.emit("done", data); });

		dom.done();
	},
	getElements: function(elem){
		assert.ok(elem);
		assert.deepEqual("tag", elem.type);
		assert.deepEqual("body", elem.name);
	},
	getElementById: function(elem){
		assert.ok(elem);
		assert.deepEqual("tag", elem.type);
		assert.deepEqual("p", elem.name);
		assert.deepEqual({ id: "text" }, elem.attribs);
		assert.deepEqual([], elem.children);
	},
	createTag: function(tag){
		assert.ok(tag);
		assert.deepEqual("tag", tag.type);
		assert.deepEqual("h1", tag.name);
		assert.deepEqual({}, tag.attribs);
		
		var val = [{ data:"Hello World!", type:"text" }];
		assert.deepEqual(val, tag.children);
		assert.deepEqual(val, tag.html);
	},
	append: function(elem){
		assert.ok(elem);
		assert.ok(elem.children);
		
		var tag = elem.children[0];
		assert.deepEqual("tag", tag.type);
		assert.deepEqual("h1", tag.name);
		assert.deepEqual({}, tag.attribs);
		
		var val = [{ data:"Hello World!", type:"text" }];
		assert.deepEqual(val, tag.children);
		assert.deepEqual(val, tag.html);
	},
	done: function(data){
		assert.ok(data);

		var val = "<html><head></head><body><p id='text'>"+
				  "<h1>Hello World!</h1></p></body></html>";
		assert.deepEqual(val, data);
	}
})
.run();
