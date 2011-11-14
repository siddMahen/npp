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

module.exports = npp = function(file, stream){

	if(typeof file !== 'string' || !file){
		throw new Error("npp requires a file path"+
			"as it's first parameter");
	}
		
	fs.readFile(file, function(err, data){
			if(err) throw err;
		
			var code;
			var exec = "";

			while(code = r.exec(data)){
				exec = exec.concat(code[1], "\n");
			}

			var dom = new nppdom(file);

			if(stream && typeof(stream) !== "function"){
				dom.on("data", function(chunk){
					stream.write(chunk);
				});

				dom.on("end", function(){
					stream.end();
				});
			}else{
				// in this case stream is treated as a 
				// callback
				
				var data = "";

				dom.on("data", function(chunk){
					data += chunk;
				});
				
				dom.on("end", function(){
					stream(data);	
				});
			}

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
