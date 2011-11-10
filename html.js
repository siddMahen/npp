
// Usage

/* HTMLElement Class
 *
 * ivars:
 *  - innerHTML
 *  - attributeDict
 * 
 * This class will be a subset of EE.
 *
 *
 * This program will create a tree like structure of the 
 * html data from a file.
 *
 * Everytime you add/delete/modify an element, it will listen
 * to the changes via an event and modify the 
 * underlying file for you. 
 *
 * This will allow us to dynamically change the HTML, using 
 * only a relatively small template.
 *
 * I don't exactly know how this is going to fare in terms of 
 * speed, however I do think this should do as well, if not
 * better than PHP. 
 *
 * Less code and faster engine. I hope....
 * 
 * Because the actual script running code is pretty sparse.
 */

var fs = require("fs"),
		events = require("events"),
		util = require("util"),
		htmlparser = require("htmlparser2"),
		dutil = htmlparser.DomUtils;

/*
 * @class HTML
 *
 * Provides an interface to access and manipulate
 * HTML data.
 *
 * @para {String} file
 *
 * @public
 */

function html(file){

	var self = this;
	
	this._path = file;
	this._state = 'starting';
	this._busy = false;
	this._queue = [];

	this._emitter = new events.EventEmitter();
	this._emitter.on('_op', function(){
		self._busy = false;
		if(self._queue.length) self._cycle();
	});

	var _impl = function(name){
		return function(){
			// FIXME: Shouldn't have to do this.
			var args = [];
			var i = 0;
			while(arguments[i]){
				args.push(arguments[i]);
				i++;
			}
			
			self._queue.push(['_'+name, args]);
			self._cycle();
		};
	}

	// list of methods that you want to queue

	var methods = ["getElements",
								 "getElementById"];

	methods.forEach(function(element, index, array){
		self[element] = _impl(element);
	});

	var _cycle = function(){
		if(self._state == 'started' && self._busy == false){	
			
			self._busy = true;
			var next_op = self._queue.shift();
			
			var func = self[next_op.shift()];
			var args = next_op.pop();
			
			func.apply(self, args);
		}
	};

	this._cycle = _cycle;

	fs.readFile(file, function(err, data){
		if(err) throw err;
			
		var options = { ignoreWhitespace: false,
										verbose: false,
										enforceEmptyTags: true };

		var handler = new htmlparser.DefaultHandler(function(err, dom){
			if(err) throw err;
			
			self._state = 'started';
			self._dom = dom;
			
			// start the de-queue process 
			if(self._queue.length) self._cycle();
		},options);

		var parser = new htmlparser.Parser(handler);
		parser.parseComplete(data);
	});
}

/*
 * HTMLElement
 *
 * The obj is expected to be from the _dom ivar.
 *
 * @private
 */

function HTMLElement(obj){

	if(typeof(obj) !== 'object')
		throw new Error("An object is required.");
	
	var self = this;
	
	// I can get away with this because it's a non 
	// prototyped object

	Object.keys(obj).forEach(function(element, index, array){
		self[element] = obj[element];
	});
	
	//take advantage of __nosuchMethod__
	// handle special cases here
	// then use no such method to begin 
	// defining cases which do not exist
	// ergo on demand and stuff
	
	this.__defineGetter__("innerHTML", function(){	
		var e = self.children[0];
		return e.data;
	});

	this.__defineSetter__("innerHTML", function(data){
		var e = self.children[0];
		e.data = data;
	});

	console.log(this);	

	return this;
}

/*
 * Returns an array of elements matching the attrs
 *
 * The callback takes the return array as it's only 
 * paramter.
 *
 * attr structure 
 *
 * { id 					: "newsfeed",
 *   tag_name			: "div",
 *   tag_type 		: "tag",
 *   tag_contains : "text",
 * }
 *
 * FIXME:not fully/well documented
 */

html.prototype._getElements = function(attr, callback){

	var e = dutil.getElements(attr, this._dom, true);
	
	for(var i = 0; i < e.length; i++){
		e[i] = new HTMLElement(e[i]);
	}

	return callback(e);
}

/*
 * Returns an element with the specified id
 *
 * The callback takes the return element as it's
 * only parameter.
 *
 */

html.prototype._getElementById = function(id, callback){
	
	var v = dutil.getElements({ id : id }, this._dom, true);
	
	var e = new HTMLElement(v[0]);
	return callback(e);
}
// make wrappers for the node-htmlparser DomUtils methods
// and use those instead of writting your own

html.prototype.makeHTML = function(callback){

	var self = this;
	var data = "";

	callback(data);
};

// Exports

module.exports = html;
