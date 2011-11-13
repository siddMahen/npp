var http = require("http"),
		npp = require("./npp");


http.createServer(function(req, res){
	npp("simple.html", res);
}).listen(8002);

console.log("Server listening on port 8002");


