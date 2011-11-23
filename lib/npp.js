var vm = require("vm"),
	fs = require("fs"),
	nppdom = require("./nppdom.js");

var r = /(?:<script type=["']{1}npp["']{1}>)([^<>]*)(?:<\/script>)/g;

/*
 * Accepts a file and a stream 
 * and streams the preprocessed HTML
 * back into the stream. Ending it 
 * when the parsing is done.
 *
 * @public
 */

module.exports = function npp(file, res){

	var args = Array.prototype.slice.call(arguments, 1);

	if(typeof file !== 'string' || !file)
		throw new Error("npp requires a file path");
	
	if(!args.length)
		throw new Error("npp requires either a "+
				"Writable Stream or a callback");
	
	var res = args.shift();
	var meta = args.length ? args.shift() : {};
	var callback = null;

	if(!res.writable === true){
		callback = res;
		meta = {};
	}
		
	fs.readFile(file, function(err, data){
			if(err) throw err;
		
			var code, exec = "";

			while(code = r.exec(data)){
				exec = exec.concat(code[1], "\n");
			}

			var dom = new nppdom(data);
			
			var onData, onEnd;

			if(!callback){
				onData = function(chunk){ res.write(chunk); };
				onEnd = function(){ res.end(); };
			}else{
				var retData = "";

				onData = function(chunk){ retData += chunk; };
				onEnd = function(){ callback(retData); };
			}

			dom.on("data", onData);
			dom.on("end", onEnd);

			var sandbox = {
	 			console: console,
				require: require,
				process: process,
				__dirname: __dirname,
				nppdom : dom,
				nppmeta : meta
			};

			//check out node-html-encoder for a simple to HTML lib
			vm.runInNewContext(exec, sandbox);
	});
}
