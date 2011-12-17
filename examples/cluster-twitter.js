var cluster = require("cluster"),
	http = require("http"),
	npp = require("npp"),
	cpus = require("os").cpus().length;

if(cluster.isMaster){
	for(var i = 0; i < cpus; i++)
		cluster.fork();

	cluster.on("death", function(worker){
		cluster.fork();
	});

	console.log("Listening on port 8000");
}else{
	http.createServer(function(req, res){
		npp("fixtures/twitter.html", res);
	}).listen(8000);
}

// This creates a cluster of node process to handle
// incoming requests, scale FTW
