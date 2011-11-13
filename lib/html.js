var fs = require("fs"),
		events = require("events"),
		util = require("util");
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
	
	//this._path = file;
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
			var args = Array.prototype.slice.call(arguments);
		
			self._queue.push(['_'+name, args]);
			self._cycle();
		};
	}

	// list of methods that you want to queue
	// anything that used this._dom needs to be wrapped
	// in async

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
		
		var options = { ignoreWhitespace: true,
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

util.inherits(html, events.EventEmitter);

/*
 * HTMLElement
 *
 * The obj is expected to be from the _dom ivar.
 *
 * @private
 */

function HTMLElement(obj){

	var self = this;
	
	// This keeps the reference to the original object in
	// the DOM tree, such that the changes I make to this 
	// will be reflected in the tree. 
	
	obj.type = obj.type !== undefined ? obj.type : "tag";
	obj.name = obj.name !== undefined ? obj.name : "";
	obj.attribs = obj.attribs !== undefined ? obj.attribs : {};
	obj.children = obj.children !== undefined ? obj.children : [];

	Object.keys(obj).forEach(function(element, index, array){
		self[element] = obj[element];
	});

	this.__defineGetter__("html", function(){	
		return self.children;
	});

	this.__defineSetter__("html", function(data, type){
		// this is more "compliant" with the jQuery standard
		self.children.splice(0, self.children.length);
		
		switch(typeof(data)){
			case 'string':
				self.children[0] = { data: data, type: type||"text" };
				break;
			case 'object':
				//FIXME: this is a little rough...
				self.children[0] = new HTMLElement(data); 
				break;
			default:
				throw new Error("Unhandeled exception!");
		}
	});

	return this;
}

HTMLElement.prototype.append = function(obj){
	this.children.splice(-1, 0, obj);
}

HTMLElement.prototype.prepend = function(obj){
	this.children.splice(0, 0, obj);
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

	e.forEach(function(element, i, array){
		e[i] = new HTMLElement(e[i]);
	});

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

/* Ideal API here: 
html.prototype.getElementById = function(id){	
	var v = dutil.getElements({ id : id }, this._dom, true);

	var e = new HTMLElement(v[0]);
	return e;
}

Problem is that the dom must be available which means that
parsing must be done, which is not possible to do without 
blocking.

*/

html.prototype.done = function(){

	var self = this;

	this.getElements({ tag_name: "script" }, function(scripts){
		scripts.forEach(function(elem, i, array){
			elem.html = "";
		});
		
		var recurse = function(obj){

			var attrstring = '';
			var attribs = obj.attribs;

			if(attribs){
				Object.keys(attribs).forEach(function(element, index, array){
					attrstring += " "+element+"="+"'"+attribs[element]+"'";
				});
			}
		
			self.emit('data', "<"+obj.name+attrstring+">");
			//perhaps add a process.nextTick() to the recurse?
			if(obj.children){
				obj.children.forEach(function(e, i, array){
					if(e.name)
						recurse(e);
					else
						self.emit('data', e.data);
				});
			}	
			self.emit('data', "</"+obj.name+">")
			//data += "\n</"+obj.name+">\n";
		}

		recurse(self._dom[0]);
		self.emit('end');
		//TODO:write the data to the stream or return
		//as a buffer if its a static file.
	});
};

html.prototype.createTag = function(name, data, attribs, children){

	if(typeof(data) === 'object'){	
		children = attribs;
		attribs = data;
		data = null;
	}

	var obj = { name: name, attribs: attribs, children: children };
	var htmlObj = new HTMLElement(obj);

	if(data){
		htmlObj.html = data;
	}

	return htmlObj;
}

// Exports

module.exports = html;