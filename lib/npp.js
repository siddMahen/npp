var vm = require("vm"),
    fs = require("fs"),
    cheerio = require("cheerio");

/*
 * Accepts a file and a stream
 * and streams the preprocessed HTML
 * back into the stream. Ending it
 * when the parsing is done.
 *
 * @public
 */

exports.fileCache = {};

// TODO: replace Hack with custom streamed renderer

module.exports = function npp(file){

	var args = Array.prototype.slice.call(arguments, 1);

	if(typeof file !== 'string' || !file)
		throw new Error("npp requires a file path");

	if(!args.length)
		throw new Error("npp requires either a "+
				"Writable Stream or a callback");

	var res = args.shift();
	var meta = args.length ? args.shift() : {};
	var callback = null;

	if(!res.writable){
		callback = res;
		meta = {};
	}

	var exec = function(data){

		var $ = cheerio.load(data);

        // Extract the embedded code
        var exec = "";
        var scripts = $('script[type~="npp"]');
        scripts.each(function(i, elem){ exec += $(this).text() });
        scripts.remove();

        // Create callbacks
		var onData, onEnd;

		if(!callback){
			onData = function(chunk){ res.write(chunk) };
			onEnd = function(){ res.end() };
		}else{
			var retData = "";

			onData = function(chunk){ retData += chunk };
			onEnd = function(){ callback(retData) };
		}

		// Hack
		$.done = function(){
			onData($.html());
			onEnd();
		}

		var sandbox = {
			require : require,
			nppmeta : meta,
			$ : $
		};

		// Add globals
		Object.keys(global).forEach(function(item){
			if(!sandbox[item]) sandbox[item] = global[item];
		});

		vm.runInNewContext(exec, sandbox);
	};

	// Check cache, else fetch the file
	if(exports.fileCache.file){
		var data = exports.fileCache.file;
		exec(data);
	}else{
		fs.readFile(file, function(err, data){
			if(err) throw err;
			exports.fileCache.file = data;
			exec(data);
		});
	}
};
