# npp - node.js preprocessing

`npp` allows you to perform server side preprocessing
for HTML files, similar to PHP, except in javascript
and using the node.js framework.

## Example:

Suppose you want to preprocess an HTML page, called `epic.html`,
which looks a little like this:

	<html>
		<head>
			<script type="npp">
				nppdom.getElementById("epictag", function(epictag){
					epictag.html = "Examples are epic!";
					nppdom.done();
				});
			</script>
		</head>
		<body>
			<div id="epictag">
			</div>
		</body>
	</html>

It can be processed like this:

	var http = require("http"),
			npp = require("npp");

	http.createServer(function(req, res){
		npp("path/to/epic.html", res);
	}).listen(8000);

The code above simply gets the tag whose id is `epictag`,
and adds "Examples are epic!" as it's inner html. The new
HTML is then written to `res` and `res` is closed.

Note the `nppdom.done()` method, which is required
to tell `npp` your done editing the HTML.

This is a very basic example. See the examples folder and
the in code documentation for details.

## Installation and Usage:

Using `npm`:

	npm install npp

## Tests:

To run the tests, install `stest` using npm or install `npp` with the `--dev` key:

	npm install stest

Or

	npm install npp --dev

Then run:

	npm test npp

## License:

(New BSD License)

Copyright (c) 2011, Siddharth Mahendraker <siddharth_mahen@me.com>
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
* Neither the name of this software nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL Siddharth Mahendraker BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
