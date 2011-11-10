# Specifications for the HTML and HTLMElement classes

## HTML

This class should easily facilitate the retrival,
removal, rearrangment and creation of new HTML
DOM elements.

Methods to Emulate:

	getElementById(id, callback)
	getElements(attrs, callback)
	

## HTMLElement

This will be the object actually representing individual
instances of the DOM elements, oftentimes seen in 
the `callback` of HTML methods. 

Methods to Emulate:

	set/get html
	set/get attributes
	set/get 

