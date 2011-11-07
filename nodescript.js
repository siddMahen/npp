#!/usr/bin/env node

var vm = require('vm'),
		fs = require('fs'),
		cp = require('child_process');
	
	// This can become more linient later, for now, stick with this
var r = /(?:<script[^\/]*type=[^\/]*"nodescript">)([^\/]*)(?:<\/[^\/]*script[^\/]*>)/g;
var file = process.argv[2]; 

fs.readFile(file, function(err, data){

		if(err) throw err;

		var scripts = [];
		var i = 0;
		
		//ensures the scrips run serially, else they run in the opposite order.
		var code;
				
		while(code = r.exec(data)){
			scripts[i] = code[1];
			i++;
		}

		// concatonate the scripts so they share variables
		// and can interact 'n stuff
		var exec = "";

		for(var j = 0; j < scripts.length; j++){
			exec = exec.concat(scripts[j],"\n");
		}

		var sandbox = {
	 		console: console,
			require: require,
			process: process,
			// FIXME: this is here so I can find my scripts
			// remeber my regex doesnt like / tokens in
			// the code
			__dirname: __dirname + '/'
		};

		// this works, but would not be very useful.
		// need to make it much more global.
	
		// I need some kind of HTML manipulation
		// lib; so I can start to add to html file
		// aim for simple API on this.

		console.log("Running scripts:\n");
		//check out node-html-encoder for a simple to HTML lib
		vm.runInNewContext(exec, sandbox);
		
		// need to override the default output 
		// methods via stdout and stderr so I 
		// can display these things on the site
});
