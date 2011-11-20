var http = require("http"),
	npp = require("npp");

http.createServer(function(req, res){
	npp("fixtures/simple.html", res);
}).listen(8000);

console.log("Listening on port 8000");
