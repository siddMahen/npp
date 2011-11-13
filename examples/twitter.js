var http = require("http"),
		npp  = require("npp");

http.createServer(function(req, res){
	npp("./twitter.html", res);
}).listen(8000);

console.log("Server listening on port 8000");

// Now hit localhost:8000 in your favorite
// browser
