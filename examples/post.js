var http = require("http"),
	npp = require("npp");

http.createServer(function(req, res){
	var data = "";
	req.setEncoding("utf8");
	req.on("data", function(chunk){
		data += chunk;
	});

	req.on("end", function(){
		var meta = { req: req, post : data }
		npp("./fixtures/post.html", res, meta);
	});
}).listen(8000);

var opts = { 
	host: "localhost",
	port: 8000,
	method: "POST",
}

var req = http.request(opts, function(res){
	var d = "";
	res.setEncoding("utf8");
	res.on("data", function(chunk){
		d += chunk;
	});
	res.on("end", function(){
		console.log(d);
	});
});

req.write("Hello World!");
req.end();
