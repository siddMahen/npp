# Specifications and HTLMElement classes

## HTML

This class should easily facilitate the retrival,
removal, rearrangment and creation of new HTML
DOM elements.

Methods to Emulate:

	getElementById(id, callback)
	getElements(attrs, callback)
	

## HTMLElement

This will be the object actually representing individual
instances of the DOM elements, oftentimes seen in 
the `callback` of HTML methods. 

Methods to Emulate:

	set/get html
	set/get attributes
	set/get children 

## Final npp npm Package

This callback should accept a file or a stream as a
parameter and either return the npp-HTML file
run, or write the contents of the npp-HTML 
file to the stream. This relies mostly on the 
running of 

Example:

	var http = require("http"),
			npp = require("npp");

	http.createServer(function(req, res){
		npp("file.html",res);
	}).listen(8000);

	OR

	http.createServer(function(req, res){
		...
		// check the req
		var file = "path/to/some/file";
		...
		//check cache...
		var parsedHTML = npp(file);
		...
		//add to the cache if not existant
		res.end(parsedHTML);
	}).listen(8001);

Current Problems:

* Requires the user to use `nppdom.done()` when
finished with the script. Kinda annoying.
