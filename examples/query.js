var http = require("http"),
	npp = require("npp");

http.createServer(function(req, res){
	// pass the request along to access 
	// properties such as the url and method
	npp("fixtures/query.html", res, { req: req });
}).listen(8000);

console.log("Listening on port 8000");
