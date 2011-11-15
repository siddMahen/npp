var vm = require("vm"),
	fs = require("fs"),
	nppdom = require("./html.js");

var r = /(?:<script type="npp">)([^<>]*)(?:<\/script>)/g;

/*
 * Accepts a file and a stream 
 * and streams the preprocessed HTML
 * back into the stream. Ending it 
 * when the parsing is done.
 *
 * @public
 */

module.exports = function npp(file, stream){

	if(typeof file !== 'string' || !file)
		throw new Error("npp requires a file path");

	if(typeof stream !== 'function' && typeof stream !== 'object')
		throw new Error("npp requires either a stream or a callback");
		
	fs.readFile(file, function(err, data){
			if(err) throw err;
		
			var code;
			var exec = "";

			while(code = r.exec(data)){
				exec = exec.concat(code[1], "\n");
			}

			var dom = new nppdom(data);
			
			var onData;
			var onEnd;

			if(typeof(stream) !== "function"){
				onData = function(chunk){ stream.write(chunk); };
				onEnd = function(){ stream.end(); };
			}else{
				var retData = "";

				onData = function(chunk){ retData += chunk; };
				//stream treated as a callback
				onEnd = function(){ stream(retData); };
			}

			dom.on("data", onData);
			dom.on("end", onEnd);

			var sandbox = {
	 			console: console,
				require: require,
				process: process,
				__dirname: __dirname,
				nppdom : dom,
			};

			//check out node-html-encoder for a simple to HTML lib
			vm.runInNewContext(exec, sandbox);
	});
}
