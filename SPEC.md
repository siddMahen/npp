# Specifications: npp

# Server Side Interface

`npp` should be implemented such that it can be
passed any Writable Stream or callback and return
the preprocessed HTML page, either by writing it
to the stream and closing the stream or through a
data parameter in the callback. For example:

	var http = require("http"),
		npp  = require("npp");

	http.createServer(function(req, res){
		npp("path/to/html.html", res);
	}).listen(8000);

Or:

	http.createServer(function(req, res){
		npp("path/to/html.html", function(data){
			//do something with the data
			res.write(data);
			//do something else
			res.end();
		});
	});

# HTML Side Interface

Keeping in terms with standard HTML style, `npp` merely
requires a `<script>` tag with `type` attribute set to
`npp`. This allows easy integration into HTML pages, and
allows the page to maintain it's structed. All commands
typed inside this area will be treated as V8 Javascript
and will have access to all node.js object and classes.
For example:

	<html>
		<head>
			<script type="npp">
			 var http = require("http");
			 // node.js calls
			 console.log(http);
			</script>
		</head>
		<body>
		// HTML...
		</body>
	</html>

The DOM will be accessed through a global singleton
available through each instance of the `<script>` tags.
It will have access to all of the DOM elements using
standardized DOM access implementations such as

	getElementById(id, callback)
	getElements(attribs, callback)

The DOM elements returned in the callbacks of these
methods will function similarly to jQuery elements,
(especially with regard to attribute access methods)
with a few additions. The DOM elements will most likely
be returned in callbacks due to the asyncronous nature
of the node.js event loop. Also, this will mean that
a special function, `done` or something of the like
will need to be called once the user is done editing the
markup, as it is impossible to trace the end of async
calls unless you write them. Therefore, the above HTML
would look more like:


	<html>
		<head>
			<script type="npp">
			 var http = require("http");
			 // node.js calls
			 console.log(http);
			 // tells npp we're done
			 global_singleton.done();
			</script>
		</head>
		<body>
		// HTML...
		</body>
	</html>


