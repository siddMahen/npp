#!/usr/bin/env node

var vm = require("vm"),
		fs = require("fs"),
		cp = require("child_process");


// var r = /(?:<script[^\/]*type=[^\/]*"nodescript">)
// ([^\/]*)(?:<\/[^\/]*script[^\/]*>)/g;
// old regex, new one is faster and better for testing...

var r = /(?:<script type="nodescript">)([^<>]*)(?:<\/script>)/g
var file = process.argv[2]; 

fs.readFile(file, function(err, data){

		if(err) throw err;
		
		//ensures the scrips run serially, else they run in the opposite order.
		var code;
		var exec = "";

		while(code = r.exec(data)){
			exec = exec.concat(code[1], "\n");
		}
		
		// concatonate the scripts so they share variables
		// and can interact 'n stuff	

		var sandbox = {
	 		console: console,
			require: require,
			process: process,
			__dirname: __dirname 
		};
debugger;
		//check out node-html-encoder for a simple to HTML lib
		
		vm.runInNewContext(exec, sandbox);
});
