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
 * @para {Buffer|String} data
 *
 * The data will be parsed for HTML content.
 *
 * @public
 */

function nppdom(data){

	if(!data) throw new Error("FATAL ERROR: requires data...");
	
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
	this._doneOp = function(){ self._emitter.emit("_op"); };

	var _impl = function(name){
		return function(){
			var args = Array.prototype.slice.call(arguments);
		
			self._queue.push(['_'+name, args]);
			self._cycle();
		};
	};

	// list of methods that you want to queue
	// anything that used this._dom needs to be wrapped
	// in async

	var methods = ["getElements","getElementById"];

	methods.forEach(function(element, index, array){
			self[element] = _impl(element);
	});

	this._cycle = function(){
		if(self._state == 'started' && self._busy === false){	
					
			self._busy = true;
			var next_op = self._queue.shift();
			
			var func = self[next_op.shift()];
			var args = next_op.pop();
			
			func.apply(self, args);
		}
	};

	var options = { ignoreWhitespace: true,	verbose: false, enforceEmptyTags: true };
	
	var handler = new htmlparser.DefaultHandler(function(err, dom){
		if(err) throw err;
			
		self._state = 'started';
		self._dom = dom;
				
		// start the de-queue process 
		if(self._queue.length) self._cycle();
	},options);

	var parser = new htmlparser.Parser(handler);
	parser.parseComplete(data);
}

util.inherits(nppdom, events.EventEmitter);

/*
 * Returns an array of elements matching the attrs
 *
 * The callback takes the return array as it's only 
 * paramter.
 *
 * attr structure 
 *
 * { 
 * 	 id 		  : "newsfeed",
 *   tag_name	  : "div",
 *   tag_type 	  : "tag",
 *   tag_contains : "text",
 * }
 *
 * FIXME:not fully/well documented
 *
 * @api public
 */

nppdom.prototype._getElements = function(attr, callback){

	var e = dutil.getElements(attr, this._dom, true);
	e.forEach(function(element, i, array){
		e[i] = new HTMLElement(e[i]);
	});

	this._doneOp();
	return callback(e);
}

/*
 * Returns an element with the specified id
 *
 * @param {String} id
 * @param {Function} callback
 *
 * The callback takes the return element as it's
 * only parameter.
 *
 * @api public
 */

nppdom.prototype._getElementById = function(id, callback){
	
	var v = dutil.getElements({ id : id }, this._dom, true);
	var e = new HTMLElement(v[0]);

	this._doneOp();
	return callback(e);
}

/*
 * A convenience method which allows you to use
 * jQuery like selectors along with the $ to fetch
 * elements
 *
 * @param {String} elem
 * @param {Function} callback
 *
 * The elem parameter follows either of the following
 * forms:
 *
 * #some_id or <some_tag>
 *
 * The callback takes an error and the fetched
 * element as parameters.
 *
 * @api public
 */

var ridtest = /^#(.+)$/;
nppdom.prototype.$ = function(elem, callback){

	var res = ridtest.exec(elem);
	if(res !== null){
		if(res[1]){
			this.getElementById(res[1], function(obj){
				callback(null, obj);
			});
			return;
		}else{
			var err = new Error("Invalid id");
			callback(err, null);
		}	
	}else{
		elem = elem.replace("<","").replace(">","");
		this.getElements({ tag_name: elem }, function(obj){
			callback(null, obj[0]);
		});
	}
}

/*
 * Creates a tag based on the given parameters.
 * 
 * @param {String} name 
 * @param {String} data (optional)
 * @param {Object} attribs (optional)
 * @param {Array} children (optional)
 *
 * @api public
 */

nppdom.prototype.createTag = function(name, data, attribs, children){

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

/* 
 * Must be called to indicate to npp that
 * the HTML is done being manipulated
 *
 * @api public
 */

nppdom.prototype.done = function(){

	var self = this;
	
	// ensures that the _dom is accessible
	this.getElements({ tag_name: "html" }, function(){
		
		var recurse = function(obj){

			var attrstring = '';
			var attribs = obj.attribs;

			if(attribs){
				if(attribs.type == "npp") return;

				Object.keys(attribs).forEach(function(element, index, array){
					attrstring += " "+element+"="+"'"+attribs[element]+"'";
				});
			}
		
			self.emit('data', "<"+obj.name+attrstring+">");
			
			if(obj.children){
				obj.children.forEach(function(e, i, array){
					if(e.name)
						recurse(e);
					else
						self.emit('data', e.data);
				});
			}

			self.emit('data', "</"+obj.name+">");
		}

		recurse(self._dom[0]);
		self.emit('end');
	});
};

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
	
	obj.type = obj.type || "tag";
	obj.name = obj.name || "";
	obj.attribs = obj.attribs || {};
	obj.children = obj.children || [];
	
	Object.keys(obj).forEach(function(element, index, array){
		self[element] = obj[element];
	});
	
	/*
	this.type = obj.type;
	this.name = obj.name;
	this.attribs = obj.attribs;
	this.children = obj.children;
	*/

	this.__defineGetter__("html", function(){	
		return self.children;
	});

	this.__defineSetter__("html", function(data, type){
		// this is more "compliant"
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
				self.children[0] = { data: "", type: "text" };
				break;
		}
	});
}

/*
 * Appends an HTMLElement to another
 *
 * @param {Object} obj
 *
 * The obj should be an HTMLElement object
 * created using createTag or created with the 
 * same properties as an object created using
 * createTag.
 *
 * @api private
 */

HTMLElement.prototype.append = function(obj){
	this.children.splice(this.children.length, 0, obj);
}

/*
 * Prepends an HTMLElement to another
 *
 * @param {Object} obj
 *
 * See above for a more detailed explanation.
 *
 * @api private
 */

HTMLElement.prototype.prepend = function(obj){
	this.children.splice(0, 0, obj);
}

// Exports
module.exports = nppdom;
