var http = require("http"),
	npp = require("npp");

http.createServer(function(req, res){
	npp("fixtures/mongo.html", res, { req: req });
}).listen(8000);

console.log("Listening on port 8000");

/* 
 * This example requires the latest version
 * of the GridFS library, as well as mongodb
 * running on your computer
 */
