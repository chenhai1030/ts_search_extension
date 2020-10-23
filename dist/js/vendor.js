(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["vendor"],{

/***/ "./node_modules/jcanvas/dist/jcanvas.js":
/*!**********************************************!*\
  !*** ./node_modules/jcanvas/dist/jcanvas.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/**
 * @license jCanvas v21.0.1
 * Copyright 2017 Caleb Evans
 * Released under the MIT license
 */
(function (jQuery, global, factory) {
	'use strict';

	if ( true && typeof module.exports === 'object') {
		module.exports = function (jQuery, w) {
			return factory(jQuery, w);
		};
	} else {
		factory(jQuery, global);
	}

// Pass this if window is not defined yet
}(typeof window !== 'undefined' ? window.jQuery : {}, typeof window !== 'undefined' ? window : this, function ($, window) {
'use strict';

var document = window.document,
	Image = window.Image,
	Array = window.Array,
	getComputedStyle = window.getComputedStyle,
	Math = window.Math,
	Number = window.Number,
	parseFloat = window.parseFloat;

// Define local aliases to frequently used properties
var defaults,
	// Aliases to jQuery methods
	extendObject = $.extend,
	inArray = $.inArray,
	typeOf = function (operand) {
		return Object.prototype.toString.call(operand)
			.slice(8, -1).toLowerCase();
	},
	isPlainObject = $.isPlainObject,
	// Math constants and functions
	PI = Math.PI,
	round = Math.round,
	abs = Math.abs,
	sin = Math.sin,
	cos = Math.cos,
	atan2 = Math.atan2,
	// The Array slice() method
	arraySlice = Array.prototype.slice,
	// jQuery's internal event normalization function
	jQueryEventFix = $.event.fix,
	// Object for storing a number of internal property maps
	maps = {},
	// jQuery internal caches
	caches = {
		dataCache: {},
		propCache: {},
		imageCache: {}
	},
	// Base transformations
	baseTransforms = {
		rotate: 0,
		scaleX: 1,
		scaleY: 1,
		translateX: 0,
		translateY: 0,
		// Store all previous masks
		masks: []
	},
	// Object for storing CSS-related properties
	css = {},
	tangibleEvents = [
		'mousedown',
		'mousemove',
		'mouseup',
		'mouseover',
		'mouseout',
		'touchstart',
		'touchmove',
		'touchend'
	];

// Constructor for creating objects that inherit from jCanvas preferences and defaults
function jCanvasObject(args) {
	var params = this,
		propName;
	// Copy the given parameters into new object
	for (propName in args) {
		// Do not merge defaults into parameters
		if (Object.prototype.hasOwnProperty.call(args, propName)) {
			params[propName] = args[propName];
		}
	}
	return params;
}

// jCanvas object in which global settings are other data are stored
var jCanvas = {
	// Events object for storing jCanvas event initiation functions
	events: {},
	// Object containing all jCanvas event hooks
	eventHooks: {},
	// Settings for enabling future jCanvas features
	future: {}
};

// jCanvas default property values
function jCanvasDefaults() {
	extendObject(this, jCanvasDefaults.baseDefaults);
}
jCanvasDefaults.baseDefaults = {
	align: 'center',
	arrowAngle: 90,
	arrowRadius: 0,
	autosave: true,
	baseline: 'middle',
	bringToFront: false,
	ccw: false,
	closed: false,
	compositing: 'source-over',
	concavity: 0,
	cornerRadius: 0,
	count: 1,
	cropFromCenter: true,
	crossOrigin: null,
	cursors: null,
	disableEvents: false,
	draggable: false,
	dragGroups: null,
	groups: null,
	data: null,
	dx: null,
	dy: null,
	end: 360,
	eventX: null,
	eventY: null,
	fillStyle: 'transparent',
	fontStyle: 'normal',
	fontSize: '12pt',
	fontFamily: 'sans-serif',
	fromCenter: true,
	height: null,
	imageSmoothing: true,
	inDegrees: true,
	intangible: false,
	index: null,
	letterSpacing: null,
	lineHeight: 1,
	layer: false,
	mask: false,
	maxWidth: null,
	miterLimit: 10,
	name: null,
	opacity: 1,
	r1: null,
	r2: null,
	radius: 0,
	repeat: 'repeat',
	respectAlign: false,
	restrictDragToAxis: null,
	rotate: 0,
	rounded: false,
	scale: 1,
	scaleX: 1,
	scaleY: 1,
	shadowBlur: 0,
	shadowColor: 'transparent',
	shadowStroke: false,
	shadowX: 0,
	shadowY: 0,
	sHeight: null,
	sides: 0,
	source: '',
	spread: 0,
	start: 0,
	strokeCap: 'butt',
	strokeDash: null,
	strokeDashOffset: 0,
	strokeJoin: 'miter',
	strokeStyle: 'transparent',
	strokeWidth: 1,
	sWidth: null,
	sx: null,
	sy: null,
	text: '',
	translate: 0,
	translateX: 0,
	translateY: 0,
	type: null,
	visible: true,
	width: null,
	x: 0,
	y: 0
};
defaults = new jCanvasDefaults();
jCanvasObject.prototype = defaults;

/* Internal helper methods */

// Determines if the given operand is a string
function isString(operand) {
	return (typeOf(operand) === 'string');
}

// Determines if the given operand is a function
function isFunction(operand) {
	return (typeOf(operand) === 'function');
}

// Determines if the given operand is numeric
function isNumeric(operand) {
	return !isNaN(Number(operand)) && !isNaN(parseFloat(operand));
}

// Get 2D context for the given canvas
function _getContext(canvas) {
	return (canvas && canvas.getContext ? canvas.getContext('2d') : null);
}

// Coerce designated number properties from strings to numbers
function _coerceNumericProps(props) {
	var propName, propType, propValue;
	// Loop through all properties in given property map
	for (propName in props) {
		if (Object.prototype.hasOwnProperty.call(props, propName)) {
			propValue = props[propName];
			propType = typeOf(propValue);
			// If property is non-empty string and value is numeric
			if (propType === 'string' && isNumeric(propValue) && propName !== 'text') {
				// Convert value to number
				props[propName] = parseFloat(propValue);
			}
		}
	}
	// Ensure value of text property is always a string
	if (props.text !== undefined) {
		props.text = String(props.text);
	}
}

// Clone the given transformations object
function _cloneTransforms(transforms) {
	// Clone the object itself
	transforms = extendObject({}, transforms);
	// Clone the object's masks array
	transforms.masks = transforms.masks.slice(0);
	return transforms;
}

// Save canvas context and update transformation stack
function _saveCanvas(ctx, data) {
	var transforms;
	ctx.save();
	transforms = _cloneTransforms(data.transforms);
	data.savedTransforms.push(transforms);
}

// Restore canvas context update transformation stack
function _restoreCanvas(ctx, data) {
	if (data.savedTransforms.length === 0) {
		// Reset transformation state if it can't be restored any more
		data.transforms = _cloneTransforms(baseTransforms);
	} else {
		// Restore canvas context
		ctx.restore();
		// Restore current transform state to the last saved state
		data.transforms = data.savedTransforms.pop();
	}
}

// Set the style with the given name
function _setStyle(canvas, ctx, params, styleName) {
	if (params[styleName]) {
		if (isFunction(params[styleName])) {
			// Handle functions
			ctx[styleName] = params[styleName].call(canvas, params);
		} else {
			// Handle string values
			ctx[styleName] = params[styleName];
		}
	}
}

// Set canvas context properties
function _setGlobalProps(canvas, ctx, params) {
	_setStyle(canvas, ctx, params, 'fillStyle');
	_setStyle(canvas, ctx, params, 'strokeStyle');
	ctx.lineWidth = params.strokeWidth;
	// Optionally round corners for paths
	if (params.rounded) {
		ctx.lineCap = ctx.lineJoin = 'round';
	} else {
		ctx.lineCap = params.strokeCap;
		ctx.lineJoin = params.strokeJoin;
		ctx.miterLimit = params.miterLimit;
	}
	// Reset strokeDash if null
	if (!params.strokeDash) {
		params.strokeDash = [];
	}
	// Dashed lines
	if (ctx.setLineDash) {
		ctx.setLineDash(params.strokeDash);
	}
	ctx.webkitLineDash = params.strokeDash;
	ctx.lineDashOffset = ctx.webkitLineDashOffset = ctx.mozDashOffset = params.strokeDashOffset;
	// Drop shadow
	ctx.shadowOffsetX = params.shadowX;
	ctx.shadowOffsetY = params.shadowY;
	ctx.shadowBlur = params.shadowBlur;
	ctx.shadowColor = params.shadowColor;
	// Opacity and composite operation
	ctx.globalAlpha = params.opacity;
	ctx.globalCompositeOperation = params.compositing;
	// Support cross-browser toggling of image smoothing
	if (params.imageSmoothing) {
		ctx.imageSmoothingEnabled = params.imageSmoothing;
	}
}

// Optionally enable masking support for this path
function _enableMasking(ctx, data, params) {
	if (params.mask) {
		// If jCanvas autosave is enabled
		if (params.autosave) {
			// Automatically save transformation state by default
			_saveCanvas(ctx, data);
		}
		// Clip the current path
		ctx.clip();
		// Keep track of current masks
		data.transforms.masks.push(params._args);
	}
}

// Restore individual shape transformation
function _restoreTransform(ctx, params) {
	// If shape has been transformed by jCanvas
	if (params._transformed) {
		// Restore canvas context
		ctx.restore();
	}
}

// Close current canvas path
function _closePath(canvas, ctx, params) {
	var data;

	// Optionally close path
	if (params.closed) {
		ctx.closePath();
	}

	if (params.shadowStroke && params.strokeWidth !== 0) {
		// Extend the shadow to include the stroke of a drawing

		// Add a stroke shadow by stroking before filling
		ctx.stroke();
		ctx.fill();
		// Ensure the below stroking does not inherit a shadow
		ctx.shadowColor = 'transparent';
		ctx.shadowBlur = 0;
		// Stroke over fill as usual
		ctx.stroke();

	} else {
		// If shadowStroke is not enabled, stroke & fill as usual

		ctx.fill();
		// Prevent extra shadow created by stroke (but only when fill is present)
		if (params.fillStyle !== 'transparent') {
			ctx.shadowColor = 'transparent';
		}
		if (params.strokeWidth !== 0) {
			// Only stroke if the stroke is not 0
			ctx.stroke();
		}

	}

	// Optionally close path
	if (!params.closed) {
		ctx.closePath();
	}

	// Restore individual shape transformation
	_restoreTransform(ctx, params);

	// Mask shape if chosen
	if (params.mask) {
		// Retrieve canvas data
		data = _getCanvasData(canvas);
		_enableMasking(ctx, data, params);
	}

}

// Transform (translate, scale, or rotate) shape
function _transformShape(canvas, ctx, params, width, height) {

	// Get conversion factor for radians
	params._toRad = (params.inDegrees ? (PI / 180) : 1);

	params._transformed = true;
	ctx.save();

	// Optionally measure (x, y) position from top-left corner
	if (!params.fromCenter && !params._centered && width !== undefined) {
		// Always draw from center unless otherwise specified
		if (height === undefined) {
			height = width;
		}
		params.x += width / 2;
		params.y += height / 2;
		params._centered = true;
	}
	// Optionally rotate shape
	if (params.rotate) {
		_rotateCanvas(ctx, params, null);
	}
	// Optionally scale shape
	if (params.scale !== 1 || params.scaleX !== 1 || params.scaleY !== 1) {
		_scaleCanvas(ctx, params, null);
	}
	// Optionally translate shape
	if (params.translate || params.translateX || params.translateY) {
		_translateCanvas(ctx, params, null);
	}

}

/* Plugin API */

// Extend jCanvas with a user-defined method
jCanvas.extend = function extend(plugin) {

	// Create plugin
	if (plugin.name) {
		// Merge properties with defaults
		if (plugin.props) {
			extendObject(defaults, plugin.props);
		}
		// Define plugin method
		$.fn[plugin.name] = function self(args) {
			var $canvases = this, canvas, e, ctx,
				params;

			for (e = 0; e < $canvases.length; e += 1) {
				canvas = $canvases[e];
				ctx = _getContext(canvas);
				if (ctx) {

					params = new jCanvasObject(args);
					_addLayer(canvas, params, args, self);

					_setGlobalProps(canvas, ctx, params);
					plugin.fn.call(canvas, ctx, params);

				}
			}
			return $canvases;
		};
		// Add drawing type to drawing map
		if (plugin.type) {
			maps.drawings[plugin.type] = plugin.name;
		}
	}
	return $.fn[plugin.name];
};

/* Layer API */

// Retrieved the stored jCanvas data for a canvas element
function _getCanvasData(canvas) {
	var dataCache = caches.dataCache, data;
	if (dataCache._canvas === canvas && dataCache._data) {

		// Retrieve canvas data from cache if possible
		data = dataCache._data;

	} else {

		// Retrieve canvas data from jQuery's internal data storage
		data = $.data(canvas, 'jCanvas');
		if (!data) {

			// Create canvas data object if it does not already exist
			data = {
				// The associated canvas element
				canvas: canvas,
				// Layers array
				layers: [],
				// Layer maps
				layer: {
					names: {},
					groups: {}
				},
				eventHooks: {},
				// All layers that intersect with the event coordinates (regardless of visibility)
				intersecting: [],
				// The topmost layer whose area contains the event coordinates
				lastIntersected: null,
				cursor: $(canvas).css('cursor'),
				// Properties for the current drag event
				drag: {
					layer: null,
					dragging: false
				},
				// Data for the current event
				event: {
					type: null,
					x: null,
					y: null
				},
				// Events which already have been bound to the canvas
				events: {},
				// The canvas's current transformation state
				transforms: _cloneTransforms(baseTransforms),
				savedTransforms: [],
				// Whether a layer is being animated or not
				animating: false,
				// The layer currently being animated
				animated: null,
				// The device pixel ratio
				pixelRatio: 1,
				// Whether pixel ratio transformations have been applied
				scaled: false,
				// Whether the canvas should be redrawn when a layer mousemove
				// event triggers (either directly, or indirectly via dragging)
				redrawOnMousemove: false
			};
			// Use jQuery to store canvas data
			$.data(canvas, 'jCanvas', data);

		}
		// Cache canvas data for faster retrieval
		dataCache._canvas = canvas;
		dataCache._data = data;

	}
	return data;
}

// Initialize all of a layer's associated jCanvas events
function _addLayerEvents($canvas, data, layer) {
	var eventName;
	// Determine which jCanvas events need to be bound to this layer
	for (eventName in jCanvas.events) {
		if (Object.prototype.hasOwnProperty.call(jCanvas.events, eventName)) {
			// If layer has callback function to complement it
			if (layer[eventName] || (layer.cursors && layer.cursors[eventName])) {
				// Bind event to layer
				_addExplicitLayerEvent($canvas, data, layer, eventName);
			}
		}
	}
	if (!data.events.mouseout) {
		$canvas.bind('mouseout.jCanvas', function () {
			// Retrieve the layer whose drag event was canceled
			var layer = data.drag.layer, l;
			// If cursor mouses out of canvas while dragging
			if (layer) {
				// Cancel drag
				data.drag = {};
				_triggerLayerEvent($canvas, data, layer, 'dragcancel');
			}
			// Loop through all layers
			for (l = 0; l < data.layers.length; l += 1) {
				layer = data.layers[l];
				// If layer thinks it's still being moused over
				if (layer._hovered) {
					// Trigger mouseout on layer
					$canvas.triggerLayerEvent(data.layers[l], 'mouseout');
				}
			}
			// Redraw layers
			$canvas.drawLayers();
		});
		// Indicate that an event handler has been bound
		data.events.mouseout = true;
	}
}

// Initialize the given event on the given layer
function _addLayerEvent($canvas, data, layer, eventName) {
	// Use touch events if appropriate
	// eventName = _getMouseEventName(eventName);
	// Bind event to layer
	jCanvas.events[eventName]($canvas, data);
	layer._event = true;
}

// Add a layer event that was explicitly declared in the layer's parameter map,
// excluding events added implicitly (e.g. mousemove event required by draggable
// layers)
function _addExplicitLayerEvent($canvas, data, layer, eventName) {
	_addLayerEvent($canvas, data, layer, eventName);
	if (eventName === 'mouseover' || eventName === 'mouseout' || eventName === 'mousemove') {
		data.redrawOnMousemove = true;
	}
}

// Enable drag support for this layer
function _enableDrag($canvas, data, layer) {
	var dragHelperEvents, eventName, i;
	// Only make layer draggable if necessary
	if (layer.draggable || layer.cursors) {

		// Organize helper events which enable drag support
		dragHelperEvents = ['mousedown', 'mousemove', 'mouseup'];

		// Bind each helper event to the canvas
		for (i = 0; i < dragHelperEvents.length; i += 1) {
			// Use touch events if appropriate
			eventName = dragHelperEvents[i];
			// Bind event
			_addLayerEvent($canvas, data, layer, eventName);
		}
		// Indicate that this layer has events bound to it
		layer._event = true;

	}
}

// Update a layer property map if property is changed
function _updateLayerName($canvas, data, layer, props) {
	var nameMap = data.layer.names;

	// If layer name is being added, not changed
	if (!props) {

		props = layer;

	} else {

		// Remove old layer name entry because layer name has changed
		if (props.name !== undefined && isString(layer.name) && layer.name !== props.name) {
			delete nameMap[layer.name];
		}

	}

	// Add new entry to layer name map with new name
	if (isString(props.name)) {
		nameMap[props.name] = layer;
	}
}

// Create or update the data map for the given layer and group type
function _updateLayerGroups($canvas, data, layer, props) {
	var groupMap = data.layer.groups,
		group, groupName, g,
		index, l;

	// If group name is not changing
	if (!props) {

		props = layer;

	} else {

		// Remove layer from all of its associated groups
		if (props.groups !== undefined && layer.groups !== null) {
			for (g = 0; g < layer.groups.length; g += 1) {
				groupName = layer.groups[g];
				group = groupMap[groupName];
				if (group) {
					// Remove layer from its old layer group entry
					for (l = 0; l < group.length; l += 1) {
						if (group[l] === layer) {
							// Keep track of the layer's initial index
							index = l;
							// Remove layer once found
							group.splice(l, 1);
							break;
						}
					}
					// Remove layer group entry if group is empty
					if (group.length === 0) {
						delete groupMap[groupName];
					}
				}
			}
		}

	}

	// Add layer to new group if a new group name is given
	if (props.groups !== undefined && props.groups !== null) {

		for (g = 0; g < props.groups.length; g += 1) {

			groupName = props.groups[g];

			group = groupMap[groupName];
			if (!group) {
				// Create new group entry if it doesn't exist
				group = groupMap[groupName] = [];
				group.name = groupName;
			}
			if (index === undefined) {
				// Add layer to end of group unless otherwise stated
				index = group.length;
			}
			// Add layer to its new layer group
			group.splice(index, 0, layer);

		}

	}
}

// Get event hooks object for the first selected canvas
$.fn.getEventHooks = function getEventHooks() {
	var $canvases = this, canvas, data,
		eventHooks = {};

	if ($canvases.length !== 0) {
		canvas = $canvases[0];
		data = _getCanvasData(canvas);
		eventHooks = data.eventHooks;
	}
	return eventHooks;
};

// Set event hooks for the selected canvases
$.fn.setEventHooks = function setEventHooks(eventHooks) {
	var $canvases = this, e,
		data;
	for (e = 0; e < $canvases.length; e += 1) {
		data = _getCanvasData($canvases[e]);
		extendObject(data.eventHooks, eventHooks);
	}
	return $canvases;
};

// Get jCanvas layers array
$.fn.getLayers = function getLayers(callback) {
	var $canvases = this, canvas, data,
		layers, layer, l,
		matching = [];

	if ($canvases.length !== 0) {

		canvas = $canvases[0];
		data = _getCanvasData(canvas);
		// Retrieve layers array for this canvas
		layers = data.layers;

		// If a callback function is given
		if (isFunction(callback)) {

			// Filter the layers array using the callback
			for (l = 0; l < layers.length; l += 1) {
				layer = layers[l];
				if (callback.call(canvas, layer)) {
					// Add layer to array of matching layers if test passes
					matching.push(layer);
				}
			}

		} else {
			// Otherwise, get all layers

			matching = layers;

		}

	}
	return matching;
};

// Get a single jCanvas layer object
$.fn.getLayer = function getLayer(layerId) {
	var $canvases = this, canvas,
		data, layers, layer, l,
		idType;

	if ($canvases.length !== 0) {

		canvas = $canvases[0];
		data = _getCanvasData(canvas);
		layers = data.layers;
		idType = typeOf(layerId);

		if (layerId && layerId.layer) {

			// Return the actual layer object if given
			layer = layerId;

		} else if (idType === 'number') {

			// Retrieve the layer using the given index

			// Allow for negative indices
			if (layerId < 0) {
				layerId = layers.length + layerId;
			}
			// Get layer with the given index
			layer = layers[layerId];

		} else if (idType === 'regexp') {

			// Get layer with the name that matches the given regex
			for (l = 0; l < layers.length; l += 1) {
				// Check if layer matches name
				if (isString(layers[l].name) && layers[l].name.match(layerId)) {
					layer = layers[l];
					break;
				}
			}

		} else {

			// Get layer with the given name
			layer = data.layer.names[layerId];

		}

	}
	return layer;
};

// Get all layers in the given group
$.fn.getLayerGroup = function getLayerGroup(groupId) {
	var $canvases = this, canvas, data,
		groups, groupName, group,
		idType = typeOf(groupId);

	if ($canvases.length !== 0) {

		canvas = $canvases[0];

		if (idType === 'array') {

			// Return layer group if given
			group = groupId;

		} else if (idType === 'regexp') {

			// Get canvas data
			data = _getCanvasData(canvas);
			groups = data.layer.groups;
			// Loop through all layers groups for this canvas
			for (groupName in groups) {
				// Find a group whose name matches the given regex
				if (groupName.match(groupId)) {
					group = groups[groupName];
					// Stop after finding the first matching group
					break;
				}
			}

		} else {

			// Find layer group with the given group name
			data = _getCanvasData(canvas);
			group = data.layer.groups[groupId];
		}

	}
	return group;
};

// Get index of layer in layers array
$.fn.getLayerIndex = function getLayerIndex(layerId) {
	var $canvases = this,
		layers = $canvases.getLayers(),
		layer = $canvases.getLayer(layerId);

	return inArray(layer, layers);
};

// Set properties of a layer
$.fn.setLayer = function setLayer(layerId, props) {
	var $canvases = this, $canvas, e,
		data, layer,
		propName, propValue, propType;

	for (e = 0; e < $canvases.length; e += 1) {
		$canvas = $($canvases[e]);
		data = _getCanvasData($canvases[e]);

		layer = $($canvases[e]).getLayer(layerId);
		if (layer) {

			// Update layer property maps
			_updateLayerName($canvas, data, layer, props);
			_updateLayerGroups($canvas, data, layer, props);

			_coerceNumericProps(props);

			// Merge properties with layer
			for (propName in props) {
				if (Object.prototype.hasOwnProperty.call(props, propName)) {
					propValue = props[propName];
					propType = typeOf(propValue);
					if (propType === 'object' && isPlainObject(propValue)) {
						// Clone objects
						layer[propName] = extendObject({}, propValue);
						_coerceNumericProps(layer[propName]);
					} else if (propType === 'array') {
						// Clone arrays
						layer[propName] = propValue.slice(0);
					} else if (propType === 'string') {
						if (propValue.indexOf('+=') === 0) {
							// Increment numbers prefixed with +=
							layer[propName] += parseFloat(propValue.substr(2));
						} else if (propValue.indexOf('-=') === 0) {
							// Decrement numbers prefixed with -=
							layer[propName] -= parseFloat(propValue.substr(2));
						} else if (!isNaN(propValue) && isNumeric(propValue) && propName !== 'text') {
							// Convert numeric values as strings to numbers
							layer[propName] = parseFloat(propValue);
						} else {
							// Otherwise, set given string value
							layer[propName] = propValue;
						}
					} else {
						// Otherwise, set given value
						layer[propName] = propValue;
					}
				}
			}

			// Update layer events
			_addLayerEvents($canvas, data, layer);
			_enableDrag($canvas, data, layer);

			// If layer's properties were changed
			if ($.isEmptyObject(props) === false) {
				_triggerLayerEvent($canvas, data, layer, 'change', props);
			}

		}
	}
	return $canvases;
};

// Set properties of all layers (optionally filtered by a callback)
$.fn.setLayers = function setLayers(props, callback) {
	var $canvases = this, $canvas, e,
		layers, l;
	for (e = 0; e < $canvases.length; e += 1) {
		$canvas = $($canvases[e]);

		layers = $canvas.getLayers(callback);
		// Loop through all layers
		for (l = 0; l < layers.length; l += 1) {
			// Set properties of each layer
			$canvas.setLayer(layers[l], props);
		}
	}
	return $canvases;
};

// Set properties of all layers in the given group
$.fn.setLayerGroup = function setLayerGroup(groupId, props) {
	var $canvases = this, $canvas, e,
		group, l;

	for (e = 0; e < $canvases.length; e += 1) {
		// Get layer group
		$canvas = $($canvases[e]);

		group = $canvas.getLayerGroup(groupId);
		// If group exists
		if (group) {

			// Loop through layers in group
			for (l = 0; l < group.length; l += 1) {
				// Merge given properties with layer
				$canvas.setLayer(group[l], props);
			}

		}
	}
	return $canvases;
};

// Move a layer to the given index in the layers array
$.fn.moveLayer = function moveLayer(layerId, index) {
	var $canvases = this, $canvas, e,
		data, layers, layer;

	for (e = 0; e < $canvases.length; e += 1) {
		$canvas = $($canvases[e]);
		data = _getCanvasData($canvases[e]);

		// Retrieve layers array and desired layer
		layers = data.layers;
		layer = $canvas.getLayer(layerId);
		if (layer) {

			// Ensure layer index is accurate
			layer.index = inArray(layer, layers);

			// Remove layer from its current placement
			layers.splice(layer.index, 1);
			// Add layer in its new placement
			layers.splice(index, 0, layer);

			// Handle negative indices
			if (index < 0) {
				index = layers.length + index;
			}
			// Update layer's stored index
			layer.index = index;

			_triggerLayerEvent($canvas, data, layer, 'move');

		}
	}
	return $canvases;
};

// Remove a jCanvas layer
$.fn.removeLayer = function removeLayer(layerId) {
	var $canvases = this, $canvas, e, data,
		layers, layer;

	for (e = 0; e < $canvases.length; e += 1) {
		$canvas = $($canvases[e]);
		data = _getCanvasData($canvases[e]);

		// Retrieve layers array and desired layer
		layers = $canvas.getLayers();
		layer = $canvas.getLayer(layerId);
		// Remove layer if found
		if (layer) {

			// Ensure layer index is accurate
			layer.index = inArray(layer, layers);
			// Remove layer and allow it to be re-added later
			layers.splice(layer.index, 1);
			delete layer._layer;

			// Update layer name map
			_updateLayerName($canvas, data, layer, {
				name: null
			});
			// Update layer group map
			_updateLayerGroups($canvas, data, layer, {
				groups: null
			});

			// Trigger 'remove' event
			_triggerLayerEvent($canvas, data, layer, 'remove');

		}
	}
	return $canvases;
};

// Remove all layers
$.fn.removeLayers = function removeLayers(callback) {
	var $canvases = this, $canvas, e,
		data, layers, layer, l;

	for (e = 0; e < $canvases.length; e += 1) {
		$canvas = $($canvases[e]);
		data = _getCanvasData($canvases[e]);
		layers = $canvas.getLayers(callback).slice(0);
		// Remove all layers individually
		for (l = 0; l < layers.length; l += 1) {
			layer = layers[l];
			$canvas.removeLayer(layer);
		}
		// Update layer maps
		data.layer.names = {};
		data.layer.groups = {};
	}
	return $canvases;
};

// Remove all layers in the group with the given ID
$.fn.removeLayerGroup = function removeLayerGroup(groupId) {
	var $canvases = this, $canvas, e, group, l;

	if (groupId !== undefined) {
		for (e = 0; e < $canvases.length; e += 1) {
			$canvas = $($canvases[e]);

			group = $canvas.getLayerGroup(groupId);
			// Remove layer group using given group name
			if (group) {

				// Clone groups array
				group = group.slice(0);

				// Loop through layers in group
				for (l = 0; l < group.length; l += 1) {
					$canvas.removeLayer(group[l]);
				}

			}
		}
	}
	return $canvases;
};

// Add an existing layer to a layer group
$.fn.addLayerToGroup = function addLayerToGroup(layerId, groupName) {
	var $canvases = this, $canvas, e,
		layer, groups = [groupName];

	for (e = 0; e < $canvases.length; e += 1) {
		$canvas = $($canvases[e]);
		layer = $canvas.getLayer(layerId);

		// If layer is not already in group
		if (layer.groups) {
			// Clone groups list
			groups = layer.groups.slice(0);
			// If layer is not already in group
			if (inArray(groupName, layer.groups) === -1) {
				// Add layer to group
				groups.push(groupName);
			}
		}
		// Update layer group maps
		$canvas.setLayer(layer, {
			groups: groups
		});

	}
	return $canvases;
};

// Remove an existing layer from a layer group
$.fn.removeLayerFromGroup = function removeLayerFromGroup(layerId, groupName) {
	var $canvases = this, $canvas, e,
		layer, groups = [],
		index;

	for (e = 0; e < $canvases.length; e += 1) {
		$canvas = $($canvases[e]);
		layer = $canvas.getLayer(layerId);

		if (layer.groups) {

			// Find index of layer in group
			index = inArray(groupName, layer.groups);

			// If layer is in group
			if (index !== -1) {

				// Clone groups list
				groups = layer.groups.slice(0);

				// Remove layer from group
				groups.splice(index, 1);

				// Update layer group maps
				$canvas.setLayer(layer, {
					groups: groups
				});

			}

		}

	}
	return $canvases;
};

// Get topmost layer that intersects with event coordinates
function _getIntersectingLayer(data) {
	var layer, i,
		mask, m;

	// Store the topmost layer
	layer = null;

	// Get the topmost layer whose visible area intersects event coordinates
	for (i = data.intersecting.length - 1; i >= 0; i -= 1) {

		// Get current layer
		layer = data.intersecting[i];

		// If layer has previous masks
		if (layer._masks) {

			// Search previous masks to ensure
			// layer is visible at event coordinates
			for (m = layer._masks.length - 1; m >= 0; m -= 1) {
				mask = layer._masks[m];
				// If mask does not intersect event coordinates
				if (!mask.intersects) {
					// Indicate that the mask does not
					// intersect event coordinates
					layer.intersects = false;
					// Stop searching previous masks
					break;
				}

			}

			// If event coordinates intersect all previous masks
			// and layer is not intangible
			if (layer.intersects && !layer.intangible) {
				// Stop searching for topmost layer
				break;
			}

		}

	}
	// If resulting layer is intangible
	if (layer && layer.intangible) {
		// Cursor does not intersect this layer
		layer = null;
	}
	return layer;
}

// Draw individual layer (internal)
function _drawLayer($canvas, ctx, layer, nextLayerIndex) {
	if (layer && layer.visible && layer._method) {
		if (nextLayerIndex) {
			layer._next = nextLayerIndex;
		} else {
			layer._next = null;
		}
		// If layer is an object, call its respective method
		if (layer._method) {
			layer._method.call($canvas, layer);
		}
	}
}

// Handle dragging of the currently-dragged layer
function _handleLayerDrag($canvas, data, eventType) {
	var layers, layer, l,
		drag, dragGroups,
		group, groupName, g,
		newX, newY;

	drag = data.drag;
	layer = drag.layer;
	dragGroups = (layer && layer.dragGroups) || [];
	layers = data.layers;

	if (eventType === 'mousemove' || eventType === 'touchmove') {
		// Detect when user is currently dragging layer

		if (!drag.dragging) {
			// Detect when user starts dragging layer

			// Signify that a layer on the canvas is being dragged
			drag.dragging = true;
			layer.dragging = true;

			// Optionally bring layer to front when drag starts
			if (layer.bringToFront) {
				// Remove layer from its original position
				layers.splice(layer.index, 1);
				// Bring layer to front
				// push() returns the new array length
				layer.index = layers.push(layer);
			}

			// Set drag properties for this layer
			layer._startX = layer.x;
			layer._startY = layer.y;
			layer._endX = layer._eventX;
			layer._endY = layer._eventY;

			// Trigger dragstart event
			_triggerLayerEvent($canvas, data, layer, 'dragstart');

		}

		if (drag.dragging) {

			// Calculate position after drag
			newX = layer._eventX - (layer._endX - layer._startX);
			newY = layer._eventY - (layer._endY - layer._startY);
			if (layer.updateDragX) {
				newX = layer.updateDragX.call($canvas[0], layer, newX);
			}
			if (layer.updateDragY) {
				newY = layer.updateDragY.call($canvas[0], layer, newY);
			}
			layer.dx = newX - layer.x;
			layer.dy = newY - layer.y;
			if (layer.restrictDragToAxis !== 'y') {
				layer.x = newX;
			}
			if (layer.restrictDragToAxis !== 'x') {
				layer.y = newY;
			}

			// Trigger drag event
			_triggerLayerEvent($canvas, data, layer, 'drag');

			// Move groups with layer on drag
			for (g = 0; g < dragGroups.length; g += 1) {

				groupName = dragGroups[g];
				group = data.layer.groups[groupName];
				if (layer.groups && group) {

					for (l = 0; l < group.length; l += 1) {
						if (group[l] !== layer) {
							if (layer.restrictDragToAxis !== 'y' && group[l].restrictDragToAxis !== 'y') {
								group[l].x += layer.dx;
							}
							if (layer.restrictDragToAxis !== 'x' && group[l].restrictDragToAxis !== 'x') {
								group[l].y += layer.dy;
							}
						}
					}

				}

			}

		}

	} else if (eventType === 'mouseup' || eventType === 'touchend') {
		// Detect when user stops dragging layer

		if (drag.dragging) {
			layer.dragging = false;
			drag.dragging = false;
			data.redrawOnMousemove = data.originalRedrawOnMousemove;
			// Trigger dragstop event
			_triggerLayerEvent($canvas, data, layer, 'dragstop');
		}

		// Cancel dragging
		data.drag = {};

	}
}


// List of CSS3 cursors that need to be prefixed
css.cursors = ['grab', 'grabbing', 'zoom-in', 'zoom-out'];

// Function to detect vendor prefix
// Modified version of David Walsh's implementation
// https://davidwalsh.name/vendor-prefix
css.prefix = (function () {
	var styles = getComputedStyle(document.documentElement, ''),
		pre = (arraySlice
			.call(styles)
			.join('')
			.match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
		)[1];
	return '-' + pre + '-';
})();

// Set cursor on canvas
function _setCursor($canvas, layer, eventType) {
	var cursor;
	if (layer.cursors) {
		// Retrieve cursor from cursors object if it exists
		cursor = layer.cursors[eventType];
	}
	// Prefix any CSS3 cursor
	if ($.inArray(cursor, css.cursors) !== -1) {
		cursor = css.prefix + cursor;
	}
	// If cursor is defined
	if (cursor) {
		// Set canvas cursor
		$canvas.css({
			cursor: cursor
		});
	}
}

// Reset cursor on canvas
function _resetCursor($canvas, data) {
	$canvas.css({
		cursor: data.cursor
	});
}

// Run the given event callback with the given arguments
function _runEventCallback($canvas, layer, eventType, callbacks, arg) {
	// Prevent callback from firing recursively
	if (callbacks[eventType] && layer._running && !layer._running[eventType]) {
		// Signify the start of callback execution for this event
		layer._running[eventType] = true;
		// Run event callback with the given arguments
		callbacks[eventType].call($canvas[0], layer, arg);
		// Signify the end of callback execution for this event
		layer._running[eventType] = false;
	}
}

// Determine if the given layer can "legally" fire the given event
function _layerCanFireEvent(layer, eventType) {
	// If events are disable and if
	// layer is tangible or event is not tangible
	return (!layer.disableEvents &&
		(!layer.intangible || $.inArray(eventType, tangibleEvents) === -1));
}

// Trigger the given event on the given layer
function _triggerLayerEvent($canvas, data, layer, eventType, arg) {
	// If layer can legally fire this event type
	if (_layerCanFireEvent(layer, eventType)) {

		// Do not set a custom cursor on layer mouseout
		if (eventType !== 'mouseout') {
			// Update cursor if one is defined for this event
			_setCursor($canvas, layer, eventType);
		}

		// Trigger the user-defined event callback
		_runEventCallback($canvas, layer, eventType, layer, arg);
		// Trigger the canvas-bound event hook
		_runEventCallback($canvas, layer, eventType, data.eventHooks, arg);
		// Trigger the global event hook
		_runEventCallback($canvas, layer, eventType, jCanvas.eventHooks, arg);

	}
}

// Manually trigger a layer event
$.fn.triggerLayerEvent = function (layer, eventType) {
	var $canvases = this, $canvas, e,
		data;

	for (e = 0; e < $canvases.length; e += 1) {
		$canvas = $($canvases[e]);
		data = _getCanvasData($canvases[e]);
		layer = $canvas.getLayer(layer);
		if (layer) {
			_triggerLayerEvent($canvas, data, layer, eventType);
		}
	}
	return $canvases;
};

// Draw layer with the given ID
$.fn.drawLayer = function drawLayer(layerId) {
	var $canvases = this, e, ctx,
		$canvas, layer;

	for (e = 0; e < $canvases.length; e += 1) {
		$canvas = $($canvases[e]);
		ctx = _getContext($canvases[e]);
		if (ctx) {
			layer = $canvas.getLayer(layerId);
			_drawLayer($canvas, ctx, layer);
		}
	}
	return $canvases;
};

// Draw all layers (or, if given, only layers starting at an index)
$.fn.drawLayers = function drawLayers(args) {
	var $canvases = this, $canvas, e, ctx,
		// Internal parameters for redrawing the canvas
		params = args || {},
		// Other variables
		layers, layer, lastLayer, l, index, lastIndex,
		data, eventCache, eventType, isImageLayer;

	// The layer index from which to start redrawing the canvas
	index = params.index;
	if (!index) {
		index = 0;
	}

	for (e = 0; e < $canvases.length; e += 1) {
		$canvas = $($canvases[e]);
		ctx = _getContext($canvases[e]);
		if (ctx) {

			data = _getCanvasData($canvases[e]);

			// Clear canvas first unless otherwise directed
			if (params.clear !== false) {
				$canvas.clearCanvas();
			}

			// If a completion callback was provided, save it to the canvas data
			// store so that the function can be passed to drawLayers() again
			// after any image layers have loaded
			if (params.complete) {
				data.drawLayersComplete = params.complete;
			}

			// Cache the layers array
			layers = data.layers;

			// Draw layers from first to last (bottom to top)
			for (l = index; l < layers.length; l += 1) {
				layer = layers[l];

				// Ensure layer index is up-to-date
				layer.index = l;

				// Prevent any one event from firing excessively
				if (params.resetFire) {
					layer._fired = false;
				}
				// Draw layer
				_drawLayer($canvas, ctx, layer, l + 1);
				// Store list of previous masks for each layer
				layer._masks = data.transforms.masks.slice(0);

				// Allow image layers to load before drawing successive layers
				if (layer._method === $.fn.drawImage && layer.visible) {
					isImageLayer = true;
					break;
				}

			}

			// If layer is an image layer
			if (isImageLayer) {
				// Stop and wait for drawImage() to resume drawLayers()
				continue;
			}

			// Store the latest
			lastIndex = l;

			// Run completion callback (if provided) once all layers have drawn
			if (params.complete) {
				params.complete.call($canvases[e]);
				delete data.drawLayersComplete;
			}

			// Get first layer that intersects with event coordinates
			layer = _getIntersectingLayer(data);

			eventCache = data.event;
			eventType = eventCache.type;

			// If jCanvas has detected a dragstart
			if (data.drag.layer) {
				// Handle dragging of layer
				_handleLayerDrag($canvas, data, eventType);
			}

			// Manage mouseout event
			lastLayer = data.lastIntersected;
			if (lastLayer !== null && layer !== lastLayer && lastLayer._hovered && !lastLayer._fired && !data.drag.dragging) {

				data.lastIntersected = null;
				lastLayer._fired = true;
				lastLayer._hovered = false;
				_triggerLayerEvent($canvas, data, lastLayer, 'mouseout');
				_resetCursor($canvas, data);

			}

			if (layer) {

				// Use mouse event callbacks if no touch event callbacks are given
				if (!layer[eventType]) {
					eventType = _getMouseEventName(eventType);
				}

				// Check events for intersecting layer
				if (layer._event && layer.intersects) {

					data.lastIntersected = layer;

					// Detect mouseover events
					if ((layer.mouseover || layer.mouseout || layer.cursors) && !data.drag.dragging) {

						if (!layer._hovered && !layer._fired) {

							// Prevent events from firing excessively
							layer._fired = true;
							layer._hovered = true;
							_triggerLayerEvent($canvas, data, layer, 'mouseover');

						}

					}

					// Detect any other mouse event
					if (!layer._fired) {

						// Prevent event from firing twice unintentionally
						layer._fired = true;
						eventCache.type = null;

						_triggerLayerEvent($canvas, data, layer, eventType);

					}

					// Use the mousedown event to start drag
					if (layer.draggable && !layer.disableEvents && (eventType === 'mousedown' || eventType === 'touchstart')) {

						// Keep track of drag state
						data.drag.layer = layer;
						data.originalRedrawOnMousemove = data.redrawOnMousemove;
						data.redrawOnMousemove = true;

					}

				}

			}

			// If cursor is not intersecting with any layer
			if (layer === null && !data.drag.dragging) {
				// Reset cursor to previous state
				_resetCursor($canvas, data);
			}

			// If the last layer has been drawn
			if (lastIndex === layers.length) {

				// Reset list of intersecting layers
				data.intersecting.length = 0;
				// Reset transformation stack
				data.transforms = _cloneTransforms(baseTransforms);
				data.savedTransforms.length = 0;

			}

		}
	}
	return $canvases;
};

// Add a jCanvas layer (internal)
function _addLayer(canvas, params, args, method) {
	var $canvas, data,
		layers, layer = (params._layer ? args : params);

	// Store arguments object for later use
	params._args = args;

	// Convert all draggable drawings into jCanvas layers
	if (params.draggable || params.dragGroups) {
		params.layer = true;
		params.draggable = true;
	}

	// Determine the layer's type using the available information
	if (!params._method) {
		if (method) {
			params._method = method;
		} else if (params.method) {
			params._method = $.fn[params.method];
		} else if (params.type) {
			params._method = $.fn[maps.drawings[params.type]];
		}
	}

	// If layer hasn't been added yet
	if (params.layer && !params._layer) {
		// Add layer to canvas

		$canvas = $(canvas);

		data = _getCanvasData(canvas);
		layers = data.layers;

		// Do not add duplicate layers of same name
		if (layer.name === null || (isString(layer.name) && data.layer.names[layer.name] === undefined)) {

			// Convert number properties to numbers
			_coerceNumericProps(params);

			// Ensure layers are unique across canvases by cloning them
			layer = new jCanvasObject(params);
			layer.canvas = canvas;
			// Indicate that this is a layer for future checks
			layer.layer = true;
			layer._layer = true;
			layer._running = {};
			// If layer stores user-defined data
			if (layer.data !== null) {
				// Clone object
				layer.data = extendObject({}, layer.data);
			} else {
				// Otherwise, create data object
				layer.data = {};
			}
			// If layer stores a list of associated groups
			if (layer.groups !== null) {
				// Clone list
				layer.groups = layer.groups.slice(0);
			} else {
				// Otherwise, create empty list
				layer.groups = [];
			}

			// Update layer group maps
			_updateLayerName($canvas, data, layer);
			_updateLayerGroups($canvas, data, layer);

			// Check for any associated jCanvas events and enable them
			_addLayerEvents($canvas, data, layer);

			// Optionally enable drag-and-drop support and cursor support
			_enableDrag($canvas, data, layer);

			// Copy _event property to parameters object
			params._event = layer._event;

			// Calculate width/height for text layers
			if (layer._method === $.fn.drawText) {
				$canvas.measureText(layer);
			}

			// Add layer to end of array if no index is specified
			if (layer.index === null) {
				layer.index = layers.length;
			}

			// Add layer to layers array at specified index
			layers.splice(layer.index, 0, layer);

			// Store layer on parameters object
			params._args = layer;

			// Trigger an 'add' event
			_triggerLayerEvent($canvas, data, layer, 'add');

		}

	} else if (!params.layer) {
		_coerceNumericProps(params);
	}

	return layer;
}

// Add a jCanvas layer
$.fn.addLayer = function addLayer(args) {
	var $canvases = this, e, ctx,
		params;

	for (e = 0; e < $canvases.length; e += 1) {
		ctx = _getContext($canvases[e]);
		if (ctx) {

			params = new jCanvasObject(args);
			params.layer = true;
			_addLayer($canvases[e], params, args);

		}
	}
	return $canvases;
};

/* Animation API */

// Define properties used in both CSS and jCanvas
css.props = [
	'width',
	'height',
	'opacity',
	'lineHeight'
];
css.propsObj = {};

// Hide/show jCanvas/CSS properties so they can be animated using jQuery
function _showProps(obj) {
	var cssProp, p;
	for (p = 0; p < css.props.length; p += 1) {
		cssProp = css.props[p];
		obj[cssProp] = obj['_' + cssProp];
	}
}
function _hideProps(obj, reset) {
	var cssProp, p;
	for (p = 0; p < css.props.length; p += 1) {
		cssProp = css.props[p];
		// Hide property using same name with leading underscore
		if (obj[cssProp] !== undefined) {
			obj['_' + cssProp] = obj[cssProp];
			css.propsObj[cssProp] = true;
			if (reset) {
				delete obj[cssProp];
			}
		}
	}
}

// Evaluate property values that are functions
function _parseEndValues(canvas, layer, endValues) {
	var propName, propValue,
		subPropName, subPropValue;
	// Loop through all properties in map of end values
	for (propName in endValues) {
		if (Object.prototype.hasOwnProperty.call(endValues, propName)) {
			propValue = endValues[propName];
			// If end value is function
			if (isFunction(propValue)) {
				// Call function and use its value as the end value
				endValues[propName] = propValue.call(canvas, layer, propName);
			}
			// If end value is an object
			if (typeOf(propValue) === 'object' && isPlainObject(propValue)) {
				// Prepare to animate properties in object
				for (subPropName in propValue) {
					if (Object.prototype.hasOwnProperty.call(propValue, subPropName)) {
						subPropValue = propValue[subPropName];
						// Store property's start value at top-level of layer
						if (layer[propName] !== undefined) {
							layer[propName + '.' + subPropName] = layer[propName][subPropName];
							// Store property's end value at top-level of end values map
							endValues[propName + '.' + subPropName] = subPropValue;
						}
					}
				}
				// Delete sub-property of object as it's no longer needed
				delete endValues[propName];
			}
		}
	}
	return endValues;
}

// Remove sub-property aliases from layer object
function _removeSubPropAliases(layer) {
	var propName;
	for (propName in layer) {
		if (Object.prototype.hasOwnProperty.call(layer, propName)) {
			if (propName.indexOf('.') !== -1) {
				delete layer[propName];
			}
		}
	}
}

// Convert a color value to an array of RGB values
function _colorToRgbArray(color) {
	var originalColor, elem,
		rgb = [],
		multiple = 1;

	// Deal with complete transparency
	if (color === 'transparent') {
		color = 'rgba(0, 0, 0, 0)';
	} else if (color.match(/^([a-z]+|#[0-9a-f]+)$/gi)) {
		// Deal with hexadecimal colors and color names
		elem = document.head;
		originalColor = elem.style.color;
		elem.style.color = color;
		color = $.css(elem, 'color');
		elem.style.color = originalColor;
	}
	// Parse RGB string
	if (color.match(/^rgb/gi)) {
		rgb = color.match(/(\d+(\.\d+)?)/gi);
		// Deal with RGB percentages
		if (color.match(/%/gi)) {
			multiple = 2.55;
		}
		rgb[0] *= multiple;
		rgb[1] *= multiple;
		rgb[2] *= multiple;
		// Ad alpha channel if given
		if (rgb[3] !== undefined) {
			rgb[3] = parseFloat(rgb[3]);
		} else {
			rgb[3] = 1;
		}
	}
	return rgb;
}

// Animate a hex or RGB color
function _animateColor(fx) {
	var n = 3,
		i;
	// Only parse start and end colors once
	if (typeOf(fx.start) !== 'array') {
		fx.start = _colorToRgbArray(fx.start);
		fx.end = _colorToRgbArray(fx.end);
	}
	fx.now = [];

	// If colors are RGBA, animate transparency
	if (fx.start[3] !== 1 || fx.end[3] !== 1) {
		n = 4;
	}

	// Calculate current frame for red, green, blue, and alpha
	for (i = 0; i < n; i += 1) {
		fx.now[i] = fx.start[i] + ((fx.end[i] - fx.start[i]) * fx.pos);
		// Only the red, green, and blue values must be integers
		if (i < 3) {
			fx.now[i] = round(fx.now[i]);
		}
	}
	if (fx.start[3] !== 1 || fx.end[3] !== 1) {
		// Only use RGBA if RGBA colors are given
		fx.now = 'rgba(' + fx.now.join(',') + ')';
	} else {
		// Otherwise, animate as solid colors
		fx.now.slice(0, 3);
		fx.now = 'rgb(' + fx.now.join(',') + ')';
	}
	// Animate colors for both canvas layers and DOM elements
	if (fx.elem.nodeName) {
		fx.elem.style[fx.prop] = fx.now;
	} else {
		fx.elem[fx.prop] = fx.now;
	}
}

// Animate jCanvas layer
$.fn.animateLayer = function animateLayer() {
	var $canvases = this, $canvas, e, ctx,
		args = arraySlice.call(arguments, 0),
		data, layer, props;

	// Deal with all cases of argument placement
	/*
		0. layer name/index
		1. properties
		2. duration/options
		3. easing
		4. complete function
		5. step function
	*/

	if (typeOf(args[2]) === 'object') {

		// Accept an options object for animation
		args.splice(2, 0, args[2].duration || null);
		args.splice(3, 0, args[3].easing || null);
		args.splice(4, 0, args[4].complete || null);
		args.splice(5, 0, args[5].step || null);

	} else {

		if (args[2] === undefined) {
			// If object is the last argument
			args.splice(2, 0, null);
			args.splice(3, 0, null);
			args.splice(4, 0, null);
		} else if (isFunction(args[2])) {
			// If callback comes after object
			args.splice(2, 0, null);
			args.splice(3, 0, null);
		}
		if (args[3] === undefined) {
			// If duration is the last argument
			args[3] = null;
			args.splice(4, 0, null);
		} else if (isFunction(args[3])) {
			// If callback comes after duration
			args.splice(3, 0, null);
		}

	}

	// Run callback function when animation completes
	function complete($canvas, data, layer) {

		return function () {

			_showProps(layer);
			_removeSubPropAliases(layer);

			// Prevent multiple redraw loops
			if (!data.animating || data.animated === layer) {
				// Redraw layers on last frame
				$canvas.drawLayers();
			}

			// Signify the end of an animation loop
			layer._animating = false;
			data.animating = false;
			data.animated = null;

			// If callback is defined
			if (args[4]) {
				// Run callback at the end of the animation
				args[4].call($canvas[0], layer);
			}

			_triggerLayerEvent($canvas, data, layer, 'animateend');

		};

	}

	// Redraw layers on every frame of the animation
	function step($canvas, data, layer) {

		return function (now, fx) {
			var parts, propName, subPropName,
				hidden = false;

			// If animated property has been hidden
			if (fx.prop[0] === '_') {
				hidden = true;
				// Unhide property temporarily
				fx.prop = fx.prop.replace('_', '');
				layer[fx.prop] = layer['_' + fx.prop];
			}

			// If animating property of sub-object
			if (fx.prop.indexOf('.') !== -1) {
				parts = fx.prop.split('.');
				propName = parts[0];
				subPropName = parts[1];
				if (layer[propName]) {
					layer[propName][subPropName] = fx.now;
				}
			}

			// Throttle animation to improve efficiency
			if (layer._pos !== fx.pos) {

				layer._pos = fx.pos;

				// Signify the start of an animation loop
				if (!layer._animating && !data.animating) {
					layer._animating = true;
					data.animating = true;
					data.animated = layer;
				}

				// Prevent multiple redraw loops
				if (!data.animating || data.animated === layer) {
					// Redraw layers for every frame
					$canvas.drawLayers();
				}

			}

			// If callback is defined
			if (args[5]) {
				// Run callback for each step of animation
				args[5].call($canvas[0], now, fx, layer);
			}

			_triggerLayerEvent($canvas, data, layer, 'animate', fx);

			// If property should be hidden during animation
			if (hidden) {
				// Hide property again
				fx.prop = '_' + fx.prop;
			}

		};

	}

	for (e = 0; e < $canvases.length; e += 1) {
		$canvas = $($canvases[e]);
		ctx = _getContext($canvases[e]);
		if (ctx) {

			data = _getCanvasData($canvases[e]);

			// If a layer object was passed, use it the layer to be animated
			layer = $canvas.getLayer(args[0]);

			// Ignore layers that are functions
			if (layer && layer._method !== $.fn.draw) {

				// Do not modify original object
				props = extendObject({}, args[1]);

				props = _parseEndValues($canvases[e], layer, props);

				// Bypass jQuery CSS Hooks for CSS properties (width, opacity, etc.)
				_hideProps(props, true);
				_hideProps(layer);

				// Fix for jQuery's vendor prefixing support, which affects how width/height/opacity are animated
				layer.style = css.propsObj;

				// Animate layer
				$(layer).animate(props, {
					duration: args[2],
					easing: ($.easing[args[3]] ? args[3] : null),
					// When animation completes
					complete: complete($canvas, data, layer),
					// Redraw canvas for every animation frame
					step: step($canvas, data, layer)
				});
				_triggerLayerEvent($canvas, data, layer, 'animatestart');
			}

		}
	}
	return $canvases;
};

// Animate all layers in a layer group
$.fn.animateLayerGroup = function animateLayerGroup(groupId) {
	var $canvases = this, $canvas, e,
		args = arraySlice.call(arguments, 0),
		group, l;
	for (e = 0; e < $canvases.length; e += 1) {
		$canvas = $($canvases[e]);
		group = $canvas.getLayerGroup(groupId);
		if (group) {

			// Animate all layers in the group
			for (l = 0; l < group.length; l += 1) {

				// Replace first argument with layer
				args[0] = group[l];
				$canvas.animateLayer.apply($canvas, args);

			}

		}
	}
	return $canvases;
};

// Delay layer animation by a given number of milliseconds
$.fn.delayLayer = function delayLayer(layerId, duration) {
	var $canvases = this, $canvas, e,
		data, layer;
	duration = duration || 0;

	for (e = 0; e < $canvases.length; e += 1) {
		$canvas = $($canvases[e]);
		data = _getCanvasData($canvases[e]);
		layer = $canvas.getLayer(layerId);
		// If layer exists
		if (layer) {
			// Delay animation
			$(layer).delay(duration);
			_triggerLayerEvent($canvas, data, layer, 'delay');
		}
	}
	return $canvases;
};

// Delay animation all layers in a layer group
$.fn.delayLayerGroup = function delayLayerGroup(groupId, duration) {
	var $canvases = this, $canvas, e,
		group, layer, l;
	duration = duration || 0;

	for (e = 0; e < $canvases.length; e += 1) {
		$canvas = $($canvases[e]);

		group = $canvas.getLayerGroup(groupId);
		// Delay all layers in the group
		if (group) {

			for (l = 0; l < group.length; l += 1) {
				// Delay each layer in the group
				layer = group[l];
				$canvas.delayLayer(layer, duration);
			}

		}
	}
	return $canvases;
};

// Stop layer animation
$.fn.stopLayer = function stopLayer(layerId, clearQueue) {
	var $canvases = this, $canvas, e,
		data, layer;

	for (e = 0; e < $canvases.length; e += 1) {
		$canvas = $($canvases[e]);
		data = _getCanvasData($canvases[e]);
		layer = $canvas.getLayer(layerId);
		// If layer exists
		if (layer) {
			// Stop animation
			$(layer).stop(clearQueue);
			_triggerLayerEvent($canvas, data, layer, 'stop');
		}
	}
	return $canvases;
};

// Stop animation of all layers in a layer group
$.fn.stopLayerGroup = function stopLayerGroup(groupId, clearQueue) {
	var $canvases = this, $canvas, e,
		group, layer, l;

	for (e = 0; e < $canvases.length; e += 1) {
		$canvas = $($canvases[e]);

		group = $canvas.getLayerGroup(groupId);
		// Stop all layers in the group
		if (group) {

			for (l = 0; l < group.length; l += 1) {
				// Stop each layer in the group
				layer = group[l];
				$canvas.stopLayer(layer, clearQueue);
			}

		}
	}
	return $canvases;
};

// Enable animation for color properties
function _supportColorProps(props) {
	var p;
	for (p = 0; p < props.length; p += 1) {
		$.fx.step[props[p]] = _animateColor;
	}
}

// Enable animation for color properties
_supportColorProps([
	'color',
	'backgroundColor',
	'borderColor',
	'borderTopColor',
	'borderRightColor',
	'borderBottomColor',
	'borderLeftColor',
	'fillStyle',
	'outlineColor',
	'strokeStyle',
	'shadowColor'
]);

/* Event API */

// Map standard mouse events to touch events
maps.touchEvents = {
	'mousedown': 'touchstart',
	'mouseup': 'touchend',
	'mousemove': 'touchmove'
};
// Map standard touch events to mouse events
maps.mouseEvents = {
	'touchstart': 'mousedown',
	'touchend': 'mouseup',
	'touchmove': 'mousemove'
};

// Convert mouse event name to a corresponding touch event name (if possible)
function _getTouchEventName(eventName) {
	// Detect touch event support
	if (maps.touchEvents[eventName]) {
		eventName = maps.touchEvents[eventName];
	}
	return eventName;
}
// Convert touch event name to a corresponding mouse event name
function _getMouseEventName(eventName) {
	if (maps.mouseEvents[eventName]) {
		eventName = maps.mouseEvents[eventName];
	}
	return eventName;
}

// Bind event to jCanvas layer using standard jQuery events
function _createEvent(eventName) {

	jCanvas.events[eventName] = function ($canvas, data) {
		var helperEventName, touchEventName, eventCache;

		// Retrieve canvas's event cache
		eventCache = data.event;

		// Both mouseover/mouseout events will be managed by a single mousemove event
		helperEventName = (eventName === 'mouseover' || eventName === 'mouseout') ? 'mousemove' : eventName;
		touchEventName = _getTouchEventName(helperEventName);

		function eventCallback(event) {
			// Cache current mouse position and redraw layers
			eventCache.x = event.offsetX;
			eventCache.y = event.offsetY;
			eventCache.type = helperEventName;
			eventCache.event = event;
			// Redraw layers on every trigger of the event; don't redraw if at
			// least one layer is draggable and there are no layers with
			// explicit mouseover/mouseout/mousemove events
			if (event.type !== 'mousemove' || data.redrawOnMousemove || data.drag.dragging) {
				$canvas.drawLayers({
					resetFire: true
				});
			}
			// Prevent default event behavior
			event.preventDefault();
		}

		// Ensure the event is not bound more than once
		if (!data.events[helperEventName]) {
			// Bind one canvas event which handles all layer events of that type
			if (touchEventName !== helperEventName) {
				$canvas.bind(helperEventName + '.jCanvas ' + touchEventName + '.jCanvas', eventCallback);
			} else {
				$canvas.bind(helperEventName + '.jCanvas', eventCallback);
			}
			// Prevent this event from being bound twice
			data.events[helperEventName] = true;
		}
	};
}
function _createEvents(eventNames) {
	var n;
	for (n = 0; n < eventNames.length; n += 1) {
		_createEvent(eventNames[n]);
	}
}
// Populate jCanvas events object with some standard events
_createEvents([
	'click',
	'dblclick',
	'mousedown',
	'mouseup',
	'mousemove',
	'mouseover',
	'mouseout',
	'touchstart',
	'touchmove',
	'touchend',
	'pointerdown',
	'pointermove',
	'pointerup',
	'contextmenu'
]);

// Check if event fires when a drawing is drawn
function _detectEvents(canvas, ctx, params) {
	var layer, data, eventCache, intersects,
		transforms, x, y, angle;

	// Use the layer object stored by the given parameters object
	layer = params._args;
	// Canvas must have event bindings
	if (layer) {

		data = _getCanvasData(canvas);
		eventCache = data.event;
		if (eventCache.x !== null && eventCache.y !== null) {
			// Respect user-defined pixel ratio
			x = eventCache.x * data.pixelRatio;
			y = eventCache.y * data.pixelRatio;
			// Determine if the given coordinates are in the current path
			intersects = ctx.isPointInPath(x, y) || (ctx.isPointInStroke && ctx.isPointInStroke(x, y));
		}
		transforms = data.transforms;

		// Allow callback functions to retrieve the mouse coordinates
		layer.eventX = eventCache.x;
		layer.eventY = eventCache.y;
		layer.event = eventCache.event;

		// Adjust coordinates to match current canvas transformation

		// Keep track of some transformation values
		angle = data.transforms.rotate;
		x = layer.eventX;
		y = layer.eventY;

		if (angle !== 0) {
			// Rotate coordinates if coordinate space has been rotated
			layer._eventX = (x * cos(-angle)) - (y * sin(-angle));
			layer._eventY = (y * cos(-angle)) + (x * sin(-angle));
		} else {
			// Otherwise, no calculations need to be made
			layer._eventX = x;
			layer._eventY = y;
		}

		// Scale coordinates
		layer._eventX /= transforms.scaleX;
		layer._eventY /= transforms.scaleY;

		// If layer intersects with cursor
		if (intersects) {
			// Add it to a list of layers that intersect with cursor
			data.intersecting.push(layer);
		}
		layer.intersects = Boolean(intersects);
	}
}

// Normalize offsetX and offsetY for all browsers
$.event.fix = function (event) {
	var offset, originalEvent, touches;

	event = jQueryEventFix.call($.event, event);
	originalEvent = event.originalEvent;

	// originalEvent does not exist for manually-triggered events
	if (originalEvent) {

		touches = originalEvent.changedTouches;

		// If offsetX and offsetY are not supported, define them
		if (event.pageX !== undefined && event.offsetX === undefined) {
			try {
				offset = $(event.currentTarget).offset();
				if (offset) {
					event.offsetX = event.pageX - offset.left;
					event.offsetY = event.pageY - offset.top;
				}
			} catch (error) {
				// Fail silently
			}
		} else if (touches) {
			try {
				// Enable offsetX and offsetY for mobile devices
				offset = $(event.currentTarget).offset();
				if (offset) {
					event.offsetX = touches[0].pageX - offset.left;
					event.offsetY = touches[0].pageY - offset.top;
				}
			} catch (error) {
				// Fail silently
			}
		}

	}
	return event;
};

/* Drawing API */

// Map drawing names with their respective method names
maps.drawings = {
	'arc': 'drawArc',
	'bezier': 'drawBezier',
	'ellipse': 'drawEllipse',
	'function': 'draw',
	'image': 'drawImage',
	'line': 'drawLine',
	'path': 'drawPath',
	'polygon': 'drawPolygon',
	'slice': 'drawSlice',
	'quadratic': 'drawQuadratic',
	'rectangle': 'drawRect',
	'text': 'drawText',
	'vector': 'drawVector',
	'save': 'saveCanvas',
	'restore': 'restoreCanvas',
	'rotate': 'rotateCanvas',
	'scale': 'scaleCanvas',
	'translate': 'translateCanvas'
};

// Draws on canvas using a function
$.fn.draw = function draw(args) {
	var $canvases = this, e, ctx,
		params = new jCanvasObject(args);

	// Draw using any other method
	if (maps.drawings[params.type] && params.type !== 'function') {

		$canvases[maps.drawings[params.type]](args);

	} else {

		for (e = 0; e < $canvases.length; e += 1) {
			ctx = _getContext($canvases[e]);
			if (ctx) {

				params = new jCanvasObject(args);
				_addLayer($canvases[e], params, args, draw);
				if (params.visible) {

					if (params.fn) {
						// Call the given user-defined function
						params.fn.call($canvases[e], ctx, params);
					}

				}

			}
		}

	}
	return $canvases;
};

// Clears canvas
$.fn.clearCanvas = function clearCanvas(args) {
	var $canvases = this, e, ctx,
		params = new jCanvasObject(args);

	for (e = 0; e < $canvases.length; e += 1) {
		ctx = _getContext($canvases[e]);
		if (ctx) {

			if (params.width === null || params.height === null) {
				// Clear entire canvas if width/height is not given

				// Reset current transformation temporarily to ensure that the entire canvas is cleared
				ctx.save();
				ctx.setTransform(1, 0, 0, 1, 0, 0);
				ctx.clearRect(0, 0, $canvases[e].width, $canvases[e].height);
				ctx.restore();

			} else {
				// Otherwise, clear the defined section of the canvas

				// Transform clear rectangle
				_addLayer($canvases[e], params, args, clearCanvas);
				_transformShape($canvases[e], ctx, params, params.width, params.height);
				ctx.clearRect(params.x - (params.width / 2), params.y - (params.height / 2), params.width, params.height);
				// Restore previous transformation
				_restoreTransform(ctx, params);

			}

		}
	}
	return $canvases;
};

/* Transformation API */

// Restores canvas
$.fn.saveCanvas = function saveCanvas(args) {
	var $canvases = this, e, ctx,
		params, data, i;

	for (e = 0; e < $canvases.length; e += 1) {
		ctx = _getContext($canvases[e]);
		if (ctx) {

			data = _getCanvasData($canvases[e]);

			params = new jCanvasObject(args);
			_addLayer($canvases[e], params, args, saveCanvas);

			// Restore a number of times using the given count
			for (i = 0; i < params.count; i += 1) {
				_saveCanvas(ctx, data);
			}

		}
	}
	return $canvases;
};

// Restores canvas
$.fn.restoreCanvas = function restoreCanvas(args) {
	var $canvases = this, e, ctx,
		params, data, i;

	for (e = 0; e < $canvases.length; e += 1) {
		ctx = _getContext($canvases[e]);
		if (ctx) {

			data = _getCanvasData($canvases[e]);

			params = new jCanvasObject(args);
			_addLayer($canvases[e], params, args, restoreCanvas);

			// Restore a number of times using the given count
			for (i = 0; i < params.count; i += 1) {
				_restoreCanvas(ctx, data);
			}

		}
	}
	return $canvases;
};

// Rotates canvas (internal)
function _rotateCanvas(ctx, params, transforms) {

	// Get conversion factor for radians
	params._toRad = (params.inDegrees ? (PI / 180) : 1);

	// Rotate canvas using shape as center of rotation
	ctx.translate(params.x, params.y);
	ctx.rotate(params.rotate * params._toRad);
	ctx.translate(-params.x, -params.y);

	// If transformation data was given
	if (transforms) {
		// Update transformation data
		transforms.rotate += (params.rotate * params._toRad);
	}
}

// Scales canvas (internal)
function _scaleCanvas(ctx, params, transforms) {

	// Scale both the x- and y- axis using the 'scale' property
	if (params.scale !== 1) {
		params.scaleX = params.scaleY = params.scale;
	}

	// Scale canvas using shape as center of rotation
	ctx.translate(params.x, params.y);
	ctx.scale(params.scaleX, params.scaleY);
	ctx.translate(-params.x, -params.y);

	// If transformation data was given
	if (transforms) {
		// Update transformation data
		transforms.scaleX *= params.scaleX;
		transforms.scaleY *= params.scaleY;
	}
}

// Translates canvas (internal)
function _translateCanvas(ctx, params, transforms) {

	// Translate both the x- and y-axis using the 'translate' property
	if (params.translate) {
		params.translateX = params.translateY = params.translate;
	}

	// Translate canvas
	ctx.translate(params.translateX, params.translateY);

	// If transformation data was given
	if (transforms) {
		// Update transformation data
		transforms.translateX += params.translateX;
		transforms.translateY += params.translateY;
	}
}

// Rotates canvas
$.fn.rotateCanvas = function rotateCanvas(args) {
	var $canvases = this, e, ctx,
		params, data;

	for (e = 0; e < $canvases.length; e += 1) {
		ctx = _getContext($canvases[e]);
		if (ctx) {

			data = _getCanvasData($canvases[e]);

			params = new jCanvasObject(args);
			_addLayer($canvases[e], params, args, rotateCanvas);

			// Autosave transformation state by default
			if (params.autosave) {
				// Automatically save transformation state by default
				_saveCanvas(ctx, data);
			}
			_rotateCanvas(ctx, params, data.transforms);
		}

	}
	return $canvases;
};

// Scales canvas
$.fn.scaleCanvas = function scaleCanvas(args) {
	var $canvases = this, e, ctx,
		params, data;

	for (e = 0; e < $canvases.length; e += 1) {
		ctx = _getContext($canvases[e]);
		if (ctx) {

			data = _getCanvasData($canvases[e]);

			params = new jCanvasObject(args);
			_addLayer($canvases[e], params, args, scaleCanvas);

			// Autosave transformation state by default
			if (params.autosave) {
				// Automatically save transformation state by default
				_saveCanvas(ctx, data);
			}
			_scaleCanvas(ctx, params, data.transforms);

		}
	}
	return $canvases;
};

// Translates canvas
$.fn.translateCanvas = function translateCanvas(args) {
	var $canvases = this, e, ctx,
		params, data;

	for (e = 0; e < $canvases.length; e += 1) {
		ctx = _getContext($canvases[e]);
		if (ctx) {

			data = _getCanvasData($canvases[e]);

			params = new jCanvasObject(args);
			_addLayer($canvases[e], params, args, translateCanvas);

			// Autosave transformation state by default
			if (params.autosave) {
				// Automatically save transformation state by default
				_saveCanvas(ctx, data);
			}
			_translateCanvas(ctx, params, data.transforms);

		}
	}
	return $canvases;
};

/* Shape API */

// Draws rectangle
$.fn.drawRect = function drawRect(args) {
	var $canvases = this, e, ctx,
		params,
		x1, y1,
		x2, y2,
		r, temp;

	for (e = 0; e < $canvases.length; e += 1) {
		ctx = _getContext($canvases[e]);
		if (ctx) {

			params = new jCanvasObject(args);
			_addLayer($canvases[e], params, args, drawRect);
			if (params.visible) {

				_transformShape($canvases[e], ctx, params, params.width, params.height);
				_setGlobalProps($canvases[e], ctx, params);

				ctx.beginPath();
				if (params.width && params.height) {
					x1 = params.x - (params.width / 2);
					y1 = params.y - (params.height / 2);
					r = abs(params.cornerRadius);
					// If corner radius is defined and is not zero
					if (r) {
						// Draw rectangle with rounded corners if cornerRadius is defined

						x2 = params.x + (params.width / 2);
						y2 = params.y + (params.height / 2);

						// Handle negative width
						if (params.width < 0) {
							temp = x1;
							x1 = x2;
							x2 = temp;
						}
						// Handle negative height
						if (params.height < 0) {
							temp = y1;
							y1 = y2;
							y2 = temp;
						}

						// Prevent over-rounded corners
						if ((x2 - x1) - (2 * r) < 0) {
							r = (x2 - x1) / 2;
						}
						if ((y2 - y1) - (2 * r) < 0) {
							r = (y2 - y1) / 2;
						}

						// Draw rectangle
						ctx.moveTo(x1 + r, y1);
						ctx.lineTo(x2 - r, y1);
						ctx.arc(x2 - r, y1 + r, r, 3 * PI / 2, PI * 2, false);
						ctx.lineTo(x2, y2 - r);
						ctx.arc(x2 - r, y2 - r, r, 0, PI / 2, false);
						ctx.lineTo(x1 + r, y2);
						ctx.arc(x1 + r, y2 - r, r, PI / 2, PI, false);
						ctx.lineTo(x1, y1 + r);
						ctx.arc(x1 + r, y1 + r, r, PI, 3 * PI / 2, false);
						// Always close path
						params.closed = true;

					} else {

						// Otherwise, draw rectangle with square corners
						ctx.rect(x1, y1, params.width, params.height);

					}
				}
				// Check for jCanvas events
				_detectEvents($canvases[e], ctx, params);
				// Close rectangle path
				_closePath($canvases[e], ctx, params);
			}
		}
	}
	return $canvases;
};

// Retrieves a coterminal angle between 0 and 2pi for the given angle
function _getCoterminal(angle) {
	while (angle < 0) {
		angle += (2 * PI);
	}
	return angle;
}

// Retrieves the x-coordinate for the given angle in a circle
function _getArcX(params, angle) {
	return params.x + (params.radius * cos(angle));
}
// Retrieves the y-coordinate for the given angle in a circle
function _getArcY(params, angle) {
	return params.y + (params.radius * sin(angle));
}

// Draws arc (internal)
function _drawArc(canvas, ctx, params, path) {
	var x1, y1, x2, y2,
		x3, y3, x4, y4,
		offsetX, offsetY,
		diff;

	// Determine offset from dragging
	if (params === path) {
		offsetX = 0;
		offsetY = 0;
	} else {
		offsetX = params.x;
		offsetY = params.y;
	}

	// Convert default end angle to radians
	if (!path.inDegrees && path.end === 360) {
		path.end = PI * 2;
	}

	// Convert angles to radians
	path.start *= params._toRad;
	path.end *= params._toRad;
	// Consider 0deg due north of arc
	path.start -= (PI / 2);
	path.end -= (PI / 2);

	// Ensure arrows are pointed correctly for CCW arcs
	diff = PI / 180;
	if (path.ccw) {
		diff *= -1;
	}

	// Calculate coordinates for start arrow
	x1 = _getArcX(path, path.start + diff);
	y1 = _getArcY(path, path.start + diff);
	x2 = _getArcX(path, path.start);
	y2 = _getArcY(path, path.start);

	_addStartArrow(
		canvas, ctx,
		params, path,
		x1, y1,
		x2, y2
	);

	// Draw arc
	ctx.arc(path.x + offsetX, path.y + offsetY, path.radius, path.start, path.end, path.ccw);

	// Calculate coordinates for end arrow
	x3 = _getArcX(path, path.end + diff);
	y3 = _getArcY(path, path.end + diff);
	x4 = _getArcX(path, path.end);
	y4 = _getArcY(path, path.end);

	_addEndArrow(
		canvas, ctx,
		params, path,
		x4, y4,
		x3, y3
	);
}

// Draws arc or circle
$.fn.drawArc = function drawArc(args) {
	var $canvases = this, e, ctx,
		params;

	for (e = 0; e < $canvases.length; e += 1) {
		ctx = _getContext($canvases[e]);
		if (ctx) {

			params = new jCanvasObject(args);
			_addLayer($canvases[e], params, args, drawArc);
			if (params.visible) {

				_transformShape($canvases[e], ctx, params, params.radius * 2);
				_setGlobalProps($canvases[e], ctx, params);

				ctx.beginPath();
				_drawArc($canvases[e], ctx, params, params);
				// Check for jCanvas events
				_detectEvents($canvases[e], ctx, params);
				// Optionally close path
				_closePath($canvases[e], ctx, params);

			}

		}
	}
	return $canvases;
};

// Draws ellipse
$.fn.drawEllipse = function drawEllipse(args) {
	var $canvases = this, e, ctx,
		params,
		controlW,
		controlH;

	for (e = 0; e < $canvases.length; e += 1) {
		ctx = _getContext($canvases[e]);
		if (ctx) {

			params = new jCanvasObject(args);
			_addLayer($canvases[e], params, args, drawEllipse);
			if (params.visible) {

				_transformShape($canvases[e], ctx, params, params.width, params.height);
				_setGlobalProps($canvases[e], ctx, params);

				// Calculate control width and height
				controlW = params.width * (4 / 3);
				controlH = params.height;

				// Create ellipse using curves
				ctx.beginPath();
				ctx.moveTo(params.x, params.y - (controlH / 2));
				// Left side
				ctx.bezierCurveTo(params.x - (controlW / 2), params.y - (controlH / 2), params.x - (controlW / 2), params.y + (controlH / 2), params.x, params.y + (controlH / 2));
				// Right side
				ctx.bezierCurveTo(params.x + (controlW / 2), params.y + (controlH / 2), params.x + (controlW / 2), params.y - (controlH / 2), params.x, params.y - (controlH / 2));
				// Check for jCanvas events
				_detectEvents($canvases[e], ctx, params);
				// Always close path
				params.closed = true;
				_closePath($canvases[e], ctx, params);

			}
		}
	}
	return $canvases;
};

// Draws a regular (equal-angled) polygon
$.fn.drawPolygon = function drawPolygon(args) {
	var $canvases = this, e, ctx,
		params,
		theta, dtheta, hdtheta,
		apothem,
		x, y, i;

	for (e = 0; e < $canvases.length; e += 1) {
		ctx = _getContext($canvases[e]);
		if (ctx) {

			params = new jCanvasObject(args);
			_addLayer($canvases[e], params, args, drawPolygon);
			if (params.visible) {

				_transformShape($canvases[e], ctx, params, params.radius * 2);
				_setGlobalProps($canvases[e], ctx, params);

				// Polygon's central angle
				dtheta = (2 * PI) / params.sides;
				// Half of dtheta
				hdtheta = dtheta / 2;
				// Polygon's starting angle
				theta = hdtheta + (PI / 2);
				// Distance from polygon's center to the middle of its side
				apothem = params.radius * cos(hdtheta);

				// Calculate path and draw
				ctx.beginPath();
				for (i = 0; i < params.sides; i += 1) {

					// Draw side of polygon
					x = params.x + (params.radius * cos(theta));
					y = params.y + (params.radius * sin(theta));

					// Plot point on polygon
					ctx.lineTo(x, y);

					// Project side if chosen
					if (params.concavity) {
						// Sides are projected from the polygon's apothem
						x = params.x + ((apothem + (-apothem * params.concavity)) * cos(theta + hdtheta));
						y = params.y + ((apothem + (-apothem * params.concavity)) * sin(theta + hdtheta));
						ctx.lineTo(x, y);
					}

					// Increment theta by delta theta
					theta += dtheta;

				}
				// Check for jCanvas events
				_detectEvents($canvases[e], ctx, params);
				// Always close path
				params.closed = true;
				_closePath($canvases[e], ctx, params);

			}
		}
	}
	return $canvases;
};

// Draws pie-shaped slice
$.fn.drawSlice = function drawSlice(args) {
	var $canvases = this, e, ctx,
		params,
		angle, dx, dy;

	for (e = 0; e < $canvases.length; e += 1) {
		ctx = _getContext($canvases[e]);
		if (ctx) {

			params = new jCanvasObject(args);
			_addLayer($canvases[e], params, args, drawSlice);
			if (params.visible) {

				_transformShape($canvases[e], ctx, params, params.radius * 2);
				_setGlobalProps($canvases[e], ctx, params);

				// Perform extra calculations

				// Convert angles to radians
				params.start *= params._toRad;
				params.end *= params._toRad;
				// Consider 0deg at north of arc
				params.start -= (PI / 2);
				params.end -= (PI / 2);

				// Find positive equivalents of angles
				params.start = _getCoterminal(params.start);
				params.end = _getCoterminal(params.end);
				// Ensure start angle is less than end angle
				if (params.end < params.start) {
					params.end += (2 * PI);
				}

				// Calculate angular position of slice
				angle = ((params.start + params.end) / 2);

				// Calculate ratios for slice's angle
				dx = (params.radius * params.spread * cos(angle));
				dy = (params.radius * params.spread * sin(angle));

				// Adjust position of slice
				params.x += dx;
				params.y += dy;

				// Draw slice
				ctx.beginPath();
				ctx.arc(params.x, params.y, params.radius, params.start, params.end, params.ccw);
				ctx.lineTo(params.x, params.y);
				// Check for jCanvas events
				_detectEvents($canvases[e], ctx, params);
				// Always close path
				params.closed = true;
				_closePath($canvases[e], ctx, params);

			}

		}
	}
	return $canvases;
};

/* Path API */

// Adds arrow to path using the given properties
function _addArrow(canvas, ctx, params, path, x1, y1, x2, y2) {
	var leftX, leftY,
		rightX, rightY,
		offsetX, offsetY,
		angle;

	// If arrow radius is given and path is not closed
	if (path.arrowRadius && !params.closed) {

		// Calculate angle
		angle = atan2((y2 - y1), (x2 - x1));
		// Adjust angle correctly
		angle -= PI;
		// Calculate offset to place arrow at edge of path
		offsetX = (params.strokeWidth * cos(angle));
		offsetY = (params.strokeWidth * sin(angle));

		// Calculate coordinates for left half of arrow
		leftX = x2 + (path.arrowRadius * cos(angle + (path.arrowAngle / 2)));
		leftY = y2 + (path.arrowRadius * sin(angle + (path.arrowAngle / 2)));
		// Calculate coordinates for right half of arrow
		rightX = x2 + (path.arrowRadius * cos(angle - (path.arrowAngle / 2)));
		rightY = y2 + (path.arrowRadius * sin(angle - (path.arrowAngle / 2)));

		// Draw left half of arrow
		ctx.moveTo(leftX - offsetX, leftY - offsetY);
		ctx.lineTo(x2 - offsetX, y2 - offsetY);
		// Draw right half of arrow
		ctx.lineTo(rightX - offsetX, rightY - offsetY);

		// Visually connect arrow to path
		ctx.moveTo(x2 - offsetX, y2 - offsetY);
		ctx.lineTo(x2 + offsetX, y2 + offsetY);
		// Move back to end of path
		ctx.moveTo(x2, y2);

	}
}

// Optionally adds arrow to start of path
function _addStartArrow(canvas, ctx, params, path, x1, y1, x2, y2) {
	if (!path._arrowAngleConverted) {
		path.arrowAngle *= params._toRad;
		path._arrowAngleConverted = true;
	}
	if (path.startArrow) {
		_addArrow(canvas, ctx, params, path, x1, y1, x2, y2);
	}
}

// Optionally adds arrow to end of path
function _addEndArrow(canvas, ctx, params, path, x1, y1, x2, y2) {
	if (!path._arrowAngleConverted) {
		path.arrowAngle *= params._toRad;
		path._arrowAngleConverted = true;
	}
	if (path.endArrow) {
		_addArrow(canvas, ctx, params, path, x1, y1, x2, y2);
	}
}

// Draws line (internal)
function _drawLine(canvas, ctx, params, path) {
	var l,
		lx, ly;
	l = 2;
	_addStartArrow(
		canvas, ctx,
		params, path,
		path.x2 + params.x,
		path.y2 + params.y,
		path.x1 + params.x,
		path.y1 + params.y
	);
	if (path.x1 !== undefined && path.y1 !== undefined) {
		ctx.moveTo(path.x1 + params.x, path.y1 + params.y);
	}
	while (true) {
		// Calculate next coordinates
		lx = path['x' + l];
		ly = path['y' + l];
		// If coordinates are given
		if (lx !== undefined && ly !== undefined) {
			// Draw next line
			ctx.lineTo(lx + params.x, ly + params.y);
			l += 1;
		} else {
			// Otherwise, stop drawing
			break;
		}
	}
	l -= 1;
	// Optionally add arrows to path
	_addEndArrow(
		canvas, ctx,
		params,
		path,
		path['x' + (l - 1)] + params.x,
		path['y' + (l - 1)] + params.y,
		path['x' + l] + params.x,
		path['y' + l] + params.y
	);
}

// Draws line
$.fn.drawLine = function drawLine(args) {
	var $canvases = this, e, ctx,
		params;

	for (e = 0; e < $canvases.length; e += 1) {
		ctx = _getContext($canvases[e]);
		if (ctx) {

			params = new jCanvasObject(args);
			_addLayer($canvases[e], params, args, drawLine);
			if (params.visible) {

				_transformShape($canvases[e], ctx, params);
				_setGlobalProps($canvases[e], ctx, params);

				// Draw each point
				ctx.beginPath();
				_drawLine($canvases[e], ctx, params, params);
				// Check for jCanvas events
				_detectEvents($canvases[e], ctx, params);
				// Optionally close path
				_closePath($canvases[e], ctx, params);

			}

		}
	}
	return $canvases;
};

// Draws quadratic curve (internal)
function _drawQuadratic(canvas, ctx, params, path) {
	var l,
		lx, ly,
		lcx, lcy;

	l = 2;

	_addStartArrow(
		canvas,
		ctx,
		params,
		path,
		path.cx1 + params.x,
		path.cy1 + params.y,
		path.x1 + params.x,
		path.y1 + params.y
	);

	if (path.x1 !== undefined && path.y1 !== undefined) {
		ctx.moveTo(path.x1 + params.x, path.y1 + params.y);
	}
	while (true) {
		// Calculate next coordinates
		lx = path['x' + l];
		ly = path['y' + l];
		lcx = path['cx' + (l - 1)];
		lcy = path['cy' + (l - 1)];
		// If coordinates are given
		if (lx !== undefined && ly !== undefined && lcx !== undefined && lcy !== undefined) {
			// Draw next curve
			ctx.quadraticCurveTo(lcx + params.x, lcy + params.y, lx + params.x, ly + params.y);
			l += 1;
		} else {
			// Otherwise, stop drawing
			break;
		}
	}
	l -= 1;
	_addEndArrow(
		canvas,
		ctx,
		params,
		path,
		path['cx' + (l - 1)] + params.x,
		path['cy' + (l - 1)] + params.y,
		path['x' + l] + params.x,
		path['y' + l] + params.y
	);
}

// Draws quadratic curve
$.fn.drawQuadratic = function drawQuadratic(args) {
	var $canvases = this, e, ctx,
		params;

	for (e = 0; e < $canvases.length; e += 1) {
		ctx = _getContext($canvases[e]);
		if (ctx) {

			params = new jCanvasObject(args);
			_addLayer($canvases[e], params, args, drawQuadratic);
			if (params.visible) {

				_transformShape($canvases[e], ctx, params);
				_setGlobalProps($canvases[e], ctx, params);

				// Draw each point
				ctx.beginPath();
				_drawQuadratic($canvases[e], ctx, params, params);
				// Check for jCanvas events
				_detectEvents($canvases[e], ctx, params);
				// Optionally close path
				_closePath($canvases[e], ctx, params);

			}
		}
	}
	return $canvases;
};

// Draws Bezier curve (internal)
function _drawBezier(canvas, ctx, params, path) {
	var l, lc,
		lx, ly,
		lcx1, lcy1,
		lcx2, lcy2;

	l = 2;
	lc = 1;

	_addStartArrow(
		canvas,
		ctx,
		params,
		path,
		path.cx1 + params.x,
		path.cy1 + params.y,
		path.x1 + params.x,
		path.y1 + params.y
	);

	if (path.x1 !== undefined && path.y1 !== undefined) {
		ctx.moveTo(path.x1 + params.x, path.y1 + params.y);
	}
	while (true) {
		// Calculate next coordinates
		lx = path['x' + l];
		ly = path['y' + l];
		lcx1 = path['cx' + lc];
		lcy1 = path['cy' + lc];
		lcx2 = path['cx' + (lc + 1)];
		lcy2 = path['cy' + (lc + 1)];
		// If next coordinates are given
		if (lx !== undefined && ly !== undefined && lcx1 !== undefined && lcy1 !== undefined && lcx2 !== undefined && lcy2 !== undefined) {
			// Draw next curve
			ctx.bezierCurveTo(lcx1 + params.x, lcy1 + params.y, lcx2 + params.x, lcy2 + params.y, lx + params.x, ly + params.y);
			l += 1;
			lc += 2;
		} else {
			// Otherwise, stop drawing
			break;
		}
	}
	l -= 1;
	lc -= 2;
	_addEndArrow(
		canvas,
		ctx,
		params,
		path,
		path['cx' + (lc + 1)] + params.x,
		path['cy' + (lc + 1)] + params.y,
		path['x' + l] + params.x,
		path['y' + l] + params.y
	);
}

// Draws Bezier curve
$.fn.drawBezier = function drawBezier(args) {
	var $canvases = this, e, ctx,
		params;

	for (e = 0; e < $canvases.length; e += 1) {
		ctx = _getContext($canvases[e]);
		if (ctx) {

			params = new jCanvasObject(args);
			_addLayer($canvases[e], params, args, drawBezier);
			if (params.visible) {

				_transformShape($canvases[e], ctx, params);
				_setGlobalProps($canvases[e], ctx, params);

				// Draw each point
				ctx.beginPath();
				_drawBezier($canvases[e], ctx, params, params);
				// Check for jCanvas events
				_detectEvents($canvases[e], ctx, params);
				// Optionally close path
				_closePath($canvases[e], ctx, params);

			}
		}
	}
	return $canvases;
};

// Retrieves the x-coordinate for the given vector angle and length
function _getVectorX(params, angle, length) {
	angle *= params._toRad;
	angle -= (PI / 2);
	return (length * cos(angle));
}
// Retrieves the y-coordinate for the given vector angle and length
function _getVectorY(params, angle, length) {
	angle *= params._toRad;
	angle -= (PI / 2);
	return (length * sin(angle));
}

// Draws vector (internal) #2
function _drawVector(canvas, ctx, params, path) {
	var l, angle, length,
		offsetX, offsetY,
		x, y,
		x3, y3,
		x4, y4;

	// Determine offset from dragging
	if (params === path) {
		offsetX = 0;
		offsetY = 0;
	} else {
		offsetX = params.x;
		offsetY = params.y;
	}

	l = 1;
	x = x3 = x4 = path.x + offsetX;
	y = y3 = y4 = path.y + offsetY;

	_addStartArrow(
		canvas, ctx,
		params, path,
		x + _getVectorX(params, path.a1, path.l1),
		y + _getVectorY(params, path.a1, path.l1),
		x,
		y
	);

	// The vector starts at the given (x, y) coordinates
	if (path.x !== undefined && path.y !== undefined) {
		ctx.moveTo(x, y);
	}
	while (true) {

		angle = path['a' + l];
		length = path['l' + l];

		if (angle !== undefined && length !== undefined) {
			// Convert the angle to radians with 0 degrees starting at north
			// Keep track of last two coordinates
			x3 = x4;
			y3 = y4;
			// Compute (x, y) coordinates from angle and length
			x4 += _getVectorX(params, angle, length);
			y4 += _getVectorY(params, angle, length);
			ctx.lineTo(x4, y4);
			l += 1;
		} else {
			// Otherwise, stop drawing
			break;
		}

	}
	_addEndArrow(
		canvas, ctx,
		params, path,
		x3, y3,
		x4, y4
	);
}

// Draws vector
$.fn.drawVector = function drawVector(args) {
	var $canvases = this, e, ctx,
		params;

	for (e = 0; e < $canvases.length; e += 1) {
		ctx = _getContext($canvases[e]);
		if (ctx) {

			params = new jCanvasObject(args);
			_addLayer($canvases[e], params, args, drawVector);
			if (params.visible) {

				_transformShape($canvases[e], ctx, params);
				_setGlobalProps($canvases[e], ctx, params);

				// Draw each point
				ctx.beginPath();
				_drawVector($canvases[e], ctx, params, params);
				// Check for jCanvas events
				_detectEvents($canvases[e], ctx, params);
				// Optionally close path
				_closePath($canvases[e], ctx, params);

			}
		}
	}
	return $canvases;
};

// Draws a path consisting of one or more subpaths
$.fn.drawPath = function drawPath(args) {
	var $canvases = this, e, ctx,
		params,
		l, lp;

	for (e = 0; e < $canvases.length; e += 1) {
		ctx = _getContext($canvases[e]);
		if (ctx) {

			params = new jCanvasObject(args);
			_addLayer($canvases[e], params, args, drawPath);
			if (params.visible) {

				_transformShape($canvases[e], ctx, params);
				_setGlobalProps($canvases[e], ctx, params);

				ctx.beginPath();
				l = 1;
				while (true) {
					lp = params['p' + l];
					if (lp !== undefined) {
						lp = new jCanvasObject(lp);
						if (lp.type === 'line') {
							_drawLine($canvases[e], ctx, params, lp);
						} else if (lp.type === 'quadratic') {
							_drawQuadratic($canvases[e], ctx, params, lp);
						} else if (lp.type === 'bezier') {
							_drawBezier($canvases[e], ctx, params, lp);
						} else if (lp.type === 'vector') {
							_drawVector($canvases[e], ctx, params, lp);
						} else if (lp.type === 'arc') {
							_drawArc($canvases[e], ctx, params, lp);
						}
						l += 1;
					} else {
						break;
					}
				}

				// Check for jCanvas events
				_detectEvents($canvases[e], ctx, params);
				// Optionally close path
				_closePath($canvases[e], ctx, params);

			}

		}
	}
	return $canvases;
};

/* Text API */

// Calculates font string and set it as the canvas font
function _setCanvasFont(canvas, ctx, params) {
	// Otherwise, use the given font attributes
	if (!isNaN(Number(params.fontSize))) {
		// Give font size units if it doesn't have any
		params.fontSize += 'px';
	}
	// Set font using given font properties
	ctx.font = params.fontStyle + ' ' + params.fontSize + ' ' + params.fontFamily;
}

// Measures canvas text
function _measureText(canvas, ctx, params, lines) {
	var originalSize, curWidth, l,
		propCache = caches.propCache;

	// Used cached width/height if possible
	if (propCache.text === params.text && propCache.fontStyle === params.fontStyle && propCache.fontSize === params.fontSize && propCache.fontFamily === params.fontFamily && propCache.maxWidth === params.maxWidth && propCache.lineHeight === params.lineHeight) {

		params.width = propCache.width;
		params.height = propCache.height;

	} else {
		// Calculate text dimensions only once

		// Calculate width of first line (for comparison)
		params.width = ctx.measureText(lines[0]).width;

		// Get width of longest line
		for (l = 1; l < lines.length; l += 1) {

			curWidth = ctx.measureText(lines[l]).width;
			// Ensure text's width is the width of its longest line
			if (curWidth > params.width) {
				params.width = curWidth;
			}

		}

		// Save original font size
		originalSize = canvas.style.fontSize;
		// Temporarily set canvas font size to retrieve size in pixels
		canvas.style.fontSize = params.fontSize;
		// Save text width and height in parameters object
		params.height = parseFloat($.css(canvas, 'fontSize')) * lines.length * params.lineHeight;
		// Reset font size to original size
		canvas.style.fontSize = originalSize;
	}
}

// Wraps a string of text within a defined width
function _wrapText(ctx, params) {
	var allText = String(params.text),
		// Maximum line width (optional)
		maxWidth = params.maxWidth,
		// Lines created by manual line breaks (\n)
		manualLines = allText.split('\n'),
		// All lines created manually and by wrapping
		allLines = [],
		// Other variables
		lines, line, l,
		text, words, w;

	// Loop through manually-broken lines
	for (l = 0; l < manualLines.length; l += 1) {

		text = manualLines[l];
		// Split line into list of words
		words = text.split(' ');
		lines = [];
		line = '';

		// If text is short enough initially
		// Or, if the text consists of only one word
		if (words.length === 1 || ctx.measureText(text).width < maxWidth) {

			// No need to wrap text
			lines = [text];

		} else {

			// Wrap lines
			for (w = 0; w < words.length; w += 1) {

				// Once line gets too wide, push word to next line
				if (ctx.measureText(line + words[w]).width > maxWidth) {
					// This check prevents empty lines from being created
					if (line !== '') {
						lines.push(line);
					}
					// Start new line and repeat process
					line = '';
				}
				// Add words to line until the line is too wide
				line += words[w];
				// Do not add a space after the last word
				if (w !== (words.length - 1)) {
					line += ' ';
				}
			}
			// The last word should always be pushed
			lines.push(line);

		}
		// Remove extra space at the end of each line
		allLines = allLines.concat(
			lines
			.join('\n')
			.replace(/((\n))|($)/gi, '$2')
			.split('\n')
		);

	}

	return allLines;
}

// Draws text on canvas
$.fn.drawText = function drawText(args) {
	var $canvases = this, e, ctx,
		params, layer,
		lines, line, l,
		fontSize, constantCloseness = 500,
		nchars, chars, ch, c,
		x, y;

	for (e = 0; e < $canvases.length; e += 1) {
		ctx = _getContext($canvases[e]);
		if (ctx) {

			params = new jCanvasObject(args);
			_addLayer($canvases[e], params, args, drawText);
			if (params.visible) {

				// Set text-specific properties
				ctx.textBaseline = params.baseline;
				ctx.textAlign = params.align;

				// Set canvas font using given properties
				_setCanvasFont($canvases[e], ctx, params);

				if (params.maxWidth !== null) {
					// Wrap text using an internal function
					lines = _wrapText(ctx, params);
				} else {
					// Convert string of text to list of lines
					lines = params.text
					.toString()
					.split('\n');
				}

				// Calculate text's width and height
				_measureText($canvases[e], ctx, params, lines);

				// If text is a layer
				if (layer) {
					// Copy calculated width/height to layer object
					layer.width = params.width;
					layer.height = params.height;
				}

				_transformShape($canvases[e], ctx, params, params.width, params.height);
				_setGlobalProps($canvases[e], ctx, params);

				// Adjust text position to accomodate different horizontal alignments
				x = params.x;
				if (params.align === 'left') {
					if (params.respectAlign) {
						// Realign text to the left if chosen
						params.x += params.width / 2;
					} else {
						// Center text block by default
						x -= params.width / 2;
					}
				} else if (params.align === 'right') {
					if (params.respectAlign) {
						// Realign text to the right if chosen
						params.x -= params.width / 2;
					} else {
						// Center text block by default
						x += params.width / 2;
					}
				}

				if (params.radius) {

					fontSize = parseFloat(params.fontSize);

					// Greater values move clockwise
					if (params.letterSpacing === null) {
						params.letterSpacing = fontSize / constantCloseness;
					}

					// Loop through each line of text
					for (l = 0; l < lines.length; l += 1) {
						ctx.save();
						ctx.translate(params.x, params.y);
						line = lines[l];
						if (params.flipArcText) {
							chars = line.split('');
							chars.reverse();
							line = chars.join('');
						}
						nchars = line.length;
						ctx.rotate(-(PI * params.letterSpacing * (nchars - 1)) / 2);
						// Loop through characters on each line
						for (c = 0; c < nchars; c += 1) {
							ch = line[c];
							// If character is not the first character
							if (c !== 0) {
								// Rotate character onto arc
								ctx.rotate(PI * params.letterSpacing);
							}
							ctx.save();
							ctx.translate(0, -params.radius);
							if (params.flipArcText) {
								ctx.scale(-1, -1);
							}
							ctx.fillText(ch, 0, 0);
							// Prevent extra shadow created by stroke (but only when fill is present)
							if (params.fillStyle !== 'transparent') {
								ctx.shadowColor = 'transparent';
							}
							if (params.strokeWidth !== 0) {
								// Only stroke if the stroke is not 0
								ctx.strokeText(ch, 0, 0);
							}
							ctx.restore();
						}
						params.radius -= fontSize;
						params.letterSpacing += fontSize / (constantCloseness * 2 * PI);
						ctx.restore();
					}

				} else {

					// Draw each line of text separately
					for (l = 0; l < lines.length; l += 1) {
						line = lines[l];
						// Add line offset to center point, but subtract some to center everything
						y = params.y + (l * params.height / lines.length) - (((lines.length - 1) * params.height / lines.length) / 2);

						ctx.shadowColor = params.shadowColor;

						// Fill & stroke text
						ctx.fillText(line, x, y);
						// Prevent extra shadow created by stroke (but only when fill is present)
						if (params.fillStyle !== 'transparent') {
							ctx.shadowColor = 'transparent';
						}
						if (params.strokeWidth !== 0) {
							// Only stroke if the stroke is not 0
							ctx.strokeText(line, x, y);
						}

					}

				}

				// Adjust bounding box according to text baseline
				y = 0;
				if (params.baseline === 'top') {
					y += params.height / 2;
				} else if (params.baseline === 'bottom') {
					y -= params.height / 2;
				}

				// Detect jCanvas events
				if (params._event) {
					ctx.beginPath();
					ctx.rect(
						params.x - (params.width / 2),
						params.y - (params.height / 2) + y,
						params.width,
						params.height
					);
					_detectEvents($canvases[e], ctx, params);
					// Close path and configure masking
					ctx.closePath();
				}
				_restoreTransform(ctx, params);

			}
		}
	}
	// Cache jCanvas parameters object for efficiency
	caches.propCache = params;
	return $canvases;
};

// Measures text width/height using the given parameters
$.fn.measureText = function measureText(args) {
	var $canvases = this, ctx,
		params, lines;

	// Attempt to retrieve layer
	params = $canvases.getLayer(args);
	// If layer does not exist or if returned object is not a jCanvas layer
	if (!params || (params && !params._layer)) {
		params = new jCanvasObject(args);
	}

	ctx = _getContext($canvases[0]);
	if (ctx) {

		// Set canvas font using given properties
		_setCanvasFont($canvases[0], ctx, params);
		// Calculate width and height of text
		if (params.maxWidth !== null) {
			lines = _wrapText(ctx, params);
		} else {
			lines = params.text.split('\n');
		}
		_measureText($canvases[0], ctx, params, lines);


	}

	return params;
};

/* Image API */

// Draws image on canvas
$.fn.drawImage = function drawImage(args) {
	var $canvases = this, canvas, e, ctx, data,
		params, layer,
		img, imgCtx, source,
		imageCache = caches.imageCache;

	// Draw image function
	function draw(canvas, ctx, data, params, layer) {

		// If width and sWidth are not defined, use image width
		if (params.width === null && params.sWidth === null) {
			params.width = params.sWidth = img.width;
		}
		// If width and sHeight are not defined, use image height
		if (params.height === null && params.sHeight === null) {
			params.height = params.sHeight = img.height;
		}

		// Ensure image layer's width and height are accurate
		if (layer) {
			layer.width = params.width;
			layer.height = params.height;
		}

		// Only crop image if all cropping properties are given
		if (params.sWidth !== null && params.sHeight !== null && params.sx !== null && params.sy !== null) {

			// If width is not defined, use the given sWidth
			if (params.width === null) {
				params.width = params.sWidth;
			}
			// If height is not defined, use the given sHeight
			if (params.height === null) {
				params.height = params.sHeight;
			}

			// Optionally crop from top-left corner of region
			if (params.cropFromCenter) {
				params.sx += params.sWidth / 2;
				params.sy += params.sHeight / 2;
			}

			// Ensure cropped region does not escape image boundaries

			// Top
			if ((params.sy - (params.sHeight / 2)) < 0) {
				params.sy = (params.sHeight / 2);
			}
			// Bottom
			if ((params.sy + (params.sHeight / 2)) > img.height) {
				params.sy = img.height - (params.sHeight / 2);
			}
			// Left
			if ((params.sx - (params.sWidth / 2)) < 0) {
				params.sx = (params.sWidth / 2);
			}
			// Right
			if ((params.sx + (params.sWidth / 2)) > img.width) {
				params.sx = img.width - (params.sWidth / 2);
			}

			_transformShape(canvas, ctx, params, params.width, params.height);
			_setGlobalProps(canvas, ctx, params);

			// Draw image
			ctx.drawImage(
				img,
				params.sx - (params.sWidth / 2),
				params.sy - (params.sHeight / 2),
				params.sWidth,
				params.sHeight,
				params.x - (params.width / 2),
				params.y - (params.height / 2),
				params.width,
				params.height
			);

		} else {
			// Show entire image if no crop region is defined

			_transformShape(canvas, ctx, params, params.width, params.height);
			_setGlobalProps(canvas, ctx, params);

			// Draw image on canvas
			ctx.drawImage(
				img,
				params.x - (params.width / 2),
				params.y - (params.height / 2),
				params.width,
				params.height
			);

		}

		// Draw invisible rectangle to allow for events and masking
		ctx.beginPath();
		ctx.rect(
			params.x - (params.width / 2),
			params.y - (params.height / 2),
			params.width,
			params.height
		);
		// Check for jCanvas events
		_detectEvents(canvas, ctx, params);
		// Close path and configure masking
		ctx.closePath();
		_restoreTransform(ctx, params);
		_enableMasking(ctx, data, params);
	}
	// On load function
	function onload(canvas, ctx, data, params, layer) {
		return function () {
			var $canvas = $(canvas);
			draw(canvas, ctx, data, params, layer);
			if (params.layer) {
				// Trigger 'load' event for layers
				_triggerLayerEvent($canvas, data, layer, 'load');
			} else if (params.load) {
				// Run 'load' callback for non-layers
				params.load.call($canvas[0], layer);
			}
			// Continue drawing successive layers after this image layer has loaded
			if (params.layer) {
				// Store list of previous masks for each layer
				layer._masks = data.transforms.masks.slice(0);
				if (params._next) {
					// Draw successive layers
					var complete = data.drawLayersComplete;
					delete data.drawLayersComplete;
					$canvas.drawLayers({
						clear: false,
						resetFire: true,
						index: params._next,
						complete: complete
					});
				}
			}
		};
	}
	for (e = 0; e < $canvases.length; e += 1) {
		canvas = $canvases[e];
		ctx = _getContext($canvases[e]);
		if (ctx) {

			data = _getCanvasData($canvases[e]);
			params = new jCanvasObject(args);
			layer = _addLayer($canvases[e], params, args, drawImage);
			if (params.visible) {

				// Cache the given source
				source = params.source;

				imgCtx = source.getContext;
				if (source.src || imgCtx) {
					// Use image or canvas element if given
					img = source;
				} else if (source) {
					if (imageCache[source] && imageCache[source].complete) {
						// Get the image element from the cache if possible
						img = imageCache[source];
					} else {
						// Otherwise, get the image from the given source URL
						img = new Image();
						// If source URL is not a data URL
						if (!source.match(/^data:/i)) {
							// Set crossOrigin for this image
							img.crossOrigin = params.crossOrigin;
						}
						img.src = source;
						// Save image in cache for improved performance
						imageCache[source] = img;
					}
				}

				if (img) {
					if (img.complete || imgCtx) {
						// Draw image if already loaded
						onload(canvas, ctx, data, params, layer)();
					} else {
						// Otherwise, draw image when it loads
						img.onload = onload(canvas, ctx, data, params, layer);
						// Fix onload() bug in IE9
						img.src = img.src;
					}
				}

			}
		}
	}
	return $canvases;
};

// Creates a canvas pattern object
$.fn.createPattern = function createPattern(args) {
	var $canvases = this, ctx,
		params,
		img, imgCtx,
		pattern, source;

	// Function to be called when pattern loads
	function onload() {
		// Create pattern
		pattern = ctx.createPattern(img, params.repeat);
		// Run callback function if defined
		if (params.load) {
			params.load.call($canvases[0], pattern);
		}
	}

	ctx = _getContext($canvases[0]);
	if (ctx) {

		params = new jCanvasObject(args);

		// Cache the given source
		source = params.source;

		// Draw when image is loaded (if load() callback function is defined)

		if (isFunction(source)) {
			// Draw pattern using function if given

			img = $('<canvas />')[0];
			img.width = params.width;
			img.height = params.height;
			imgCtx = _getContext(img);
			source.call(img, imgCtx);
			onload();

		} else {
			// Otherwise, draw pattern using source image

			imgCtx = source.getContext;
			if (source.src || imgCtx) {
				// Use image element if given
				img = source;
			} else {
				// Use URL if given to get the image
				img = new Image();
				// If source URL is not a data URL
				if (!source.match(/^data:/i)) {
					// Set crossOrigin for this image
					img.crossOrigin = params.crossOrigin;
				}
				img.src = source;
			}

			// Create pattern if already loaded
			if (img.complete || imgCtx) {
				onload();
			} else {
				img.onload = onload;
				// Fix onload() bug in IE9
				img.src = img.src;
			}

		}

	} else {

		pattern = null;

	}
	return pattern;
};

// Creates a canvas gradient object
$.fn.createGradient = function createGradient(args) {
	var $canvases = this, ctx,
		params,
		gradient,
		stops = [], nstops,
		start, end,
		i, a, n, p;

	params = new jCanvasObject(args);
	ctx = _getContext($canvases[0]);
	if (ctx) {

		// Gradient coordinates must be defined
		params.x1 = params.x1 || 0;
		params.y1 = params.y1 || 0;
		params.x2 = params.x2 || 0;
		params.y2 = params.y2 || 0;

		if (params.r1 !== null && params.r2 !== null) {
			// Create radial gradient if chosen
			gradient = ctx.createRadialGradient(params.x1, params.y1, params.r1, params.x2, params.y2, params.r2);
		} else {
			// Otherwise, create a linear gradient by default
			gradient = ctx.createLinearGradient(params.x1, params.y1, params.x2, params.y2);
		}

		// Count number of color stops
		for (i = 1; params['c' + i] !== undefined; i += 1) {
			if (params['s' + i] !== undefined) {
				stops.push(params['s' + i]);
			} else {
				stops.push(null);
			}
		}
		nstops = stops.length;

		// Define start stop if not already defined
		if (stops[0] === null) {
			stops[0] = 0;
		}
		// Define end stop if not already defined
		if (stops[nstops - 1] === null) {
			stops[nstops - 1] = 1;
		}

		// Loop through color stops to fill in the blanks
		for (i = 0; i < nstops; i += 1) {
			// A progression, in this context, is defined as all of the color stops between and including two known color stops

			if (stops[i] !== null) {
				// Start a new progression if stop is a number

				// Number of stops in current progression
				n = 1;
				// Current iteration in current progression
				p = 0;
				start = stops[i];

				// Look ahead to find end stop
				for (a = (i + 1); a < nstops; a += 1) {
					if (stops[a] !== null) {
						// If this future stop is a number, make it the end stop for this progression
						end = stops[a];
						break;
					} else {
						// Otherwise, keep looking ahead
						n += 1;
					}
				}

				// Ensure start stop is not greater than end stop
				if (start > end) {
					stops[a] = stops[i];
				}

			} else if (stops[i] === null) {
				// Calculate stop if not initially given
				p += 1;
				stops[i] = start + (p * ((end - start) / n));
			}
			// Add color stop to gradient object
			gradient.addColorStop(stops[i], params['c' + (i + 1)]);
		}

	} else {
		gradient = null;
	}
	return gradient;
};

// Manipulates pixels on the canvas
$.fn.setPixels = function setPixels(args) {
	var $canvases = this,
		canvas, e, ctx, canvasData,
		params,
		px,
		imgData, pixelData, i, len;

	for (e = 0; e < $canvases.length; e += 1) {
		canvas = $canvases[e];
		ctx = _getContext(canvas);
		canvasData = _getCanvasData($canvases[e]);
		if (ctx) {

			params = new jCanvasObject(args);
			_addLayer(canvas, params, args, setPixels);
			_transformShape($canvases[e], ctx, params, params.width, params.height);

			// Use entire canvas of x, y, width, or height is not defined
			if (params.width === null || params.height === null) {
				params.width = canvas.width;
				params.height = canvas.height;
				params.x = params.width / 2;
				params.y = params.height / 2;
			}

			if (params.width !== 0 && params.height !== 0) {
				// Only set pixels if width and height are not zero

				imgData = ctx.getImageData(
					(params.x - (params.width / 2)) * canvasData.pixelRatio,
					(params.y - (params.height / 2)) * canvasData.pixelRatio,
					params.width * canvasData.pixelRatio,
					params.height * canvasData.pixelRatio
				);
				pixelData = imgData.data;
				len = pixelData.length;

				// Loop through pixels with the "each" callback function
				if (params.each) {
					for (i = 0; i < len; i += 4) {
						px = {
							r: pixelData[i],
							g: pixelData[i + 1],
							b: pixelData[i + 2],
							a: pixelData[i + 3]
						};
						params.each.call(canvas, px, params);
						pixelData[i] = px.r;
						pixelData[i + 1] = px.g;
						pixelData[i + 2] = px.b;
						pixelData[i + 3] = px.a;
					}
				}
				// Put pixels on canvas
				ctx.putImageData(
					imgData,
					(params.x - (params.width / 2)) * canvasData.pixelRatio,
					(params.y - (params.height / 2)) * canvasData.pixelRatio
				);
				// Restore transformation
				ctx.restore();

			}

		}
	}
	return $canvases;
};

// Retrieves canvas image as data URL
$.fn.getCanvasImage = function getCanvasImage(type, quality) {
	var $canvases = this, canvas,
		dataURL = null;
	if ($canvases.length !== 0) {
		canvas = $canvases[0];
		if (canvas.toDataURL) {
			// JPEG quality defaults to 1
			if (quality === undefined) {
				quality = 1;
			}
			dataURL = canvas.toDataURL('image/' + type, quality);
		}
	}
	return dataURL;
};

// Scales canvas based on the device's pixel ratio
$.fn.detectPixelRatio = function detectPixelRatio(callback) {
	var $canvases = this,
		canvas, e, ctx,
		devicePixelRatio, backingStoreRatio, ratio,
		oldWidth, oldHeight,
		data;

	for (e = 0; e < $canvases.length; e += 1) {
		// Get canvas and its associated data
		canvas = $canvases[e];
		ctx = _getContext(canvas);
		data = _getCanvasData($canvases[e]);

		// If canvas has not already been scaled with this method
		if (!data.scaled) {

			// Determine device pixel ratios
			devicePixelRatio = window.devicePixelRatio || 1;
			backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
				ctx.mozBackingStorePixelRatio ||
				ctx.msBackingStorePixelRatio ||
				ctx.oBackingStorePixelRatio ||
				ctx.backingStorePixelRatio || 1;

			// Calculate general ratio based on the two given ratios
			ratio = devicePixelRatio / backingStoreRatio;

			if (ratio !== 1) {
				// Scale canvas relative to ratio

				// Get the current canvas dimensions for future use
				oldWidth = canvas.width;
				oldHeight = canvas.height;

				// Resize canvas relative to the determined ratio
				canvas.width = oldWidth * ratio;
				canvas.height = oldHeight * ratio;

				// Scale canvas back to original dimensions via CSS
				canvas.style.width = oldWidth + 'px';
				canvas.style.height = oldHeight + 'px';

				// Scale context to counter the manual scaling of canvas
				ctx.scale(ratio, ratio);

			}

			// Set pixel ratio on canvas data object
			data.pixelRatio = ratio;
			// Ensure that this method can only be called once for any given canvas
			data.scaled = true;

			// Call the given callback function with the ratio as its only argument
			if (callback) {
				callback.call(canvas, ratio);
			}

		}

	}
	return $canvases;
};

// Clears the jCanvas cache
jCanvas.clearCache = function clearCache() {
	var cacheName;
	for (cacheName in caches) {
		if (Object.prototype.hasOwnProperty.call(caches, cacheName)) {
			caches[cacheName] = {};
		}
	}
};

// Enable canvas feature detection with $.support
$.support.canvas = ($('<canvas />')[0].getContext !== undefined);

// Export jCanvas functions
extendObject(jCanvas, {
	defaults: defaults,
	setGlobalProps: _setGlobalProps,
	transformShape: _transformShape,
	detectEvents: _detectEvents,
	closePath: _closePath,
	setCanvasFont: _setCanvasFont,
	measureText: _measureText
});
$.jCanvas = jCanvas;
$.jCanvasObject = jCanvasObject;

}));


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvamNhbnZhcy9kaXN0L2pjYW52YXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsS0FBSyxLQUEwQjtBQUMvQjtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTs7QUFFQTtBQUNBLENBQUMsbURBQW1EO0FBQ3BEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBLGVBQWU7QUFDZixlQUFlO0FBQ2Y7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBLGVBQWU7QUFDZjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCO0FBQzdCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLEVBQUU7QUFDRjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxjQUFjLHNCQUFzQjtBQUNwQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSxFQUFFOztBQUVGO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0EsS0FBSztBQUNMLGtCQUFrQjtBQUNsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLHdCQUF3QjtBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsYUFBYSw2QkFBNkI7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQSxFQUFFOztBQUVGO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBLEVBQUU7O0FBRUY7QUFDQTtBQUNBLGNBQWMseUJBQXlCO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLGtCQUFrQjtBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQSxhQUFhLHlCQUF5Qjs7QUFFdEM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLHNCQUFzQjtBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLGNBQWMsbUJBQW1CO0FBQ2pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxHQUFHO0FBQ0g7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQSxHQUFHOztBQUVIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxHQUFHOztBQUVIO0FBQ0EsY0FBYyxtQkFBbUI7QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLEdBQUc7O0FBRUg7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFlBQVksc0JBQXNCO0FBQ2xDO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1Q0FBdUM7QUFDdkM7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksc0JBQXNCO0FBQ2xDOztBQUVBO0FBQ0E7QUFDQSxhQUFhLG1CQUFtQjtBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsWUFBWSxzQkFBc0I7QUFDbEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxjQUFjLGtCQUFrQjtBQUNoQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsWUFBWSxzQkFBc0I7QUFDbEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxZQUFZLHNCQUFzQjtBQUNsQztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0EsSUFBSTs7QUFFSjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFlBQVksc0JBQXNCO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYSxtQkFBbUI7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGFBQWEsc0JBQXNCO0FBQ25DOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsZUFBZSxrQkFBa0I7QUFDakM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFlBQVksc0JBQXNCO0FBQ2xDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFlBQVksc0JBQXNCO0FBQ2xDO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsdUNBQXVDLFFBQVE7O0FBRS9DO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esb0NBQW9DLFFBQVE7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxjQUFjLHVCQUF1Qjs7QUFFckM7QUFDQTtBQUNBOztBQUVBLGdCQUFnQixrQkFBa0I7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBLEVBQUU7QUFDRjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxZQUFZLHNCQUFzQjtBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsWUFBWSxzQkFBc0I7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFlBQVksc0JBQXNCO0FBQ2xDO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLGtCQUFrQixtQkFBbUI7QUFDckM7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQ0FBZ0M7QUFDaEMsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUEsRUFBRTtBQUNGO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxZQUFZLHNCQUFzQjtBQUNsQztBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVksc0JBQXNCO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksc0JBQXNCO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxZQUFZLE9BQU87QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLEVBQUU7O0FBRUY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxZQUFZLHNCQUFzQjtBQUNsQztBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsMkJBQTJCOztBQUUzQjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksc0JBQXNCO0FBQ2xDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGNBQWMsa0JBQWtCOztBQUVoQztBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxZQUFZLHNCQUFzQjtBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxZQUFZLHNCQUFzQjtBQUNsQzs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsY0FBYyxrQkFBa0I7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsWUFBWSxzQkFBc0I7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFlBQVksc0JBQXNCO0FBQ2xDOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxjQUFjLGtCQUFrQjtBQUNoQztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLGtCQUFrQjtBQUM5QjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrREFBa0Q7QUFDbEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksdUJBQXVCO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQSxFQUFFOztBQUVGLGFBQWEsc0JBQXNCO0FBQ25DO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFlBQVksc0JBQXNCO0FBQ2xDO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLElBQUk7QUFDSjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsWUFBWSxzQkFBc0I7QUFDbEM7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsY0FBYyxrQkFBa0I7QUFDaEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxZQUFZLHNCQUFzQjtBQUNsQztBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxjQUFjLGtCQUFrQjtBQUNoQztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsWUFBWSxzQkFBc0I7QUFDbEM7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxZQUFZLHNCQUFzQjtBQUNsQztBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFlBQVksc0JBQXNCO0FBQ2xDO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsWUFBWSxzQkFBc0I7QUFDbEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxNQUFNOztBQUVOO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFlBQVksc0JBQXNCO0FBQ2xDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxZQUFZLHNCQUFzQjtBQUNsQztBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxZQUFZLHNCQUFzQjtBQUNsQztBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGVBQWUsa0JBQWtCOztBQUVqQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsWUFBWSxzQkFBc0I7QUFDbEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsWUFBWSxzQkFBc0I7QUFDbEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsWUFBWSxzQkFBc0I7QUFDbEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxZQUFZLHNCQUFzQjtBQUNsQztBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsWUFBWSxzQkFBc0I7QUFDbEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsWUFBWSxzQkFBc0I7QUFDbEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0EsT0FBTztBQUNQO0FBQ0EsT0FBTztBQUNQO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBLEVBQUU7QUFDRjs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsYUFBYSxrQkFBa0I7O0FBRS9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsWUFBWSx3QkFBd0I7O0FBRXBDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsR0FBRzs7QUFFSDtBQUNBLGNBQWMsa0JBQWtCOztBQUVoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsWUFBWSxzQkFBc0I7QUFDbEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGdCQUFnQixrQkFBa0I7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixZQUFZO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsS0FBSzs7QUFFTDtBQUNBLGdCQUFnQixrQkFBa0I7QUFDbEM7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTs7O0FBR0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsR0FBRztBQUNIOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxzQkFBc0I7QUFDbEM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxFQUFFOztBQUVGOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxhQUFhLCtCQUErQjtBQUM1QztBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxhQUFhLFlBQVk7QUFDekI7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EscUJBQXFCLFlBQVk7QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxZQUFZLHNCQUFzQjtBQUNsQztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxnQkFBZ0IsU0FBUztBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsWUFBWSxzQkFBc0I7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7O0FBRUEsQ0FBQyIsImZpbGUiOiJ2ZW5kb3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlIGpDYW52YXMgdjIxLjAuMVxuICogQ29weXJpZ2h0IDIwMTcgQ2FsZWIgRXZhbnNcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICovXG4oZnVuY3Rpb24gKGpRdWVyeSwgZ2xvYmFsLCBmYWN0b3J5KSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xuXHRcdG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGpRdWVyeSwgdykge1xuXHRcdFx0cmV0dXJuIGZhY3RvcnkoalF1ZXJ5LCB3KTtcblx0XHR9O1xuXHR9IGVsc2Uge1xuXHRcdGZhY3RvcnkoalF1ZXJ5LCBnbG9iYWwpO1xuXHR9XG5cbi8vIFBhc3MgdGhpcyBpZiB3aW5kb3cgaXMgbm90IGRlZmluZWQgeWV0XG59KHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmpRdWVyeSA6IHt9LCB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHRoaXMsIGZ1bmN0aW9uICgkLCB3aW5kb3cpIHtcbid1c2Ugc3RyaWN0JztcblxudmFyIGRvY3VtZW50ID0gd2luZG93LmRvY3VtZW50LFxuXHRJbWFnZSA9IHdpbmRvdy5JbWFnZSxcblx0QXJyYXkgPSB3aW5kb3cuQXJyYXksXG5cdGdldENvbXB1dGVkU3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSxcblx0TWF0aCA9IHdpbmRvdy5NYXRoLFxuXHROdW1iZXIgPSB3aW5kb3cuTnVtYmVyLFxuXHRwYXJzZUZsb2F0ID0gd2luZG93LnBhcnNlRmxvYXQ7XG5cbi8vIERlZmluZSBsb2NhbCBhbGlhc2VzIHRvIGZyZXF1ZW50bHkgdXNlZCBwcm9wZXJ0aWVzXG52YXIgZGVmYXVsdHMsXG5cdC8vIEFsaWFzZXMgdG8galF1ZXJ5IG1ldGhvZHNcblx0ZXh0ZW5kT2JqZWN0ID0gJC5leHRlbmQsXG5cdGluQXJyYXkgPSAkLmluQXJyYXksXG5cdHR5cGVPZiA9IGZ1bmN0aW9uIChvcGVyYW5kKSB7XG5cdFx0cmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvcGVyYW5kKVxuXHRcdFx0LnNsaWNlKDgsIC0xKS50b0xvd2VyQ2FzZSgpO1xuXHR9LFxuXHRpc1BsYWluT2JqZWN0ID0gJC5pc1BsYWluT2JqZWN0LFxuXHQvLyBNYXRoIGNvbnN0YW50cyBhbmQgZnVuY3Rpb25zXG5cdFBJID0gTWF0aC5QSSxcblx0cm91bmQgPSBNYXRoLnJvdW5kLFxuXHRhYnMgPSBNYXRoLmFicyxcblx0c2luID0gTWF0aC5zaW4sXG5cdGNvcyA9IE1hdGguY29zLFxuXHRhdGFuMiA9IE1hdGguYXRhbjIsXG5cdC8vIFRoZSBBcnJheSBzbGljZSgpIG1ldGhvZFxuXHRhcnJheVNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLFxuXHQvLyBqUXVlcnkncyBpbnRlcm5hbCBldmVudCBub3JtYWxpemF0aW9uIGZ1bmN0aW9uXG5cdGpRdWVyeUV2ZW50Rml4ID0gJC5ldmVudC5maXgsXG5cdC8vIE9iamVjdCBmb3Igc3RvcmluZyBhIG51bWJlciBvZiBpbnRlcm5hbCBwcm9wZXJ0eSBtYXBzXG5cdG1hcHMgPSB7fSxcblx0Ly8galF1ZXJ5IGludGVybmFsIGNhY2hlc1xuXHRjYWNoZXMgPSB7XG5cdFx0ZGF0YUNhY2hlOiB7fSxcblx0XHRwcm9wQ2FjaGU6IHt9LFxuXHRcdGltYWdlQ2FjaGU6IHt9XG5cdH0sXG5cdC8vIEJhc2UgdHJhbnNmb3JtYXRpb25zXG5cdGJhc2VUcmFuc2Zvcm1zID0ge1xuXHRcdHJvdGF0ZTogMCxcblx0XHRzY2FsZVg6IDEsXG5cdFx0c2NhbGVZOiAxLFxuXHRcdHRyYW5zbGF0ZVg6IDAsXG5cdFx0dHJhbnNsYXRlWTogMCxcblx0XHQvLyBTdG9yZSBhbGwgcHJldmlvdXMgbWFza3Ncblx0XHRtYXNrczogW11cblx0fSxcblx0Ly8gT2JqZWN0IGZvciBzdG9yaW5nIENTUy1yZWxhdGVkIHByb3BlcnRpZXNcblx0Y3NzID0ge30sXG5cdHRhbmdpYmxlRXZlbnRzID0gW1xuXHRcdCdtb3VzZWRvd24nLFxuXHRcdCdtb3VzZW1vdmUnLFxuXHRcdCdtb3VzZXVwJyxcblx0XHQnbW91c2VvdmVyJyxcblx0XHQnbW91c2VvdXQnLFxuXHRcdCd0b3VjaHN0YXJ0Jyxcblx0XHQndG91Y2htb3ZlJyxcblx0XHQndG91Y2hlbmQnXG5cdF07XG5cbi8vIENvbnN0cnVjdG9yIGZvciBjcmVhdGluZyBvYmplY3RzIHRoYXQgaW5oZXJpdCBmcm9tIGpDYW52YXMgcHJlZmVyZW5jZXMgYW5kIGRlZmF1bHRzXG5mdW5jdGlvbiBqQ2FudmFzT2JqZWN0KGFyZ3MpIHtcblx0dmFyIHBhcmFtcyA9IHRoaXMsXG5cdFx0cHJvcE5hbWU7XG5cdC8vIENvcHkgdGhlIGdpdmVuIHBhcmFtZXRlcnMgaW50byBuZXcgb2JqZWN0XG5cdGZvciAocHJvcE5hbWUgaW4gYXJncykge1xuXHRcdC8vIERvIG5vdCBtZXJnZSBkZWZhdWx0cyBpbnRvIHBhcmFtZXRlcnNcblx0XHRpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGFyZ3MsIHByb3BOYW1lKSkge1xuXHRcdFx0cGFyYW1zW3Byb3BOYW1lXSA9IGFyZ3NbcHJvcE5hbWVdO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcGFyYW1zO1xufVxuXG4vLyBqQ2FudmFzIG9iamVjdCBpbiB3aGljaCBnbG9iYWwgc2V0dGluZ3MgYXJlIG90aGVyIGRhdGEgYXJlIHN0b3JlZFxudmFyIGpDYW52YXMgPSB7XG5cdC8vIEV2ZW50cyBvYmplY3QgZm9yIHN0b3JpbmcgakNhbnZhcyBldmVudCBpbml0aWF0aW9uIGZ1bmN0aW9uc1xuXHRldmVudHM6IHt9LFxuXHQvLyBPYmplY3QgY29udGFpbmluZyBhbGwgakNhbnZhcyBldmVudCBob29rc1xuXHRldmVudEhvb2tzOiB7fSxcblx0Ly8gU2V0dGluZ3MgZm9yIGVuYWJsaW5nIGZ1dHVyZSBqQ2FudmFzIGZlYXR1cmVzXG5cdGZ1dHVyZToge31cbn07XG5cbi8vIGpDYW52YXMgZGVmYXVsdCBwcm9wZXJ0eSB2YWx1ZXNcbmZ1bmN0aW9uIGpDYW52YXNEZWZhdWx0cygpIHtcblx0ZXh0ZW5kT2JqZWN0KHRoaXMsIGpDYW52YXNEZWZhdWx0cy5iYXNlRGVmYXVsdHMpO1xufVxuakNhbnZhc0RlZmF1bHRzLmJhc2VEZWZhdWx0cyA9IHtcblx0YWxpZ246ICdjZW50ZXInLFxuXHRhcnJvd0FuZ2xlOiA5MCxcblx0YXJyb3dSYWRpdXM6IDAsXG5cdGF1dG9zYXZlOiB0cnVlLFxuXHRiYXNlbGluZTogJ21pZGRsZScsXG5cdGJyaW5nVG9Gcm9udDogZmFsc2UsXG5cdGNjdzogZmFsc2UsXG5cdGNsb3NlZDogZmFsc2UsXG5cdGNvbXBvc2l0aW5nOiAnc291cmNlLW92ZXInLFxuXHRjb25jYXZpdHk6IDAsXG5cdGNvcm5lclJhZGl1czogMCxcblx0Y291bnQ6IDEsXG5cdGNyb3BGcm9tQ2VudGVyOiB0cnVlLFxuXHRjcm9zc09yaWdpbjogbnVsbCxcblx0Y3Vyc29yczogbnVsbCxcblx0ZGlzYWJsZUV2ZW50czogZmFsc2UsXG5cdGRyYWdnYWJsZTogZmFsc2UsXG5cdGRyYWdHcm91cHM6IG51bGwsXG5cdGdyb3VwczogbnVsbCxcblx0ZGF0YTogbnVsbCxcblx0ZHg6IG51bGwsXG5cdGR5OiBudWxsLFxuXHRlbmQ6IDM2MCxcblx0ZXZlbnRYOiBudWxsLFxuXHRldmVudFk6IG51bGwsXG5cdGZpbGxTdHlsZTogJ3RyYW5zcGFyZW50Jyxcblx0Zm9udFN0eWxlOiAnbm9ybWFsJyxcblx0Zm9udFNpemU6ICcxMnB0Jyxcblx0Zm9udEZhbWlseTogJ3NhbnMtc2VyaWYnLFxuXHRmcm9tQ2VudGVyOiB0cnVlLFxuXHRoZWlnaHQ6IG51bGwsXG5cdGltYWdlU21vb3RoaW5nOiB0cnVlLFxuXHRpbkRlZ3JlZXM6IHRydWUsXG5cdGludGFuZ2libGU6IGZhbHNlLFxuXHRpbmRleDogbnVsbCxcblx0bGV0dGVyU3BhY2luZzogbnVsbCxcblx0bGluZUhlaWdodDogMSxcblx0bGF5ZXI6IGZhbHNlLFxuXHRtYXNrOiBmYWxzZSxcblx0bWF4V2lkdGg6IG51bGwsXG5cdG1pdGVyTGltaXQ6IDEwLFxuXHRuYW1lOiBudWxsLFxuXHRvcGFjaXR5OiAxLFxuXHRyMTogbnVsbCxcblx0cjI6IG51bGwsXG5cdHJhZGl1czogMCxcblx0cmVwZWF0OiAncmVwZWF0Jyxcblx0cmVzcGVjdEFsaWduOiBmYWxzZSxcblx0cmVzdHJpY3REcmFnVG9BeGlzOiBudWxsLFxuXHRyb3RhdGU6IDAsXG5cdHJvdW5kZWQ6IGZhbHNlLFxuXHRzY2FsZTogMSxcblx0c2NhbGVYOiAxLFxuXHRzY2FsZVk6IDEsXG5cdHNoYWRvd0JsdXI6IDAsXG5cdHNoYWRvd0NvbG9yOiAndHJhbnNwYXJlbnQnLFxuXHRzaGFkb3dTdHJva2U6IGZhbHNlLFxuXHRzaGFkb3dYOiAwLFxuXHRzaGFkb3dZOiAwLFxuXHRzSGVpZ2h0OiBudWxsLFxuXHRzaWRlczogMCxcblx0c291cmNlOiAnJyxcblx0c3ByZWFkOiAwLFxuXHRzdGFydDogMCxcblx0c3Ryb2tlQ2FwOiAnYnV0dCcsXG5cdHN0cm9rZURhc2g6IG51bGwsXG5cdHN0cm9rZURhc2hPZmZzZXQ6IDAsXG5cdHN0cm9rZUpvaW46ICdtaXRlcicsXG5cdHN0cm9rZVN0eWxlOiAndHJhbnNwYXJlbnQnLFxuXHRzdHJva2VXaWR0aDogMSxcblx0c1dpZHRoOiBudWxsLFxuXHRzeDogbnVsbCxcblx0c3k6IG51bGwsXG5cdHRleHQ6ICcnLFxuXHR0cmFuc2xhdGU6IDAsXG5cdHRyYW5zbGF0ZVg6IDAsXG5cdHRyYW5zbGF0ZVk6IDAsXG5cdHR5cGU6IG51bGwsXG5cdHZpc2libGU6IHRydWUsXG5cdHdpZHRoOiBudWxsLFxuXHR4OiAwLFxuXHR5OiAwXG59O1xuZGVmYXVsdHMgPSBuZXcgakNhbnZhc0RlZmF1bHRzKCk7XG5qQ2FudmFzT2JqZWN0LnByb3RvdHlwZSA9IGRlZmF1bHRzO1xuXG4vKiBJbnRlcm5hbCBoZWxwZXIgbWV0aG9kcyAqL1xuXG4vLyBEZXRlcm1pbmVzIGlmIHRoZSBnaXZlbiBvcGVyYW5kIGlzIGEgc3RyaW5nXG5mdW5jdGlvbiBpc1N0cmluZyhvcGVyYW5kKSB7XG5cdHJldHVybiAodHlwZU9mKG9wZXJhbmQpID09PSAnc3RyaW5nJyk7XG59XG5cbi8vIERldGVybWluZXMgaWYgdGhlIGdpdmVuIG9wZXJhbmQgaXMgYSBmdW5jdGlvblxuZnVuY3Rpb24gaXNGdW5jdGlvbihvcGVyYW5kKSB7XG5cdHJldHVybiAodHlwZU9mKG9wZXJhbmQpID09PSAnZnVuY3Rpb24nKTtcbn1cblxuLy8gRGV0ZXJtaW5lcyBpZiB0aGUgZ2l2ZW4gb3BlcmFuZCBpcyBudW1lcmljXG5mdW5jdGlvbiBpc051bWVyaWMob3BlcmFuZCkge1xuXHRyZXR1cm4gIWlzTmFOKE51bWJlcihvcGVyYW5kKSkgJiYgIWlzTmFOKHBhcnNlRmxvYXQob3BlcmFuZCkpO1xufVxuXG4vLyBHZXQgMkQgY29udGV4dCBmb3IgdGhlIGdpdmVuIGNhbnZhc1xuZnVuY3Rpb24gX2dldENvbnRleHQoY2FudmFzKSB7XG5cdHJldHVybiAoY2FudmFzICYmIGNhbnZhcy5nZXRDb250ZXh0ID8gY2FudmFzLmdldENvbnRleHQoJzJkJykgOiBudWxsKTtcbn1cblxuLy8gQ29lcmNlIGRlc2lnbmF0ZWQgbnVtYmVyIHByb3BlcnRpZXMgZnJvbSBzdHJpbmdzIHRvIG51bWJlcnNcbmZ1bmN0aW9uIF9jb2VyY2VOdW1lcmljUHJvcHMocHJvcHMpIHtcblx0dmFyIHByb3BOYW1lLCBwcm9wVHlwZSwgcHJvcFZhbHVlO1xuXHQvLyBMb29wIHRocm91Z2ggYWxsIHByb3BlcnRpZXMgaW4gZ2l2ZW4gcHJvcGVydHkgbWFwXG5cdGZvciAocHJvcE5hbWUgaW4gcHJvcHMpIHtcblx0XHRpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3BzLCBwcm9wTmFtZSkpIHtcblx0XHRcdHByb3BWYWx1ZSA9IHByb3BzW3Byb3BOYW1lXTtcblx0XHRcdHByb3BUeXBlID0gdHlwZU9mKHByb3BWYWx1ZSk7XG5cdFx0XHQvLyBJZiBwcm9wZXJ0eSBpcyBub24tZW1wdHkgc3RyaW5nIGFuZCB2YWx1ZSBpcyBudW1lcmljXG5cdFx0XHRpZiAocHJvcFR5cGUgPT09ICdzdHJpbmcnICYmIGlzTnVtZXJpYyhwcm9wVmFsdWUpICYmIHByb3BOYW1lICE9PSAndGV4dCcpIHtcblx0XHRcdFx0Ly8gQ29udmVydCB2YWx1ZSB0byBudW1iZXJcblx0XHRcdFx0cHJvcHNbcHJvcE5hbWVdID0gcGFyc2VGbG9hdChwcm9wVmFsdWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHQvLyBFbnN1cmUgdmFsdWUgb2YgdGV4dCBwcm9wZXJ0eSBpcyBhbHdheXMgYSBzdHJpbmdcblx0aWYgKHByb3BzLnRleHQgIT09IHVuZGVmaW5lZCkge1xuXHRcdHByb3BzLnRleHQgPSBTdHJpbmcocHJvcHMudGV4dCk7XG5cdH1cbn1cblxuLy8gQ2xvbmUgdGhlIGdpdmVuIHRyYW5zZm9ybWF0aW9ucyBvYmplY3RcbmZ1bmN0aW9uIF9jbG9uZVRyYW5zZm9ybXModHJhbnNmb3Jtcykge1xuXHQvLyBDbG9uZSB0aGUgb2JqZWN0IGl0c2VsZlxuXHR0cmFuc2Zvcm1zID0gZXh0ZW5kT2JqZWN0KHt9LCB0cmFuc2Zvcm1zKTtcblx0Ly8gQ2xvbmUgdGhlIG9iamVjdCdzIG1hc2tzIGFycmF5XG5cdHRyYW5zZm9ybXMubWFza3MgPSB0cmFuc2Zvcm1zLm1hc2tzLnNsaWNlKDApO1xuXHRyZXR1cm4gdHJhbnNmb3Jtcztcbn1cblxuLy8gU2F2ZSBjYW52YXMgY29udGV4dCBhbmQgdXBkYXRlIHRyYW5zZm9ybWF0aW9uIHN0YWNrXG5mdW5jdGlvbiBfc2F2ZUNhbnZhcyhjdHgsIGRhdGEpIHtcblx0dmFyIHRyYW5zZm9ybXM7XG5cdGN0eC5zYXZlKCk7XG5cdHRyYW5zZm9ybXMgPSBfY2xvbmVUcmFuc2Zvcm1zKGRhdGEudHJhbnNmb3Jtcyk7XG5cdGRhdGEuc2F2ZWRUcmFuc2Zvcm1zLnB1c2godHJhbnNmb3Jtcyk7XG59XG5cbi8vIFJlc3RvcmUgY2FudmFzIGNvbnRleHQgdXBkYXRlIHRyYW5zZm9ybWF0aW9uIHN0YWNrXG5mdW5jdGlvbiBfcmVzdG9yZUNhbnZhcyhjdHgsIGRhdGEpIHtcblx0aWYgKGRhdGEuc2F2ZWRUcmFuc2Zvcm1zLmxlbmd0aCA9PT0gMCkge1xuXHRcdC8vIFJlc2V0IHRyYW5zZm9ybWF0aW9uIHN0YXRlIGlmIGl0IGNhbid0IGJlIHJlc3RvcmVkIGFueSBtb3JlXG5cdFx0ZGF0YS50cmFuc2Zvcm1zID0gX2Nsb25lVHJhbnNmb3JtcyhiYXNlVHJhbnNmb3Jtcyk7XG5cdH0gZWxzZSB7XG5cdFx0Ly8gUmVzdG9yZSBjYW52YXMgY29udGV4dFxuXHRcdGN0eC5yZXN0b3JlKCk7XG5cdFx0Ly8gUmVzdG9yZSBjdXJyZW50IHRyYW5zZm9ybSBzdGF0ZSB0byB0aGUgbGFzdCBzYXZlZCBzdGF0ZVxuXHRcdGRhdGEudHJhbnNmb3JtcyA9IGRhdGEuc2F2ZWRUcmFuc2Zvcm1zLnBvcCgpO1xuXHR9XG59XG5cbi8vIFNldCB0aGUgc3R5bGUgd2l0aCB0aGUgZ2l2ZW4gbmFtZVxuZnVuY3Rpb24gX3NldFN0eWxlKGNhbnZhcywgY3R4LCBwYXJhbXMsIHN0eWxlTmFtZSkge1xuXHRpZiAocGFyYW1zW3N0eWxlTmFtZV0pIHtcblx0XHRpZiAoaXNGdW5jdGlvbihwYXJhbXNbc3R5bGVOYW1lXSkpIHtcblx0XHRcdC8vIEhhbmRsZSBmdW5jdGlvbnNcblx0XHRcdGN0eFtzdHlsZU5hbWVdID0gcGFyYW1zW3N0eWxlTmFtZV0uY2FsbChjYW52YXMsIHBhcmFtcyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIEhhbmRsZSBzdHJpbmcgdmFsdWVzXG5cdFx0XHRjdHhbc3R5bGVOYW1lXSA9IHBhcmFtc1tzdHlsZU5hbWVdO1xuXHRcdH1cblx0fVxufVxuXG4vLyBTZXQgY2FudmFzIGNvbnRleHQgcHJvcGVydGllc1xuZnVuY3Rpb24gX3NldEdsb2JhbFByb3BzKGNhbnZhcywgY3R4LCBwYXJhbXMpIHtcblx0X3NldFN0eWxlKGNhbnZhcywgY3R4LCBwYXJhbXMsICdmaWxsU3R5bGUnKTtcblx0X3NldFN0eWxlKGNhbnZhcywgY3R4LCBwYXJhbXMsICdzdHJva2VTdHlsZScpO1xuXHRjdHgubGluZVdpZHRoID0gcGFyYW1zLnN0cm9rZVdpZHRoO1xuXHQvLyBPcHRpb25hbGx5IHJvdW5kIGNvcm5lcnMgZm9yIHBhdGhzXG5cdGlmIChwYXJhbXMucm91bmRlZCkge1xuXHRcdGN0eC5saW5lQ2FwID0gY3R4LmxpbmVKb2luID0gJ3JvdW5kJztcblx0fSBlbHNlIHtcblx0XHRjdHgubGluZUNhcCA9IHBhcmFtcy5zdHJva2VDYXA7XG5cdFx0Y3R4LmxpbmVKb2luID0gcGFyYW1zLnN0cm9rZUpvaW47XG5cdFx0Y3R4Lm1pdGVyTGltaXQgPSBwYXJhbXMubWl0ZXJMaW1pdDtcblx0fVxuXHQvLyBSZXNldCBzdHJva2VEYXNoIGlmIG51bGxcblx0aWYgKCFwYXJhbXMuc3Ryb2tlRGFzaCkge1xuXHRcdHBhcmFtcy5zdHJva2VEYXNoID0gW107XG5cdH1cblx0Ly8gRGFzaGVkIGxpbmVzXG5cdGlmIChjdHguc2V0TGluZURhc2gpIHtcblx0XHRjdHguc2V0TGluZURhc2gocGFyYW1zLnN0cm9rZURhc2gpO1xuXHR9XG5cdGN0eC53ZWJraXRMaW5lRGFzaCA9IHBhcmFtcy5zdHJva2VEYXNoO1xuXHRjdHgubGluZURhc2hPZmZzZXQgPSBjdHgud2Via2l0TGluZURhc2hPZmZzZXQgPSBjdHgubW96RGFzaE9mZnNldCA9IHBhcmFtcy5zdHJva2VEYXNoT2Zmc2V0O1xuXHQvLyBEcm9wIHNoYWRvd1xuXHRjdHguc2hhZG93T2Zmc2V0WCA9IHBhcmFtcy5zaGFkb3dYO1xuXHRjdHguc2hhZG93T2Zmc2V0WSA9IHBhcmFtcy5zaGFkb3dZO1xuXHRjdHguc2hhZG93Qmx1ciA9IHBhcmFtcy5zaGFkb3dCbHVyO1xuXHRjdHguc2hhZG93Q29sb3IgPSBwYXJhbXMuc2hhZG93Q29sb3I7XG5cdC8vIE9wYWNpdHkgYW5kIGNvbXBvc2l0ZSBvcGVyYXRpb25cblx0Y3R4Lmdsb2JhbEFscGhhID0gcGFyYW1zLm9wYWNpdHk7XG5cdGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSBwYXJhbXMuY29tcG9zaXRpbmc7XG5cdC8vIFN1cHBvcnQgY3Jvc3MtYnJvd3NlciB0b2dnbGluZyBvZiBpbWFnZSBzbW9vdGhpbmdcblx0aWYgKHBhcmFtcy5pbWFnZVNtb290aGluZykge1xuXHRcdGN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBwYXJhbXMuaW1hZ2VTbW9vdGhpbmc7XG5cdH1cbn1cblxuLy8gT3B0aW9uYWxseSBlbmFibGUgbWFza2luZyBzdXBwb3J0IGZvciB0aGlzIHBhdGhcbmZ1bmN0aW9uIF9lbmFibGVNYXNraW5nKGN0eCwgZGF0YSwgcGFyYW1zKSB7XG5cdGlmIChwYXJhbXMubWFzaykge1xuXHRcdC8vIElmIGpDYW52YXMgYXV0b3NhdmUgaXMgZW5hYmxlZFxuXHRcdGlmIChwYXJhbXMuYXV0b3NhdmUpIHtcblx0XHRcdC8vIEF1dG9tYXRpY2FsbHkgc2F2ZSB0cmFuc2Zvcm1hdGlvbiBzdGF0ZSBieSBkZWZhdWx0XG5cdFx0XHRfc2F2ZUNhbnZhcyhjdHgsIGRhdGEpO1xuXHRcdH1cblx0XHQvLyBDbGlwIHRoZSBjdXJyZW50IHBhdGhcblx0XHRjdHguY2xpcCgpO1xuXHRcdC8vIEtlZXAgdHJhY2sgb2YgY3VycmVudCBtYXNrc1xuXHRcdGRhdGEudHJhbnNmb3Jtcy5tYXNrcy5wdXNoKHBhcmFtcy5fYXJncyk7XG5cdH1cbn1cblxuLy8gUmVzdG9yZSBpbmRpdmlkdWFsIHNoYXBlIHRyYW5zZm9ybWF0aW9uXG5mdW5jdGlvbiBfcmVzdG9yZVRyYW5zZm9ybShjdHgsIHBhcmFtcykge1xuXHQvLyBJZiBzaGFwZSBoYXMgYmVlbiB0cmFuc2Zvcm1lZCBieSBqQ2FudmFzXG5cdGlmIChwYXJhbXMuX3RyYW5zZm9ybWVkKSB7XG5cdFx0Ly8gUmVzdG9yZSBjYW52YXMgY29udGV4dFxuXHRcdGN0eC5yZXN0b3JlKCk7XG5cdH1cbn1cblxuLy8gQ2xvc2UgY3VycmVudCBjYW52YXMgcGF0aFxuZnVuY3Rpb24gX2Nsb3NlUGF0aChjYW52YXMsIGN0eCwgcGFyYW1zKSB7XG5cdHZhciBkYXRhO1xuXG5cdC8vIE9wdGlvbmFsbHkgY2xvc2UgcGF0aFxuXHRpZiAocGFyYW1zLmNsb3NlZCkge1xuXHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0fVxuXG5cdGlmIChwYXJhbXMuc2hhZG93U3Ryb2tlICYmIHBhcmFtcy5zdHJva2VXaWR0aCAhPT0gMCkge1xuXHRcdC8vIEV4dGVuZCB0aGUgc2hhZG93IHRvIGluY2x1ZGUgdGhlIHN0cm9rZSBvZiBhIGRyYXdpbmdcblxuXHRcdC8vIEFkZCBhIHN0cm9rZSBzaGFkb3cgYnkgc3Ryb2tpbmcgYmVmb3JlIGZpbGxpbmdcblx0XHRjdHguc3Ryb2tlKCk7XG5cdFx0Y3R4LmZpbGwoKTtcblx0XHQvLyBFbnN1cmUgdGhlIGJlbG93IHN0cm9raW5nIGRvZXMgbm90IGluaGVyaXQgYSBzaGFkb3dcblx0XHRjdHguc2hhZG93Q29sb3IgPSAndHJhbnNwYXJlbnQnO1xuXHRcdGN0eC5zaGFkb3dCbHVyID0gMDtcblx0XHQvLyBTdHJva2Ugb3ZlciBmaWxsIGFzIHVzdWFsXG5cdFx0Y3R4LnN0cm9rZSgpO1xuXG5cdH0gZWxzZSB7XG5cdFx0Ly8gSWYgc2hhZG93U3Ryb2tlIGlzIG5vdCBlbmFibGVkLCBzdHJva2UgJiBmaWxsIGFzIHVzdWFsXG5cblx0XHRjdHguZmlsbCgpO1xuXHRcdC8vIFByZXZlbnQgZXh0cmEgc2hhZG93IGNyZWF0ZWQgYnkgc3Ryb2tlIChidXQgb25seSB3aGVuIGZpbGwgaXMgcHJlc2VudClcblx0XHRpZiAocGFyYW1zLmZpbGxTdHlsZSAhPT0gJ3RyYW5zcGFyZW50Jykge1xuXHRcdFx0Y3R4LnNoYWRvd0NvbG9yID0gJ3RyYW5zcGFyZW50Jztcblx0XHR9XG5cdFx0aWYgKHBhcmFtcy5zdHJva2VXaWR0aCAhPT0gMCkge1xuXHRcdFx0Ly8gT25seSBzdHJva2UgaWYgdGhlIHN0cm9rZSBpcyBub3QgMFxuXHRcdFx0Y3R4LnN0cm9rZSgpO1xuXHRcdH1cblxuXHR9XG5cblx0Ly8gT3B0aW9uYWxseSBjbG9zZSBwYXRoXG5cdGlmICghcGFyYW1zLmNsb3NlZCkge1xuXHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0fVxuXG5cdC8vIFJlc3RvcmUgaW5kaXZpZHVhbCBzaGFwZSB0cmFuc2Zvcm1hdGlvblxuXHRfcmVzdG9yZVRyYW5zZm9ybShjdHgsIHBhcmFtcyk7XG5cblx0Ly8gTWFzayBzaGFwZSBpZiBjaG9zZW5cblx0aWYgKHBhcmFtcy5tYXNrKSB7XG5cdFx0Ly8gUmV0cmlldmUgY2FudmFzIGRhdGFcblx0XHRkYXRhID0gX2dldENhbnZhc0RhdGEoY2FudmFzKTtcblx0XHRfZW5hYmxlTWFza2luZyhjdHgsIGRhdGEsIHBhcmFtcyk7XG5cdH1cblxufVxuXG4vLyBUcmFuc2Zvcm0gKHRyYW5zbGF0ZSwgc2NhbGUsIG9yIHJvdGF0ZSkgc2hhcGVcbmZ1bmN0aW9uIF90cmFuc2Zvcm1TaGFwZShjYW52YXMsIGN0eCwgcGFyYW1zLCB3aWR0aCwgaGVpZ2h0KSB7XG5cblx0Ly8gR2V0IGNvbnZlcnNpb24gZmFjdG9yIGZvciByYWRpYW5zXG5cdHBhcmFtcy5fdG9SYWQgPSAocGFyYW1zLmluRGVncmVlcyA/IChQSSAvIDE4MCkgOiAxKTtcblxuXHRwYXJhbXMuX3RyYW5zZm9ybWVkID0gdHJ1ZTtcblx0Y3R4LnNhdmUoKTtcblxuXHQvLyBPcHRpb25hbGx5IG1lYXN1cmUgKHgsIHkpIHBvc2l0aW9uIGZyb20gdG9wLWxlZnQgY29ybmVyXG5cdGlmICghcGFyYW1zLmZyb21DZW50ZXIgJiYgIXBhcmFtcy5fY2VudGVyZWQgJiYgd2lkdGggIT09IHVuZGVmaW5lZCkge1xuXHRcdC8vIEFsd2F5cyBkcmF3IGZyb20gY2VudGVyIHVubGVzcyBvdGhlcndpc2Ugc3BlY2lmaWVkXG5cdFx0aWYgKGhlaWdodCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRoZWlnaHQgPSB3aWR0aDtcblx0XHR9XG5cdFx0cGFyYW1zLnggKz0gd2lkdGggLyAyO1xuXHRcdHBhcmFtcy55ICs9IGhlaWdodCAvIDI7XG5cdFx0cGFyYW1zLl9jZW50ZXJlZCA9IHRydWU7XG5cdH1cblx0Ly8gT3B0aW9uYWxseSByb3RhdGUgc2hhcGVcblx0aWYgKHBhcmFtcy5yb3RhdGUpIHtcblx0XHRfcm90YXRlQ2FudmFzKGN0eCwgcGFyYW1zLCBudWxsKTtcblx0fVxuXHQvLyBPcHRpb25hbGx5IHNjYWxlIHNoYXBlXG5cdGlmIChwYXJhbXMuc2NhbGUgIT09IDEgfHwgcGFyYW1zLnNjYWxlWCAhPT0gMSB8fCBwYXJhbXMuc2NhbGVZICE9PSAxKSB7XG5cdFx0X3NjYWxlQ2FudmFzKGN0eCwgcGFyYW1zLCBudWxsKTtcblx0fVxuXHQvLyBPcHRpb25hbGx5IHRyYW5zbGF0ZSBzaGFwZVxuXHRpZiAocGFyYW1zLnRyYW5zbGF0ZSB8fCBwYXJhbXMudHJhbnNsYXRlWCB8fCBwYXJhbXMudHJhbnNsYXRlWSkge1xuXHRcdF90cmFuc2xhdGVDYW52YXMoY3R4LCBwYXJhbXMsIG51bGwpO1xuXHR9XG5cbn1cblxuLyogUGx1Z2luIEFQSSAqL1xuXG4vLyBFeHRlbmQgakNhbnZhcyB3aXRoIGEgdXNlci1kZWZpbmVkIG1ldGhvZFxuakNhbnZhcy5leHRlbmQgPSBmdW5jdGlvbiBleHRlbmQocGx1Z2luKSB7XG5cblx0Ly8gQ3JlYXRlIHBsdWdpblxuXHRpZiAocGx1Z2luLm5hbWUpIHtcblx0XHQvLyBNZXJnZSBwcm9wZXJ0aWVzIHdpdGggZGVmYXVsdHNcblx0XHRpZiAocGx1Z2luLnByb3BzKSB7XG5cdFx0XHRleHRlbmRPYmplY3QoZGVmYXVsdHMsIHBsdWdpbi5wcm9wcyk7XG5cdFx0fVxuXHRcdC8vIERlZmluZSBwbHVnaW4gbWV0aG9kXG5cdFx0JC5mbltwbHVnaW4ubmFtZV0gPSBmdW5jdGlvbiBzZWxmKGFyZ3MpIHtcblx0XHRcdHZhciAkY2FudmFzZXMgPSB0aGlzLCBjYW52YXMsIGUsIGN0eCxcblx0XHRcdFx0cGFyYW1zO1xuXG5cdFx0XHRmb3IgKGUgPSAwOyBlIDwgJGNhbnZhc2VzLmxlbmd0aDsgZSArPSAxKSB7XG5cdFx0XHRcdGNhbnZhcyA9ICRjYW52YXNlc1tlXTtcblx0XHRcdFx0Y3R4ID0gX2dldENvbnRleHQoY2FudmFzKTtcblx0XHRcdFx0aWYgKGN0eCkge1xuXG5cdFx0XHRcdFx0cGFyYW1zID0gbmV3IGpDYW52YXNPYmplY3QoYXJncyk7XG5cdFx0XHRcdFx0X2FkZExheWVyKGNhbnZhcywgcGFyYW1zLCBhcmdzLCBzZWxmKTtcblxuXHRcdFx0XHRcdF9zZXRHbG9iYWxQcm9wcyhjYW52YXMsIGN0eCwgcGFyYW1zKTtcblx0XHRcdFx0XHRwbHVnaW4uZm4uY2FsbChjYW52YXMsIGN0eCwgcGFyYW1zKTtcblxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gJGNhbnZhc2VzO1xuXHRcdH07XG5cdFx0Ly8gQWRkIGRyYXdpbmcgdHlwZSB0byBkcmF3aW5nIG1hcFxuXHRcdGlmIChwbHVnaW4udHlwZSkge1xuXHRcdFx0bWFwcy5kcmF3aW5nc1twbHVnaW4udHlwZV0gPSBwbHVnaW4ubmFtZTtcblx0XHR9XG5cdH1cblx0cmV0dXJuICQuZm5bcGx1Z2luLm5hbWVdO1xufTtcblxuLyogTGF5ZXIgQVBJICovXG5cbi8vIFJldHJpZXZlZCB0aGUgc3RvcmVkIGpDYW52YXMgZGF0YSBmb3IgYSBjYW52YXMgZWxlbWVudFxuZnVuY3Rpb24gX2dldENhbnZhc0RhdGEoY2FudmFzKSB7XG5cdHZhciBkYXRhQ2FjaGUgPSBjYWNoZXMuZGF0YUNhY2hlLCBkYXRhO1xuXHRpZiAoZGF0YUNhY2hlLl9jYW52YXMgPT09IGNhbnZhcyAmJiBkYXRhQ2FjaGUuX2RhdGEpIHtcblxuXHRcdC8vIFJldHJpZXZlIGNhbnZhcyBkYXRhIGZyb20gY2FjaGUgaWYgcG9zc2libGVcblx0XHRkYXRhID0gZGF0YUNhY2hlLl9kYXRhO1xuXG5cdH0gZWxzZSB7XG5cblx0XHQvLyBSZXRyaWV2ZSBjYW52YXMgZGF0YSBmcm9tIGpRdWVyeSdzIGludGVybmFsIGRhdGEgc3RvcmFnZVxuXHRcdGRhdGEgPSAkLmRhdGEoY2FudmFzLCAnakNhbnZhcycpO1xuXHRcdGlmICghZGF0YSkge1xuXG5cdFx0XHQvLyBDcmVhdGUgY2FudmFzIGRhdGEgb2JqZWN0IGlmIGl0IGRvZXMgbm90IGFscmVhZHkgZXhpc3Rcblx0XHRcdGRhdGEgPSB7XG5cdFx0XHRcdC8vIFRoZSBhc3NvY2lhdGVkIGNhbnZhcyBlbGVtZW50XG5cdFx0XHRcdGNhbnZhczogY2FudmFzLFxuXHRcdFx0XHQvLyBMYXllcnMgYXJyYXlcblx0XHRcdFx0bGF5ZXJzOiBbXSxcblx0XHRcdFx0Ly8gTGF5ZXIgbWFwc1xuXHRcdFx0XHRsYXllcjoge1xuXHRcdFx0XHRcdG5hbWVzOiB7fSxcblx0XHRcdFx0XHRncm91cHM6IHt9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGV2ZW50SG9va3M6IHt9LFxuXHRcdFx0XHQvLyBBbGwgbGF5ZXJzIHRoYXQgaW50ZXJzZWN0IHdpdGggdGhlIGV2ZW50IGNvb3JkaW5hdGVzIChyZWdhcmRsZXNzIG9mIHZpc2liaWxpdHkpXG5cdFx0XHRcdGludGVyc2VjdGluZzogW10sXG5cdFx0XHRcdC8vIFRoZSB0b3Btb3N0IGxheWVyIHdob3NlIGFyZWEgY29udGFpbnMgdGhlIGV2ZW50IGNvb3JkaW5hdGVzXG5cdFx0XHRcdGxhc3RJbnRlcnNlY3RlZDogbnVsbCxcblx0XHRcdFx0Y3Vyc29yOiAkKGNhbnZhcykuY3NzKCdjdXJzb3InKSxcblx0XHRcdFx0Ly8gUHJvcGVydGllcyBmb3IgdGhlIGN1cnJlbnQgZHJhZyBldmVudFxuXHRcdFx0XHRkcmFnOiB7XG5cdFx0XHRcdFx0bGF5ZXI6IG51bGwsXG5cdFx0XHRcdFx0ZHJhZ2dpbmc6IGZhbHNlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdC8vIERhdGEgZm9yIHRoZSBjdXJyZW50IGV2ZW50XG5cdFx0XHRcdGV2ZW50OiB7XG5cdFx0XHRcdFx0dHlwZTogbnVsbCxcblx0XHRcdFx0XHR4OiBudWxsLFxuXHRcdFx0XHRcdHk6IG51bGxcblx0XHRcdFx0fSxcblx0XHRcdFx0Ly8gRXZlbnRzIHdoaWNoIGFscmVhZHkgaGF2ZSBiZWVuIGJvdW5kIHRvIHRoZSBjYW52YXNcblx0XHRcdFx0ZXZlbnRzOiB7fSxcblx0XHRcdFx0Ly8gVGhlIGNhbnZhcydzIGN1cnJlbnQgdHJhbnNmb3JtYXRpb24gc3RhdGVcblx0XHRcdFx0dHJhbnNmb3JtczogX2Nsb25lVHJhbnNmb3JtcyhiYXNlVHJhbnNmb3JtcyksXG5cdFx0XHRcdHNhdmVkVHJhbnNmb3JtczogW10sXG5cdFx0XHRcdC8vIFdoZXRoZXIgYSBsYXllciBpcyBiZWluZyBhbmltYXRlZCBvciBub3Rcblx0XHRcdFx0YW5pbWF0aW5nOiBmYWxzZSxcblx0XHRcdFx0Ly8gVGhlIGxheWVyIGN1cnJlbnRseSBiZWluZyBhbmltYXRlZFxuXHRcdFx0XHRhbmltYXRlZDogbnVsbCxcblx0XHRcdFx0Ly8gVGhlIGRldmljZSBwaXhlbCByYXRpb1xuXHRcdFx0XHRwaXhlbFJhdGlvOiAxLFxuXHRcdFx0XHQvLyBXaGV0aGVyIHBpeGVsIHJhdGlvIHRyYW5zZm9ybWF0aW9ucyBoYXZlIGJlZW4gYXBwbGllZFxuXHRcdFx0XHRzY2FsZWQ6IGZhbHNlLFxuXHRcdFx0XHQvLyBXaGV0aGVyIHRoZSBjYW52YXMgc2hvdWxkIGJlIHJlZHJhd24gd2hlbiBhIGxheWVyIG1vdXNlbW92ZVxuXHRcdFx0XHQvLyBldmVudCB0cmlnZ2VycyAoZWl0aGVyIGRpcmVjdGx5LCBvciBpbmRpcmVjdGx5IHZpYSBkcmFnZ2luZylcblx0XHRcdFx0cmVkcmF3T25Nb3VzZW1vdmU6IGZhbHNlXG5cdFx0XHR9O1xuXHRcdFx0Ly8gVXNlIGpRdWVyeSB0byBzdG9yZSBjYW52YXMgZGF0YVxuXHRcdFx0JC5kYXRhKGNhbnZhcywgJ2pDYW52YXMnLCBkYXRhKTtcblxuXHRcdH1cblx0XHQvLyBDYWNoZSBjYW52YXMgZGF0YSBmb3IgZmFzdGVyIHJldHJpZXZhbFxuXHRcdGRhdGFDYWNoZS5fY2FudmFzID0gY2FudmFzO1xuXHRcdGRhdGFDYWNoZS5fZGF0YSA9IGRhdGE7XG5cblx0fVxuXHRyZXR1cm4gZGF0YTtcbn1cblxuLy8gSW5pdGlhbGl6ZSBhbGwgb2YgYSBsYXllcidzIGFzc29jaWF0ZWQgakNhbnZhcyBldmVudHNcbmZ1bmN0aW9uIF9hZGRMYXllckV2ZW50cygkY2FudmFzLCBkYXRhLCBsYXllcikge1xuXHR2YXIgZXZlbnROYW1lO1xuXHQvLyBEZXRlcm1pbmUgd2hpY2ggakNhbnZhcyBldmVudHMgbmVlZCB0byBiZSBib3VuZCB0byB0aGlzIGxheWVyXG5cdGZvciAoZXZlbnROYW1lIGluIGpDYW52YXMuZXZlbnRzKSB7XG5cdFx0aWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChqQ2FudmFzLmV2ZW50cywgZXZlbnROYW1lKSkge1xuXHRcdFx0Ly8gSWYgbGF5ZXIgaGFzIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGNvbXBsZW1lbnQgaXRcblx0XHRcdGlmIChsYXllcltldmVudE5hbWVdIHx8IChsYXllci5jdXJzb3JzICYmIGxheWVyLmN1cnNvcnNbZXZlbnROYW1lXSkpIHtcblx0XHRcdFx0Ly8gQmluZCBldmVudCB0byBsYXllclxuXHRcdFx0XHRfYWRkRXhwbGljaXRMYXllckV2ZW50KCRjYW52YXMsIGRhdGEsIGxheWVyLCBldmVudE5hbWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRpZiAoIWRhdGEuZXZlbnRzLm1vdXNlb3V0KSB7XG5cdFx0JGNhbnZhcy5iaW5kKCdtb3VzZW91dC5qQ2FudmFzJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0Ly8gUmV0cmlldmUgdGhlIGxheWVyIHdob3NlIGRyYWcgZXZlbnQgd2FzIGNhbmNlbGVkXG5cdFx0XHR2YXIgbGF5ZXIgPSBkYXRhLmRyYWcubGF5ZXIsIGw7XG5cdFx0XHQvLyBJZiBjdXJzb3IgbW91c2VzIG91dCBvZiBjYW52YXMgd2hpbGUgZHJhZ2dpbmdcblx0XHRcdGlmIChsYXllcikge1xuXHRcdFx0XHQvLyBDYW5jZWwgZHJhZ1xuXHRcdFx0XHRkYXRhLmRyYWcgPSB7fTtcblx0XHRcdFx0X3RyaWdnZXJMYXllckV2ZW50KCRjYW52YXMsIGRhdGEsIGxheWVyLCAnZHJhZ2NhbmNlbCcpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gTG9vcCB0aHJvdWdoIGFsbCBsYXllcnNcblx0XHRcdGZvciAobCA9IDA7IGwgPCBkYXRhLmxheWVycy5sZW5ndGg7IGwgKz0gMSkge1xuXHRcdFx0XHRsYXllciA9IGRhdGEubGF5ZXJzW2xdO1xuXHRcdFx0XHQvLyBJZiBsYXllciB0aGlua3MgaXQncyBzdGlsbCBiZWluZyBtb3VzZWQgb3ZlclxuXHRcdFx0XHRpZiAobGF5ZXIuX2hvdmVyZWQpIHtcblx0XHRcdFx0XHQvLyBUcmlnZ2VyIG1vdXNlb3V0IG9uIGxheWVyXG5cdFx0XHRcdFx0JGNhbnZhcy50cmlnZ2VyTGF5ZXJFdmVudChkYXRhLmxheWVyc1tsXSwgJ21vdXNlb3V0Jyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vIFJlZHJhdyBsYXllcnNcblx0XHRcdCRjYW52YXMuZHJhd0xheWVycygpO1xuXHRcdH0pO1xuXHRcdC8vIEluZGljYXRlIHRoYXQgYW4gZXZlbnQgaGFuZGxlciBoYXMgYmVlbiBib3VuZFxuXHRcdGRhdGEuZXZlbnRzLm1vdXNlb3V0ID0gdHJ1ZTtcblx0fVxufVxuXG4vLyBJbml0aWFsaXplIHRoZSBnaXZlbiBldmVudCBvbiB0aGUgZ2l2ZW4gbGF5ZXJcbmZ1bmN0aW9uIF9hZGRMYXllckV2ZW50KCRjYW52YXMsIGRhdGEsIGxheWVyLCBldmVudE5hbWUpIHtcblx0Ly8gVXNlIHRvdWNoIGV2ZW50cyBpZiBhcHByb3ByaWF0ZVxuXHQvLyBldmVudE5hbWUgPSBfZ2V0TW91c2VFdmVudE5hbWUoZXZlbnROYW1lKTtcblx0Ly8gQmluZCBldmVudCB0byBsYXllclxuXHRqQ2FudmFzLmV2ZW50c1tldmVudE5hbWVdKCRjYW52YXMsIGRhdGEpO1xuXHRsYXllci5fZXZlbnQgPSB0cnVlO1xufVxuXG4vLyBBZGQgYSBsYXllciBldmVudCB0aGF0IHdhcyBleHBsaWNpdGx5IGRlY2xhcmVkIGluIHRoZSBsYXllcidzIHBhcmFtZXRlciBtYXAsXG4vLyBleGNsdWRpbmcgZXZlbnRzIGFkZGVkIGltcGxpY2l0bHkgKGUuZy4gbW91c2Vtb3ZlIGV2ZW50IHJlcXVpcmVkIGJ5IGRyYWdnYWJsZVxuLy8gbGF5ZXJzKVxuZnVuY3Rpb24gX2FkZEV4cGxpY2l0TGF5ZXJFdmVudCgkY2FudmFzLCBkYXRhLCBsYXllciwgZXZlbnROYW1lKSB7XG5cdF9hZGRMYXllckV2ZW50KCRjYW52YXMsIGRhdGEsIGxheWVyLCBldmVudE5hbWUpO1xuXHRpZiAoZXZlbnROYW1lID09PSAnbW91c2VvdmVyJyB8fCBldmVudE5hbWUgPT09ICdtb3VzZW91dCcgfHwgZXZlbnROYW1lID09PSAnbW91c2Vtb3ZlJykge1xuXHRcdGRhdGEucmVkcmF3T25Nb3VzZW1vdmUgPSB0cnVlO1xuXHR9XG59XG5cbi8vIEVuYWJsZSBkcmFnIHN1cHBvcnQgZm9yIHRoaXMgbGF5ZXJcbmZ1bmN0aW9uIF9lbmFibGVEcmFnKCRjYW52YXMsIGRhdGEsIGxheWVyKSB7XG5cdHZhciBkcmFnSGVscGVyRXZlbnRzLCBldmVudE5hbWUsIGk7XG5cdC8vIE9ubHkgbWFrZSBsYXllciBkcmFnZ2FibGUgaWYgbmVjZXNzYXJ5XG5cdGlmIChsYXllci5kcmFnZ2FibGUgfHwgbGF5ZXIuY3Vyc29ycykge1xuXG5cdFx0Ly8gT3JnYW5pemUgaGVscGVyIGV2ZW50cyB3aGljaCBlbmFibGUgZHJhZyBzdXBwb3J0XG5cdFx0ZHJhZ0hlbHBlckV2ZW50cyA9IFsnbW91c2Vkb3duJywgJ21vdXNlbW92ZScsICdtb3VzZXVwJ107XG5cblx0XHQvLyBCaW5kIGVhY2ggaGVscGVyIGV2ZW50IHRvIHRoZSBjYW52YXNcblx0XHRmb3IgKGkgPSAwOyBpIDwgZHJhZ0hlbHBlckV2ZW50cy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdFx0Ly8gVXNlIHRvdWNoIGV2ZW50cyBpZiBhcHByb3ByaWF0ZVxuXHRcdFx0ZXZlbnROYW1lID0gZHJhZ0hlbHBlckV2ZW50c1tpXTtcblx0XHRcdC8vIEJpbmQgZXZlbnRcblx0XHRcdF9hZGRMYXllckV2ZW50KCRjYW52YXMsIGRhdGEsIGxheWVyLCBldmVudE5hbWUpO1xuXHRcdH1cblx0XHQvLyBJbmRpY2F0ZSB0aGF0IHRoaXMgbGF5ZXIgaGFzIGV2ZW50cyBib3VuZCB0byBpdFxuXHRcdGxheWVyLl9ldmVudCA9IHRydWU7XG5cblx0fVxufVxuXG4vLyBVcGRhdGUgYSBsYXllciBwcm9wZXJ0eSBtYXAgaWYgcHJvcGVydHkgaXMgY2hhbmdlZFxuZnVuY3Rpb24gX3VwZGF0ZUxheWVyTmFtZSgkY2FudmFzLCBkYXRhLCBsYXllciwgcHJvcHMpIHtcblx0dmFyIG5hbWVNYXAgPSBkYXRhLmxheWVyLm5hbWVzO1xuXG5cdC8vIElmIGxheWVyIG5hbWUgaXMgYmVpbmcgYWRkZWQsIG5vdCBjaGFuZ2VkXG5cdGlmICghcHJvcHMpIHtcblxuXHRcdHByb3BzID0gbGF5ZXI7XG5cblx0fSBlbHNlIHtcblxuXHRcdC8vIFJlbW92ZSBvbGQgbGF5ZXIgbmFtZSBlbnRyeSBiZWNhdXNlIGxheWVyIG5hbWUgaGFzIGNoYW5nZWRcblx0XHRpZiAocHJvcHMubmFtZSAhPT0gdW5kZWZpbmVkICYmIGlzU3RyaW5nKGxheWVyLm5hbWUpICYmIGxheWVyLm5hbWUgIT09IHByb3BzLm5hbWUpIHtcblx0XHRcdGRlbGV0ZSBuYW1lTWFwW2xheWVyLm5hbWVdO1xuXHRcdH1cblxuXHR9XG5cblx0Ly8gQWRkIG5ldyBlbnRyeSB0byBsYXllciBuYW1lIG1hcCB3aXRoIG5ldyBuYW1lXG5cdGlmIChpc1N0cmluZyhwcm9wcy5uYW1lKSkge1xuXHRcdG5hbWVNYXBbcHJvcHMubmFtZV0gPSBsYXllcjtcblx0fVxufVxuXG4vLyBDcmVhdGUgb3IgdXBkYXRlIHRoZSBkYXRhIG1hcCBmb3IgdGhlIGdpdmVuIGxheWVyIGFuZCBncm91cCB0eXBlXG5mdW5jdGlvbiBfdXBkYXRlTGF5ZXJHcm91cHMoJGNhbnZhcywgZGF0YSwgbGF5ZXIsIHByb3BzKSB7XG5cdHZhciBncm91cE1hcCA9IGRhdGEubGF5ZXIuZ3JvdXBzLFxuXHRcdGdyb3VwLCBncm91cE5hbWUsIGcsXG5cdFx0aW5kZXgsIGw7XG5cblx0Ly8gSWYgZ3JvdXAgbmFtZSBpcyBub3QgY2hhbmdpbmdcblx0aWYgKCFwcm9wcykge1xuXG5cdFx0cHJvcHMgPSBsYXllcjtcblxuXHR9IGVsc2Uge1xuXG5cdFx0Ly8gUmVtb3ZlIGxheWVyIGZyb20gYWxsIG9mIGl0cyBhc3NvY2lhdGVkIGdyb3Vwc1xuXHRcdGlmIChwcm9wcy5ncm91cHMgIT09IHVuZGVmaW5lZCAmJiBsYXllci5ncm91cHMgIT09IG51bGwpIHtcblx0XHRcdGZvciAoZyA9IDA7IGcgPCBsYXllci5ncm91cHMubGVuZ3RoOyBnICs9IDEpIHtcblx0XHRcdFx0Z3JvdXBOYW1lID0gbGF5ZXIuZ3JvdXBzW2ddO1xuXHRcdFx0XHRncm91cCA9IGdyb3VwTWFwW2dyb3VwTmFtZV07XG5cdFx0XHRcdGlmIChncm91cCkge1xuXHRcdFx0XHRcdC8vIFJlbW92ZSBsYXllciBmcm9tIGl0cyBvbGQgbGF5ZXIgZ3JvdXAgZW50cnlcblx0XHRcdFx0XHRmb3IgKGwgPSAwOyBsIDwgZ3JvdXAubGVuZ3RoOyBsICs9IDEpIHtcblx0XHRcdFx0XHRcdGlmIChncm91cFtsXSA9PT0gbGF5ZXIpIHtcblx0XHRcdFx0XHRcdFx0Ly8gS2VlcCB0cmFjayBvZiB0aGUgbGF5ZXIncyBpbml0aWFsIGluZGV4XG5cdFx0XHRcdFx0XHRcdGluZGV4ID0gbDtcblx0XHRcdFx0XHRcdFx0Ly8gUmVtb3ZlIGxheWVyIG9uY2UgZm91bmRcblx0XHRcdFx0XHRcdFx0Z3JvdXAuc3BsaWNlKGwsIDEpO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gUmVtb3ZlIGxheWVyIGdyb3VwIGVudHJ5IGlmIGdyb3VwIGlzIGVtcHR5XG5cdFx0XHRcdFx0aWYgKGdyb3VwLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRcdFx0ZGVsZXRlIGdyb3VwTWFwW2dyb3VwTmFtZV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdH1cblxuXHQvLyBBZGQgbGF5ZXIgdG8gbmV3IGdyb3VwIGlmIGEgbmV3IGdyb3VwIG5hbWUgaXMgZ2l2ZW5cblx0aWYgKHByb3BzLmdyb3VwcyAhPT0gdW5kZWZpbmVkICYmIHByb3BzLmdyb3VwcyAhPT0gbnVsbCkge1xuXG5cdFx0Zm9yIChnID0gMDsgZyA8IHByb3BzLmdyb3Vwcy5sZW5ndGg7IGcgKz0gMSkge1xuXG5cdFx0XHRncm91cE5hbWUgPSBwcm9wcy5ncm91cHNbZ107XG5cblx0XHRcdGdyb3VwID0gZ3JvdXBNYXBbZ3JvdXBOYW1lXTtcblx0XHRcdGlmICghZ3JvdXApIHtcblx0XHRcdFx0Ly8gQ3JlYXRlIG5ldyBncm91cCBlbnRyeSBpZiBpdCBkb2Vzbid0IGV4aXN0XG5cdFx0XHRcdGdyb3VwID0gZ3JvdXBNYXBbZ3JvdXBOYW1lXSA9IFtdO1xuXHRcdFx0XHRncm91cC5uYW1lID0gZ3JvdXBOYW1lO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGluZGV4ID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0Ly8gQWRkIGxheWVyIHRvIGVuZCBvZiBncm91cCB1bmxlc3Mgb3RoZXJ3aXNlIHN0YXRlZFxuXHRcdFx0XHRpbmRleCA9IGdyb3VwLmxlbmd0aDtcblx0XHRcdH1cblx0XHRcdC8vIEFkZCBsYXllciB0byBpdHMgbmV3IGxheWVyIGdyb3VwXG5cdFx0XHRncm91cC5zcGxpY2UoaW5kZXgsIDAsIGxheWVyKTtcblxuXHRcdH1cblxuXHR9XG59XG5cbi8vIEdldCBldmVudCBob29rcyBvYmplY3QgZm9yIHRoZSBmaXJzdCBzZWxlY3RlZCBjYW52YXNcbiQuZm4uZ2V0RXZlbnRIb29rcyA9IGZ1bmN0aW9uIGdldEV2ZW50SG9va3MoKSB7XG5cdHZhciAkY2FudmFzZXMgPSB0aGlzLCBjYW52YXMsIGRhdGEsXG5cdFx0ZXZlbnRIb29rcyA9IHt9O1xuXG5cdGlmICgkY2FudmFzZXMubGVuZ3RoICE9PSAwKSB7XG5cdFx0Y2FudmFzID0gJGNhbnZhc2VzWzBdO1xuXHRcdGRhdGEgPSBfZ2V0Q2FudmFzRGF0YShjYW52YXMpO1xuXHRcdGV2ZW50SG9va3MgPSBkYXRhLmV2ZW50SG9va3M7XG5cdH1cblx0cmV0dXJuIGV2ZW50SG9va3M7XG59O1xuXG4vLyBTZXQgZXZlbnQgaG9va3MgZm9yIHRoZSBzZWxlY3RlZCBjYW52YXNlc1xuJC5mbi5zZXRFdmVudEhvb2tzID0gZnVuY3Rpb24gc2V0RXZlbnRIb29rcyhldmVudEhvb2tzKSB7XG5cdHZhciAkY2FudmFzZXMgPSB0aGlzLCBlLFxuXHRcdGRhdGE7XG5cdGZvciAoZSA9IDA7IGUgPCAkY2FudmFzZXMubGVuZ3RoOyBlICs9IDEpIHtcblx0XHRkYXRhID0gX2dldENhbnZhc0RhdGEoJGNhbnZhc2VzW2VdKTtcblx0XHRleHRlbmRPYmplY3QoZGF0YS5ldmVudEhvb2tzLCBldmVudEhvb2tzKTtcblx0fVxuXHRyZXR1cm4gJGNhbnZhc2VzO1xufTtcblxuLy8gR2V0IGpDYW52YXMgbGF5ZXJzIGFycmF5XG4kLmZuLmdldExheWVycyA9IGZ1bmN0aW9uIGdldExheWVycyhjYWxsYmFjaykge1xuXHR2YXIgJGNhbnZhc2VzID0gdGhpcywgY2FudmFzLCBkYXRhLFxuXHRcdGxheWVycywgbGF5ZXIsIGwsXG5cdFx0bWF0Y2hpbmcgPSBbXTtcblxuXHRpZiAoJGNhbnZhc2VzLmxlbmd0aCAhPT0gMCkge1xuXG5cdFx0Y2FudmFzID0gJGNhbnZhc2VzWzBdO1xuXHRcdGRhdGEgPSBfZ2V0Q2FudmFzRGF0YShjYW52YXMpO1xuXHRcdC8vIFJldHJpZXZlIGxheWVycyBhcnJheSBmb3IgdGhpcyBjYW52YXNcblx0XHRsYXllcnMgPSBkYXRhLmxheWVycztcblxuXHRcdC8vIElmIGEgY2FsbGJhY2sgZnVuY3Rpb24gaXMgZ2l2ZW5cblx0XHRpZiAoaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcblxuXHRcdFx0Ly8gRmlsdGVyIHRoZSBsYXllcnMgYXJyYXkgdXNpbmcgdGhlIGNhbGxiYWNrXG5cdFx0XHRmb3IgKGwgPSAwOyBsIDwgbGF5ZXJzLmxlbmd0aDsgbCArPSAxKSB7XG5cdFx0XHRcdGxheWVyID0gbGF5ZXJzW2xdO1xuXHRcdFx0XHRpZiAoY2FsbGJhY2suY2FsbChjYW52YXMsIGxheWVyKSkge1xuXHRcdFx0XHRcdC8vIEFkZCBsYXllciB0byBhcnJheSBvZiBtYXRjaGluZyBsYXllcnMgaWYgdGVzdCBwYXNzZXNcblx0XHRcdFx0XHRtYXRjaGluZy5wdXNoKGxheWVyKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIE90aGVyd2lzZSwgZ2V0IGFsbCBsYXllcnNcblxuXHRcdFx0bWF0Y2hpbmcgPSBsYXllcnM7XG5cblx0XHR9XG5cblx0fVxuXHRyZXR1cm4gbWF0Y2hpbmc7XG59O1xuXG4vLyBHZXQgYSBzaW5nbGUgakNhbnZhcyBsYXllciBvYmplY3RcbiQuZm4uZ2V0TGF5ZXIgPSBmdW5jdGlvbiBnZXRMYXllcihsYXllcklkKSB7XG5cdHZhciAkY2FudmFzZXMgPSB0aGlzLCBjYW52YXMsXG5cdFx0ZGF0YSwgbGF5ZXJzLCBsYXllciwgbCxcblx0XHRpZFR5cGU7XG5cblx0aWYgKCRjYW52YXNlcy5sZW5ndGggIT09IDApIHtcblxuXHRcdGNhbnZhcyA9ICRjYW52YXNlc1swXTtcblx0XHRkYXRhID0gX2dldENhbnZhc0RhdGEoY2FudmFzKTtcblx0XHRsYXllcnMgPSBkYXRhLmxheWVycztcblx0XHRpZFR5cGUgPSB0eXBlT2YobGF5ZXJJZCk7XG5cblx0XHRpZiAobGF5ZXJJZCAmJiBsYXllcklkLmxheWVyKSB7XG5cblx0XHRcdC8vIFJldHVybiB0aGUgYWN0dWFsIGxheWVyIG9iamVjdCBpZiBnaXZlblxuXHRcdFx0bGF5ZXIgPSBsYXllcklkO1xuXG5cdFx0fSBlbHNlIGlmIChpZFR5cGUgPT09ICdudW1iZXInKSB7XG5cblx0XHRcdC8vIFJldHJpZXZlIHRoZSBsYXllciB1c2luZyB0aGUgZ2l2ZW4gaW5kZXhcblxuXHRcdFx0Ly8gQWxsb3cgZm9yIG5lZ2F0aXZlIGluZGljZXNcblx0XHRcdGlmIChsYXllcklkIDwgMCkge1xuXHRcdFx0XHRsYXllcklkID0gbGF5ZXJzLmxlbmd0aCArIGxheWVySWQ7XG5cdFx0XHR9XG5cdFx0XHQvLyBHZXQgbGF5ZXIgd2l0aCB0aGUgZ2l2ZW4gaW5kZXhcblx0XHRcdGxheWVyID0gbGF5ZXJzW2xheWVySWRdO1xuXG5cdFx0fSBlbHNlIGlmIChpZFR5cGUgPT09ICdyZWdleHAnKSB7XG5cblx0XHRcdC8vIEdldCBsYXllciB3aXRoIHRoZSBuYW1lIHRoYXQgbWF0Y2hlcyB0aGUgZ2l2ZW4gcmVnZXhcblx0XHRcdGZvciAobCA9IDA7IGwgPCBsYXllcnMubGVuZ3RoOyBsICs9IDEpIHtcblx0XHRcdFx0Ly8gQ2hlY2sgaWYgbGF5ZXIgbWF0Y2hlcyBuYW1lXG5cdFx0XHRcdGlmIChpc1N0cmluZyhsYXllcnNbbF0ubmFtZSkgJiYgbGF5ZXJzW2xdLm5hbWUubWF0Y2gobGF5ZXJJZCkpIHtcblx0XHRcdFx0XHRsYXllciA9IGxheWVyc1tsXTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0Ly8gR2V0IGxheWVyIHdpdGggdGhlIGdpdmVuIG5hbWVcblx0XHRcdGxheWVyID0gZGF0YS5sYXllci5uYW1lc1tsYXllcklkXTtcblxuXHRcdH1cblxuXHR9XG5cdHJldHVybiBsYXllcjtcbn07XG5cbi8vIEdldCBhbGwgbGF5ZXJzIGluIHRoZSBnaXZlbiBncm91cFxuJC5mbi5nZXRMYXllckdyb3VwID0gZnVuY3Rpb24gZ2V0TGF5ZXJHcm91cChncm91cElkKSB7XG5cdHZhciAkY2FudmFzZXMgPSB0aGlzLCBjYW52YXMsIGRhdGEsXG5cdFx0Z3JvdXBzLCBncm91cE5hbWUsIGdyb3VwLFxuXHRcdGlkVHlwZSA9IHR5cGVPZihncm91cElkKTtcblxuXHRpZiAoJGNhbnZhc2VzLmxlbmd0aCAhPT0gMCkge1xuXG5cdFx0Y2FudmFzID0gJGNhbnZhc2VzWzBdO1xuXG5cdFx0aWYgKGlkVHlwZSA9PT0gJ2FycmF5Jykge1xuXG5cdFx0XHQvLyBSZXR1cm4gbGF5ZXIgZ3JvdXAgaWYgZ2l2ZW5cblx0XHRcdGdyb3VwID0gZ3JvdXBJZDtcblxuXHRcdH0gZWxzZSBpZiAoaWRUeXBlID09PSAncmVnZXhwJykge1xuXG5cdFx0XHQvLyBHZXQgY2FudmFzIGRhdGFcblx0XHRcdGRhdGEgPSBfZ2V0Q2FudmFzRGF0YShjYW52YXMpO1xuXHRcdFx0Z3JvdXBzID0gZGF0YS5sYXllci5ncm91cHM7XG5cdFx0XHQvLyBMb29wIHRocm91Z2ggYWxsIGxheWVycyBncm91cHMgZm9yIHRoaXMgY2FudmFzXG5cdFx0XHRmb3IgKGdyb3VwTmFtZSBpbiBncm91cHMpIHtcblx0XHRcdFx0Ly8gRmluZCBhIGdyb3VwIHdob3NlIG5hbWUgbWF0Y2hlcyB0aGUgZ2l2ZW4gcmVnZXhcblx0XHRcdFx0aWYgKGdyb3VwTmFtZS5tYXRjaChncm91cElkKSkge1xuXHRcdFx0XHRcdGdyb3VwID0gZ3JvdXBzW2dyb3VwTmFtZV07XG5cdFx0XHRcdFx0Ly8gU3RvcCBhZnRlciBmaW5kaW5nIHRoZSBmaXJzdCBtYXRjaGluZyBncm91cFxuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHQvLyBGaW5kIGxheWVyIGdyb3VwIHdpdGggdGhlIGdpdmVuIGdyb3VwIG5hbWVcblx0XHRcdGRhdGEgPSBfZ2V0Q2FudmFzRGF0YShjYW52YXMpO1xuXHRcdFx0Z3JvdXAgPSBkYXRhLmxheWVyLmdyb3Vwc1tncm91cElkXTtcblx0XHR9XG5cblx0fVxuXHRyZXR1cm4gZ3JvdXA7XG59O1xuXG4vLyBHZXQgaW5kZXggb2YgbGF5ZXIgaW4gbGF5ZXJzIGFycmF5XG4kLmZuLmdldExheWVySW5kZXggPSBmdW5jdGlvbiBnZXRMYXllckluZGV4KGxheWVySWQpIHtcblx0dmFyICRjYW52YXNlcyA9IHRoaXMsXG5cdFx0bGF5ZXJzID0gJGNhbnZhc2VzLmdldExheWVycygpLFxuXHRcdGxheWVyID0gJGNhbnZhc2VzLmdldExheWVyKGxheWVySWQpO1xuXG5cdHJldHVybiBpbkFycmF5KGxheWVyLCBsYXllcnMpO1xufTtcblxuLy8gU2V0IHByb3BlcnRpZXMgb2YgYSBsYXllclxuJC5mbi5zZXRMYXllciA9IGZ1bmN0aW9uIHNldExheWVyKGxheWVySWQsIHByb3BzKSB7XG5cdHZhciAkY2FudmFzZXMgPSB0aGlzLCAkY2FudmFzLCBlLFxuXHRcdGRhdGEsIGxheWVyLFxuXHRcdHByb3BOYW1lLCBwcm9wVmFsdWUsIHByb3BUeXBlO1xuXG5cdGZvciAoZSA9IDA7IGUgPCAkY2FudmFzZXMubGVuZ3RoOyBlICs9IDEpIHtcblx0XHQkY2FudmFzID0gJCgkY2FudmFzZXNbZV0pO1xuXHRcdGRhdGEgPSBfZ2V0Q2FudmFzRGF0YSgkY2FudmFzZXNbZV0pO1xuXG5cdFx0bGF5ZXIgPSAkKCRjYW52YXNlc1tlXSkuZ2V0TGF5ZXIobGF5ZXJJZCk7XG5cdFx0aWYgKGxheWVyKSB7XG5cblx0XHRcdC8vIFVwZGF0ZSBsYXllciBwcm9wZXJ0eSBtYXBzXG5cdFx0XHRfdXBkYXRlTGF5ZXJOYW1lKCRjYW52YXMsIGRhdGEsIGxheWVyLCBwcm9wcyk7XG5cdFx0XHRfdXBkYXRlTGF5ZXJHcm91cHMoJGNhbnZhcywgZGF0YSwgbGF5ZXIsIHByb3BzKTtcblxuXHRcdFx0X2NvZXJjZU51bWVyaWNQcm9wcyhwcm9wcyk7XG5cblx0XHRcdC8vIE1lcmdlIHByb3BlcnRpZXMgd2l0aCBsYXllclxuXHRcdFx0Zm9yIChwcm9wTmFtZSBpbiBwcm9wcykge1xuXHRcdFx0XHRpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3BzLCBwcm9wTmFtZSkpIHtcblx0XHRcdFx0XHRwcm9wVmFsdWUgPSBwcm9wc1twcm9wTmFtZV07XG5cdFx0XHRcdFx0cHJvcFR5cGUgPSB0eXBlT2YocHJvcFZhbHVlKTtcblx0XHRcdFx0XHRpZiAocHJvcFR5cGUgPT09ICdvYmplY3QnICYmIGlzUGxhaW5PYmplY3QocHJvcFZhbHVlKSkge1xuXHRcdFx0XHRcdFx0Ly8gQ2xvbmUgb2JqZWN0c1xuXHRcdFx0XHRcdFx0bGF5ZXJbcHJvcE5hbWVdID0gZXh0ZW5kT2JqZWN0KHt9LCBwcm9wVmFsdWUpO1xuXHRcdFx0XHRcdFx0X2NvZXJjZU51bWVyaWNQcm9wcyhsYXllcltwcm9wTmFtZV0pO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAocHJvcFR5cGUgPT09ICdhcnJheScpIHtcblx0XHRcdFx0XHRcdC8vIENsb25lIGFycmF5c1xuXHRcdFx0XHRcdFx0bGF5ZXJbcHJvcE5hbWVdID0gcHJvcFZhbHVlLnNsaWNlKDApO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAocHJvcFR5cGUgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdFx0XHRpZiAocHJvcFZhbHVlLmluZGV4T2YoJys9JykgPT09IDApIHtcblx0XHRcdFx0XHRcdFx0Ly8gSW5jcmVtZW50IG51bWJlcnMgcHJlZml4ZWQgd2l0aCArPVxuXHRcdFx0XHRcdFx0XHRsYXllcltwcm9wTmFtZV0gKz0gcGFyc2VGbG9hdChwcm9wVmFsdWUuc3Vic3RyKDIpKTtcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAocHJvcFZhbHVlLmluZGV4T2YoJy09JykgPT09IDApIHtcblx0XHRcdFx0XHRcdFx0Ly8gRGVjcmVtZW50IG51bWJlcnMgcHJlZml4ZWQgd2l0aCAtPVxuXHRcdFx0XHRcdFx0XHRsYXllcltwcm9wTmFtZV0gLT0gcGFyc2VGbG9hdChwcm9wVmFsdWUuc3Vic3RyKDIpKTtcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoIWlzTmFOKHByb3BWYWx1ZSkgJiYgaXNOdW1lcmljKHByb3BWYWx1ZSkgJiYgcHJvcE5hbWUgIT09ICd0ZXh0Jykge1xuXHRcdFx0XHRcdFx0XHQvLyBDb252ZXJ0IG51bWVyaWMgdmFsdWVzIGFzIHN0cmluZ3MgdG8gbnVtYmVyc1xuXHRcdFx0XHRcdFx0XHRsYXllcltwcm9wTmFtZV0gPSBwYXJzZUZsb2F0KHByb3BWYWx1ZSk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHQvLyBPdGhlcndpc2UsIHNldCBnaXZlbiBzdHJpbmcgdmFsdWVcblx0XHRcdFx0XHRcdFx0bGF5ZXJbcHJvcE5hbWVdID0gcHJvcFZhbHVlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQvLyBPdGhlcndpc2UsIHNldCBnaXZlbiB2YWx1ZVxuXHRcdFx0XHRcdFx0bGF5ZXJbcHJvcE5hbWVdID0gcHJvcFZhbHVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBVcGRhdGUgbGF5ZXIgZXZlbnRzXG5cdFx0XHRfYWRkTGF5ZXJFdmVudHMoJGNhbnZhcywgZGF0YSwgbGF5ZXIpO1xuXHRcdFx0X2VuYWJsZURyYWcoJGNhbnZhcywgZGF0YSwgbGF5ZXIpO1xuXG5cdFx0XHQvLyBJZiBsYXllcidzIHByb3BlcnRpZXMgd2VyZSBjaGFuZ2VkXG5cdFx0XHRpZiAoJC5pc0VtcHR5T2JqZWN0KHByb3BzKSA9PT0gZmFsc2UpIHtcblx0XHRcdFx0X3RyaWdnZXJMYXllckV2ZW50KCRjYW52YXMsIGRhdGEsIGxheWVyLCAnY2hhbmdlJywgcHJvcHMpO1xuXHRcdFx0fVxuXG5cdFx0fVxuXHR9XG5cdHJldHVybiAkY2FudmFzZXM7XG59O1xuXG4vLyBTZXQgcHJvcGVydGllcyBvZiBhbGwgbGF5ZXJzIChvcHRpb25hbGx5IGZpbHRlcmVkIGJ5IGEgY2FsbGJhY2spXG4kLmZuLnNldExheWVycyA9IGZ1bmN0aW9uIHNldExheWVycyhwcm9wcywgY2FsbGJhY2spIHtcblx0dmFyICRjYW52YXNlcyA9IHRoaXMsICRjYW52YXMsIGUsXG5cdFx0bGF5ZXJzLCBsO1xuXHRmb3IgKGUgPSAwOyBlIDwgJGNhbnZhc2VzLmxlbmd0aDsgZSArPSAxKSB7XG5cdFx0JGNhbnZhcyA9ICQoJGNhbnZhc2VzW2VdKTtcblxuXHRcdGxheWVycyA9ICRjYW52YXMuZ2V0TGF5ZXJzKGNhbGxiYWNrKTtcblx0XHQvLyBMb29wIHRocm91Z2ggYWxsIGxheWVyc1xuXHRcdGZvciAobCA9IDA7IGwgPCBsYXllcnMubGVuZ3RoOyBsICs9IDEpIHtcblx0XHRcdC8vIFNldCBwcm9wZXJ0aWVzIG9mIGVhY2ggbGF5ZXJcblx0XHRcdCRjYW52YXMuc2V0TGF5ZXIobGF5ZXJzW2xdLCBwcm9wcyk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiAkY2FudmFzZXM7XG59O1xuXG4vLyBTZXQgcHJvcGVydGllcyBvZiBhbGwgbGF5ZXJzIGluIHRoZSBnaXZlbiBncm91cFxuJC5mbi5zZXRMYXllckdyb3VwID0gZnVuY3Rpb24gc2V0TGF5ZXJHcm91cChncm91cElkLCBwcm9wcykge1xuXHR2YXIgJGNhbnZhc2VzID0gdGhpcywgJGNhbnZhcywgZSxcblx0XHRncm91cCwgbDtcblxuXHRmb3IgKGUgPSAwOyBlIDwgJGNhbnZhc2VzLmxlbmd0aDsgZSArPSAxKSB7XG5cdFx0Ly8gR2V0IGxheWVyIGdyb3VwXG5cdFx0JGNhbnZhcyA9ICQoJGNhbnZhc2VzW2VdKTtcblxuXHRcdGdyb3VwID0gJGNhbnZhcy5nZXRMYXllckdyb3VwKGdyb3VwSWQpO1xuXHRcdC8vIElmIGdyb3VwIGV4aXN0c1xuXHRcdGlmIChncm91cCkge1xuXG5cdFx0XHQvLyBMb29wIHRocm91Z2ggbGF5ZXJzIGluIGdyb3VwXG5cdFx0XHRmb3IgKGwgPSAwOyBsIDwgZ3JvdXAubGVuZ3RoOyBsICs9IDEpIHtcblx0XHRcdFx0Ly8gTWVyZ2UgZ2l2ZW4gcHJvcGVydGllcyB3aXRoIGxheWVyXG5cdFx0XHRcdCRjYW52YXMuc2V0TGF5ZXIoZ3JvdXBbbF0sIHByb3BzKTtcblx0XHRcdH1cblxuXHRcdH1cblx0fVxuXHRyZXR1cm4gJGNhbnZhc2VzO1xufTtcblxuLy8gTW92ZSBhIGxheWVyIHRvIHRoZSBnaXZlbiBpbmRleCBpbiB0aGUgbGF5ZXJzIGFycmF5XG4kLmZuLm1vdmVMYXllciA9IGZ1bmN0aW9uIG1vdmVMYXllcihsYXllcklkLCBpbmRleCkge1xuXHR2YXIgJGNhbnZhc2VzID0gdGhpcywgJGNhbnZhcywgZSxcblx0XHRkYXRhLCBsYXllcnMsIGxheWVyO1xuXG5cdGZvciAoZSA9IDA7IGUgPCAkY2FudmFzZXMubGVuZ3RoOyBlICs9IDEpIHtcblx0XHQkY2FudmFzID0gJCgkY2FudmFzZXNbZV0pO1xuXHRcdGRhdGEgPSBfZ2V0Q2FudmFzRGF0YSgkY2FudmFzZXNbZV0pO1xuXG5cdFx0Ly8gUmV0cmlldmUgbGF5ZXJzIGFycmF5IGFuZCBkZXNpcmVkIGxheWVyXG5cdFx0bGF5ZXJzID0gZGF0YS5sYXllcnM7XG5cdFx0bGF5ZXIgPSAkY2FudmFzLmdldExheWVyKGxheWVySWQpO1xuXHRcdGlmIChsYXllcikge1xuXG5cdFx0XHQvLyBFbnN1cmUgbGF5ZXIgaW5kZXggaXMgYWNjdXJhdGVcblx0XHRcdGxheWVyLmluZGV4ID0gaW5BcnJheShsYXllciwgbGF5ZXJzKTtcblxuXHRcdFx0Ly8gUmVtb3ZlIGxheWVyIGZyb20gaXRzIGN1cnJlbnQgcGxhY2VtZW50XG5cdFx0XHRsYXllcnMuc3BsaWNlKGxheWVyLmluZGV4LCAxKTtcblx0XHRcdC8vIEFkZCBsYXllciBpbiBpdHMgbmV3IHBsYWNlbWVudFxuXHRcdFx0bGF5ZXJzLnNwbGljZShpbmRleCwgMCwgbGF5ZXIpO1xuXG5cdFx0XHQvLyBIYW5kbGUgbmVnYXRpdmUgaW5kaWNlc1xuXHRcdFx0aWYgKGluZGV4IDwgMCkge1xuXHRcdFx0XHRpbmRleCA9IGxheWVycy5sZW5ndGggKyBpbmRleDtcblx0XHRcdH1cblx0XHRcdC8vIFVwZGF0ZSBsYXllcidzIHN0b3JlZCBpbmRleFxuXHRcdFx0bGF5ZXIuaW5kZXggPSBpbmRleDtcblxuXHRcdFx0X3RyaWdnZXJMYXllckV2ZW50KCRjYW52YXMsIGRhdGEsIGxheWVyLCAnbW92ZScpO1xuXG5cdFx0fVxuXHR9XG5cdHJldHVybiAkY2FudmFzZXM7XG59O1xuXG4vLyBSZW1vdmUgYSBqQ2FudmFzIGxheWVyXG4kLmZuLnJlbW92ZUxheWVyID0gZnVuY3Rpb24gcmVtb3ZlTGF5ZXIobGF5ZXJJZCkge1xuXHR2YXIgJGNhbnZhc2VzID0gdGhpcywgJGNhbnZhcywgZSwgZGF0YSxcblx0XHRsYXllcnMsIGxheWVyO1xuXG5cdGZvciAoZSA9IDA7IGUgPCAkY2FudmFzZXMubGVuZ3RoOyBlICs9IDEpIHtcblx0XHQkY2FudmFzID0gJCgkY2FudmFzZXNbZV0pO1xuXHRcdGRhdGEgPSBfZ2V0Q2FudmFzRGF0YSgkY2FudmFzZXNbZV0pO1xuXG5cdFx0Ly8gUmV0cmlldmUgbGF5ZXJzIGFycmF5IGFuZCBkZXNpcmVkIGxheWVyXG5cdFx0bGF5ZXJzID0gJGNhbnZhcy5nZXRMYXllcnMoKTtcblx0XHRsYXllciA9ICRjYW52YXMuZ2V0TGF5ZXIobGF5ZXJJZCk7XG5cdFx0Ly8gUmVtb3ZlIGxheWVyIGlmIGZvdW5kXG5cdFx0aWYgKGxheWVyKSB7XG5cblx0XHRcdC8vIEVuc3VyZSBsYXllciBpbmRleCBpcyBhY2N1cmF0ZVxuXHRcdFx0bGF5ZXIuaW5kZXggPSBpbkFycmF5KGxheWVyLCBsYXllcnMpO1xuXHRcdFx0Ly8gUmVtb3ZlIGxheWVyIGFuZCBhbGxvdyBpdCB0byBiZSByZS1hZGRlZCBsYXRlclxuXHRcdFx0bGF5ZXJzLnNwbGljZShsYXllci5pbmRleCwgMSk7XG5cdFx0XHRkZWxldGUgbGF5ZXIuX2xheWVyO1xuXG5cdFx0XHQvLyBVcGRhdGUgbGF5ZXIgbmFtZSBtYXBcblx0XHRcdF91cGRhdGVMYXllck5hbWUoJGNhbnZhcywgZGF0YSwgbGF5ZXIsIHtcblx0XHRcdFx0bmFtZTogbnVsbFxuXHRcdFx0fSk7XG5cdFx0XHQvLyBVcGRhdGUgbGF5ZXIgZ3JvdXAgbWFwXG5cdFx0XHRfdXBkYXRlTGF5ZXJHcm91cHMoJGNhbnZhcywgZGF0YSwgbGF5ZXIsIHtcblx0XHRcdFx0Z3JvdXBzOiBudWxsXG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gVHJpZ2dlciAncmVtb3ZlJyBldmVudFxuXHRcdFx0X3RyaWdnZXJMYXllckV2ZW50KCRjYW52YXMsIGRhdGEsIGxheWVyLCAncmVtb3ZlJyk7XG5cblx0XHR9XG5cdH1cblx0cmV0dXJuICRjYW52YXNlcztcbn07XG5cbi8vIFJlbW92ZSBhbGwgbGF5ZXJzXG4kLmZuLnJlbW92ZUxheWVycyA9IGZ1bmN0aW9uIHJlbW92ZUxheWVycyhjYWxsYmFjaykge1xuXHR2YXIgJGNhbnZhc2VzID0gdGhpcywgJGNhbnZhcywgZSxcblx0XHRkYXRhLCBsYXllcnMsIGxheWVyLCBsO1xuXG5cdGZvciAoZSA9IDA7IGUgPCAkY2FudmFzZXMubGVuZ3RoOyBlICs9IDEpIHtcblx0XHQkY2FudmFzID0gJCgkY2FudmFzZXNbZV0pO1xuXHRcdGRhdGEgPSBfZ2V0Q2FudmFzRGF0YSgkY2FudmFzZXNbZV0pO1xuXHRcdGxheWVycyA9ICRjYW52YXMuZ2V0TGF5ZXJzKGNhbGxiYWNrKS5zbGljZSgwKTtcblx0XHQvLyBSZW1vdmUgYWxsIGxheWVycyBpbmRpdmlkdWFsbHlcblx0XHRmb3IgKGwgPSAwOyBsIDwgbGF5ZXJzLmxlbmd0aDsgbCArPSAxKSB7XG5cdFx0XHRsYXllciA9IGxheWVyc1tsXTtcblx0XHRcdCRjYW52YXMucmVtb3ZlTGF5ZXIobGF5ZXIpO1xuXHRcdH1cblx0XHQvLyBVcGRhdGUgbGF5ZXIgbWFwc1xuXHRcdGRhdGEubGF5ZXIubmFtZXMgPSB7fTtcblx0XHRkYXRhLmxheWVyLmdyb3VwcyA9IHt9O1xuXHR9XG5cdHJldHVybiAkY2FudmFzZXM7XG59O1xuXG4vLyBSZW1vdmUgYWxsIGxheWVycyBpbiB0aGUgZ3JvdXAgd2l0aCB0aGUgZ2l2ZW4gSURcbiQuZm4ucmVtb3ZlTGF5ZXJHcm91cCA9IGZ1bmN0aW9uIHJlbW92ZUxheWVyR3JvdXAoZ3JvdXBJZCkge1xuXHR2YXIgJGNhbnZhc2VzID0gdGhpcywgJGNhbnZhcywgZSwgZ3JvdXAsIGw7XG5cblx0aWYgKGdyb3VwSWQgIT09IHVuZGVmaW5lZCkge1xuXHRcdGZvciAoZSA9IDA7IGUgPCAkY2FudmFzZXMubGVuZ3RoOyBlICs9IDEpIHtcblx0XHRcdCRjYW52YXMgPSAkKCRjYW52YXNlc1tlXSk7XG5cblx0XHRcdGdyb3VwID0gJGNhbnZhcy5nZXRMYXllckdyb3VwKGdyb3VwSWQpO1xuXHRcdFx0Ly8gUmVtb3ZlIGxheWVyIGdyb3VwIHVzaW5nIGdpdmVuIGdyb3VwIG5hbWVcblx0XHRcdGlmIChncm91cCkge1xuXG5cdFx0XHRcdC8vIENsb25lIGdyb3VwcyBhcnJheVxuXHRcdFx0XHRncm91cCA9IGdyb3VwLnNsaWNlKDApO1xuXG5cdFx0XHRcdC8vIExvb3AgdGhyb3VnaCBsYXllcnMgaW4gZ3JvdXBcblx0XHRcdFx0Zm9yIChsID0gMDsgbCA8IGdyb3VwLmxlbmd0aDsgbCArPSAxKSB7XG5cdFx0XHRcdFx0JGNhbnZhcy5yZW1vdmVMYXllcihncm91cFtsXSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gJGNhbnZhc2VzO1xufTtcblxuLy8gQWRkIGFuIGV4aXN0aW5nIGxheWVyIHRvIGEgbGF5ZXIgZ3JvdXBcbiQuZm4uYWRkTGF5ZXJUb0dyb3VwID0gZnVuY3Rpb24gYWRkTGF5ZXJUb0dyb3VwKGxheWVySWQsIGdyb3VwTmFtZSkge1xuXHR2YXIgJGNhbnZhc2VzID0gdGhpcywgJGNhbnZhcywgZSxcblx0XHRsYXllciwgZ3JvdXBzID0gW2dyb3VwTmFtZV07XG5cblx0Zm9yIChlID0gMDsgZSA8ICRjYW52YXNlcy5sZW5ndGg7IGUgKz0gMSkge1xuXHRcdCRjYW52YXMgPSAkKCRjYW52YXNlc1tlXSk7XG5cdFx0bGF5ZXIgPSAkY2FudmFzLmdldExheWVyKGxheWVySWQpO1xuXG5cdFx0Ly8gSWYgbGF5ZXIgaXMgbm90IGFscmVhZHkgaW4gZ3JvdXBcblx0XHRpZiAobGF5ZXIuZ3JvdXBzKSB7XG5cdFx0XHQvLyBDbG9uZSBncm91cHMgbGlzdFxuXHRcdFx0Z3JvdXBzID0gbGF5ZXIuZ3JvdXBzLnNsaWNlKDApO1xuXHRcdFx0Ly8gSWYgbGF5ZXIgaXMgbm90IGFscmVhZHkgaW4gZ3JvdXBcblx0XHRcdGlmIChpbkFycmF5KGdyb3VwTmFtZSwgbGF5ZXIuZ3JvdXBzKSA9PT0gLTEpIHtcblx0XHRcdFx0Ly8gQWRkIGxheWVyIHRvIGdyb3VwXG5cdFx0XHRcdGdyb3Vwcy5wdXNoKGdyb3VwTmFtZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIFVwZGF0ZSBsYXllciBncm91cCBtYXBzXG5cdFx0JGNhbnZhcy5zZXRMYXllcihsYXllciwge1xuXHRcdFx0Z3JvdXBzOiBncm91cHNcblx0XHR9KTtcblxuXHR9XG5cdHJldHVybiAkY2FudmFzZXM7XG59O1xuXG4vLyBSZW1vdmUgYW4gZXhpc3RpbmcgbGF5ZXIgZnJvbSBhIGxheWVyIGdyb3VwXG4kLmZuLnJlbW92ZUxheWVyRnJvbUdyb3VwID0gZnVuY3Rpb24gcmVtb3ZlTGF5ZXJGcm9tR3JvdXAobGF5ZXJJZCwgZ3JvdXBOYW1lKSB7XG5cdHZhciAkY2FudmFzZXMgPSB0aGlzLCAkY2FudmFzLCBlLFxuXHRcdGxheWVyLCBncm91cHMgPSBbXSxcblx0XHRpbmRleDtcblxuXHRmb3IgKGUgPSAwOyBlIDwgJGNhbnZhc2VzLmxlbmd0aDsgZSArPSAxKSB7XG5cdFx0JGNhbnZhcyA9ICQoJGNhbnZhc2VzW2VdKTtcblx0XHRsYXllciA9ICRjYW52YXMuZ2V0TGF5ZXIobGF5ZXJJZCk7XG5cblx0XHRpZiAobGF5ZXIuZ3JvdXBzKSB7XG5cblx0XHRcdC8vIEZpbmQgaW5kZXggb2YgbGF5ZXIgaW4gZ3JvdXBcblx0XHRcdGluZGV4ID0gaW5BcnJheShncm91cE5hbWUsIGxheWVyLmdyb3Vwcyk7XG5cblx0XHRcdC8vIElmIGxheWVyIGlzIGluIGdyb3VwXG5cdFx0XHRpZiAoaW5kZXggIT09IC0xKSB7XG5cblx0XHRcdFx0Ly8gQ2xvbmUgZ3JvdXBzIGxpc3Rcblx0XHRcdFx0Z3JvdXBzID0gbGF5ZXIuZ3JvdXBzLnNsaWNlKDApO1xuXG5cdFx0XHRcdC8vIFJlbW92ZSBsYXllciBmcm9tIGdyb3VwXG5cdFx0XHRcdGdyb3Vwcy5zcGxpY2UoaW5kZXgsIDEpO1xuXG5cdFx0XHRcdC8vIFVwZGF0ZSBsYXllciBncm91cCBtYXBzXG5cdFx0XHRcdCRjYW52YXMuc2V0TGF5ZXIobGF5ZXIsIHtcblx0XHRcdFx0XHRncm91cHM6IGdyb3Vwc1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH1cblx0cmV0dXJuICRjYW52YXNlcztcbn07XG5cbi8vIEdldCB0b3Btb3N0IGxheWVyIHRoYXQgaW50ZXJzZWN0cyB3aXRoIGV2ZW50IGNvb3JkaW5hdGVzXG5mdW5jdGlvbiBfZ2V0SW50ZXJzZWN0aW5nTGF5ZXIoZGF0YSkge1xuXHR2YXIgbGF5ZXIsIGksXG5cdFx0bWFzaywgbTtcblxuXHQvLyBTdG9yZSB0aGUgdG9wbW9zdCBsYXllclxuXHRsYXllciA9IG51bGw7XG5cblx0Ly8gR2V0IHRoZSB0b3Btb3N0IGxheWVyIHdob3NlIHZpc2libGUgYXJlYSBpbnRlcnNlY3RzIGV2ZW50IGNvb3JkaW5hdGVzXG5cdGZvciAoaSA9IGRhdGEuaW50ZXJzZWN0aW5nLmxlbmd0aCAtIDE7IGkgPj0gMDsgaSAtPSAxKSB7XG5cblx0XHQvLyBHZXQgY3VycmVudCBsYXllclxuXHRcdGxheWVyID0gZGF0YS5pbnRlcnNlY3RpbmdbaV07XG5cblx0XHQvLyBJZiBsYXllciBoYXMgcHJldmlvdXMgbWFza3Ncblx0XHRpZiAobGF5ZXIuX21hc2tzKSB7XG5cblx0XHRcdC8vIFNlYXJjaCBwcmV2aW91cyBtYXNrcyB0byBlbnN1cmVcblx0XHRcdC8vIGxheWVyIGlzIHZpc2libGUgYXQgZXZlbnQgY29vcmRpbmF0ZXNcblx0XHRcdGZvciAobSA9IGxheWVyLl9tYXNrcy5sZW5ndGggLSAxOyBtID49IDA7IG0gLT0gMSkge1xuXHRcdFx0XHRtYXNrID0gbGF5ZXIuX21hc2tzW21dO1xuXHRcdFx0XHQvLyBJZiBtYXNrIGRvZXMgbm90IGludGVyc2VjdCBldmVudCBjb29yZGluYXRlc1xuXHRcdFx0XHRpZiAoIW1hc2suaW50ZXJzZWN0cykge1xuXHRcdFx0XHRcdC8vIEluZGljYXRlIHRoYXQgdGhlIG1hc2sgZG9lcyBub3Rcblx0XHRcdFx0XHQvLyBpbnRlcnNlY3QgZXZlbnQgY29vcmRpbmF0ZXNcblx0XHRcdFx0XHRsYXllci5pbnRlcnNlY3RzID0gZmFsc2U7XG5cdFx0XHRcdFx0Ly8gU3RvcCBzZWFyY2hpbmcgcHJldmlvdXMgbWFza3Ncblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHRcdC8vIElmIGV2ZW50IGNvb3JkaW5hdGVzIGludGVyc2VjdCBhbGwgcHJldmlvdXMgbWFza3Ncblx0XHRcdC8vIGFuZCBsYXllciBpcyBub3QgaW50YW5naWJsZVxuXHRcdFx0aWYgKGxheWVyLmludGVyc2VjdHMgJiYgIWxheWVyLmludGFuZ2libGUpIHtcblx0XHRcdFx0Ly8gU3RvcCBzZWFyY2hpbmcgZm9yIHRvcG1vc3QgbGF5ZXJcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fVxuXHQvLyBJZiByZXN1bHRpbmcgbGF5ZXIgaXMgaW50YW5naWJsZVxuXHRpZiAobGF5ZXIgJiYgbGF5ZXIuaW50YW5naWJsZSkge1xuXHRcdC8vIEN1cnNvciBkb2VzIG5vdCBpbnRlcnNlY3QgdGhpcyBsYXllclxuXHRcdGxheWVyID0gbnVsbDtcblx0fVxuXHRyZXR1cm4gbGF5ZXI7XG59XG5cbi8vIERyYXcgaW5kaXZpZHVhbCBsYXllciAoaW50ZXJuYWwpXG5mdW5jdGlvbiBfZHJhd0xheWVyKCRjYW52YXMsIGN0eCwgbGF5ZXIsIG5leHRMYXllckluZGV4KSB7XG5cdGlmIChsYXllciAmJiBsYXllci52aXNpYmxlICYmIGxheWVyLl9tZXRob2QpIHtcblx0XHRpZiAobmV4dExheWVySW5kZXgpIHtcblx0XHRcdGxheWVyLl9uZXh0ID0gbmV4dExheWVySW5kZXg7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxheWVyLl9uZXh0ID0gbnVsbDtcblx0XHR9XG5cdFx0Ly8gSWYgbGF5ZXIgaXMgYW4gb2JqZWN0LCBjYWxsIGl0cyByZXNwZWN0aXZlIG1ldGhvZFxuXHRcdGlmIChsYXllci5fbWV0aG9kKSB7XG5cdFx0XHRsYXllci5fbWV0aG9kLmNhbGwoJGNhbnZhcywgbGF5ZXIpO1xuXHRcdH1cblx0fVxufVxuXG4vLyBIYW5kbGUgZHJhZ2dpbmcgb2YgdGhlIGN1cnJlbnRseS1kcmFnZ2VkIGxheWVyXG5mdW5jdGlvbiBfaGFuZGxlTGF5ZXJEcmFnKCRjYW52YXMsIGRhdGEsIGV2ZW50VHlwZSkge1xuXHR2YXIgbGF5ZXJzLCBsYXllciwgbCxcblx0XHRkcmFnLCBkcmFnR3JvdXBzLFxuXHRcdGdyb3VwLCBncm91cE5hbWUsIGcsXG5cdFx0bmV3WCwgbmV3WTtcblxuXHRkcmFnID0gZGF0YS5kcmFnO1xuXHRsYXllciA9IGRyYWcubGF5ZXI7XG5cdGRyYWdHcm91cHMgPSAobGF5ZXIgJiYgbGF5ZXIuZHJhZ0dyb3VwcykgfHwgW107XG5cdGxheWVycyA9IGRhdGEubGF5ZXJzO1xuXG5cdGlmIChldmVudFR5cGUgPT09ICdtb3VzZW1vdmUnIHx8IGV2ZW50VHlwZSA9PT0gJ3RvdWNobW92ZScpIHtcblx0XHQvLyBEZXRlY3Qgd2hlbiB1c2VyIGlzIGN1cnJlbnRseSBkcmFnZ2luZyBsYXllclxuXG5cdFx0aWYgKCFkcmFnLmRyYWdnaW5nKSB7XG5cdFx0XHQvLyBEZXRlY3Qgd2hlbiB1c2VyIHN0YXJ0cyBkcmFnZ2luZyBsYXllclxuXG5cdFx0XHQvLyBTaWduaWZ5IHRoYXQgYSBsYXllciBvbiB0aGUgY2FudmFzIGlzIGJlaW5nIGRyYWdnZWRcblx0XHRcdGRyYWcuZHJhZ2dpbmcgPSB0cnVlO1xuXHRcdFx0bGF5ZXIuZHJhZ2dpbmcgPSB0cnVlO1xuXG5cdFx0XHQvLyBPcHRpb25hbGx5IGJyaW5nIGxheWVyIHRvIGZyb250IHdoZW4gZHJhZyBzdGFydHNcblx0XHRcdGlmIChsYXllci5icmluZ1RvRnJvbnQpIHtcblx0XHRcdFx0Ly8gUmVtb3ZlIGxheWVyIGZyb20gaXRzIG9yaWdpbmFsIHBvc2l0aW9uXG5cdFx0XHRcdGxheWVycy5zcGxpY2UobGF5ZXIuaW5kZXgsIDEpO1xuXHRcdFx0XHQvLyBCcmluZyBsYXllciB0byBmcm9udFxuXHRcdFx0XHQvLyBwdXNoKCkgcmV0dXJucyB0aGUgbmV3IGFycmF5IGxlbmd0aFxuXHRcdFx0XHRsYXllci5pbmRleCA9IGxheWVycy5wdXNoKGxheWVyKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gU2V0IGRyYWcgcHJvcGVydGllcyBmb3IgdGhpcyBsYXllclxuXHRcdFx0bGF5ZXIuX3N0YXJ0WCA9IGxheWVyLng7XG5cdFx0XHRsYXllci5fc3RhcnRZID0gbGF5ZXIueTtcblx0XHRcdGxheWVyLl9lbmRYID0gbGF5ZXIuX2V2ZW50WDtcblx0XHRcdGxheWVyLl9lbmRZID0gbGF5ZXIuX2V2ZW50WTtcblxuXHRcdFx0Ly8gVHJpZ2dlciBkcmFnc3RhcnQgZXZlbnRcblx0XHRcdF90cmlnZ2VyTGF5ZXJFdmVudCgkY2FudmFzLCBkYXRhLCBsYXllciwgJ2RyYWdzdGFydCcpO1xuXG5cdFx0fVxuXG5cdFx0aWYgKGRyYWcuZHJhZ2dpbmcpIHtcblxuXHRcdFx0Ly8gQ2FsY3VsYXRlIHBvc2l0aW9uIGFmdGVyIGRyYWdcblx0XHRcdG5ld1ggPSBsYXllci5fZXZlbnRYIC0gKGxheWVyLl9lbmRYIC0gbGF5ZXIuX3N0YXJ0WCk7XG5cdFx0XHRuZXdZID0gbGF5ZXIuX2V2ZW50WSAtIChsYXllci5fZW5kWSAtIGxheWVyLl9zdGFydFkpO1xuXHRcdFx0aWYgKGxheWVyLnVwZGF0ZURyYWdYKSB7XG5cdFx0XHRcdG5ld1ggPSBsYXllci51cGRhdGVEcmFnWC5jYWxsKCRjYW52YXNbMF0sIGxheWVyLCBuZXdYKTtcblx0XHRcdH1cblx0XHRcdGlmIChsYXllci51cGRhdGVEcmFnWSkge1xuXHRcdFx0XHRuZXdZID0gbGF5ZXIudXBkYXRlRHJhZ1kuY2FsbCgkY2FudmFzWzBdLCBsYXllciwgbmV3WSk7XG5cdFx0XHR9XG5cdFx0XHRsYXllci5keCA9IG5ld1ggLSBsYXllci54O1xuXHRcdFx0bGF5ZXIuZHkgPSBuZXdZIC0gbGF5ZXIueTtcblx0XHRcdGlmIChsYXllci5yZXN0cmljdERyYWdUb0F4aXMgIT09ICd5Jykge1xuXHRcdFx0XHRsYXllci54ID0gbmV3WDtcblx0XHRcdH1cblx0XHRcdGlmIChsYXllci5yZXN0cmljdERyYWdUb0F4aXMgIT09ICd4Jykge1xuXHRcdFx0XHRsYXllci55ID0gbmV3WTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gVHJpZ2dlciBkcmFnIGV2ZW50XG5cdFx0XHRfdHJpZ2dlckxheWVyRXZlbnQoJGNhbnZhcywgZGF0YSwgbGF5ZXIsICdkcmFnJyk7XG5cblx0XHRcdC8vIE1vdmUgZ3JvdXBzIHdpdGggbGF5ZXIgb24gZHJhZ1xuXHRcdFx0Zm9yIChnID0gMDsgZyA8IGRyYWdHcm91cHMubGVuZ3RoOyBnICs9IDEpIHtcblxuXHRcdFx0XHRncm91cE5hbWUgPSBkcmFnR3JvdXBzW2ddO1xuXHRcdFx0XHRncm91cCA9IGRhdGEubGF5ZXIuZ3JvdXBzW2dyb3VwTmFtZV07XG5cdFx0XHRcdGlmIChsYXllci5ncm91cHMgJiYgZ3JvdXApIHtcblxuXHRcdFx0XHRcdGZvciAobCA9IDA7IGwgPCBncm91cC5sZW5ndGg7IGwgKz0gMSkge1xuXHRcdFx0XHRcdFx0aWYgKGdyb3VwW2xdICE9PSBsYXllcikge1xuXHRcdFx0XHRcdFx0XHRpZiAobGF5ZXIucmVzdHJpY3REcmFnVG9BeGlzICE9PSAneScgJiYgZ3JvdXBbbF0ucmVzdHJpY3REcmFnVG9BeGlzICE9PSAneScpIHtcblx0XHRcdFx0XHRcdFx0XHRncm91cFtsXS54ICs9IGxheWVyLmR4O1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGlmIChsYXllci5yZXN0cmljdERyYWdUb0F4aXMgIT09ICd4JyAmJiBncm91cFtsXS5yZXN0cmljdERyYWdUb0F4aXMgIT09ICd4Jykge1xuXHRcdFx0XHRcdFx0XHRcdGdyb3VwW2xdLnkgKz0gbGF5ZXIuZHk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fSBlbHNlIGlmIChldmVudFR5cGUgPT09ICdtb3VzZXVwJyB8fCBldmVudFR5cGUgPT09ICd0b3VjaGVuZCcpIHtcblx0XHQvLyBEZXRlY3Qgd2hlbiB1c2VyIHN0b3BzIGRyYWdnaW5nIGxheWVyXG5cblx0XHRpZiAoZHJhZy5kcmFnZ2luZykge1xuXHRcdFx0bGF5ZXIuZHJhZ2dpbmcgPSBmYWxzZTtcblx0XHRcdGRyYWcuZHJhZ2dpbmcgPSBmYWxzZTtcblx0XHRcdGRhdGEucmVkcmF3T25Nb3VzZW1vdmUgPSBkYXRhLm9yaWdpbmFsUmVkcmF3T25Nb3VzZW1vdmU7XG5cdFx0XHQvLyBUcmlnZ2VyIGRyYWdzdG9wIGV2ZW50XG5cdFx0XHRfdHJpZ2dlckxheWVyRXZlbnQoJGNhbnZhcywgZGF0YSwgbGF5ZXIsICdkcmFnc3RvcCcpO1xuXHRcdH1cblxuXHRcdC8vIENhbmNlbCBkcmFnZ2luZ1xuXHRcdGRhdGEuZHJhZyA9IHt9O1xuXG5cdH1cbn1cblxuXG4vLyBMaXN0IG9mIENTUzMgY3Vyc29ycyB0aGF0IG5lZWQgdG8gYmUgcHJlZml4ZWRcbmNzcy5jdXJzb3JzID0gWydncmFiJywgJ2dyYWJiaW5nJywgJ3pvb20taW4nLCAnem9vbS1vdXQnXTtcblxuLy8gRnVuY3Rpb24gdG8gZGV0ZWN0IHZlbmRvciBwcmVmaXhcbi8vIE1vZGlmaWVkIHZlcnNpb24gb2YgRGF2aWQgV2Fsc2gncyBpbXBsZW1lbnRhdGlvblxuLy8gaHR0cHM6Ly9kYXZpZHdhbHNoLm5hbWUvdmVuZG9yLXByZWZpeFxuY3NzLnByZWZpeCA9IChmdW5jdGlvbiAoKSB7XG5cdHZhciBzdHlsZXMgPSBnZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgJycpLFxuXHRcdHByZSA9IChhcnJheVNsaWNlXG5cdFx0XHQuY2FsbChzdHlsZXMpXG5cdFx0XHQuam9pbignJylcblx0XHRcdC5tYXRjaCgvLShtb3p8d2Via2l0fG1zKS0vKSB8fCAoc3R5bGVzLk9MaW5rID09PSAnJyAmJiBbJycsICdvJ10pXG5cdFx0KVsxXTtcblx0cmV0dXJuICctJyArIHByZSArICctJztcbn0pKCk7XG5cbi8vIFNldCBjdXJzb3Igb24gY2FudmFzXG5mdW5jdGlvbiBfc2V0Q3Vyc29yKCRjYW52YXMsIGxheWVyLCBldmVudFR5cGUpIHtcblx0dmFyIGN1cnNvcjtcblx0aWYgKGxheWVyLmN1cnNvcnMpIHtcblx0XHQvLyBSZXRyaWV2ZSBjdXJzb3IgZnJvbSBjdXJzb3JzIG9iamVjdCBpZiBpdCBleGlzdHNcblx0XHRjdXJzb3IgPSBsYXllci5jdXJzb3JzW2V2ZW50VHlwZV07XG5cdH1cblx0Ly8gUHJlZml4IGFueSBDU1MzIGN1cnNvclxuXHRpZiAoJC5pbkFycmF5KGN1cnNvciwgY3NzLmN1cnNvcnMpICE9PSAtMSkge1xuXHRcdGN1cnNvciA9IGNzcy5wcmVmaXggKyBjdXJzb3I7XG5cdH1cblx0Ly8gSWYgY3Vyc29yIGlzIGRlZmluZWRcblx0aWYgKGN1cnNvcikge1xuXHRcdC8vIFNldCBjYW52YXMgY3Vyc29yXG5cdFx0JGNhbnZhcy5jc3Moe1xuXHRcdFx0Y3Vyc29yOiBjdXJzb3Jcblx0XHR9KTtcblx0fVxufVxuXG4vLyBSZXNldCBjdXJzb3Igb24gY2FudmFzXG5mdW5jdGlvbiBfcmVzZXRDdXJzb3IoJGNhbnZhcywgZGF0YSkge1xuXHQkY2FudmFzLmNzcyh7XG5cdFx0Y3Vyc29yOiBkYXRhLmN1cnNvclxuXHR9KTtcbn1cblxuLy8gUnVuIHRoZSBnaXZlbiBldmVudCBjYWxsYmFjayB3aXRoIHRoZSBnaXZlbiBhcmd1bWVudHNcbmZ1bmN0aW9uIF9ydW5FdmVudENhbGxiYWNrKCRjYW52YXMsIGxheWVyLCBldmVudFR5cGUsIGNhbGxiYWNrcywgYXJnKSB7XG5cdC8vIFByZXZlbnQgY2FsbGJhY2sgZnJvbSBmaXJpbmcgcmVjdXJzaXZlbHlcblx0aWYgKGNhbGxiYWNrc1tldmVudFR5cGVdICYmIGxheWVyLl9ydW5uaW5nICYmICFsYXllci5fcnVubmluZ1tldmVudFR5cGVdKSB7XG5cdFx0Ly8gU2lnbmlmeSB0aGUgc3RhcnQgb2YgY2FsbGJhY2sgZXhlY3V0aW9uIGZvciB0aGlzIGV2ZW50XG5cdFx0bGF5ZXIuX3J1bm5pbmdbZXZlbnRUeXBlXSA9IHRydWU7XG5cdFx0Ly8gUnVuIGV2ZW50IGNhbGxiYWNrIHdpdGggdGhlIGdpdmVuIGFyZ3VtZW50c1xuXHRcdGNhbGxiYWNrc1tldmVudFR5cGVdLmNhbGwoJGNhbnZhc1swXSwgbGF5ZXIsIGFyZyk7XG5cdFx0Ly8gU2lnbmlmeSB0aGUgZW5kIG9mIGNhbGxiYWNrIGV4ZWN1dGlvbiBmb3IgdGhpcyBldmVudFxuXHRcdGxheWVyLl9ydW5uaW5nW2V2ZW50VHlwZV0gPSBmYWxzZTtcblx0fVxufVxuXG4vLyBEZXRlcm1pbmUgaWYgdGhlIGdpdmVuIGxheWVyIGNhbiBcImxlZ2FsbHlcIiBmaXJlIHRoZSBnaXZlbiBldmVudFxuZnVuY3Rpb24gX2xheWVyQ2FuRmlyZUV2ZW50KGxheWVyLCBldmVudFR5cGUpIHtcblx0Ly8gSWYgZXZlbnRzIGFyZSBkaXNhYmxlIGFuZCBpZlxuXHQvLyBsYXllciBpcyB0YW5naWJsZSBvciBldmVudCBpcyBub3QgdGFuZ2libGVcblx0cmV0dXJuICghbGF5ZXIuZGlzYWJsZUV2ZW50cyAmJlxuXHRcdCghbGF5ZXIuaW50YW5naWJsZSB8fCAkLmluQXJyYXkoZXZlbnRUeXBlLCB0YW5naWJsZUV2ZW50cykgPT09IC0xKSk7XG59XG5cbi8vIFRyaWdnZXIgdGhlIGdpdmVuIGV2ZW50IG9uIHRoZSBnaXZlbiBsYXllclxuZnVuY3Rpb24gX3RyaWdnZXJMYXllckV2ZW50KCRjYW52YXMsIGRhdGEsIGxheWVyLCBldmVudFR5cGUsIGFyZykge1xuXHQvLyBJZiBsYXllciBjYW4gbGVnYWxseSBmaXJlIHRoaXMgZXZlbnQgdHlwZVxuXHRpZiAoX2xheWVyQ2FuRmlyZUV2ZW50KGxheWVyLCBldmVudFR5cGUpKSB7XG5cblx0XHQvLyBEbyBub3Qgc2V0IGEgY3VzdG9tIGN1cnNvciBvbiBsYXllciBtb3VzZW91dFxuXHRcdGlmIChldmVudFR5cGUgIT09ICdtb3VzZW91dCcpIHtcblx0XHRcdC8vIFVwZGF0ZSBjdXJzb3IgaWYgb25lIGlzIGRlZmluZWQgZm9yIHRoaXMgZXZlbnRcblx0XHRcdF9zZXRDdXJzb3IoJGNhbnZhcywgbGF5ZXIsIGV2ZW50VHlwZSk7XG5cdFx0fVxuXG5cdFx0Ly8gVHJpZ2dlciB0aGUgdXNlci1kZWZpbmVkIGV2ZW50IGNhbGxiYWNrXG5cdFx0X3J1bkV2ZW50Q2FsbGJhY2soJGNhbnZhcywgbGF5ZXIsIGV2ZW50VHlwZSwgbGF5ZXIsIGFyZyk7XG5cdFx0Ly8gVHJpZ2dlciB0aGUgY2FudmFzLWJvdW5kIGV2ZW50IGhvb2tcblx0XHRfcnVuRXZlbnRDYWxsYmFjaygkY2FudmFzLCBsYXllciwgZXZlbnRUeXBlLCBkYXRhLmV2ZW50SG9va3MsIGFyZyk7XG5cdFx0Ly8gVHJpZ2dlciB0aGUgZ2xvYmFsIGV2ZW50IGhvb2tcblx0XHRfcnVuRXZlbnRDYWxsYmFjaygkY2FudmFzLCBsYXllciwgZXZlbnRUeXBlLCBqQ2FudmFzLmV2ZW50SG9va3MsIGFyZyk7XG5cblx0fVxufVxuXG4vLyBNYW51YWxseSB0cmlnZ2VyIGEgbGF5ZXIgZXZlbnRcbiQuZm4udHJpZ2dlckxheWVyRXZlbnQgPSBmdW5jdGlvbiAobGF5ZXIsIGV2ZW50VHlwZSkge1xuXHR2YXIgJGNhbnZhc2VzID0gdGhpcywgJGNhbnZhcywgZSxcblx0XHRkYXRhO1xuXG5cdGZvciAoZSA9IDA7IGUgPCAkY2FudmFzZXMubGVuZ3RoOyBlICs9IDEpIHtcblx0XHQkY2FudmFzID0gJCgkY2FudmFzZXNbZV0pO1xuXHRcdGRhdGEgPSBfZ2V0Q2FudmFzRGF0YSgkY2FudmFzZXNbZV0pO1xuXHRcdGxheWVyID0gJGNhbnZhcy5nZXRMYXllcihsYXllcik7XG5cdFx0aWYgKGxheWVyKSB7XG5cdFx0XHRfdHJpZ2dlckxheWVyRXZlbnQoJGNhbnZhcywgZGF0YSwgbGF5ZXIsIGV2ZW50VHlwZSk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiAkY2FudmFzZXM7XG59O1xuXG4vLyBEcmF3IGxheWVyIHdpdGggdGhlIGdpdmVuIElEXG4kLmZuLmRyYXdMYXllciA9IGZ1bmN0aW9uIGRyYXdMYXllcihsYXllcklkKSB7XG5cdHZhciAkY2FudmFzZXMgPSB0aGlzLCBlLCBjdHgsXG5cdFx0JGNhbnZhcywgbGF5ZXI7XG5cblx0Zm9yIChlID0gMDsgZSA8ICRjYW52YXNlcy5sZW5ndGg7IGUgKz0gMSkge1xuXHRcdCRjYW52YXMgPSAkKCRjYW52YXNlc1tlXSk7XG5cdFx0Y3R4ID0gX2dldENvbnRleHQoJGNhbnZhc2VzW2VdKTtcblx0XHRpZiAoY3R4KSB7XG5cdFx0XHRsYXllciA9ICRjYW52YXMuZ2V0TGF5ZXIobGF5ZXJJZCk7XG5cdFx0XHRfZHJhd0xheWVyKCRjYW52YXMsIGN0eCwgbGF5ZXIpO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gJGNhbnZhc2VzO1xufTtcblxuLy8gRHJhdyBhbGwgbGF5ZXJzIChvciwgaWYgZ2l2ZW4sIG9ubHkgbGF5ZXJzIHN0YXJ0aW5nIGF0IGFuIGluZGV4KVxuJC5mbi5kcmF3TGF5ZXJzID0gZnVuY3Rpb24gZHJhd0xheWVycyhhcmdzKSB7XG5cdHZhciAkY2FudmFzZXMgPSB0aGlzLCAkY2FudmFzLCBlLCBjdHgsXG5cdFx0Ly8gSW50ZXJuYWwgcGFyYW1ldGVycyBmb3IgcmVkcmF3aW5nIHRoZSBjYW52YXNcblx0XHRwYXJhbXMgPSBhcmdzIHx8IHt9LFxuXHRcdC8vIE90aGVyIHZhcmlhYmxlc1xuXHRcdGxheWVycywgbGF5ZXIsIGxhc3RMYXllciwgbCwgaW5kZXgsIGxhc3RJbmRleCxcblx0XHRkYXRhLCBldmVudENhY2hlLCBldmVudFR5cGUsIGlzSW1hZ2VMYXllcjtcblxuXHQvLyBUaGUgbGF5ZXIgaW5kZXggZnJvbSB3aGljaCB0byBzdGFydCByZWRyYXdpbmcgdGhlIGNhbnZhc1xuXHRpbmRleCA9IHBhcmFtcy5pbmRleDtcblx0aWYgKCFpbmRleCkge1xuXHRcdGluZGV4ID0gMDtcblx0fVxuXG5cdGZvciAoZSA9IDA7IGUgPCAkY2FudmFzZXMubGVuZ3RoOyBlICs9IDEpIHtcblx0XHQkY2FudmFzID0gJCgkY2FudmFzZXNbZV0pO1xuXHRcdGN0eCA9IF9nZXRDb250ZXh0KCRjYW52YXNlc1tlXSk7XG5cdFx0aWYgKGN0eCkge1xuXG5cdFx0XHRkYXRhID0gX2dldENhbnZhc0RhdGEoJGNhbnZhc2VzW2VdKTtcblxuXHRcdFx0Ly8gQ2xlYXIgY2FudmFzIGZpcnN0IHVubGVzcyBvdGhlcndpc2UgZGlyZWN0ZWRcblx0XHRcdGlmIChwYXJhbXMuY2xlYXIgIT09IGZhbHNlKSB7XG5cdFx0XHRcdCRjYW52YXMuY2xlYXJDYW52YXMoKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gSWYgYSBjb21wbGV0aW9uIGNhbGxiYWNrIHdhcyBwcm92aWRlZCwgc2F2ZSBpdCB0byB0aGUgY2FudmFzIGRhdGFcblx0XHRcdC8vIHN0b3JlIHNvIHRoYXQgdGhlIGZ1bmN0aW9uIGNhbiBiZSBwYXNzZWQgdG8gZHJhd0xheWVycygpIGFnYWluXG5cdFx0XHQvLyBhZnRlciBhbnkgaW1hZ2UgbGF5ZXJzIGhhdmUgbG9hZGVkXG5cdFx0XHRpZiAocGFyYW1zLmNvbXBsZXRlKSB7XG5cdFx0XHRcdGRhdGEuZHJhd0xheWVyc0NvbXBsZXRlID0gcGFyYW1zLmNvbXBsZXRlO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBDYWNoZSB0aGUgbGF5ZXJzIGFycmF5XG5cdFx0XHRsYXllcnMgPSBkYXRhLmxheWVycztcblxuXHRcdFx0Ly8gRHJhdyBsYXllcnMgZnJvbSBmaXJzdCB0byBsYXN0IChib3R0b20gdG8gdG9wKVxuXHRcdFx0Zm9yIChsID0gaW5kZXg7IGwgPCBsYXllcnMubGVuZ3RoOyBsICs9IDEpIHtcblx0XHRcdFx0bGF5ZXIgPSBsYXllcnNbbF07XG5cblx0XHRcdFx0Ly8gRW5zdXJlIGxheWVyIGluZGV4IGlzIHVwLXRvLWRhdGVcblx0XHRcdFx0bGF5ZXIuaW5kZXggPSBsO1xuXG5cdFx0XHRcdC8vIFByZXZlbnQgYW55IG9uZSBldmVudCBmcm9tIGZpcmluZyBleGNlc3NpdmVseVxuXHRcdFx0XHRpZiAocGFyYW1zLnJlc2V0RmlyZSkge1xuXHRcdFx0XHRcdGxheWVyLl9maXJlZCA9IGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIERyYXcgbGF5ZXJcblx0XHRcdFx0X2RyYXdMYXllcigkY2FudmFzLCBjdHgsIGxheWVyLCBsICsgMSk7XG5cdFx0XHRcdC8vIFN0b3JlIGxpc3Qgb2YgcHJldmlvdXMgbWFza3MgZm9yIGVhY2ggbGF5ZXJcblx0XHRcdFx0bGF5ZXIuX21hc2tzID0gZGF0YS50cmFuc2Zvcm1zLm1hc2tzLnNsaWNlKDApO1xuXG5cdFx0XHRcdC8vIEFsbG93IGltYWdlIGxheWVycyB0byBsb2FkIGJlZm9yZSBkcmF3aW5nIHN1Y2Nlc3NpdmUgbGF5ZXJzXG5cdFx0XHRcdGlmIChsYXllci5fbWV0aG9kID09PSAkLmZuLmRyYXdJbWFnZSAmJiBsYXllci52aXNpYmxlKSB7XG5cdFx0XHRcdFx0aXNJbWFnZUxheWVyID0gdHJ1ZTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHRcdC8vIElmIGxheWVyIGlzIGFuIGltYWdlIGxheWVyXG5cdFx0XHRpZiAoaXNJbWFnZUxheWVyKSB7XG5cdFx0XHRcdC8vIFN0b3AgYW5kIHdhaXQgZm9yIGRyYXdJbWFnZSgpIHRvIHJlc3VtZSBkcmF3TGF5ZXJzKClcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFN0b3JlIHRoZSBsYXRlc3Rcblx0XHRcdGxhc3RJbmRleCA9IGw7XG5cblx0XHRcdC8vIFJ1biBjb21wbGV0aW9uIGNhbGxiYWNrIChpZiBwcm92aWRlZCkgb25jZSBhbGwgbGF5ZXJzIGhhdmUgZHJhd25cblx0XHRcdGlmIChwYXJhbXMuY29tcGxldGUpIHtcblx0XHRcdFx0cGFyYW1zLmNvbXBsZXRlLmNhbGwoJGNhbnZhc2VzW2VdKTtcblx0XHRcdFx0ZGVsZXRlIGRhdGEuZHJhd0xheWVyc0NvbXBsZXRlO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBHZXQgZmlyc3QgbGF5ZXIgdGhhdCBpbnRlcnNlY3RzIHdpdGggZXZlbnQgY29vcmRpbmF0ZXNcblx0XHRcdGxheWVyID0gX2dldEludGVyc2VjdGluZ0xheWVyKGRhdGEpO1xuXG5cdFx0XHRldmVudENhY2hlID0gZGF0YS5ldmVudDtcblx0XHRcdGV2ZW50VHlwZSA9IGV2ZW50Q2FjaGUudHlwZTtcblxuXHRcdFx0Ly8gSWYgakNhbnZhcyBoYXMgZGV0ZWN0ZWQgYSBkcmFnc3RhcnRcblx0XHRcdGlmIChkYXRhLmRyYWcubGF5ZXIpIHtcblx0XHRcdFx0Ly8gSGFuZGxlIGRyYWdnaW5nIG9mIGxheWVyXG5cdFx0XHRcdF9oYW5kbGVMYXllckRyYWcoJGNhbnZhcywgZGF0YSwgZXZlbnRUeXBlKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gTWFuYWdlIG1vdXNlb3V0IGV2ZW50XG5cdFx0XHRsYXN0TGF5ZXIgPSBkYXRhLmxhc3RJbnRlcnNlY3RlZDtcblx0XHRcdGlmIChsYXN0TGF5ZXIgIT09IG51bGwgJiYgbGF5ZXIgIT09IGxhc3RMYXllciAmJiBsYXN0TGF5ZXIuX2hvdmVyZWQgJiYgIWxhc3RMYXllci5fZmlyZWQgJiYgIWRhdGEuZHJhZy5kcmFnZ2luZykge1xuXG5cdFx0XHRcdGRhdGEubGFzdEludGVyc2VjdGVkID0gbnVsbDtcblx0XHRcdFx0bGFzdExheWVyLl9maXJlZCA9IHRydWU7XG5cdFx0XHRcdGxhc3RMYXllci5faG92ZXJlZCA9IGZhbHNlO1xuXHRcdFx0XHRfdHJpZ2dlckxheWVyRXZlbnQoJGNhbnZhcywgZGF0YSwgbGFzdExheWVyLCAnbW91c2VvdXQnKTtcblx0XHRcdFx0X3Jlc2V0Q3Vyc29yKCRjYW52YXMsIGRhdGEpO1xuXG5cdFx0XHR9XG5cblx0XHRcdGlmIChsYXllcikge1xuXG5cdFx0XHRcdC8vIFVzZSBtb3VzZSBldmVudCBjYWxsYmFja3MgaWYgbm8gdG91Y2ggZXZlbnQgY2FsbGJhY2tzIGFyZSBnaXZlblxuXHRcdFx0XHRpZiAoIWxheWVyW2V2ZW50VHlwZV0pIHtcblx0XHRcdFx0XHRldmVudFR5cGUgPSBfZ2V0TW91c2VFdmVudE5hbWUoZXZlbnRUeXBlKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIENoZWNrIGV2ZW50cyBmb3IgaW50ZXJzZWN0aW5nIGxheWVyXG5cdFx0XHRcdGlmIChsYXllci5fZXZlbnQgJiYgbGF5ZXIuaW50ZXJzZWN0cykge1xuXG5cdFx0XHRcdFx0ZGF0YS5sYXN0SW50ZXJzZWN0ZWQgPSBsYXllcjtcblxuXHRcdFx0XHRcdC8vIERldGVjdCBtb3VzZW92ZXIgZXZlbnRzXG5cdFx0XHRcdFx0aWYgKChsYXllci5tb3VzZW92ZXIgfHwgbGF5ZXIubW91c2VvdXQgfHwgbGF5ZXIuY3Vyc29ycykgJiYgIWRhdGEuZHJhZy5kcmFnZ2luZykge1xuXG5cdFx0XHRcdFx0XHRpZiAoIWxheWVyLl9ob3ZlcmVkICYmICFsYXllci5fZmlyZWQpIHtcblxuXHRcdFx0XHRcdFx0XHQvLyBQcmV2ZW50IGV2ZW50cyBmcm9tIGZpcmluZyBleGNlc3NpdmVseVxuXHRcdFx0XHRcdFx0XHRsYXllci5fZmlyZWQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRsYXllci5faG92ZXJlZCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdF90cmlnZ2VyTGF5ZXJFdmVudCgkY2FudmFzLCBkYXRhLCBsYXllciwgJ21vdXNlb3ZlcicpO1xuXG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBEZXRlY3QgYW55IG90aGVyIG1vdXNlIGV2ZW50XG5cdFx0XHRcdFx0aWYgKCFsYXllci5fZmlyZWQpIHtcblxuXHRcdFx0XHRcdFx0Ly8gUHJldmVudCBldmVudCBmcm9tIGZpcmluZyB0d2ljZSB1bmludGVudGlvbmFsbHlcblx0XHRcdFx0XHRcdGxheWVyLl9maXJlZCA9IHRydWU7XG5cdFx0XHRcdFx0XHRldmVudENhY2hlLnR5cGUgPSBudWxsO1xuXG5cdFx0XHRcdFx0XHRfdHJpZ2dlckxheWVyRXZlbnQoJGNhbnZhcywgZGF0YSwgbGF5ZXIsIGV2ZW50VHlwZSk7XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBVc2UgdGhlIG1vdXNlZG93biBldmVudCB0byBzdGFydCBkcmFnXG5cdFx0XHRcdFx0aWYgKGxheWVyLmRyYWdnYWJsZSAmJiAhbGF5ZXIuZGlzYWJsZUV2ZW50cyAmJiAoZXZlbnRUeXBlID09PSAnbW91c2Vkb3duJyB8fCBldmVudFR5cGUgPT09ICd0b3VjaHN0YXJ0JykpIHtcblxuXHRcdFx0XHRcdFx0Ly8gS2VlcCB0cmFjayBvZiBkcmFnIHN0YXRlXG5cdFx0XHRcdFx0XHRkYXRhLmRyYWcubGF5ZXIgPSBsYXllcjtcblx0XHRcdFx0XHRcdGRhdGEub3JpZ2luYWxSZWRyYXdPbk1vdXNlbW92ZSA9IGRhdGEucmVkcmF3T25Nb3VzZW1vdmU7XG5cdFx0XHRcdFx0XHRkYXRhLnJlZHJhd09uTW91c2Vtb3ZlID0gdHJ1ZTtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdFx0Ly8gSWYgY3Vyc29yIGlzIG5vdCBpbnRlcnNlY3Rpbmcgd2l0aCBhbnkgbGF5ZXJcblx0XHRcdGlmIChsYXllciA9PT0gbnVsbCAmJiAhZGF0YS5kcmFnLmRyYWdnaW5nKSB7XG5cdFx0XHRcdC8vIFJlc2V0IGN1cnNvciB0byBwcmV2aW91cyBzdGF0ZVxuXHRcdFx0XHRfcmVzZXRDdXJzb3IoJGNhbnZhcywgZGF0YSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIElmIHRoZSBsYXN0IGxheWVyIGhhcyBiZWVuIGRyYXduXG5cdFx0XHRpZiAobGFzdEluZGV4ID09PSBsYXllcnMubGVuZ3RoKSB7XG5cblx0XHRcdFx0Ly8gUmVzZXQgbGlzdCBvZiBpbnRlcnNlY3RpbmcgbGF5ZXJzXG5cdFx0XHRcdGRhdGEuaW50ZXJzZWN0aW5nLmxlbmd0aCA9IDA7XG5cdFx0XHRcdC8vIFJlc2V0IHRyYW5zZm9ybWF0aW9uIHN0YWNrXG5cdFx0XHRcdGRhdGEudHJhbnNmb3JtcyA9IF9jbG9uZVRyYW5zZm9ybXMoYmFzZVRyYW5zZm9ybXMpO1xuXHRcdFx0XHRkYXRhLnNhdmVkVHJhbnNmb3Jtcy5sZW5ndGggPSAwO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cdH1cblx0cmV0dXJuICRjYW52YXNlcztcbn07XG5cbi8vIEFkZCBhIGpDYW52YXMgbGF5ZXIgKGludGVybmFsKVxuZnVuY3Rpb24gX2FkZExheWVyKGNhbnZhcywgcGFyYW1zLCBhcmdzLCBtZXRob2QpIHtcblx0dmFyICRjYW52YXMsIGRhdGEsXG5cdFx0bGF5ZXJzLCBsYXllciA9IChwYXJhbXMuX2xheWVyID8gYXJncyA6IHBhcmFtcyk7XG5cblx0Ly8gU3RvcmUgYXJndW1lbnRzIG9iamVjdCBmb3IgbGF0ZXIgdXNlXG5cdHBhcmFtcy5fYXJncyA9IGFyZ3M7XG5cblx0Ly8gQ29udmVydCBhbGwgZHJhZ2dhYmxlIGRyYXdpbmdzIGludG8gakNhbnZhcyBsYXllcnNcblx0aWYgKHBhcmFtcy5kcmFnZ2FibGUgfHwgcGFyYW1zLmRyYWdHcm91cHMpIHtcblx0XHRwYXJhbXMubGF5ZXIgPSB0cnVlO1xuXHRcdHBhcmFtcy5kcmFnZ2FibGUgPSB0cnVlO1xuXHR9XG5cblx0Ly8gRGV0ZXJtaW5lIHRoZSBsYXllcidzIHR5cGUgdXNpbmcgdGhlIGF2YWlsYWJsZSBpbmZvcm1hdGlvblxuXHRpZiAoIXBhcmFtcy5fbWV0aG9kKSB7XG5cdFx0aWYgKG1ldGhvZCkge1xuXHRcdFx0cGFyYW1zLl9tZXRob2QgPSBtZXRob2Q7XG5cdFx0fSBlbHNlIGlmIChwYXJhbXMubWV0aG9kKSB7XG5cdFx0XHRwYXJhbXMuX21ldGhvZCA9ICQuZm5bcGFyYW1zLm1ldGhvZF07XG5cdFx0fSBlbHNlIGlmIChwYXJhbXMudHlwZSkge1xuXHRcdFx0cGFyYW1zLl9tZXRob2QgPSAkLmZuW21hcHMuZHJhd2luZ3NbcGFyYW1zLnR5cGVdXTtcblx0XHR9XG5cdH1cblxuXHQvLyBJZiBsYXllciBoYXNuJ3QgYmVlbiBhZGRlZCB5ZXRcblx0aWYgKHBhcmFtcy5sYXllciAmJiAhcGFyYW1zLl9sYXllcikge1xuXHRcdC8vIEFkZCBsYXllciB0byBjYW52YXNcblxuXHRcdCRjYW52YXMgPSAkKGNhbnZhcyk7XG5cblx0XHRkYXRhID0gX2dldENhbnZhc0RhdGEoY2FudmFzKTtcblx0XHRsYXllcnMgPSBkYXRhLmxheWVycztcblxuXHRcdC8vIERvIG5vdCBhZGQgZHVwbGljYXRlIGxheWVycyBvZiBzYW1lIG5hbWVcblx0XHRpZiAobGF5ZXIubmFtZSA9PT0gbnVsbCB8fCAoaXNTdHJpbmcobGF5ZXIubmFtZSkgJiYgZGF0YS5sYXllci5uYW1lc1tsYXllci5uYW1lXSA9PT0gdW5kZWZpbmVkKSkge1xuXG5cdFx0XHQvLyBDb252ZXJ0IG51bWJlciBwcm9wZXJ0aWVzIHRvIG51bWJlcnNcblx0XHRcdF9jb2VyY2VOdW1lcmljUHJvcHMocGFyYW1zKTtcblxuXHRcdFx0Ly8gRW5zdXJlIGxheWVycyBhcmUgdW5pcXVlIGFjcm9zcyBjYW52YXNlcyBieSBjbG9uaW5nIHRoZW1cblx0XHRcdGxheWVyID0gbmV3IGpDYW52YXNPYmplY3QocGFyYW1zKTtcblx0XHRcdGxheWVyLmNhbnZhcyA9IGNhbnZhcztcblx0XHRcdC8vIEluZGljYXRlIHRoYXQgdGhpcyBpcyBhIGxheWVyIGZvciBmdXR1cmUgY2hlY2tzXG5cdFx0XHRsYXllci5sYXllciA9IHRydWU7XG5cdFx0XHRsYXllci5fbGF5ZXIgPSB0cnVlO1xuXHRcdFx0bGF5ZXIuX3J1bm5pbmcgPSB7fTtcblx0XHRcdC8vIElmIGxheWVyIHN0b3JlcyB1c2VyLWRlZmluZWQgZGF0YVxuXHRcdFx0aWYgKGxheWVyLmRhdGEgIT09IG51bGwpIHtcblx0XHRcdFx0Ly8gQ2xvbmUgb2JqZWN0XG5cdFx0XHRcdGxheWVyLmRhdGEgPSBleHRlbmRPYmplY3Qoe30sIGxheWVyLmRhdGEpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gT3RoZXJ3aXNlLCBjcmVhdGUgZGF0YSBvYmplY3Rcblx0XHRcdFx0bGF5ZXIuZGF0YSA9IHt9O1xuXHRcdFx0fVxuXHRcdFx0Ly8gSWYgbGF5ZXIgc3RvcmVzIGEgbGlzdCBvZiBhc3NvY2lhdGVkIGdyb3Vwc1xuXHRcdFx0aWYgKGxheWVyLmdyb3VwcyAhPT0gbnVsbCkge1xuXHRcdFx0XHQvLyBDbG9uZSBsaXN0XG5cdFx0XHRcdGxheWVyLmdyb3VwcyA9IGxheWVyLmdyb3Vwcy5zbGljZSgwKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIE90aGVyd2lzZSwgY3JlYXRlIGVtcHR5IGxpc3Rcblx0XHRcdFx0bGF5ZXIuZ3JvdXBzID0gW107XG5cdFx0XHR9XG5cblx0XHRcdC8vIFVwZGF0ZSBsYXllciBncm91cCBtYXBzXG5cdFx0XHRfdXBkYXRlTGF5ZXJOYW1lKCRjYW52YXMsIGRhdGEsIGxheWVyKTtcblx0XHRcdF91cGRhdGVMYXllckdyb3VwcygkY2FudmFzLCBkYXRhLCBsYXllcik7XG5cblx0XHRcdC8vIENoZWNrIGZvciBhbnkgYXNzb2NpYXRlZCBqQ2FudmFzIGV2ZW50cyBhbmQgZW5hYmxlIHRoZW1cblx0XHRcdF9hZGRMYXllckV2ZW50cygkY2FudmFzLCBkYXRhLCBsYXllcik7XG5cblx0XHRcdC8vIE9wdGlvbmFsbHkgZW5hYmxlIGRyYWctYW5kLWRyb3Agc3VwcG9ydCBhbmQgY3Vyc29yIHN1cHBvcnRcblx0XHRcdF9lbmFibGVEcmFnKCRjYW52YXMsIGRhdGEsIGxheWVyKTtcblxuXHRcdFx0Ly8gQ29weSBfZXZlbnQgcHJvcGVydHkgdG8gcGFyYW1ldGVycyBvYmplY3Rcblx0XHRcdHBhcmFtcy5fZXZlbnQgPSBsYXllci5fZXZlbnQ7XG5cblx0XHRcdC8vIENhbGN1bGF0ZSB3aWR0aC9oZWlnaHQgZm9yIHRleHQgbGF5ZXJzXG5cdFx0XHRpZiAobGF5ZXIuX21ldGhvZCA9PT0gJC5mbi5kcmF3VGV4dCkge1xuXHRcdFx0XHQkY2FudmFzLm1lYXN1cmVUZXh0KGxheWVyKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gQWRkIGxheWVyIHRvIGVuZCBvZiBhcnJheSBpZiBubyBpbmRleCBpcyBzcGVjaWZpZWRcblx0XHRcdGlmIChsYXllci5pbmRleCA9PT0gbnVsbCkge1xuXHRcdFx0XHRsYXllci5pbmRleCA9IGxheWVycy5sZW5ndGg7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEFkZCBsYXllciB0byBsYXllcnMgYXJyYXkgYXQgc3BlY2lmaWVkIGluZGV4XG5cdFx0XHRsYXllcnMuc3BsaWNlKGxheWVyLmluZGV4LCAwLCBsYXllcik7XG5cblx0XHRcdC8vIFN0b3JlIGxheWVyIG9uIHBhcmFtZXRlcnMgb2JqZWN0XG5cdFx0XHRwYXJhbXMuX2FyZ3MgPSBsYXllcjtcblxuXHRcdFx0Ly8gVHJpZ2dlciBhbiAnYWRkJyBldmVudFxuXHRcdFx0X3RyaWdnZXJMYXllckV2ZW50KCRjYW52YXMsIGRhdGEsIGxheWVyLCAnYWRkJyk7XG5cblx0XHR9XG5cblx0fSBlbHNlIGlmICghcGFyYW1zLmxheWVyKSB7XG5cdFx0X2NvZXJjZU51bWVyaWNQcm9wcyhwYXJhbXMpO1xuXHR9XG5cblx0cmV0dXJuIGxheWVyO1xufVxuXG4vLyBBZGQgYSBqQ2FudmFzIGxheWVyXG4kLmZuLmFkZExheWVyID0gZnVuY3Rpb24gYWRkTGF5ZXIoYXJncykge1xuXHR2YXIgJGNhbnZhc2VzID0gdGhpcywgZSwgY3R4LFxuXHRcdHBhcmFtcztcblxuXHRmb3IgKGUgPSAwOyBlIDwgJGNhbnZhc2VzLmxlbmd0aDsgZSArPSAxKSB7XG5cdFx0Y3R4ID0gX2dldENvbnRleHQoJGNhbnZhc2VzW2VdKTtcblx0XHRpZiAoY3R4KSB7XG5cblx0XHRcdHBhcmFtcyA9IG5ldyBqQ2FudmFzT2JqZWN0KGFyZ3MpO1xuXHRcdFx0cGFyYW1zLmxheWVyID0gdHJ1ZTtcblx0XHRcdF9hZGRMYXllcigkY2FudmFzZXNbZV0sIHBhcmFtcywgYXJncyk7XG5cblx0XHR9XG5cdH1cblx0cmV0dXJuICRjYW52YXNlcztcbn07XG5cbi8qIEFuaW1hdGlvbiBBUEkgKi9cblxuLy8gRGVmaW5lIHByb3BlcnRpZXMgdXNlZCBpbiBib3RoIENTUyBhbmQgakNhbnZhc1xuY3NzLnByb3BzID0gW1xuXHQnd2lkdGgnLFxuXHQnaGVpZ2h0Jyxcblx0J29wYWNpdHknLFxuXHQnbGluZUhlaWdodCdcbl07XG5jc3MucHJvcHNPYmogPSB7fTtcblxuLy8gSGlkZS9zaG93IGpDYW52YXMvQ1NTIHByb3BlcnRpZXMgc28gdGhleSBjYW4gYmUgYW5pbWF0ZWQgdXNpbmcgalF1ZXJ5XG5mdW5jdGlvbiBfc2hvd1Byb3BzKG9iaikge1xuXHR2YXIgY3NzUHJvcCwgcDtcblx0Zm9yIChwID0gMDsgcCA8IGNzcy5wcm9wcy5sZW5ndGg7IHAgKz0gMSkge1xuXHRcdGNzc1Byb3AgPSBjc3MucHJvcHNbcF07XG5cdFx0b2JqW2Nzc1Byb3BdID0gb2JqWydfJyArIGNzc1Byb3BdO1xuXHR9XG59XG5mdW5jdGlvbiBfaGlkZVByb3BzKG9iaiwgcmVzZXQpIHtcblx0dmFyIGNzc1Byb3AsIHA7XG5cdGZvciAocCA9IDA7IHAgPCBjc3MucHJvcHMubGVuZ3RoOyBwICs9IDEpIHtcblx0XHRjc3NQcm9wID0gY3NzLnByb3BzW3BdO1xuXHRcdC8vIEhpZGUgcHJvcGVydHkgdXNpbmcgc2FtZSBuYW1lIHdpdGggbGVhZGluZyB1bmRlcnNjb3JlXG5cdFx0aWYgKG9ialtjc3NQcm9wXSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRvYmpbJ18nICsgY3NzUHJvcF0gPSBvYmpbY3NzUHJvcF07XG5cdFx0XHRjc3MucHJvcHNPYmpbY3NzUHJvcF0gPSB0cnVlO1xuXHRcdFx0aWYgKHJlc2V0KSB7XG5cdFx0XHRcdGRlbGV0ZSBvYmpbY3NzUHJvcF07XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbi8vIEV2YWx1YXRlIHByb3BlcnR5IHZhbHVlcyB0aGF0IGFyZSBmdW5jdGlvbnNcbmZ1bmN0aW9uIF9wYXJzZUVuZFZhbHVlcyhjYW52YXMsIGxheWVyLCBlbmRWYWx1ZXMpIHtcblx0dmFyIHByb3BOYW1lLCBwcm9wVmFsdWUsXG5cdFx0c3ViUHJvcE5hbWUsIHN1YlByb3BWYWx1ZTtcblx0Ly8gTG9vcCB0aHJvdWdoIGFsbCBwcm9wZXJ0aWVzIGluIG1hcCBvZiBlbmQgdmFsdWVzXG5cdGZvciAocHJvcE5hbWUgaW4gZW5kVmFsdWVzKSB7XG5cdFx0aWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChlbmRWYWx1ZXMsIHByb3BOYW1lKSkge1xuXHRcdFx0cHJvcFZhbHVlID0gZW5kVmFsdWVzW3Byb3BOYW1lXTtcblx0XHRcdC8vIElmIGVuZCB2YWx1ZSBpcyBmdW5jdGlvblxuXHRcdFx0aWYgKGlzRnVuY3Rpb24ocHJvcFZhbHVlKSkge1xuXHRcdFx0XHQvLyBDYWxsIGZ1bmN0aW9uIGFuZCB1c2UgaXRzIHZhbHVlIGFzIHRoZSBlbmQgdmFsdWVcblx0XHRcdFx0ZW5kVmFsdWVzW3Byb3BOYW1lXSA9IHByb3BWYWx1ZS5jYWxsKGNhbnZhcywgbGF5ZXIsIHByb3BOYW1lKTtcblx0XHRcdH1cblx0XHRcdC8vIElmIGVuZCB2YWx1ZSBpcyBhbiBvYmplY3Rcblx0XHRcdGlmICh0eXBlT2YocHJvcFZhbHVlKSA9PT0gJ29iamVjdCcgJiYgaXNQbGFpbk9iamVjdChwcm9wVmFsdWUpKSB7XG5cdFx0XHRcdC8vIFByZXBhcmUgdG8gYW5pbWF0ZSBwcm9wZXJ0aWVzIGluIG9iamVjdFxuXHRcdFx0XHRmb3IgKHN1YlByb3BOYW1lIGluIHByb3BWYWx1ZSkge1xuXHRcdFx0XHRcdGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocHJvcFZhbHVlLCBzdWJQcm9wTmFtZSkpIHtcblx0XHRcdFx0XHRcdHN1YlByb3BWYWx1ZSA9IHByb3BWYWx1ZVtzdWJQcm9wTmFtZV07XG5cdFx0XHRcdFx0XHQvLyBTdG9yZSBwcm9wZXJ0eSdzIHN0YXJ0IHZhbHVlIGF0IHRvcC1sZXZlbCBvZiBsYXllclxuXHRcdFx0XHRcdFx0aWYgKGxheWVyW3Byb3BOYW1lXSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRcdGxheWVyW3Byb3BOYW1lICsgJy4nICsgc3ViUHJvcE5hbWVdID0gbGF5ZXJbcHJvcE5hbWVdW3N1YlByb3BOYW1lXTtcblx0XHRcdFx0XHRcdFx0Ly8gU3RvcmUgcHJvcGVydHkncyBlbmQgdmFsdWUgYXQgdG9wLWxldmVsIG9mIGVuZCB2YWx1ZXMgbWFwXG5cdFx0XHRcdFx0XHRcdGVuZFZhbHVlc1twcm9wTmFtZSArICcuJyArIHN1YlByb3BOYW1lXSA9IHN1YlByb3BWYWx1ZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gRGVsZXRlIHN1Yi1wcm9wZXJ0eSBvZiBvYmplY3QgYXMgaXQncyBubyBsb25nZXIgbmVlZGVkXG5cdFx0XHRcdGRlbGV0ZSBlbmRWYWx1ZXNbcHJvcE5hbWVdO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gZW5kVmFsdWVzO1xufVxuXG4vLyBSZW1vdmUgc3ViLXByb3BlcnR5IGFsaWFzZXMgZnJvbSBsYXllciBvYmplY3RcbmZ1bmN0aW9uIF9yZW1vdmVTdWJQcm9wQWxpYXNlcyhsYXllcikge1xuXHR2YXIgcHJvcE5hbWU7XG5cdGZvciAocHJvcE5hbWUgaW4gbGF5ZXIpIHtcblx0XHRpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGxheWVyLCBwcm9wTmFtZSkpIHtcblx0XHRcdGlmIChwcm9wTmFtZS5pbmRleE9mKCcuJykgIT09IC0xKSB7XG5cdFx0XHRcdGRlbGV0ZSBsYXllcltwcm9wTmFtZV07XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbi8vIENvbnZlcnQgYSBjb2xvciB2YWx1ZSB0byBhbiBhcnJheSBvZiBSR0IgdmFsdWVzXG5mdW5jdGlvbiBfY29sb3JUb1JnYkFycmF5KGNvbG9yKSB7XG5cdHZhciBvcmlnaW5hbENvbG9yLCBlbGVtLFxuXHRcdHJnYiA9IFtdLFxuXHRcdG11bHRpcGxlID0gMTtcblxuXHQvLyBEZWFsIHdpdGggY29tcGxldGUgdHJhbnNwYXJlbmN5XG5cdGlmIChjb2xvciA9PT0gJ3RyYW5zcGFyZW50Jykge1xuXHRcdGNvbG9yID0gJ3JnYmEoMCwgMCwgMCwgMCknO1xuXHR9IGVsc2UgaWYgKGNvbG9yLm1hdGNoKC9eKFthLXpdK3wjWzAtOWEtZl0rKSQvZ2kpKSB7XG5cdFx0Ly8gRGVhbCB3aXRoIGhleGFkZWNpbWFsIGNvbG9ycyBhbmQgY29sb3IgbmFtZXNcblx0XHRlbGVtID0gZG9jdW1lbnQuaGVhZDtcblx0XHRvcmlnaW5hbENvbG9yID0gZWxlbS5zdHlsZS5jb2xvcjtcblx0XHRlbGVtLnN0eWxlLmNvbG9yID0gY29sb3I7XG5cdFx0Y29sb3IgPSAkLmNzcyhlbGVtLCAnY29sb3InKTtcblx0XHRlbGVtLnN0eWxlLmNvbG9yID0gb3JpZ2luYWxDb2xvcjtcblx0fVxuXHQvLyBQYXJzZSBSR0Igc3RyaW5nXG5cdGlmIChjb2xvci5tYXRjaCgvXnJnYi9naSkpIHtcblx0XHRyZ2IgPSBjb2xvci5tYXRjaCgvKFxcZCsoXFwuXFxkKyk/KS9naSk7XG5cdFx0Ly8gRGVhbCB3aXRoIFJHQiBwZXJjZW50YWdlc1xuXHRcdGlmIChjb2xvci5tYXRjaCgvJS9naSkpIHtcblx0XHRcdG11bHRpcGxlID0gMi41NTtcblx0XHR9XG5cdFx0cmdiWzBdICo9IG11bHRpcGxlO1xuXHRcdHJnYlsxXSAqPSBtdWx0aXBsZTtcblx0XHRyZ2JbMl0gKj0gbXVsdGlwbGU7XG5cdFx0Ly8gQWQgYWxwaGEgY2hhbm5lbCBpZiBnaXZlblxuXHRcdGlmIChyZ2JbM10gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmdiWzNdID0gcGFyc2VGbG9hdChyZ2JbM10pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZ2JbM10gPSAxO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcmdiO1xufVxuXG4vLyBBbmltYXRlIGEgaGV4IG9yIFJHQiBjb2xvclxuZnVuY3Rpb24gX2FuaW1hdGVDb2xvcihmeCkge1xuXHR2YXIgbiA9IDMsXG5cdFx0aTtcblx0Ly8gT25seSBwYXJzZSBzdGFydCBhbmQgZW5kIGNvbG9ycyBvbmNlXG5cdGlmICh0eXBlT2YoZnguc3RhcnQpICE9PSAnYXJyYXknKSB7XG5cdFx0Znguc3RhcnQgPSBfY29sb3JUb1JnYkFycmF5KGZ4LnN0YXJ0KTtcblx0XHRmeC5lbmQgPSBfY29sb3JUb1JnYkFycmF5KGZ4LmVuZCk7XG5cdH1cblx0Zngubm93ID0gW107XG5cblx0Ly8gSWYgY29sb3JzIGFyZSBSR0JBLCBhbmltYXRlIHRyYW5zcGFyZW5jeVxuXHRpZiAoZnguc3RhcnRbM10gIT09IDEgfHwgZnguZW5kWzNdICE9PSAxKSB7XG5cdFx0biA9IDQ7XG5cdH1cblxuXHQvLyBDYWxjdWxhdGUgY3VycmVudCBmcmFtZSBmb3IgcmVkLCBncmVlbiwgYmx1ZSwgYW5kIGFscGhhXG5cdGZvciAoaSA9IDA7IGkgPCBuOyBpICs9IDEpIHtcblx0XHRmeC5ub3dbaV0gPSBmeC5zdGFydFtpXSArICgoZnguZW5kW2ldIC0gZnguc3RhcnRbaV0pICogZngucG9zKTtcblx0XHQvLyBPbmx5IHRoZSByZWQsIGdyZWVuLCBhbmQgYmx1ZSB2YWx1ZXMgbXVzdCBiZSBpbnRlZ2Vyc1xuXHRcdGlmIChpIDwgMykge1xuXHRcdFx0Zngubm93W2ldID0gcm91bmQoZngubm93W2ldKTtcblx0XHR9XG5cdH1cblx0aWYgKGZ4LnN0YXJ0WzNdICE9PSAxIHx8IGZ4LmVuZFszXSAhPT0gMSkge1xuXHRcdC8vIE9ubHkgdXNlIFJHQkEgaWYgUkdCQSBjb2xvcnMgYXJlIGdpdmVuXG5cdFx0Zngubm93ID0gJ3JnYmEoJyArIGZ4Lm5vdy5qb2luKCcsJykgKyAnKSc7XG5cdH0gZWxzZSB7XG5cdFx0Ly8gT3RoZXJ3aXNlLCBhbmltYXRlIGFzIHNvbGlkIGNvbG9yc1xuXHRcdGZ4Lm5vdy5zbGljZSgwLCAzKTtcblx0XHRmeC5ub3cgPSAncmdiKCcgKyBmeC5ub3cuam9pbignLCcpICsgJyknO1xuXHR9XG5cdC8vIEFuaW1hdGUgY29sb3JzIGZvciBib3RoIGNhbnZhcyBsYXllcnMgYW5kIERPTSBlbGVtZW50c1xuXHRpZiAoZnguZWxlbS5ub2RlTmFtZSkge1xuXHRcdGZ4LmVsZW0uc3R5bGVbZngucHJvcF0gPSBmeC5ub3c7XG5cdH0gZWxzZSB7XG5cdFx0ZnguZWxlbVtmeC5wcm9wXSA9IGZ4Lm5vdztcblx0fVxufVxuXG4vLyBBbmltYXRlIGpDYW52YXMgbGF5ZXJcbiQuZm4uYW5pbWF0ZUxheWVyID0gZnVuY3Rpb24gYW5pbWF0ZUxheWVyKCkge1xuXHR2YXIgJGNhbnZhc2VzID0gdGhpcywgJGNhbnZhcywgZSwgY3R4LFxuXHRcdGFyZ3MgPSBhcnJheVNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSxcblx0XHRkYXRhLCBsYXllciwgcHJvcHM7XG5cblx0Ly8gRGVhbCB3aXRoIGFsbCBjYXNlcyBvZiBhcmd1bWVudCBwbGFjZW1lbnRcblx0Lypcblx0XHQwLiBsYXllciBuYW1lL2luZGV4XG5cdFx0MS4gcHJvcGVydGllc1xuXHRcdDIuIGR1cmF0aW9uL29wdGlvbnNcblx0XHQzLiBlYXNpbmdcblx0XHQ0LiBjb21wbGV0ZSBmdW5jdGlvblxuXHRcdDUuIHN0ZXAgZnVuY3Rpb25cblx0Ki9cblxuXHRpZiAodHlwZU9mKGFyZ3NbMl0pID09PSAnb2JqZWN0Jykge1xuXG5cdFx0Ly8gQWNjZXB0IGFuIG9wdGlvbnMgb2JqZWN0IGZvciBhbmltYXRpb25cblx0XHRhcmdzLnNwbGljZSgyLCAwLCBhcmdzWzJdLmR1cmF0aW9uIHx8IG51bGwpO1xuXHRcdGFyZ3Muc3BsaWNlKDMsIDAsIGFyZ3NbM10uZWFzaW5nIHx8IG51bGwpO1xuXHRcdGFyZ3Muc3BsaWNlKDQsIDAsIGFyZ3NbNF0uY29tcGxldGUgfHwgbnVsbCk7XG5cdFx0YXJncy5zcGxpY2UoNSwgMCwgYXJnc1s1XS5zdGVwIHx8IG51bGwpO1xuXG5cdH0gZWxzZSB7XG5cblx0XHRpZiAoYXJnc1syXSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHQvLyBJZiBvYmplY3QgaXMgdGhlIGxhc3QgYXJndW1lbnRcblx0XHRcdGFyZ3Muc3BsaWNlKDIsIDAsIG51bGwpO1xuXHRcdFx0YXJncy5zcGxpY2UoMywgMCwgbnVsbCk7XG5cdFx0XHRhcmdzLnNwbGljZSg0LCAwLCBudWxsKTtcblx0XHR9IGVsc2UgaWYgKGlzRnVuY3Rpb24oYXJnc1syXSkpIHtcblx0XHRcdC8vIElmIGNhbGxiYWNrIGNvbWVzIGFmdGVyIG9iamVjdFxuXHRcdFx0YXJncy5zcGxpY2UoMiwgMCwgbnVsbCk7XG5cdFx0XHRhcmdzLnNwbGljZSgzLCAwLCBudWxsKTtcblx0XHR9XG5cdFx0aWYgKGFyZ3NbM10gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Ly8gSWYgZHVyYXRpb24gaXMgdGhlIGxhc3QgYXJndW1lbnRcblx0XHRcdGFyZ3NbM10gPSBudWxsO1xuXHRcdFx0YXJncy5zcGxpY2UoNCwgMCwgbnVsbCk7XG5cdFx0fSBlbHNlIGlmIChpc0Z1bmN0aW9uKGFyZ3NbM10pKSB7XG5cdFx0XHQvLyBJZiBjYWxsYmFjayBjb21lcyBhZnRlciBkdXJhdGlvblxuXHRcdFx0YXJncy5zcGxpY2UoMywgMCwgbnVsbCk7XG5cdFx0fVxuXG5cdH1cblxuXHQvLyBSdW4gY2FsbGJhY2sgZnVuY3Rpb24gd2hlbiBhbmltYXRpb24gY29tcGxldGVzXG5cdGZ1bmN0aW9uIGNvbXBsZXRlKCRjYW52YXMsIGRhdGEsIGxheWVyKSB7XG5cblx0XHRyZXR1cm4gZnVuY3Rpb24gKCkge1xuXG5cdFx0XHRfc2hvd1Byb3BzKGxheWVyKTtcblx0XHRcdF9yZW1vdmVTdWJQcm9wQWxpYXNlcyhsYXllcik7XG5cblx0XHRcdC8vIFByZXZlbnQgbXVsdGlwbGUgcmVkcmF3IGxvb3BzXG5cdFx0XHRpZiAoIWRhdGEuYW5pbWF0aW5nIHx8IGRhdGEuYW5pbWF0ZWQgPT09IGxheWVyKSB7XG5cdFx0XHRcdC8vIFJlZHJhdyBsYXllcnMgb24gbGFzdCBmcmFtZVxuXHRcdFx0XHQkY2FudmFzLmRyYXdMYXllcnMoKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gU2lnbmlmeSB0aGUgZW5kIG9mIGFuIGFuaW1hdGlvbiBsb29wXG5cdFx0XHRsYXllci5fYW5pbWF0aW5nID0gZmFsc2U7XG5cdFx0XHRkYXRhLmFuaW1hdGluZyA9IGZhbHNlO1xuXHRcdFx0ZGF0YS5hbmltYXRlZCA9IG51bGw7XG5cblx0XHRcdC8vIElmIGNhbGxiYWNrIGlzIGRlZmluZWRcblx0XHRcdGlmIChhcmdzWzRdKSB7XG5cdFx0XHRcdC8vIFJ1biBjYWxsYmFjayBhdCB0aGUgZW5kIG9mIHRoZSBhbmltYXRpb25cblx0XHRcdFx0YXJnc1s0XS5jYWxsKCRjYW52YXNbMF0sIGxheWVyKTtcblx0XHRcdH1cblxuXHRcdFx0X3RyaWdnZXJMYXllckV2ZW50KCRjYW52YXMsIGRhdGEsIGxheWVyLCAnYW5pbWF0ZWVuZCcpO1xuXG5cdFx0fTtcblxuXHR9XG5cblx0Ly8gUmVkcmF3IGxheWVycyBvbiBldmVyeSBmcmFtZSBvZiB0aGUgYW5pbWF0aW9uXG5cdGZ1bmN0aW9uIHN0ZXAoJGNhbnZhcywgZGF0YSwgbGF5ZXIpIHtcblxuXHRcdHJldHVybiBmdW5jdGlvbiAobm93LCBmeCkge1xuXHRcdFx0dmFyIHBhcnRzLCBwcm9wTmFtZSwgc3ViUHJvcE5hbWUsXG5cdFx0XHRcdGhpZGRlbiA9IGZhbHNlO1xuXG5cdFx0XHQvLyBJZiBhbmltYXRlZCBwcm9wZXJ0eSBoYXMgYmVlbiBoaWRkZW5cblx0XHRcdGlmIChmeC5wcm9wWzBdID09PSAnXycpIHtcblx0XHRcdFx0aGlkZGVuID0gdHJ1ZTtcblx0XHRcdFx0Ly8gVW5oaWRlIHByb3BlcnR5IHRlbXBvcmFyaWx5XG5cdFx0XHRcdGZ4LnByb3AgPSBmeC5wcm9wLnJlcGxhY2UoJ18nLCAnJyk7XG5cdFx0XHRcdGxheWVyW2Z4LnByb3BdID0gbGF5ZXJbJ18nICsgZngucHJvcF07XG5cdFx0XHR9XG5cblx0XHRcdC8vIElmIGFuaW1hdGluZyBwcm9wZXJ0eSBvZiBzdWItb2JqZWN0XG5cdFx0XHRpZiAoZngucHJvcC5pbmRleE9mKCcuJykgIT09IC0xKSB7XG5cdFx0XHRcdHBhcnRzID0gZngucHJvcC5zcGxpdCgnLicpO1xuXHRcdFx0XHRwcm9wTmFtZSA9IHBhcnRzWzBdO1xuXHRcdFx0XHRzdWJQcm9wTmFtZSA9IHBhcnRzWzFdO1xuXHRcdFx0XHRpZiAobGF5ZXJbcHJvcE5hbWVdKSB7XG5cdFx0XHRcdFx0bGF5ZXJbcHJvcE5hbWVdW3N1YlByb3BOYW1lXSA9IGZ4Lm5vdztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBUaHJvdHRsZSBhbmltYXRpb24gdG8gaW1wcm92ZSBlZmZpY2llbmN5XG5cdFx0XHRpZiAobGF5ZXIuX3BvcyAhPT0gZngucG9zKSB7XG5cblx0XHRcdFx0bGF5ZXIuX3BvcyA9IGZ4LnBvcztcblxuXHRcdFx0XHQvLyBTaWduaWZ5IHRoZSBzdGFydCBvZiBhbiBhbmltYXRpb24gbG9vcFxuXHRcdFx0XHRpZiAoIWxheWVyLl9hbmltYXRpbmcgJiYgIWRhdGEuYW5pbWF0aW5nKSB7XG5cdFx0XHRcdFx0bGF5ZXIuX2FuaW1hdGluZyA9IHRydWU7XG5cdFx0XHRcdFx0ZGF0YS5hbmltYXRpbmcgPSB0cnVlO1xuXHRcdFx0XHRcdGRhdGEuYW5pbWF0ZWQgPSBsYXllcjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFByZXZlbnQgbXVsdGlwbGUgcmVkcmF3IGxvb3BzXG5cdFx0XHRcdGlmICghZGF0YS5hbmltYXRpbmcgfHwgZGF0YS5hbmltYXRlZCA9PT0gbGF5ZXIpIHtcblx0XHRcdFx0XHQvLyBSZWRyYXcgbGF5ZXJzIGZvciBldmVyeSBmcmFtZVxuXHRcdFx0XHRcdCRjYW52YXMuZHJhd0xheWVycygpO1xuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdFx0Ly8gSWYgY2FsbGJhY2sgaXMgZGVmaW5lZFxuXHRcdFx0aWYgKGFyZ3NbNV0pIHtcblx0XHRcdFx0Ly8gUnVuIGNhbGxiYWNrIGZvciBlYWNoIHN0ZXAgb2YgYW5pbWF0aW9uXG5cdFx0XHRcdGFyZ3NbNV0uY2FsbCgkY2FudmFzWzBdLCBub3csIGZ4LCBsYXllcik7XG5cdFx0XHR9XG5cblx0XHRcdF90cmlnZ2VyTGF5ZXJFdmVudCgkY2FudmFzLCBkYXRhLCBsYXllciwgJ2FuaW1hdGUnLCBmeCk7XG5cblx0XHRcdC8vIElmIHByb3BlcnR5IHNob3VsZCBiZSBoaWRkZW4gZHVyaW5nIGFuaW1hdGlvblxuXHRcdFx0aWYgKGhpZGRlbikge1xuXHRcdFx0XHQvLyBIaWRlIHByb3BlcnR5IGFnYWluXG5cdFx0XHRcdGZ4LnByb3AgPSAnXycgKyBmeC5wcm9wO1xuXHRcdFx0fVxuXG5cdFx0fTtcblxuXHR9XG5cblx0Zm9yIChlID0gMDsgZSA8ICRjYW52YXNlcy5sZW5ndGg7IGUgKz0gMSkge1xuXHRcdCRjYW52YXMgPSAkKCRjYW52YXNlc1tlXSk7XG5cdFx0Y3R4ID0gX2dldENvbnRleHQoJGNhbnZhc2VzW2VdKTtcblx0XHRpZiAoY3R4KSB7XG5cblx0XHRcdGRhdGEgPSBfZ2V0Q2FudmFzRGF0YSgkY2FudmFzZXNbZV0pO1xuXG5cdFx0XHQvLyBJZiBhIGxheWVyIG9iamVjdCB3YXMgcGFzc2VkLCB1c2UgaXQgdGhlIGxheWVyIHRvIGJlIGFuaW1hdGVkXG5cdFx0XHRsYXllciA9ICRjYW52YXMuZ2V0TGF5ZXIoYXJnc1swXSk7XG5cblx0XHRcdC8vIElnbm9yZSBsYXllcnMgdGhhdCBhcmUgZnVuY3Rpb25zXG5cdFx0XHRpZiAobGF5ZXIgJiYgbGF5ZXIuX21ldGhvZCAhPT0gJC5mbi5kcmF3KSB7XG5cblx0XHRcdFx0Ly8gRG8gbm90IG1vZGlmeSBvcmlnaW5hbCBvYmplY3Rcblx0XHRcdFx0cHJvcHMgPSBleHRlbmRPYmplY3Qoe30sIGFyZ3NbMV0pO1xuXG5cdFx0XHRcdHByb3BzID0gX3BhcnNlRW5kVmFsdWVzKCRjYW52YXNlc1tlXSwgbGF5ZXIsIHByb3BzKTtcblxuXHRcdFx0XHQvLyBCeXBhc3MgalF1ZXJ5IENTUyBIb29rcyBmb3IgQ1NTIHByb3BlcnRpZXMgKHdpZHRoLCBvcGFjaXR5LCBldGMuKVxuXHRcdFx0XHRfaGlkZVByb3BzKHByb3BzLCB0cnVlKTtcblx0XHRcdFx0X2hpZGVQcm9wcyhsYXllcik7XG5cblx0XHRcdFx0Ly8gRml4IGZvciBqUXVlcnkncyB2ZW5kb3IgcHJlZml4aW5nIHN1cHBvcnQsIHdoaWNoIGFmZmVjdHMgaG93IHdpZHRoL2hlaWdodC9vcGFjaXR5IGFyZSBhbmltYXRlZFxuXHRcdFx0XHRsYXllci5zdHlsZSA9IGNzcy5wcm9wc09iajtcblxuXHRcdFx0XHQvLyBBbmltYXRlIGxheWVyXG5cdFx0XHRcdCQobGF5ZXIpLmFuaW1hdGUocHJvcHMsIHtcblx0XHRcdFx0XHRkdXJhdGlvbjogYXJnc1syXSxcblx0XHRcdFx0XHRlYXNpbmc6ICgkLmVhc2luZ1thcmdzWzNdXSA/IGFyZ3NbM10gOiBudWxsKSxcblx0XHRcdFx0XHQvLyBXaGVuIGFuaW1hdGlvbiBjb21wbGV0ZXNcblx0XHRcdFx0XHRjb21wbGV0ZTogY29tcGxldGUoJGNhbnZhcywgZGF0YSwgbGF5ZXIpLFxuXHRcdFx0XHRcdC8vIFJlZHJhdyBjYW52YXMgZm9yIGV2ZXJ5IGFuaW1hdGlvbiBmcmFtZVxuXHRcdFx0XHRcdHN0ZXA6IHN0ZXAoJGNhbnZhcywgZGF0YSwgbGF5ZXIpXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRfdHJpZ2dlckxheWVyRXZlbnQoJGNhbnZhcywgZGF0YSwgbGF5ZXIsICdhbmltYXRlc3RhcnQnKTtcblx0XHRcdH1cblxuXHRcdH1cblx0fVxuXHRyZXR1cm4gJGNhbnZhc2VzO1xufTtcblxuLy8gQW5pbWF0ZSBhbGwgbGF5ZXJzIGluIGEgbGF5ZXIgZ3JvdXBcbiQuZm4uYW5pbWF0ZUxheWVyR3JvdXAgPSBmdW5jdGlvbiBhbmltYXRlTGF5ZXJHcm91cChncm91cElkKSB7XG5cdHZhciAkY2FudmFzZXMgPSB0aGlzLCAkY2FudmFzLCBlLFxuXHRcdGFyZ3MgPSBhcnJheVNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSxcblx0XHRncm91cCwgbDtcblx0Zm9yIChlID0gMDsgZSA8ICRjYW52YXNlcy5sZW5ndGg7IGUgKz0gMSkge1xuXHRcdCRjYW52YXMgPSAkKCRjYW52YXNlc1tlXSk7XG5cdFx0Z3JvdXAgPSAkY2FudmFzLmdldExheWVyR3JvdXAoZ3JvdXBJZCk7XG5cdFx0aWYgKGdyb3VwKSB7XG5cblx0XHRcdC8vIEFuaW1hdGUgYWxsIGxheWVycyBpbiB0aGUgZ3JvdXBcblx0XHRcdGZvciAobCA9IDA7IGwgPCBncm91cC5sZW5ndGg7IGwgKz0gMSkge1xuXG5cdFx0XHRcdC8vIFJlcGxhY2UgZmlyc3QgYXJndW1lbnQgd2l0aCBsYXllclxuXHRcdFx0XHRhcmdzWzBdID0gZ3JvdXBbbF07XG5cdFx0XHRcdCRjYW52YXMuYW5pbWF0ZUxheWVyLmFwcGx5KCRjYW52YXMsIGFyZ3MpO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cdH1cblx0cmV0dXJuICRjYW52YXNlcztcbn07XG5cbi8vIERlbGF5IGxheWVyIGFuaW1hdGlvbiBieSBhIGdpdmVuIG51bWJlciBvZiBtaWxsaXNlY29uZHNcbiQuZm4uZGVsYXlMYXllciA9IGZ1bmN0aW9uIGRlbGF5TGF5ZXIobGF5ZXJJZCwgZHVyYXRpb24pIHtcblx0dmFyICRjYW52YXNlcyA9IHRoaXMsICRjYW52YXMsIGUsXG5cdFx0ZGF0YSwgbGF5ZXI7XG5cdGR1cmF0aW9uID0gZHVyYXRpb24gfHwgMDtcblxuXHRmb3IgKGUgPSAwOyBlIDwgJGNhbnZhc2VzLmxlbmd0aDsgZSArPSAxKSB7XG5cdFx0JGNhbnZhcyA9ICQoJGNhbnZhc2VzW2VdKTtcblx0XHRkYXRhID0gX2dldENhbnZhc0RhdGEoJGNhbnZhc2VzW2VdKTtcblx0XHRsYXllciA9ICRjYW52YXMuZ2V0TGF5ZXIobGF5ZXJJZCk7XG5cdFx0Ly8gSWYgbGF5ZXIgZXhpc3RzXG5cdFx0aWYgKGxheWVyKSB7XG5cdFx0XHQvLyBEZWxheSBhbmltYXRpb25cblx0XHRcdCQobGF5ZXIpLmRlbGF5KGR1cmF0aW9uKTtcblx0XHRcdF90cmlnZ2VyTGF5ZXJFdmVudCgkY2FudmFzLCBkYXRhLCBsYXllciwgJ2RlbGF5Jyk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiAkY2FudmFzZXM7XG59O1xuXG4vLyBEZWxheSBhbmltYXRpb24gYWxsIGxheWVycyBpbiBhIGxheWVyIGdyb3VwXG4kLmZuLmRlbGF5TGF5ZXJHcm91cCA9IGZ1bmN0aW9uIGRlbGF5TGF5ZXJHcm91cChncm91cElkLCBkdXJhdGlvbikge1xuXHR2YXIgJGNhbnZhc2VzID0gdGhpcywgJGNhbnZhcywgZSxcblx0XHRncm91cCwgbGF5ZXIsIGw7XG5cdGR1cmF0aW9uID0gZHVyYXRpb24gfHwgMDtcblxuXHRmb3IgKGUgPSAwOyBlIDwgJGNhbnZhc2VzLmxlbmd0aDsgZSArPSAxKSB7XG5cdFx0JGNhbnZhcyA9ICQoJGNhbnZhc2VzW2VdKTtcblxuXHRcdGdyb3VwID0gJGNhbnZhcy5nZXRMYXllckdyb3VwKGdyb3VwSWQpO1xuXHRcdC8vIERlbGF5IGFsbCBsYXllcnMgaW4gdGhlIGdyb3VwXG5cdFx0aWYgKGdyb3VwKSB7XG5cblx0XHRcdGZvciAobCA9IDA7IGwgPCBncm91cC5sZW5ndGg7IGwgKz0gMSkge1xuXHRcdFx0XHQvLyBEZWxheSBlYWNoIGxheWVyIGluIHRoZSBncm91cFxuXHRcdFx0XHRsYXllciA9IGdyb3VwW2xdO1xuXHRcdFx0XHQkY2FudmFzLmRlbGF5TGF5ZXIobGF5ZXIsIGR1cmF0aW9uKTtcblx0XHRcdH1cblxuXHRcdH1cblx0fVxuXHRyZXR1cm4gJGNhbnZhc2VzO1xufTtcblxuLy8gU3RvcCBsYXllciBhbmltYXRpb25cbiQuZm4uc3RvcExheWVyID0gZnVuY3Rpb24gc3RvcExheWVyKGxheWVySWQsIGNsZWFyUXVldWUpIHtcblx0dmFyICRjYW52YXNlcyA9IHRoaXMsICRjYW52YXMsIGUsXG5cdFx0ZGF0YSwgbGF5ZXI7XG5cblx0Zm9yIChlID0gMDsgZSA8ICRjYW52YXNlcy5sZW5ndGg7IGUgKz0gMSkge1xuXHRcdCRjYW52YXMgPSAkKCRjYW52YXNlc1tlXSk7XG5cdFx0ZGF0YSA9IF9nZXRDYW52YXNEYXRhKCRjYW52YXNlc1tlXSk7XG5cdFx0bGF5ZXIgPSAkY2FudmFzLmdldExheWVyKGxheWVySWQpO1xuXHRcdC8vIElmIGxheWVyIGV4aXN0c1xuXHRcdGlmIChsYXllcikge1xuXHRcdFx0Ly8gU3RvcCBhbmltYXRpb25cblx0XHRcdCQobGF5ZXIpLnN0b3AoY2xlYXJRdWV1ZSk7XG5cdFx0XHRfdHJpZ2dlckxheWVyRXZlbnQoJGNhbnZhcywgZGF0YSwgbGF5ZXIsICdzdG9wJyk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiAkY2FudmFzZXM7XG59O1xuXG4vLyBTdG9wIGFuaW1hdGlvbiBvZiBhbGwgbGF5ZXJzIGluIGEgbGF5ZXIgZ3JvdXBcbiQuZm4uc3RvcExheWVyR3JvdXAgPSBmdW5jdGlvbiBzdG9wTGF5ZXJHcm91cChncm91cElkLCBjbGVhclF1ZXVlKSB7XG5cdHZhciAkY2FudmFzZXMgPSB0aGlzLCAkY2FudmFzLCBlLFxuXHRcdGdyb3VwLCBsYXllciwgbDtcblxuXHRmb3IgKGUgPSAwOyBlIDwgJGNhbnZhc2VzLmxlbmd0aDsgZSArPSAxKSB7XG5cdFx0JGNhbnZhcyA9ICQoJGNhbnZhc2VzW2VdKTtcblxuXHRcdGdyb3VwID0gJGNhbnZhcy5nZXRMYXllckdyb3VwKGdyb3VwSWQpO1xuXHRcdC8vIFN0b3AgYWxsIGxheWVycyBpbiB0aGUgZ3JvdXBcblx0XHRpZiAoZ3JvdXApIHtcblxuXHRcdFx0Zm9yIChsID0gMDsgbCA8IGdyb3VwLmxlbmd0aDsgbCArPSAxKSB7XG5cdFx0XHRcdC8vIFN0b3AgZWFjaCBsYXllciBpbiB0aGUgZ3JvdXBcblx0XHRcdFx0bGF5ZXIgPSBncm91cFtsXTtcblx0XHRcdFx0JGNhbnZhcy5zdG9wTGF5ZXIobGF5ZXIsIGNsZWFyUXVldWUpO1xuXHRcdFx0fVxuXG5cdFx0fVxuXHR9XG5cdHJldHVybiAkY2FudmFzZXM7XG59O1xuXG4vLyBFbmFibGUgYW5pbWF0aW9uIGZvciBjb2xvciBwcm9wZXJ0aWVzXG5mdW5jdGlvbiBfc3VwcG9ydENvbG9yUHJvcHMocHJvcHMpIHtcblx0dmFyIHA7XG5cdGZvciAocCA9IDA7IHAgPCBwcm9wcy5sZW5ndGg7IHAgKz0gMSkge1xuXHRcdCQuZnguc3RlcFtwcm9wc1twXV0gPSBfYW5pbWF0ZUNvbG9yO1xuXHR9XG59XG5cbi8vIEVuYWJsZSBhbmltYXRpb24gZm9yIGNvbG9yIHByb3BlcnRpZXNcbl9zdXBwb3J0Q29sb3JQcm9wcyhbXG5cdCdjb2xvcicsXG5cdCdiYWNrZ3JvdW5kQ29sb3InLFxuXHQnYm9yZGVyQ29sb3InLFxuXHQnYm9yZGVyVG9wQ29sb3InLFxuXHQnYm9yZGVyUmlnaHRDb2xvcicsXG5cdCdib3JkZXJCb3R0b21Db2xvcicsXG5cdCdib3JkZXJMZWZ0Q29sb3InLFxuXHQnZmlsbFN0eWxlJyxcblx0J291dGxpbmVDb2xvcicsXG5cdCdzdHJva2VTdHlsZScsXG5cdCdzaGFkb3dDb2xvcidcbl0pO1xuXG4vKiBFdmVudCBBUEkgKi9cblxuLy8gTWFwIHN0YW5kYXJkIG1vdXNlIGV2ZW50cyB0byB0b3VjaCBldmVudHNcbm1hcHMudG91Y2hFdmVudHMgPSB7XG5cdCdtb3VzZWRvd24nOiAndG91Y2hzdGFydCcsXG5cdCdtb3VzZXVwJzogJ3RvdWNoZW5kJyxcblx0J21vdXNlbW92ZSc6ICd0b3VjaG1vdmUnXG59O1xuLy8gTWFwIHN0YW5kYXJkIHRvdWNoIGV2ZW50cyB0byBtb3VzZSBldmVudHNcbm1hcHMubW91c2VFdmVudHMgPSB7XG5cdCd0b3VjaHN0YXJ0JzogJ21vdXNlZG93bicsXG5cdCd0b3VjaGVuZCc6ICdtb3VzZXVwJyxcblx0J3RvdWNobW92ZSc6ICdtb3VzZW1vdmUnXG59O1xuXG4vLyBDb252ZXJ0IG1vdXNlIGV2ZW50IG5hbWUgdG8gYSBjb3JyZXNwb25kaW5nIHRvdWNoIGV2ZW50IG5hbWUgKGlmIHBvc3NpYmxlKVxuZnVuY3Rpb24gX2dldFRvdWNoRXZlbnROYW1lKGV2ZW50TmFtZSkge1xuXHQvLyBEZXRlY3QgdG91Y2ggZXZlbnQgc3VwcG9ydFxuXHRpZiAobWFwcy50b3VjaEV2ZW50c1tldmVudE5hbWVdKSB7XG5cdFx0ZXZlbnROYW1lID0gbWFwcy50b3VjaEV2ZW50c1tldmVudE5hbWVdO1xuXHR9XG5cdHJldHVybiBldmVudE5hbWU7XG59XG4vLyBDb252ZXJ0IHRvdWNoIGV2ZW50IG5hbWUgdG8gYSBjb3JyZXNwb25kaW5nIG1vdXNlIGV2ZW50IG5hbWVcbmZ1bmN0aW9uIF9nZXRNb3VzZUV2ZW50TmFtZShldmVudE5hbWUpIHtcblx0aWYgKG1hcHMubW91c2VFdmVudHNbZXZlbnROYW1lXSkge1xuXHRcdGV2ZW50TmFtZSA9IG1hcHMubW91c2VFdmVudHNbZXZlbnROYW1lXTtcblx0fVxuXHRyZXR1cm4gZXZlbnROYW1lO1xufVxuXG4vLyBCaW5kIGV2ZW50IHRvIGpDYW52YXMgbGF5ZXIgdXNpbmcgc3RhbmRhcmQgalF1ZXJ5IGV2ZW50c1xuZnVuY3Rpb24gX2NyZWF0ZUV2ZW50KGV2ZW50TmFtZSkge1xuXG5cdGpDYW52YXMuZXZlbnRzW2V2ZW50TmFtZV0gPSBmdW5jdGlvbiAoJGNhbnZhcywgZGF0YSkge1xuXHRcdHZhciBoZWxwZXJFdmVudE5hbWUsIHRvdWNoRXZlbnROYW1lLCBldmVudENhY2hlO1xuXG5cdFx0Ly8gUmV0cmlldmUgY2FudmFzJ3MgZXZlbnQgY2FjaGVcblx0XHRldmVudENhY2hlID0gZGF0YS5ldmVudDtcblxuXHRcdC8vIEJvdGggbW91c2VvdmVyL21vdXNlb3V0IGV2ZW50cyB3aWxsIGJlIG1hbmFnZWQgYnkgYSBzaW5nbGUgbW91c2Vtb3ZlIGV2ZW50XG5cdFx0aGVscGVyRXZlbnROYW1lID0gKGV2ZW50TmFtZSA9PT0gJ21vdXNlb3ZlcicgfHwgZXZlbnROYW1lID09PSAnbW91c2VvdXQnKSA/ICdtb3VzZW1vdmUnIDogZXZlbnROYW1lO1xuXHRcdHRvdWNoRXZlbnROYW1lID0gX2dldFRvdWNoRXZlbnROYW1lKGhlbHBlckV2ZW50TmFtZSk7XG5cblx0XHRmdW5jdGlvbiBldmVudENhbGxiYWNrKGV2ZW50KSB7XG5cdFx0XHQvLyBDYWNoZSBjdXJyZW50IG1vdXNlIHBvc2l0aW9uIGFuZCByZWRyYXcgbGF5ZXJzXG5cdFx0XHRldmVudENhY2hlLnggPSBldmVudC5vZmZzZXRYO1xuXHRcdFx0ZXZlbnRDYWNoZS55ID0gZXZlbnQub2Zmc2V0WTtcblx0XHRcdGV2ZW50Q2FjaGUudHlwZSA9IGhlbHBlckV2ZW50TmFtZTtcblx0XHRcdGV2ZW50Q2FjaGUuZXZlbnQgPSBldmVudDtcblx0XHRcdC8vIFJlZHJhdyBsYXllcnMgb24gZXZlcnkgdHJpZ2dlciBvZiB0aGUgZXZlbnQ7IGRvbid0IHJlZHJhdyBpZiBhdFxuXHRcdFx0Ly8gbGVhc3Qgb25lIGxheWVyIGlzIGRyYWdnYWJsZSBhbmQgdGhlcmUgYXJlIG5vIGxheWVycyB3aXRoXG5cdFx0XHQvLyBleHBsaWNpdCBtb3VzZW92ZXIvbW91c2VvdXQvbW91c2Vtb3ZlIGV2ZW50c1xuXHRcdFx0aWYgKGV2ZW50LnR5cGUgIT09ICdtb3VzZW1vdmUnIHx8IGRhdGEucmVkcmF3T25Nb3VzZW1vdmUgfHwgZGF0YS5kcmFnLmRyYWdnaW5nKSB7XG5cdFx0XHRcdCRjYW52YXMuZHJhd0xheWVycyh7XG5cdFx0XHRcdFx0cmVzZXRGaXJlOiB0cnVlXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0Ly8gUHJldmVudCBkZWZhdWx0IGV2ZW50IGJlaGF2aW9yXG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdH1cblxuXHRcdC8vIEVuc3VyZSB0aGUgZXZlbnQgaXMgbm90IGJvdW5kIG1vcmUgdGhhbiBvbmNlXG5cdFx0aWYgKCFkYXRhLmV2ZW50c1toZWxwZXJFdmVudE5hbWVdKSB7XG5cdFx0XHQvLyBCaW5kIG9uZSBjYW52YXMgZXZlbnQgd2hpY2ggaGFuZGxlcyBhbGwgbGF5ZXIgZXZlbnRzIG9mIHRoYXQgdHlwZVxuXHRcdFx0aWYgKHRvdWNoRXZlbnROYW1lICE9PSBoZWxwZXJFdmVudE5hbWUpIHtcblx0XHRcdFx0JGNhbnZhcy5iaW5kKGhlbHBlckV2ZW50TmFtZSArICcuakNhbnZhcyAnICsgdG91Y2hFdmVudE5hbWUgKyAnLmpDYW52YXMnLCBldmVudENhbGxiYWNrKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCRjYW52YXMuYmluZChoZWxwZXJFdmVudE5hbWUgKyAnLmpDYW52YXMnLCBldmVudENhbGxiYWNrKTtcblx0XHRcdH1cblx0XHRcdC8vIFByZXZlbnQgdGhpcyBldmVudCBmcm9tIGJlaW5nIGJvdW5kIHR3aWNlXG5cdFx0XHRkYXRhLmV2ZW50c1toZWxwZXJFdmVudE5hbWVdID0gdHJ1ZTtcblx0XHR9XG5cdH07XG59XG5mdW5jdGlvbiBfY3JlYXRlRXZlbnRzKGV2ZW50TmFtZXMpIHtcblx0dmFyIG47XG5cdGZvciAobiA9IDA7IG4gPCBldmVudE5hbWVzLmxlbmd0aDsgbiArPSAxKSB7XG5cdFx0X2NyZWF0ZUV2ZW50KGV2ZW50TmFtZXNbbl0pO1xuXHR9XG59XG4vLyBQb3B1bGF0ZSBqQ2FudmFzIGV2ZW50cyBvYmplY3Qgd2l0aCBzb21lIHN0YW5kYXJkIGV2ZW50c1xuX2NyZWF0ZUV2ZW50cyhbXG5cdCdjbGljaycsXG5cdCdkYmxjbGljaycsXG5cdCdtb3VzZWRvd24nLFxuXHQnbW91c2V1cCcsXG5cdCdtb3VzZW1vdmUnLFxuXHQnbW91c2VvdmVyJyxcblx0J21vdXNlb3V0Jyxcblx0J3RvdWNoc3RhcnQnLFxuXHQndG91Y2htb3ZlJyxcblx0J3RvdWNoZW5kJyxcblx0J3BvaW50ZXJkb3duJyxcblx0J3BvaW50ZXJtb3ZlJyxcblx0J3BvaW50ZXJ1cCcsXG5cdCdjb250ZXh0bWVudSdcbl0pO1xuXG4vLyBDaGVjayBpZiBldmVudCBmaXJlcyB3aGVuIGEgZHJhd2luZyBpcyBkcmF3blxuZnVuY3Rpb24gX2RldGVjdEV2ZW50cyhjYW52YXMsIGN0eCwgcGFyYW1zKSB7XG5cdHZhciBsYXllciwgZGF0YSwgZXZlbnRDYWNoZSwgaW50ZXJzZWN0cyxcblx0XHR0cmFuc2Zvcm1zLCB4LCB5LCBhbmdsZTtcblxuXHQvLyBVc2UgdGhlIGxheWVyIG9iamVjdCBzdG9yZWQgYnkgdGhlIGdpdmVuIHBhcmFtZXRlcnMgb2JqZWN0XG5cdGxheWVyID0gcGFyYW1zLl9hcmdzO1xuXHQvLyBDYW52YXMgbXVzdCBoYXZlIGV2ZW50IGJpbmRpbmdzXG5cdGlmIChsYXllcikge1xuXG5cdFx0ZGF0YSA9IF9nZXRDYW52YXNEYXRhKGNhbnZhcyk7XG5cdFx0ZXZlbnRDYWNoZSA9IGRhdGEuZXZlbnQ7XG5cdFx0aWYgKGV2ZW50Q2FjaGUueCAhPT0gbnVsbCAmJiBldmVudENhY2hlLnkgIT09IG51bGwpIHtcblx0XHRcdC8vIFJlc3BlY3QgdXNlci1kZWZpbmVkIHBpeGVsIHJhdGlvXG5cdFx0XHR4ID0gZXZlbnRDYWNoZS54ICogZGF0YS5waXhlbFJhdGlvO1xuXHRcdFx0eSA9IGV2ZW50Q2FjaGUueSAqIGRhdGEucGl4ZWxSYXRpbztcblx0XHRcdC8vIERldGVybWluZSBpZiB0aGUgZ2l2ZW4gY29vcmRpbmF0ZXMgYXJlIGluIHRoZSBjdXJyZW50IHBhdGhcblx0XHRcdGludGVyc2VjdHMgPSBjdHguaXNQb2ludEluUGF0aCh4LCB5KSB8fCAoY3R4LmlzUG9pbnRJblN0cm9rZSAmJiBjdHguaXNQb2ludEluU3Ryb2tlKHgsIHkpKTtcblx0XHR9XG5cdFx0dHJhbnNmb3JtcyA9IGRhdGEudHJhbnNmb3JtcztcblxuXHRcdC8vIEFsbG93IGNhbGxiYWNrIGZ1bmN0aW9ucyB0byByZXRyaWV2ZSB0aGUgbW91c2UgY29vcmRpbmF0ZXNcblx0XHRsYXllci5ldmVudFggPSBldmVudENhY2hlLng7XG5cdFx0bGF5ZXIuZXZlbnRZID0gZXZlbnRDYWNoZS55O1xuXHRcdGxheWVyLmV2ZW50ID0gZXZlbnRDYWNoZS5ldmVudDtcblxuXHRcdC8vIEFkanVzdCBjb29yZGluYXRlcyB0byBtYXRjaCBjdXJyZW50IGNhbnZhcyB0cmFuc2Zvcm1hdGlvblxuXG5cdFx0Ly8gS2VlcCB0cmFjayBvZiBzb21lIHRyYW5zZm9ybWF0aW9uIHZhbHVlc1xuXHRcdGFuZ2xlID0gZGF0YS50cmFuc2Zvcm1zLnJvdGF0ZTtcblx0XHR4ID0gbGF5ZXIuZXZlbnRYO1xuXHRcdHkgPSBsYXllci5ldmVudFk7XG5cblx0XHRpZiAoYW5nbGUgIT09IDApIHtcblx0XHRcdC8vIFJvdGF0ZSBjb29yZGluYXRlcyBpZiBjb29yZGluYXRlIHNwYWNlIGhhcyBiZWVuIHJvdGF0ZWRcblx0XHRcdGxheWVyLl9ldmVudFggPSAoeCAqIGNvcygtYW5nbGUpKSAtICh5ICogc2luKC1hbmdsZSkpO1xuXHRcdFx0bGF5ZXIuX2V2ZW50WSA9ICh5ICogY29zKC1hbmdsZSkpICsgKHggKiBzaW4oLWFuZ2xlKSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIE90aGVyd2lzZSwgbm8gY2FsY3VsYXRpb25zIG5lZWQgdG8gYmUgbWFkZVxuXHRcdFx0bGF5ZXIuX2V2ZW50WCA9IHg7XG5cdFx0XHRsYXllci5fZXZlbnRZID0geTtcblx0XHR9XG5cblx0XHQvLyBTY2FsZSBjb29yZGluYXRlc1xuXHRcdGxheWVyLl9ldmVudFggLz0gdHJhbnNmb3Jtcy5zY2FsZVg7XG5cdFx0bGF5ZXIuX2V2ZW50WSAvPSB0cmFuc2Zvcm1zLnNjYWxlWTtcblxuXHRcdC8vIElmIGxheWVyIGludGVyc2VjdHMgd2l0aCBjdXJzb3Jcblx0XHRpZiAoaW50ZXJzZWN0cykge1xuXHRcdFx0Ly8gQWRkIGl0IHRvIGEgbGlzdCBvZiBsYXllcnMgdGhhdCBpbnRlcnNlY3Qgd2l0aCBjdXJzb3Jcblx0XHRcdGRhdGEuaW50ZXJzZWN0aW5nLnB1c2gobGF5ZXIpO1xuXHRcdH1cblx0XHRsYXllci5pbnRlcnNlY3RzID0gQm9vbGVhbihpbnRlcnNlY3RzKTtcblx0fVxufVxuXG4vLyBOb3JtYWxpemUgb2Zmc2V0WCBhbmQgb2Zmc2V0WSBmb3IgYWxsIGJyb3dzZXJzXG4kLmV2ZW50LmZpeCA9IGZ1bmN0aW9uIChldmVudCkge1xuXHR2YXIgb2Zmc2V0LCBvcmlnaW5hbEV2ZW50LCB0b3VjaGVzO1xuXG5cdGV2ZW50ID0galF1ZXJ5RXZlbnRGaXguY2FsbCgkLmV2ZW50LCBldmVudCk7XG5cdG9yaWdpbmFsRXZlbnQgPSBldmVudC5vcmlnaW5hbEV2ZW50O1xuXG5cdC8vIG9yaWdpbmFsRXZlbnQgZG9lcyBub3QgZXhpc3QgZm9yIG1hbnVhbGx5LXRyaWdnZXJlZCBldmVudHNcblx0aWYgKG9yaWdpbmFsRXZlbnQpIHtcblxuXHRcdHRvdWNoZXMgPSBvcmlnaW5hbEV2ZW50LmNoYW5nZWRUb3VjaGVzO1xuXG5cdFx0Ly8gSWYgb2Zmc2V0WCBhbmQgb2Zmc2V0WSBhcmUgbm90IHN1cHBvcnRlZCwgZGVmaW5lIHRoZW1cblx0XHRpZiAoZXZlbnQucGFnZVggIT09IHVuZGVmaW5lZCAmJiBldmVudC5vZmZzZXRYID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdG9mZnNldCA9ICQoZXZlbnQuY3VycmVudFRhcmdldCkub2Zmc2V0KCk7XG5cdFx0XHRcdGlmIChvZmZzZXQpIHtcblx0XHRcdFx0XHRldmVudC5vZmZzZXRYID0gZXZlbnQucGFnZVggLSBvZmZzZXQubGVmdDtcblx0XHRcdFx0XHRldmVudC5vZmZzZXRZID0gZXZlbnQucGFnZVkgLSBvZmZzZXQudG9wO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHQvLyBGYWlsIHNpbGVudGx5XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICh0b3VjaGVzKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHQvLyBFbmFibGUgb2Zmc2V0WCBhbmQgb2Zmc2V0WSBmb3IgbW9iaWxlIGRldmljZXNcblx0XHRcdFx0b2Zmc2V0ID0gJChldmVudC5jdXJyZW50VGFyZ2V0KS5vZmZzZXQoKTtcblx0XHRcdFx0aWYgKG9mZnNldCkge1xuXHRcdFx0XHRcdGV2ZW50Lm9mZnNldFggPSB0b3VjaGVzWzBdLnBhZ2VYIC0gb2Zmc2V0LmxlZnQ7XG5cdFx0XHRcdFx0ZXZlbnQub2Zmc2V0WSA9IHRvdWNoZXNbMF0ucGFnZVkgLSBvZmZzZXQudG9wO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHQvLyBGYWlsIHNpbGVudGx5XG5cdFx0XHR9XG5cdFx0fVxuXG5cdH1cblx0cmV0dXJuIGV2ZW50O1xufTtcblxuLyogRHJhd2luZyBBUEkgKi9cblxuLy8gTWFwIGRyYXdpbmcgbmFtZXMgd2l0aCB0aGVpciByZXNwZWN0aXZlIG1ldGhvZCBuYW1lc1xubWFwcy5kcmF3aW5ncyA9IHtcblx0J2FyYyc6ICdkcmF3QXJjJyxcblx0J2Jlemllcic6ICdkcmF3QmV6aWVyJyxcblx0J2VsbGlwc2UnOiAnZHJhd0VsbGlwc2UnLFxuXHQnZnVuY3Rpb24nOiAnZHJhdycsXG5cdCdpbWFnZSc6ICdkcmF3SW1hZ2UnLFxuXHQnbGluZSc6ICdkcmF3TGluZScsXG5cdCdwYXRoJzogJ2RyYXdQYXRoJyxcblx0J3BvbHlnb24nOiAnZHJhd1BvbHlnb24nLFxuXHQnc2xpY2UnOiAnZHJhd1NsaWNlJyxcblx0J3F1YWRyYXRpYyc6ICdkcmF3UXVhZHJhdGljJyxcblx0J3JlY3RhbmdsZSc6ICdkcmF3UmVjdCcsXG5cdCd0ZXh0JzogJ2RyYXdUZXh0Jyxcblx0J3ZlY3Rvcic6ICdkcmF3VmVjdG9yJyxcblx0J3NhdmUnOiAnc2F2ZUNhbnZhcycsXG5cdCdyZXN0b3JlJzogJ3Jlc3RvcmVDYW52YXMnLFxuXHQncm90YXRlJzogJ3JvdGF0ZUNhbnZhcycsXG5cdCdzY2FsZSc6ICdzY2FsZUNhbnZhcycsXG5cdCd0cmFuc2xhdGUnOiAndHJhbnNsYXRlQ2FudmFzJ1xufTtcblxuLy8gRHJhd3Mgb24gY2FudmFzIHVzaW5nIGEgZnVuY3Rpb25cbiQuZm4uZHJhdyA9IGZ1bmN0aW9uIGRyYXcoYXJncykge1xuXHR2YXIgJGNhbnZhc2VzID0gdGhpcywgZSwgY3R4LFxuXHRcdHBhcmFtcyA9IG5ldyBqQ2FudmFzT2JqZWN0KGFyZ3MpO1xuXG5cdC8vIERyYXcgdXNpbmcgYW55IG90aGVyIG1ldGhvZFxuXHRpZiAobWFwcy5kcmF3aW5nc1twYXJhbXMudHlwZV0gJiYgcGFyYW1zLnR5cGUgIT09ICdmdW5jdGlvbicpIHtcblxuXHRcdCRjYW52YXNlc1ttYXBzLmRyYXdpbmdzW3BhcmFtcy50eXBlXV0oYXJncyk7XG5cblx0fSBlbHNlIHtcblxuXHRcdGZvciAoZSA9IDA7IGUgPCAkY2FudmFzZXMubGVuZ3RoOyBlICs9IDEpIHtcblx0XHRcdGN0eCA9IF9nZXRDb250ZXh0KCRjYW52YXNlc1tlXSk7XG5cdFx0XHRpZiAoY3R4KSB7XG5cblx0XHRcdFx0cGFyYW1zID0gbmV3IGpDYW52YXNPYmplY3QoYXJncyk7XG5cdFx0XHRcdF9hZGRMYXllcigkY2FudmFzZXNbZV0sIHBhcmFtcywgYXJncywgZHJhdyk7XG5cdFx0XHRcdGlmIChwYXJhbXMudmlzaWJsZSkge1xuXG5cdFx0XHRcdFx0aWYgKHBhcmFtcy5mbikge1xuXHRcdFx0XHRcdFx0Ly8gQ2FsbCB0aGUgZ2l2ZW4gdXNlci1kZWZpbmVkIGZ1bmN0aW9uXG5cdFx0XHRcdFx0XHRwYXJhbXMuZm4uY2FsbCgkY2FudmFzZXNbZV0sIGN0eCwgcGFyYW1zKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cdFx0fVxuXG5cdH1cblx0cmV0dXJuICRjYW52YXNlcztcbn07XG5cbi8vIENsZWFycyBjYW52YXNcbiQuZm4uY2xlYXJDYW52YXMgPSBmdW5jdGlvbiBjbGVhckNhbnZhcyhhcmdzKSB7XG5cdHZhciAkY2FudmFzZXMgPSB0aGlzLCBlLCBjdHgsXG5cdFx0cGFyYW1zID0gbmV3IGpDYW52YXNPYmplY3QoYXJncyk7XG5cblx0Zm9yIChlID0gMDsgZSA8ICRjYW52YXNlcy5sZW5ndGg7IGUgKz0gMSkge1xuXHRcdGN0eCA9IF9nZXRDb250ZXh0KCRjYW52YXNlc1tlXSk7XG5cdFx0aWYgKGN0eCkge1xuXG5cdFx0XHRpZiAocGFyYW1zLndpZHRoID09PSBudWxsIHx8IHBhcmFtcy5oZWlnaHQgPT09IG51bGwpIHtcblx0XHRcdFx0Ly8gQ2xlYXIgZW50aXJlIGNhbnZhcyBpZiB3aWR0aC9oZWlnaHQgaXMgbm90IGdpdmVuXG5cblx0XHRcdFx0Ly8gUmVzZXQgY3VycmVudCB0cmFuc2Zvcm1hdGlvbiB0ZW1wb3JhcmlseSB0byBlbnN1cmUgdGhhdCB0aGUgZW50aXJlIGNhbnZhcyBpcyBjbGVhcmVkXG5cdFx0XHRcdGN0eC5zYXZlKCk7XG5cdFx0XHRcdGN0eC5zZXRUcmFuc2Zvcm0oMSwgMCwgMCwgMSwgMCwgMCk7XG5cdFx0XHRcdGN0eC5jbGVhclJlY3QoMCwgMCwgJGNhbnZhc2VzW2VdLndpZHRoLCAkY2FudmFzZXNbZV0uaGVpZ2h0KTtcblx0XHRcdFx0Y3R4LnJlc3RvcmUoKTtcblxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gT3RoZXJ3aXNlLCBjbGVhciB0aGUgZGVmaW5lZCBzZWN0aW9uIG9mIHRoZSBjYW52YXNcblxuXHRcdFx0XHQvLyBUcmFuc2Zvcm0gY2xlYXIgcmVjdGFuZ2xlXG5cdFx0XHRcdF9hZGRMYXllcigkY2FudmFzZXNbZV0sIHBhcmFtcywgYXJncywgY2xlYXJDYW52YXMpO1xuXHRcdFx0XHRfdHJhbnNmb3JtU2hhcGUoJGNhbnZhc2VzW2VdLCBjdHgsIHBhcmFtcywgcGFyYW1zLndpZHRoLCBwYXJhbXMuaGVpZ2h0KTtcblx0XHRcdFx0Y3R4LmNsZWFyUmVjdChwYXJhbXMueCAtIChwYXJhbXMud2lkdGggLyAyKSwgcGFyYW1zLnkgLSAocGFyYW1zLmhlaWdodCAvIDIpLCBwYXJhbXMud2lkdGgsIHBhcmFtcy5oZWlnaHQpO1xuXHRcdFx0XHQvLyBSZXN0b3JlIHByZXZpb3VzIHRyYW5zZm9ybWF0aW9uXG5cdFx0XHRcdF9yZXN0b3JlVHJhbnNmb3JtKGN0eCwgcGFyYW1zKTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXHR9XG5cdHJldHVybiAkY2FudmFzZXM7XG59O1xuXG4vKiBUcmFuc2Zvcm1hdGlvbiBBUEkgKi9cblxuLy8gUmVzdG9yZXMgY2FudmFzXG4kLmZuLnNhdmVDYW52YXMgPSBmdW5jdGlvbiBzYXZlQ2FudmFzKGFyZ3MpIHtcblx0dmFyICRjYW52YXNlcyA9IHRoaXMsIGUsIGN0eCxcblx0XHRwYXJhbXMsIGRhdGEsIGk7XG5cblx0Zm9yIChlID0gMDsgZSA8ICRjYW52YXNlcy5sZW5ndGg7IGUgKz0gMSkge1xuXHRcdGN0eCA9IF9nZXRDb250ZXh0KCRjYW52YXNlc1tlXSk7XG5cdFx0aWYgKGN0eCkge1xuXG5cdFx0XHRkYXRhID0gX2dldENhbnZhc0RhdGEoJGNhbnZhc2VzW2VdKTtcblxuXHRcdFx0cGFyYW1zID0gbmV3IGpDYW52YXNPYmplY3QoYXJncyk7XG5cdFx0XHRfYWRkTGF5ZXIoJGNhbnZhc2VzW2VdLCBwYXJhbXMsIGFyZ3MsIHNhdmVDYW52YXMpO1xuXG5cdFx0XHQvLyBSZXN0b3JlIGEgbnVtYmVyIG9mIHRpbWVzIHVzaW5nIHRoZSBnaXZlbiBjb3VudFxuXHRcdFx0Zm9yIChpID0gMDsgaSA8IHBhcmFtcy5jb3VudDsgaSArPSAxKSB7XG5cdFx0XHRcdF9zYXZlQ2FudmFzKGN0eCwgZGF0YSk7XG5cdFx0XHR9XG5cblx0XHR9XG5cdH1cblx0cmV0dXJuICRjYW52YXNlcztcbn07XG5cbi8vIFJlc3RvcmVzIGNhbnZhc1xuJC5mbi5yZXN0b3JlQ2FudmFzID0gZnVuY3Rpb24gcmVzdG9yZUNhbnZhcyhhcmdzKSB7XG5cdHZhciAkY2FudmFzZXMgPSB0aGlzLCBlLCBjdHgsXG5cdFx0cGFyYW1zLCBkYXRhLCBpO1xuXG5cdGZvciAoZSA9IDA7IGUgPCAkY2FudmFzZXMubGVuZ3RoOyBlICs9IDEpIHtcblx0XHRjdHggPSBfZ2V0Q29udGV4dCgkY2FudmFzZXNbZV0pO1xuXHRcdGlmIChjdHgpIHtcblxuXHRcdFx0ZGF0YSA9IF9nZXRDYW52YXNEYXRhKCRjYW52YXNlc1tlXSk7XG5cblx0XHRcdHBhcmFtcyA9IG5ldyBqQ2FudmFzT2JqZWN0KGFyZ3MpO1xuXHRcdFx0X2FkZExheWVyKCRjYW52YXNlc1tlXSwgcGFyYW1zLCBhcmdzLCByZXN0b3JlQ2FudmFzKTtcblxuXHRcdFx0Ly8gUmVzdG9yZSBhIG51bWJlciBvZiB0aW1lcyB1c2luZyB0aGUgZ2l2ZW4gY291bnRcblx0XHRcdGZvciAoaSA9IDA7IGkgPCBwYXJhbXMuY291bnQ7IGkgKz0gMSkge1xuXHRcdFx0XHRfcmVzdG9yZUNhbnZhcyhjdHgsIGRhdGEpO1xuXHRcdFx0fVxuXG5cdFx0fVxuXHR9XG5cdHJldHVybiAkY2FudmFzZXM7XG59O1xuXG4vLyBSb3RhdGVzIGNhbnZhcyAoaW50ZXJuYWwpXG5mdW5jdGlvbiBfcm90YXRlQ2FudmFzKGN0eCwgcGFyYW1zLCB0cmFuc2Zvcm1zKSB7XG5cblx0Ly8gR2V0IGNvbnZlcnNpb24gZmFjdG9yIGZvciByYWRpYW5zXG5cdHBhcmFtcy5fdG9SYWQgPSAocGFyYW1zLmluRGVncmVlcyA/IChQSSAvIDE4MCkgOiAxKTtcblxuXHQvLyBSb3RhdGUgY2FudmFzIHVzaW5nIHNoYXBlIGFzIGNlbnRlciBvZiByb3RhdGlvblxuXHRjdHgudHJhbnNsYXRlKHBhcmFtcy54LCBwYXJhbXMueSk7XG5cdGN0eC5yb3RhdGUocGFyYW1zLnJvdGF0ZSAqIHBhcmFtcy5fdG9SYWQpO1xuXHRjdHgudHJhbnNsYXRlKC1wYXJhbXMueCwgLXBhcmFtcy55KTtcblxuXHQvLyBJZiB0cmFuc2Zvcm1hdGlvbiBkYXRhIHdhcyBnaXZlblxuXHRpZiAodHJhbnNmb3Jtcykge1xuXHRcdC8vIFVwZGF0ZSB0cmFuc2Zvcm1hdGlvbiBkYXRhXG5cdFx0dHJhbnNmb3Jtcy5yb3RhdGUgKz0gKHBhcmFtcy5yb3RhdGUgKiBwYXJhbXMuX3RvUmFkKTtcblx0fVxufVxuXG4vLyBTY2FsZXMgY2FudmFzIChpbnRlcm5hbClcbmZ1bmN0aW9uIF9zY2FsZUNhbnZhcyhjdHgsIHBhcmFtcywgdHJhbnNmb3Jtcykge1xuXG5cdC8vIFNjYWxlIGJvdGggdGhlIHgtIGFuZCB5LSBheGlzIHVzaW5nIHRoZSAnc2NhbGUnIHByb3BlcnR5XG5cdGlmIChwYXJhbXMuc2NhbGUgIT09IDEpIHtcblx0XHRwYXJhbXMuc2NhbGVYID0gcGFyYW1zLnNjYWxlWSA9IHBhcmFtcy5zY2FsZTtcblx0fVxuXG5cdC8vIFNjYWxlIGNhbnZhcyB1c2luZyBzaGFwZSBhcyBjZW50ZXIgb2Ygcm90YXRpb25cblx0Y3R4LnRyYW5zbGF0ZShwYXJhbXMueCwgcGFyYW1zLnkpO1xuXHRjdHguc2NhbGUocGFyYW1zLnNjYWxlWCwgcGFyYW1zLnNjYWxlWSk7XG5cdGN0eC50cmFuc2xhdGUoLXBhcmFtcy54LCAtcGFyYW1zLnkpO1xuXG5cdC8vIElmIHRyYW5zZm9ybWF0aW9uIGRhdGEgd2FzIGdpdmVuXG5cdGlmICh0cmFuc2Zvcm1zKSB7XG5cdFx0Ly8gVXBkYXRlIHRyYW5zZm9ybWF0aW9uIGRhdGFcblx0XHR0cmFuc2Zvcm1zLnNjYWxlWCAqPSBwYXJhbXMuc2NhbGVYO1xuXHRcdHRyYW5zZm9ybXMuc2NhbGVZICo9IHBhcmFtcy5zY2FsZVk7XG5cdH1cbn1cblxuLy8gVHJhbnNsYXRlcyBjYW52YXMgKGludGVybmFsKVxuZnVuY3Rpb24gX3RyYW5zbGF0ZUNhbnZhcyhjdHgsIHBhcmFtcywgdHJhbnNmb3Jtcykge1xuXG5cdC8vIFRyYW5zbGF0ZSBib3RoIHRoZSB4LSBhbmQgeS1heGlzIHVzaW5nIHRoZSAndHJhbnNsYXRlJyBwcm9wZXJ0eVxuXHRpZiAocGFyYW1zLnRyYW5zbGF0ZSkge1xuXHRcdHBhcmFtcy50cmFuc2xhdGVYID0gcGFyYW1zLnRyYW5zbGF0ZVkgPSBwYXJhbXMudHJhbnNsYXRlO1xuXHR9XG5cblx0Ly8gVHJhbnNsYXRlIGNhbnZhc1xuXHRjdHgudHJhbnNsYXRlKHBhcmFtcy50cmFuc2xhdGVYLCBwYXJhbXMudHJhbnNsYXRlWSk7XG5cblx0Ly8gSWYgdHJhbnNmb3JtYXRpb24gZGF0YSB3YXMgZ2l2ZW5cblx0aWYgKHRyYW5zZm9ybXMpIHtcblx0XHQvLyBVcGRhdGUgdHJhbnNmb3JtYXRpb24gZGF0YVxuXHRcdHRyYW5zZm9ybXMudHJhbnNsYXRlWCArPSBwYXJhbXMudHJhbnNsYXRlWDtcblx0XHR0cmFuc2Zvcm1zLnRyYW5zbGF0ZVkgKz0gcGFyYW1zLnRyYW5zbGF0ZVk7XG5cdH1cbn1cblxuLy8gUm90YXRlcyBjYW52YXNcbiQuZm4ucm90YXRlQ2FudmFzID0gZnVuY3Rpb24gcm90YXRlQ2FudmFzKGFyZ3MpIHtcblx0dmFyICRjYW52YXNlcyA9IHRoaXMsIGUsIGN0eCxcblx0XHRwYXJhbXMsIGRhdGE7XG5cblx0Zm9yIChlID0gMDsgZSA8ICRjYW52YXNlcy5sZW5ndGg7IGUgKz0gMSkge1xuXHRcdGN0eCA9IF9nZXRDb250ZXh0KCRjYW52YXNlc1tlXSk7XG5cdFx0aWYgKGN0eCkge1xuXG5cdFx0XHRkYXRhID0gX2dldENhbnZhc0RhdGEoJGNhbnZhc2VzW2VdKTtcblxuXHRcdFx0cGFyYW1zID0gbmV3IGpDYW52YXNPYmplY3QoYXJncyk7XG5cdFx0XHRfYWRkTGF5ZXIoJGNhbnZhc2VzW2VdLCBwYXJhbXMsIGFyZ3MsIHJvdGF0ZUNhbnZhcyk7XG5cblx0XHRcdC8vIEF1dG9zYXZlIHRyYW5zZm9ybWF0aW9uIHN0YXRlIGJ5IGRlZmF1bHRcblx0XHRcdGlmIChwYXJhbXMuYXV0b3NhdmUpIHtcblx0XHRcdFx0Ly8gQXV0b21hdGljYWxseSBzYXZlIHRyYW5zZm9ybWF0aW9uIHN0YXRlIGJ5IGRlZmF1bHRcblx0XHRcdFx0X3NhdmVDYW52YXMoY3R4LCBkYXRhKTtcblx0XHRcdH1cblx0XHRcdF9yb3RhdGVDYW52YXMoY3R4LCBwYXJhbXMsIGRhdGEudHJhbnNmb3Jtcyk7XG5cdFx0fVxuXG5cdH1cblx0cmV0dXJuICRjYW52YXNlcztcbn07XG5cbi8vIFNjYWxlcyBjYW52YXNcbiQuZm4uc2NhbGVDYW52YXMgPSBmdW5jdGlvbiBzY2FsZUNhbnZhcyhhcmdzKSB7XG5cdHZhciAkY2FudmFzZXMgPSB0aGlzLCBlLCBjdHgsXG5cdFx0cGFyYW1zLCBkYXRhO1xuXG5cdGZvciAoZSA9IDA7IGUgPCAkY2FudmFzZXMubGVuZ3RoOyBlICs9IDEpIHtcblx0XHRjdHggPSBfZ2V0Q29udGV4dCgkY2FudmFzZXNbZV0pO1xuXHRcdGlmIChjdHgpIHtcblxuXHRcdFx0ZGF0YSA9IF9nZXRDYW52YXNEYXRhKCRjYW52YXNlc1tlXSk7XG5cblx0XHRcdHBhcmFtcyA9IG5ldyBqQ2FudmFzT2JqZWN0KGFyZ3MpO1xuXHRcdFx0X2FkZExheWVyKCRjYW52YXNlc1tlXSwgcGFyYW1zLCBhcmdzLCBzY2FsZUNhbnZhcyk7XG5cblx0XHRcdC8vIEF1dG9zYXZlIHRyYW5zZm9ybWF0aW9uIHN0YXRlIGJ5IGRlZmF1bHRcblx0XHRcdGlmIChwYXJhbXMuYXV0b3NhdmUpIHtcblx0XHRcdFx0Ly8gQXV0b21hdGljYWxseSBzYXZlIHRyYW5zZm9ybWF0aW9uIHN0YXRlIGJ5IGRlZmF1bHRcblx0XHRcdFx0X3NhdmVDYW52YXMoY3R4LCBkYXRhKTtcblx0XHRcdH1cblx0XHRcdF9zY2FsZUNhbnZhcyhjdHgsIHBhcmFtcywgZGF0YS50cmFuc2Zvcm1zKTtcblxuXHRcdH1cblx0fVxuXHRyZXR1cm4gJGNhbnZhc2VzO1xufTtcblxuLy8gVHJhbnNsYXRlcyBjYW52YXNcbiQuZm4udHJhbnNsYXRlQ2FudmFzID0gZnVuY3Rpb24gdHJhbnNsYXRlQ2FudmFzKGFyZ3MpIHtcblx0dmFyICRjYW52YXNlcyA9IHRoaXMsIGUsIGN0eCxcblx0XHRwYXJhbXMsIGRhdGE7XG5cblx0Zm9yIChlID0gMDsgZSA8ICRjYW52YXNlcy5sZW5ndGg7IGUgKz0gMSkge1xuXHRcdGN0eCA9IF9nZXRDb250ZXh0KCRjYW52YXNlc1tlXSk7XG5cdFx0aWYgKGN0eCkge1xuXG5cdFx0XHRkYXRhID0gX2dldENhbnZhc0RhdGEoJGNhbnZhc2VzW2VdKTtcblxuXHRcdFx0cGFyYW1zID0gbmV3IGpDYW52YXNPYmplY3QoYXJncyk7XG5cdFx0XHRfYWRkTGF5ZXIoJGNhbnZhc2VzW2VdLCBwYXJhbXMsIGFyZ3MsIHRyYW5zbGF0ZUNhbnZhcyk7XG5cblx0XHRcdC8vIEF1dG9zYXZlIHRyYW5zZm9ybWF0aW9uIHN0YXRlIGJ5IGRlZmF1bHRcblx0XHRcdGlmIChwYXJhbXMuYXV0b3NhdmUpIHtcblx0XHRcdFx0Ly8gQXV0b21hdGljYWxseSBzYXZlIHRyYW5zZm9ybWF0aW9uIHN0YXRlIGJ5IGRlZmF1bHRcblx0XHRcdFx0X3NhdmVDYW52YXMoY3R4LCBkYXRhKTtcblx0XHRcdH1cblx0XHRcdF90cmFuc2xhdGVDYW52YXMoY3R4LCBwYXJhbXMsIGRhdGEudHJhbnNmb3Jtcyk7XG5cblx0XHR9XG5cdH1cblx0cmV0dXJuICRjYW52YXNlcztcbn07XG5cbi8qIFNoYXBlIEFQSSAqL1xuXG4vLyBEcmF3cyByZWN0YW5nbGVcbiQuZm4uZHJhd1JlY3QgPSBmdW5jdGlvbiBkcmF3UmVjdChhcmdzKSB7XG5cdHZhciAkY2FudmFzZXMgPSB0aGlzLCBlLCBjdHgsXG5cdFx0cGFyYW1zLFxuXHRcdHgxLCB5MSxcblx0XHR4MiwgeTIsXG5cdFx0ciwgdGVtcDtcblxuXHRmb3IgKGUgPSAwOyBlIDwgJGNhbnZhc2VzLmxlbmd0aDsgZSArPSAxKSB7XG5cdFx0Y3R4ID0gX2dldENvbnRleHQoJGNhbnZhc2VzW2VdKTtcblx0XHRpZiAoY3R4KSB7XG5cblx0XHRcdHBhcmFtcyA9IG5ldyBqQ2FudmFzT2JqZWN0KGFyZ3MpO1xuXHRcdFx0X2FkZExheWVyKCRjYW52YXNlc1tlXSwgcGFyYW1zLCBhcmdzLCBkcmF3UmVjdCk7XG5cdFx0XHRpZiAocGFyYW1zLnZpc2libGUpIHtcblxuXHRcdFx0XHRfdHJhbnNmb3JtU2hhcGUoJGNhbnZhc2VzW2VdLCBjdHgsIHBhcmFtcywgcGFyYW1zLndpZHRoLCBwYXJhbXMuaGVpZ2h0KTtcblx0XHRcdFx0X3NldEdsb2JhbFByb3BzKCRjYW52YXNlc1tlXSwgY3R4LCBwYXJhbXMpO1xuXG5cdFx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdFx0aWYgKHBhcmFtcy53aWR0aCAmJiBwYXJhbXMuaGVpZ2h0KSB7XG5cdFx0XHRcdFx0eDEgPSBwYXJhbXMueCAtIChwYXJhbXMud2lkdGggLyAyKTtcblx0XHRcdFx0XHR5MSA9IHBhcmFtcy55IC0gKHBhcmFtcy5oZWlnaHQgLyAyKTtcblx0XHRcdFx0XHRyID0gYWJzKHBhcmFtcy5jb3JuZXJSYWRpdXMpO1xuXHRcdFx0XHRcdC8vIElmIGNvcm5lciByYWRpdXMgaXMgZGVmaW5lZCBhbmQgaXMgbm90IHplcm9cblx0XHRcdFx0XHRpZiAocikge1xuXHRcdFx0XHRcdFx0Ly8gRHJhdyByZWN0YW5nbGUgd2l0aCByb3VuZGVkIGNvcm5lcnMgaWYgY29ybmVyUmFkaXVzIGlzIGRlZmluZWRcblxuXHRcdFx0XHRcdFx0eDIgPSBwYXJhbXMueCArIChwYXJhbXMud2lkdGggLyAyKTtcblx0XHRcdFx0XHRcdHkyID0gcGFyYW1zLnkgKyAocGFyYW1zLmhlaWdodCAvIDIpO1xuXG5cdFx0XHRcdFx0XHQvLyBIYW5kbGUgbmVnYXRpdmUgd2lkdGhcblx0XHRcdFx0XHRcdGlmIChwYXJhbXMud2lkdGggPCAwKSB7XG5cdFx0XHRcdFx0XHRcdHRlbXAgPSB4MTtcblx0XHRcdFx0XHRcdFx0eDEgPSB4Mjtcblx0XHRcdFx0XHRcdFx0eDIgPSB0ZW1wO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Ly8gSGFuZGxlIG5lZ2F0aXZlIGhlaWdodFxuXHRcdFx0XHRcdFx0aWYgKHBhcmFtcy5oZWlnaHQgPCAwKSB7XG5cdFx0XHRcdFx0XHRcdHRlbXAgPSB5MTtcblx0XHRcdFx0XHRcdFx0eTEgPSB5Mjtcblx0XHRcdFx0XHRcdFx0eTIgPSB0ZW1wO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvLyBQcmV2ZW50IG92ZXItcm91bmRlZCBjb3JuZXJzXG5cdFx0XHRcdFx0XHRpZiAoKHgyIC0geDEpIC0gKDIgKiByKSA8IDApIHtcblx0XHRcdFx0XHRcdFx0ciA9ICh4MiAtIHgxKSAvIDI7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpZiAoKHkyIC0geTEpIC0gKDIgKiByKSA8IDApIHtcblx0XHRcdFx0XHRcdFx0ciA9ICh5MiAtIHkxKSAvIDI7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdC8vIERyYXcgcmVjdGFuZ2xlXG5cdFx0XHRcdFx0XHRjdHgubW92ZVRvKHgxICsgciwgeTEpO1xuXHRcdFx0XHRcdFx0Y3R4LmxpbmVUbyh4MiAtIHIsIHkxKTtcblx0XHRcdFx0XHRcdGN0eC5hcmMoeDIgLSByLCB5MSArIHIsIHIsIDMgKiBQSSAvIDIsIFBJICogMiwgZmFsc2UpO1xuXHRcdFx0XHRcdFx0Y3R4LmxpbmVUbyh4MiwgeTIgLSByKTtcblx0XHRcdFx0XHRcdGN0eC5hcmMoeDIgLSByLCB5MiAtIHIsIHIsIDAsIFBJIC8gMiwgZmFsc2UpO1xuXHRcdFx0XHRcdFx0Y3R4LmxpbmVUbyh4MSArIHIsIHkyKTtcblx0XHRcdFx0XHRcdGN0eC5hcmMoeDEgKyByLCB5MiAtIHIsIHIsIFBJIC8gMiwgUEksIGZhbHNlKTtcblx0XHRcdFx0XHRcdGN0eC5saW5lVG8oeDEsIHkxICsgcik7XG5cdFx0XHRcdFx0XHRjdHguYXJjKHgxICsgciwgeTEgKyByLCByLCBQSSwgMyAqIFBJIC8gMiwgZmFsc2UpO1xuXHRcdFx0XHRcdFx0Ly8gQWx3YXlzIGNsb3NlIHBhdGhcblx0XHRcdFx0XHRcdHBhcmFtcy5jbG9zZWQgPSB0cnVlO1xuXG5cdFx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdFx0Ly8gT3RoZXJ3aXNlLCBkcmF3IHJlY3RhbmdsZSB3aXRoIHNxdWFyZSBjb3JuZXJzXG5cdFx0XHRcdFx0XHRjdHgucmVjdCh4MSwgeTEsIHBhcmFtcy53aWR0aCwgcGFyYW1zLmhlaWdodCk7XG5cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gQ2hlY2sgZm9yIGpDYW52YXMgZXZlbnRzXG5cdFx0XHRcdF9kZXRlY3RFdmVudHMoJGNhbnZhc2VzW2VdLCBjdHgsIHBhcmFtcyk7XG5cdFx0XHRcdC8vIENsb3NlIHJlY3RhbmdsZSBwYXRoXG5cdFx0XHRcdF9jbG9zZVBhdGgoJGNhbnZhc2VzW2VdLCBjdHgsIHBhcmFtcyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiAkY2FudmFzZXM7XG59O1xuXG4vLyBSZXRyaWV2ZXMgYSBjb3Rlcm1pbmFsIGFuZ2xlIGJldHdlZW4gMCBhbmQgMnBpIGZvciB0aGUgZ2l2ZW4gYW5nbGVcbmZ1bmN0aW9uIF9nZXRDb3Rlcm1pbmFsKGFuZ2xlKSB7XG5cdHdoaWxlIChhbmdsZSA8IDApIHtcblx0XHRhbmdsZSArPSAoMiAqIFBJKTtcblx0fVxuXHRyZXR1cm4gYW5nbGU7XG59XG5cbi8vIFJldHJpZXZlcyB0aGUgeC1jb29yZGluYXRlIGZvciB0aGUgZ2l2ZW4gYW5nbGUgaW4gYSBjaXJjbGVcbmZ1bmN0aW9uIF9nZXRBcmNYKHBhcmFtcywgYW5nbGUpIHtcblx0cmV0dXJuIHBhcmFtcy54ICsgKHBhcmFtcy5yYWRpdXMgKiBjb3MoYW5nbGUpKTtcbn1cbi8vIFJldHJpZXZlcyB0aGUgeS1jb29yZGluYXRlIGZvciB0aGUgZ2l2ZW4gYW5nbGUgaW4gYSBjaXJjbGVcbmZ1bmN0aW9uIF9nZXRBcmNZKHBhcmFtcywgYW5nbGUpIHtcblx0cmV0dXJuIHBhcmFtcy55ICsgKHBhcmFtcy5yYWRpdXMgKiBzaW4oYW5nbGUpKTtcbn1cblxuLy8gRHJhd3MgYXJjIChpbnRlcm5hbClcbmZ1bmN0aW9uIF9kcmF3QXJjKGNhbnZhcywgY3R4LCBwYXJhbXMsIHBhdGgpIHtcblx0dmFyIHgxLCB5MSwgeDIsIHkyLFxuXHRcdHgzLCB5MywgeDQsIHk0LFxuXHRcdG9mZnNldFgsIG9mZnNldFksXG5cdFx0ZGlmZjtcblxuXHQvLyBEZXRlcm1pbmUgb2Zmc2V0IGZyb20gZHJhZ2dpbmdcblx0aWYgKHBhcmFtcyA9PT0gcGF0aCkge1xuXHRcdG9mZnNldFggPSAwO1xuXHRcdG9mZnNldFkgPSAwO1xuXHR9IGVsc2Uge1xuXHRcdG9mZnNldFggPSBwYXJhbXMueDtcblx0XHRvZmZzZXRZID0gcGFyYW1zLnk7XG5cdH1cblxuXHQvLyBDb252ZXJ0IGRlZmF1bHQgZW5kIGFuZ2xlIHRvIHJhZGlhbnNcblx0aWYgKCFwYXRoLmluRGVncmVlcyAmJiBwYXRoLmVuZCA9PT0gMzYwKSB7XG5cdFx0cGF0aC5lbmQgPSBQSSAqIDI7XG5cdH1cblxuXHQvLyBDb252ZXJ0IGFuZ2xlcyB0byByYWRpYW5zXG5cdHBhdGguc3RhcnQgKj0gcGFyYW1zLl90b1JhZDtcblx0cGF0aC5lbmQgKj0gcGFyYW1zLl90b1JhZDtcblx0Ly8gQ29uc2lkZXIgMGRlZyBkdWUgbm9ydGggb2YgYXJjXG5cdHBhdGguc3RhcnQgLT0gKFBJIC8gMik7XG5cdHBhdGguZW5kIC09IChQSSAvIDIpO1xuXG5cdC8vIEVuc3VyZSBhcnJvd3MgYXJlIHBvaW50ZWQgY29ycmVjdGx5IGZvciBDQ1cgYXJjc1xuXHRkaWZmID0gUEkgLyAxODA7XG5cdGlmIChwYXRoLmNjdykge1xuXHRcdGRpZmYgKj0gLTE7XG5cdH1cblxuXHQvLyBDYWxjdWxhdGUgY29vcmRpbmF0ZXMgZm9yIHN0YXJ0IGFycm93XG5cdHgxID0gX2dldEFyY1gocGF0aCwgcGF0aC5zdGFydCArIGRpZmYpO1xuXHR5MSA9IF9nZXRBcmNZKHBhdGgsIHBhdGguc3RhcnQgKyBkaWZmKTtcblx0eDIgPSBfZ2V0QXJjWChwYXRoLCBwYXRoLnN0YXJ0KTtcblx0eTIgPSBfZ2V0QXJjWShwYXRoLCBwYXRoLnN0YXJ0KTtcblxuXHRfYWRkU3RhcnRBcnJvdyhcblx0XHRjYW52YXMsIGN0eCxcblx0XHRwYXJhbXMsIHBhdGgsXG5cdFx0eDEsIHkxLFxuXHRcdHgyLCB5MlxuXHQpO1xuXG5cdC8vIERyYXcgYXJjXG5cdGN0eC5hcmMocGF0aC54ICsgb2Zmc2V0WCwgcGF0aC55ICsgb2Zmc2V0WSwgcGF0aC5yYWRpdXMsIHBhdGguc3RhcnQsIHBhdGguZW5kLCBwYXRoLmNjdyk7XG5cblx0Ly8gQ2FsY3VsYXRlIGNvb3JkaW5hdGVzIGZvciBlbmQgYXJyb3dcblx0eDMgPSBfZ2V0QXJjWChwYXRoLCBwYXRoLmVuZCArIGRpZmYpO1xuXHR5MyA9IF9nZXRBcmNZKHBhdGgsIHBhdGguZW5kICsgZGlmZik7XG5cdHg0ID0gX2dldEFyY1gocGF0aCwgcGF0aC5lbmQpO1xuXHR5NCA9IF9nZXRBcmNZKHBhdGgsIHBhdGguZW5kKTtcblxuXHRfYWRkRW5kQXJyb3coXG5cdFx0Y2FudmFzLCBjdHgsXG5cdFx0cGFyYW1zLCBwYXRoLFxuXHRcdHg0LCB5NCxcblx0XHR4MywgeTNcblx0KTtcbn1cblxuLy8gRHJhd3MgYXJjIG9yIGNpcmNsZVxuJC5mbi5kcmF3QXJjID0gZnVuY3Rpb24gZHJhd0FyYyhhcmdzKSB7XG5cdHZhciAkY2FudmFzZXMgPSB0aGlzLCBlLCBjdHgsXG5cdFx0cGFyYW1zO1xuXG5cdGZvciAoZSA9IDA7IGUgPCAkY2FudmFzZXMubGVuZ3RoOyBlICs9IDEpIHtcblx0XHRjdHggPSBfZ2V0Q29udGV4dCgkY2FudmFzZXNbZV0pO1xuXHRcdGlmIChjdHgpIHtcblxuXHRcdFx0cGFyYW1zID0gbmV3IGpDYW52YXNPYmplY3QoYXJncyk7XG5cdFx0XHRfYWRkTGF5ZXIoJGNhbnZhc2VzW2VdLCBwYXJhbXMsIGFyZ3MsIGRyYXdBcmMpO1xuXHRcdFx0aWYgKHBhcmFtcy52aXNpYmxlKSB7XG5cblx0XHRcdFx0X3RyYW5zZm9ybVNoYXBlKCRjYW52YXNlc1tlXSwgY3R4LCBwYXJhbXMsIHBhcmFtcy5yYWRpdXMgKiAyKTtcblx0XHRcdFx0X3NldEdsb2JhbFByb3BzKCRjYW52YXNlc1tlXSwgY3R4LCBwYXJhbXMpO1xuXG5cdFx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdFx0X2RyYXdBcmMoJGNhbnZhc2VzW2VdLCBjdHgsIHBhcmFtcywgcGFyYW1zKTtcblx0XHRcdFx0Ly8gQ2hlY2sgZm9yIGpDYW52YXMgZXZlbnRzXG5cdFx0XHRcdF9kZXRlY3RFdmVudHMoJGNhbnZhc2VzW2VdLCBjdHgsIHBhcmFtcyk7XG5cdFx0XHRcdC8vIE9wdGlvbmFsbHkgY2xvc2UgcGF0aFxuXHRcdFx0XHRfY2xvc2VQYXRoKCRjYW52YXNlc1tlXSwgY3R4LCBwYXJhbXMpO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cdH1cblx0cmV0dXJuICRjYW52YXNlcztcbn07XG5cbi8vIERyYXdzIGVsbGlwc2VcbiQuZm4uZHJhd0VsbGlwc2UgPSBmdW5jdGlvbiBkcmF3RWxsaXBzZShhcmdzKSB7XG5cdHZhciAkY2FudmFzZXMgPSB0aGlzLCBlLCBjdHgsXG5cdFx0cGFyYW1zLFxuXHRcdGNvbnRyb2xXLFxuXHRcdGNvbnRyb2xIO1xuXG5cdGZvciAoZSA9IDA7IGUgPCAkY2FudmFzZXMubGVuZ3RoOyBlICs9IDEpIHtcblx0XHRjdHggPSBfZ2V0Q29udGV4dCgkY2FudmFzZXNbZV0pO1xuXHRcdGlmIChjdHgpIHtcblxuXHRcdFx0cGFyYW1zID0gbmV3IGpDYW52YXNPYmplY3QoYXJncyk7XG5cdFx0XHRfYWRkTGF5ZXIoJGNhbnZhc2VzW2VdLCBwYXJhbXMsIGFyZ3MsIGRyYXdFbGxpcHNlKTtcblx0XHRcdGlmIChwYXJhbXMudmlzaWJsZSkge1xuXG5cdFx0XHRcdF90cmFuc2Zvcm1TaGFwZSgkY2FudmFzZXNbZV0sIGN0eCwgcGFyYW1zLCBwYXJhbXMud2lkdGgsIHBhcmFtcy5oZWlnaHQpO1xuXHRcdFx0XHRfc2V0R2xvYmFsUHJvcHMoJGNhbnZhc2VzW2VdLCBjdHgsIHBhcmFtcyk7XG5cblx0XHRcdFx0Ly8gQ2FsY3VsYXRlIGNvbnRyb2wgd2lkdGggYW5kIGhlaWdodFxuXHRcdFx0XHRjb250cm9sVyA9IHBhcmFtcy53aWR0aCAqICg0IC8gMyk7XG5cdFx0XHRcdGNvbnRyb2xIID0gcGFyYW1zLmhlaWdodDtcblxuXHRcdFx0XHQvLyBDcmVhdGUgZWxsaXBzZSB1c2luZyBjdXJ2ZXNcblx0XHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0XHRjdHgubW92ZVRvKHBhcmFtcy54LCBwYXJhbXMueSAtIChjb250cm9sSCAvIDIpKTtcblx0XHRcdFx0Ly8gTGVmdCBzaWRlXG5cdFx0XHRcdGN0eC5iZXppZXJDdXJ2ZVRvKHBhcmFtcy54IC0gKGNvbnRyb2xXIC8gMiksIHBhcmFtcy55IC0gKGNvbnRyb2xIIC8gMiksIHBhcmFtcy54IC0gKGNvbnRyb2xXIC8gMiksIHBhcmFtcy55ICsgKGNvbnRyb2xIIC8gMiksIHBhcmFtcy54LCBwYXJhbXMueSArIChjb250cm9sSCAvIDIpKTtcblx0XHRcdFx0Ly8gUmlnaHQgc2lkZVxuXHRcdFx0XHRjdHguYmV6aWVyQ3VydmVUbyhwYXJhbXMueCArIChjb250cm9sVyAvIDIpLCBwYXJhbXMueSArIChjb250cm9sSCAvIDIpLCBwYXJhbXMueCArIChjb250cm9sVyAvIDIpLCBwYXJhbXMueSAtIChjb250cm9sSCAvIDIpLCBwYXJhbXMueCwgcGFyYW1zLnkgLSAoY29udHJvbEggLyAyKSk7XG5cdFx0XHRcdC8vIENoZWNrIGZvciBqQ2FudmFzIGV2ZW50c1xuXHRcdFx0XHRfZGV0ZWN0RXZlbnRzKCRjYW52YXNlc1tlXSwgY3R4LCBwYXJhbXMpO1xuXHRcdFx0XHQvLyBBbHdheXMgY2xvc2UgcGF0aFxuXHRcdFx0XHRwYXJhbXMuY2xvc2VkID0gdHJ1ZTtcblx0XHRcdFx0X2Nsb3NlUGF0aCgkY2FudmFzZXNbZV0sIGN0eCwgcGFyYW1zKTtcblxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gJGNhbnZhc2VzO1xufTtcblxuLy8gRHJhd3MgYSByZWd1bGFyIChlcXVhbC1hbmdsZWQpIHBvbHlnb25cbiQuZm4uZHJhd1BvbHlnb24gPSBmdW5jdGlvbiBkcmF3UG9seWdvbihhcmdzKSB7XG5cdHZhciAkY2FudmFzZXMgPSB0aGlzLCBlLCBjdHgsXG5cdFx0cGFyYW1zLFxuXHRcdHRoZXRhLCBkdGhldGEsIGhkdGhldGEsXG5cdFx0YXBvdGhlbSxcblx0XHR4LCB5LCBpO1xuXG5cdGZvciAoZSA9IDA7IGUgPCAkY2FudmFzZXMubGVuZ3RoOyBlICs9IDEpIHtcblx0XHRjdHggPSBfZ2V0Q29udGV4dCgkY2FudmFzZXNbZV0pO1xuXHRcdGlmIChjdHgpIHtcblxuXHRcdFx0cGFyYW1zID0gbmV3IGpDYW52YXNPYmplY3QoYXJncyk7XG5cdFx0XHRfYWRkTGF5ZXIoJGNhbnZhc2VzW2VdLCBwYXJhbXMsIGFyZ3MsIGRyYXdQb2x5Z29uKTtcblx0XHRcdGlmIChwYXJhbXMudmlzaWJsZSkge1xuXG5cdFx0XHRcdF90cmFuc2Zvcm1TaGFwZSgkY2FudmFzZXNbZV0sIGN0eCwgcGFyYW1zLCBwYXJhbXMucmFkaXVzICogMik7XG5cdFx0XHRcdF9zZXRHbG9iYWxQcm9wcygkY2FudmFzZXNbZV0sIGN0eCwgcGFyYW1zKTtcblxuXHRcdFx0XHQvLyBQb2x5Z29uJ3MgY2VudHJhbCBhbmdsZVxuXHRcdFx0XHRkdGhldGEgPSAoMiAqIFBJKSAvIHBhcmFtcy5zaWRlcztcblx0XHRcdFx0Ly8gSGFsZiBvZiBkdGhldGFcblx0XHRcdFx0aGR0aGV0YSA9IGR0aGV0YSAvIDI7XG5cdFx0XHRcdC8vIFBvbHlnb24ncyBzdGFydGluZyBhbmdsZVxuXHRcdFx0XHR0aGV0YSA9IGhkdGhldGEgKyAoUEkgLyAyKTtcblx0XHRcdFx0Ly8gRGlzdGFuY2UgZnJvbSBwb2x5Z29uJ3MgY2VudGVyIHRvIHRoZSBtaWRkbGUgb2YgaXRzIHNpZGVcblx0XHRcdFx0YXBvdGhlbSA9IHBhcmFtcy5yYWRpdXMgKiBjb3MoaGR0aGV0YSk7XG5cblx0XHRcdFx0Ly8gQ2FsY3VsYXRlIHBhdGggYW5kIGRyYXdcblx0XHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0XHRmb3IgKGkgPSAwOyBpIDwgcGFyYW1zLnNpZGVzOyBpICs9IDEpIHtcblxuXHRcdFx0XHRcdC8vIERyYXcgc2lkZSBvZiBwb2x5Z29uXG5cdFx0XHRcdFx0eCA9IHBhcmFtcy54ICsgKHBhcmFtcy5yYWRpdXMgKiBjb3ModGhldGEpKTtcblx0XHRcdFx0XHR5ID0gcGFyYW1zLnkgKyAocGFyYW1zLnJhZGl1cyAqIHNpbih0aGV0YSkpO1xuXG5cdFx0XHRcdFx0Ly8gUGxvdCBwb2ludCBvbiBwb2x5Z29uXG5cdFx0XHRcdFx0Y3R4LmxpbmVUbyh4LCB5KTtcblxuXHRcdFx0XHRcdC8vIFByb2plY3Qgc2lkZSBpZiBjaG9zZW5cblx0XHRcdFx0XHRpZiAocGFyYW1zLmNvbmNhdml0eSkge1xuXHRcdFx0XHRcdFx0Ly8gU2lkZXMgYXJlIHByb2plY3RlZCBmcm9tIHRoZSBwb2x5Z29uJ3MgYXBvdGhlbVxuXHRcdFx0XHRcdFx0eCA9IHBhcmFtcy54ICsgKChhcG90aGVtICsgKC1hcG90aGVtICogcGFyYW1zLmNvbmNhdml0eSkpICogY29zKHRoZXRhICsgaGR0aGV0YSkpO1xuXHRcdFx0XHRcdFx0eSA9IHBhcmFtcy55ICsgKChhcG90aGVtICsgKC1hcG90aGVtICogcGFyYW1zLmNvbmNhdml0eSkpICogc2luKHRoZXRhICsgaGR0aGV0YSkpO1xuXHRcdFx0XHRcdFx0Y3R4LmxpbmVUbyh4LCB5KTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBJbmNyZW1lbnQgdGhldGEgYnkgZGVsdGEgdGhldGFcblx0XHRcdFx0XHR0aGV0YSArPSBkdGhldGE7XG5cblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBDaGVjayBmb3IgakNhbnZhcyBldmVudHNcblx0XHRcdFx0X2RldGVjdEV2ZW50cygkY2FudmFzZXNbZV0sIGN0eCwgcGFyYW1zKTtcblx0XHRcdFx0Ly8gQWx3YXlzIGNsb3NlIHBhdGhcblx0XHRcdFx0cGFyYW1zLmNsb3NlZCA9IHRydWU7XG5cdFx0XHRcdF9jbG9zZVBhdGgoJGNhbnZhc2VzW2VdLCBjdHgsIHBhcmFtcyk7XG5cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuICRjYW52YXNlcztcbn07XG5cbi8vIERyYXdzIHBpZS1zaGFwZWQgc2xpY2VcbiQuZm4uZHJhd1NsaWNlID0gZnVuY3Rpb24gZHJhd1NsaWNlKGFyZ3MpIHtcblx0dmFyICRjYW52YXNlcyA9IHRoaXMsIGUsIGN0eCxcblx0XHRwYXJhbXMsXG5cdFx0YW5nbGUsIGR4LCBkeTtcblxuXHRmb3IgKGUgPSAwOyBlIDwgJGNhbnZhc2VzLmxlbmd0aDsgZSArPSAxKSB7XG5cdFx0Y3R4ID0gX2dldENvbnRleHQoJGNhbnZhc2VzW2VdKTtcblx0XHRpZiAoY3R4KSB7XG5cblx0XHRcdHBhcmFtcyA9IG5ldyBqQ2FudmFzT2JqZWN0KGFyZ3MpO1xuXHRcdFx0X2FkZExheWVyKCRjYW52YXNlc1tlXSwgcGFyYW1zLCBhcmdzLCBkcmF3U2xpY2UpO1xuXHRcdFx0aWYgKHBhcmFtcy52aXNpYmxlKSB7XG5cblx0XHRcdFx0X3RyYW5zZm9ybVNoYXBlKCRjYW52YXNlc1tlXSwgY3R4LCBwYXJhbXMsIHBhcmFtcy5yYWRpdXMgKiAyKTtcblx0XHRcdFx0X3NldEdsb2JhbFByb3BzKCRjYW52YXNlc1tlXSwgY3R4LCBwYXJhbXMpO1xuXG5cdFx0XHRcdC8vIFBlcmZvcm0gZXh0cmEgY2FsY3VsYXRpb25zXG5cblx0XHRcdFx0Ly8gQ29udmVydCBhbmdsZXMgdG8gcmFkaWFuc1xuXHRcdFx0XHRwYXJhbXMuc3RhcnQgKj0gcGFyYW1zLl90b1JhZDtcblx0XHRcdFx0cGFyYW1zLmVuZCAqPSBwYXJhbXMuX3RvUmFkO1xuXHRcdFx0XHQvLyBDb25zaWRlciAwZGVnIGF0IG5vcnRoIG9mIGFyY1xuXHRcdFx0XHRwYXJhbXMuc3RhcnQgLT0gKFBJIC8gMik7XG5cdFx0XHRcdHBhcmFtcy5lbmQgLT0gKFBJIC8gMik7XG5cblx0XHRcdFx0Ly8gRmluZCBwb3NpdGl2ZSBlcXVpdmFsZW50cyBvZiBhbmdsZXNcblx0XHRcdFx0cGFyYW1zLnN0YXJ0ID0gX2dldENvdGVybWluYWwocGFyYW1zLnN0YXJ0KTtcblx0XHRcdFx0cGFyYW1zLmVuZCA9IF9nZXRDb3Rlcm1pbmFsKHBhcmFtcy5lbmQpO1xuXHRcdFx0XHQvLyBFbnN1cmUgc3RhcnQgYW5nbGUgaXMgbGVzcyB0aGFuIGVuZCBhbmdsZVxuXHRcdFx0XHRpZiAocGFyYW1zLmVuZCA8IHBhcmFtcy5zdGFydCkge1xuXHRcdFx0XHRcdHBhcmFtcy5lbmQgKz0gKDIgKiBQSSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBDYWxjdWxhdGUgYW5ndWxhciBwb3NpdGlvbiBvZiBzbGljZVxuXHRcdFx0XHRhbmdsZSA9ICgocGFyYW1zLnN0YXJ0ICsgcGFyYW1zLmVuZCkgLyAyKTtcblxuXHRcdFx0XHQvLyBDYWxjdWxhdGUgcmF0aW9zIGZvciBzbGljZSdzIGFuZ2xlXG5cdFx0XHRcdGR4ID0gKHBhcmFtcy5yYWRpdXMgKiBwYXJhbXMuc3ByZWFkICogY29zKGFuZ2xlKSk7XG5cdFx0XHRcdGR5ID0gKHBhcmFtcy5yYWRpdXMgKiBwYXJhbXMuc3ByZWFkICogc2luKGFuZ2xlKSk7XG5cblx0XHRcdFx0Ly8gQWRqdXN0IHBvc2l0aW9uIG9mIHNsaWNlXG5cdFx0XHRcdHBhcmFtcy54ICs9IGR4O1xuXHRcdFx0XHRwYXJhbXMueSArPSBkeTtcblxuXHRcdFx0XHQvLyBEcmF3IHNsaWNlXG5cdFx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdFx0Y3R4LmFyYyhwYXJhbXMueCwgcGFyYW1zLnksIHBhcmFtcy5yYWRpdXMsIHBhcmFtcy5zdGFydCwgcGFyYW1zLmVuZCwgcGFyYW1zLmNjdyk7XG5cdFx0XHRcdGN0eC5saW5lVG8ocGFyYW1zLngsIHBhcmFtcy55KTtcblx0XHRcdFx0Ly8gQ2hlY2sgZm9yIGpDYW52YXMgZXZlbnRzXG5cdFx0XHRcdF9kZXRlY3RFdmVudHMoJGNhbnZhc2VzW2VdLCBjdHgsIHBhcmFtcyk7XG5cdFx0XHRcdC8vIEFsd2F5cyBjbG9zZSBwYXRoXG5cdFx0XHRcdHBhcmFtcy5jbG9zZWQgPSB0cnVlO1xuXHRcdFx0XHRfY2xvc2VQYXRoKCRjYW52YXNlc1tlXSwgY3R4LCBwYXJhbXMpO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cdH1cblx0cmV0dXJuICRjYW52YXNlcztcbn07XG5cbi8qIFBhdGggQVBJICovXG5cbi8vIEFkZHMgYXJyb3cgdG8gcGF0aCB1c2luZyB0aGUgZ2l2ZW4gcHJvcGVydGllc1xuZnVuY3Rpb24gX2FkZEFycm93KGNhbnZhcywgY3R4LCBwYXJhbXMsIHBhdGgsIHgxLCB5MSwgeDIsIHkyKSB7XG5cdHZhciBsZWZ0WCwgbGVmdFksXG5cdFx0cmlnaHRYLCByaWdodFksXG5cdFx0b2Zmc2V0WCwgb2Zmc2V0WSxcblx0XHRhbmdsZTtcblxuXHQvLyBJZiBhcnJvdyByYWRpdXMgaXMgZ2l2ZW4gYW5kIHBhdGggaXMgbm90IGNsb3NlZFxuXHRpZiAocGF0aC5hcnJvd1JhZGl1cyAmJiAhcGFyYW1zLmNsb3NlZCkge1xuXG5cdFx0Ly8gQ2FsY3VsYXRlIGFuZ2xlXG5cdFx0YW5nbGUgPSBhdGFuMigoeTIgLSB5MSksICh4MiAtIHgxKSk7XG5cdFx0Ly8gQWRqdXN0IGFuZ2xlIGNvcnJlY3RseVxuXHRcdGFuZ2xlIC09IFBJO1xuXHRcdC8vIENhbGN1bGF0ZSBvZmZzZXQgdG8gcGxhY2UgYXJyb3cgYXQgZWRnZSBvZiBwYXRoXG5cdFx0b2Zmc2V0WCA9IChwYXJhbXMuc3Ryb2tlV2lkdGggKiBjb3MoYW5nbGUpKTtcblx0XHRvZmZzZXRZID0gKHBhcmFtcy5zdHJva2VXaWR0aCAqIHNpbihhbmdsZSkpO1xuXG5cdFx0Ly8gQ2FsY3VsYXRlIGNvb3JkaW5hdGVzIGZvciBsZWZ0IGhhbGYgb2YgYXJyb3dcblx0XHRsZWZ0WCA9IHgyICsgKHBhdGguYXJyb3dSYWRpdXMgKiBjb3MoYW5nbGUgKyAocGF0aC5hcnJvd0FuZ2xlIC8gMikpKTtcblx0XHRsZWZ0WSA9IHkyICsgKHBhdGguYXJyb3dSYWRpdXMgKiBzaW4oYW5nbGUgKyAocGF0aC5hcnJvd0FuZ2xlIC8gMikpKTtcblx0XHQvLyBDYWxjdWxhdGUgY29vcmRpbmF0ZXMgZm9yIHJpZ2h0IGhhbGYgb2YgYXJyb3dcblx0XHRyaWdodFggPSB4MiArIChwYXRoLmFycm93UmFkaXVzICogY29zKGFuZ2xlIC0gKHBhdGguYXJyb3dBbmdsZSAvIDIpKSk7XG5cdFx0cmlnaHRZID0geTIgKyAocGF0aC5hcnJvd1JhZGl1cyAqIHNpbihhbmdsZSAtIChwYXRoLmFycm93QW5nbGUgLyAyKSkpO1xuXG5cdFx0Ly8gRHJhdyBsZWZ0IGhhbGYgb2YgYXJyb3dcblx0XHRjdHgubW92ZVRvKGxlZnRYIC0gb2Zmc2V0WCwgbGVmdFkgLSBvZmZzZXRZKTtcblx0XHRjdHgubGluZVRvKHgyIC0gb2Zmc2V0WCwgeTIgLSBvZmZzZXRZKTtcblx0XHQvLyBEcmF3IHJpZ2h0IGhhbGYgb2YgYXJyb3dcblx0XHRjdHgubGluZVRvKHJpZ2h0WCAtIG9mZnNldFgsIHJpZ2h0WSAtIG9mZnNldFkpO1xuXG5cdFx0Ly8gVmlzdWFsbHkgY29ubmVjdCBhcnJvdyB0byBwYXRoXG5cdFx0Y3R4Lm1vdmVUbyh4MiAtIG9mZnNldFgsIHkyIC0gb2Zmc2V0WSk7XG5cdFx0Y3R4LmxpbmVUbyh4MiArIG9mZnNldFgsIHkyICsgb2Zmc2V0WSk7XG5cdFx0Ly8gTW92ZSBiYWNrIHRvIGVuZCBvZiBwYXRoXG5cdFx0Y3R4Lm1vdmVUbyh4MiwgeTIpO1xuXG5cdH1cbn1cblxuLy8gT3B0aW9uYWxseSBhZGRzIGFycm93IHRvIHN0YXJ0IG9mIHBhdGhcbmZ1bmN0aW9uIF9hZGRTdGFydEFycm93KGNhbnZhcywgY3R4LCBwYXJhbXMsIHBhdGgsIHgxLCB5MSwgeDIsIHkyKSB7XG5cdGlmICghcGF0aC5fYXJyb3dBbmdsZUNvbnZlcnRlZCkge1xuXHRcdHBhdGguYXJyb3dBbmdsZSAqPSBwYXJhbXMuX3RvUmFkO1xuXHRcdHBhdGguX2Fycm93QW5nbGVDb252ZXJ0ZWQgPSB0cnVlO1xuXHR9XG5cdGlmIChwYXRoLnN0YXJ0QXJyb3cpIHtcblx0XHRfYWRkQXJyb3coY2FudmFzLCBjdHgsIHBhcmFtcywgcGF0aCwgeDEsIHkxLCB4MiwgeTIpO1xuXHR9XG59XG5cbi8vIE9wdGlvbmFsbHkgYWRkcyBhcnJvdyB0byBlbmQgb2YgcGF0aFxuZnVuY3Rpb24gX2FkZEVuZEFycm93KGNhbnZhcywgY3R4LCBwYXJhbXMsIHBhdGgsIHgxLCB5MSwgeDIsIHkyKSB7XG5cdGlmICghcGF0aC5fYXJyb3dBbmdsZUNvbnZlcnRlZCkge1xuXHRcdHBhdGguYXJyb3dBbmdsZSAqPSBwYXJhbXMuX3RvUmFkO1xuXHRcdHBhdGguX2Fycm93QW5nbGVDb252ZXJ0ZWQgPSB0cnVlO1xuXHR9XG5cdGlmIChwYXRoLmVuZEFycm93KSB7XG5cdFx0X2FkZEFycm93KGNhbnZhcywgY3R4LCBwYXJhbXMsIHBhdGgsIHgxLCB5MSwgeDIsIHkyKTtcblx0fVxufVxuXG4vLyBEcmF3cyBsaW5lIChpbnRlcm5hbClcbmZ1bmN0aW9uIF9kcmF3TGluZShjYW52YXMsIGN0eCwgcGFyYW1zLCBwYXRoKSB7XG5cdHZhciBsLFxuXHRcdGx4LCBseTtcblx0bCA9IDI7XG5cdF9hZGRTdGFydEFycm93KFxuXHRcdGNhbnZhcywgY3R4LFxuXHRcdHBhcmFtcywgcGF0aCxcblx0XHRwYXRoLngyICsgcGFyYW1zLngsXG5cdFx0cGF0aC55MiArIHBhcmFtcy55LFxuXHRcdHBhdGgueDEgKyBwYXJhbXMueCxcblx0XHRwYXRoLnkxICsgcGFyYW1zLnlcblx0KTtcblx0aWYgKHBhdGgueDEgIT09IHVuZGVmaW5lZCAmJiBwYXRoLnkxICE9PSB1bmRlZmluZWQpIHtcblx0XHRjdHgubW92ZVRvKHBhdGgueDEgKyBwYXJhbXMueCwgcGF0aC55MSArIHBhcmFtcy55KTtcblx0fVxuXHR3aGlsZSAodHJ1ZSkge1xuXHRcdC8vIENhbGN1bGF0ZSBuZXh0IGNvb3JkaW5hdGVzXG5cdFx0bHggPSBwYXRoWyd4JyArIGxdO1xuXHRcdGx5ID0gcGF0aFsneScgKyBsXTtcblx0XHQvLyBJZiBjb29yZGluYXRlcyBhcmUgZ2l2ZW5cblx0XHRpZiAobHggIT09IHVuZGVmaW5lZCAmJiBseSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHQvLyBEcmF3IG5leHQgbGluZVxuXHRcdFx0Y3R4LmxpbmVUbyhseCArIHBhcmFtcy54LCBseSArIHBhcmFtcy55KTtcblx0XHRcdGwgKz0gMTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gT3RoZXJ3aXNlLCBzdG9wIGRyYXdpbmdcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXHRsIC09IDE7XG5cdC8vIE9wdGlvbmFsbHkgYWRkIGFycm93cyB0byBwYXRoXG5cdF9hZGRFbmRBcnJvdyhcblx0XHRjYW52YXMsIGN0eCxcblx0XHRwYXJhbXMsXG5cdFx0cGF0aCxcblx0XHRwYXRoWyd4JyArIChsIC0gMSldICsgcGFyYW1zLngsXG5cdFx0cGF0aFsneScgKyAobCAtIDEpXSArIHBhcmFtcy55LFxuXHRcdHBhdGhbJ3gnICsgbF0gKyBwYXJhbXMueCxcblx0XHRwYXRoWyd5JyArIGxdICsgcGFyYW1zLnlcblx0KTtcbn1cblxuLy8gRHJhd3MgbGluZVxuJC5mbi5kcmF3TGluZSA9IGZ1bmN0aW9uIGRyYXdMaW5lKGFyZ3MpIHtcblx0dmFyICRjYW52YXNlcyA9IHRoaXMsIGUsIGN0eCxcblx0XHRwYXJhbXM7XG5cblx0Zm9yIChlID0gMDsgZSA8ICRjYW52YXNlcy5sZW5ndGg7IGUgKz0gMSkge1xuXHRcdGN0eCA9IF9nZXRDb250ZXh0KCRjYW52YXNlc1tlXSk7XG5cdFx0aWYgKGN0eCkge1xuXG5cdFx0XHRwYXJhbXMgPSBuZXcgakNhbnZhc09iamVjdChhcmdzKTtcblx0XHRcdF9hZGRMYXllcigkY2FudmFzZXNbZV0sIHBhcmFtcywgYXJncywgZHJhd0xpbmUpO1xuXHRcdFx0aWYgKHBhcmFtcy52aXNpYmxlKSB7XG5cblx0XHRcdFx0X3RyYW5zZm9ybVNoYXBlKCRjYW52YXNlc1tlXSwgY3R4LCBwYXJhbXMpO1xuXHRcdFx0XHRfc2V0R2xvYmFsUHJvcHMoJGNhbnZhc2VzW2VdLCBjdHgsIHBhcmFtcyk7XG5cblx0XHRcdFx0Ly8gRHJhdyBlYWNoIHBvaW50XG5cdFx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdFx0X2RyYXdMaW5lKCRjYW52YXNlc1tlXSwgY3R4LCBwYXJhbXMsIHBhcmFtcyk7XG5cdFx0XHRcdC8vIENoZWNrIGZvciBqQ2FudmFzIGV2ZW50c1xuXHRcdFx0XHRfZGV0ZWN0RXZlbnRzKCRjYW52YXNlc1tlXSwgY3R4LCBwYXJhbXMpO1xuXHRcdFx0XHQvLyBPcHRpb25hbGx5IGNsb3NlIHBhdGhcblx0XHRcdFx0X2Nsb3NlUGF0aCgkY2FudmFzZXNbZV0sIGN0eCwgcGFyYW1zKTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXHR9XG5cdHJldHVybiAkY2FudmFzZXM7XG59O1xuXG4vLyBEcmF3cyBxdWFkcmF0aWMgY3VydmUgKGludGVybmFsKVxuZnVuY3Rpb24gX2RyYXdRdWFkcmF0aWMoY2FudmFzLCBjdHgsIHBhcmFtcywgcGF0aCkge1xuXHR2YXIgbCxcblx0XHRseCwgbHksXG5cdFx0bGN4LCBsY3k7XG5cblx0bCA9IDI7XG5cblx0X2FkZFN0YXJ0QXJyb3coXG5cdFx0Y2FudmFzLFxuXHRcdGN0eCxcblx0XHRwYXJhbXMsXG5cdFx0cGF0aCxcblx0XHRwYXRoLmN4MSArIHBhcmFtcy54LFxuXHRcdHBhdGguY3kxICsgcGFyYW1zLnksXG5cdFx0cGF0aC54MSArIHBhcmFtcy54LFxuXHRcdHBhdGgueTEgKyBwYXJhbXMueVxuXHQpO1xuXG5cdGlmIChwYXRoLngxICE9PSB1bmRlZmluZWQgJiYgcGF0aC55MSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0Y3R4Lm1vdmVUbyhwYXRoLngxICsgcGFyYW1zLngsIHBhdGgueTEgKyBwYXJhbXMueSk7XG5cdH1cblx0d2hpbGUgKHRydWUpIHtcblx0XHQvLyBDYWxjdWxhdGUgbmV4dCBjb29yZGluYXRlc1xuXHRcdGx4ID0gcGF0aFsneCcgKyBsXTtcblx0XHRseSA9IHBhdGhbJ3knICsgbF07XG5cdFx0bGN4ID0gcGF0aFsnY3gnICsgKGwgLSAxKV07XG5cdFx0bGN5ID0gcGF0aFsnY3knICsgKGwgLSAxKV07XG5cdFx0Ly8gSWYgY29vcmRpbmF0ZXMgYXJlIGdpdmVuXG5cdFx0aWYgKGx4ICE9PSB1bmRlZmluZWQgJiYgbHkgIT09IHVuZGVmaW5lZCAmJiBsY3ggIT09IHVuZGVmaW5lZCAmJiBsY3kgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Ly8gRHJhdyBuZXh0IGN1cnZlXG5cdFx0XHRjdHgucXVhZHJhdGljQ3VydmVUbyhsY3ggKyBwYXJhbXMueCwgbGN5ICsgcGFyYW1zLnksIGx4ICsgcGFyYW1zLngsIGx5ICsgcGFyYW1zLnkpO1xuXHRcdFx0bCArPSAxO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBPdGhlcndpc2UsIHN0b3AgZHJhd2luZ1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cdGwgLT0gMTtcblx0X2FkZEVuZEFycm93KFxuXHRcdGNhbnZhcyxcblx0XHRjdHgsXG5cdFx0cGFyYW1zLFxuXHRcdHBhdGgsXG5cdFx0cGF0aFsnY3gnICsgKGwgLSAxKV0gKyBwYXJhbXMueCxcblx0XHRwYXRoWydjeScgKyAobCAtIDEpXSArIHBhcmFtcy55LFxuXHRcdHBhdGhbJ3gnICsgbF0gKyBwYXJhbXMueCxcblx0XHRwYXRoWyd5JyArIGxdICsgcGFyYW1zLnlcblx0KTtcbn1cblxuLy8gRHJhd3MgcXVhZHJhdGljIGN1cnZlXG4kLmZuLmRyYXdRdWFkcmF0aWMgPSBmdW5jdGlvbiBkcmF3UXVhZHJhdGljKGFyZ3MpIHtcblx0dmFyICRjYW52YXNlcyA9IHRoaXMsIGUsIGN0eCxcblx0XHRwYXJhbXM7XG5cblx0Zm9yIChlID0gMDsgZSA8ICRjYW52YXNlcy5sZW5ndGg7IGUgKz0gMSkge1xuXHRcdGN0eCA9IF9nZXRDb250ZXh0KCRjYW52YXNlc1tlXSk7XG5cdFx0aWYgKGN0eCkge1xuXG5cdFx0XHRwYXJhbXMgPSBuZXcgakNhbnZhc09iamVjdChhcmdzKTtcblx0XHRcdF9hZGRMYXllcigkY2FudmFzZXNbZV0sIHBhcmFtcywgYXJncywgZHJhd1F1YWRyYXRpYyk7XG5cdFx0XHRpZiAocGFyYW1zLnZpc2libGUpIHtcblxuXHRcdFx0XHRfdHJhbnNmb3JtU2hhcGUoJGNhbnZhc2VzW2VdLCBjdHgsIHBhcmFtcyk7XG5cdFx0XHRcdF9zZXRHbG9iYWxQcm9wcygkY2FudmFzZXNbZV0sIGN0eCwgcGFyYW1zKTtcblxuXHRcdFx0XHQvLyBEcmF3IGVhY2ggcG9pbnRcblx0XHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0XHRfZHJhd1F1YWRyYXRpYygkY2FudmFzZXNbZV0sIGN0eCwgcGFyYW1zLCBwYXJhbXMpO1xuXHRcdFx0XHQvLyBDaGVjayBmb3IgakNhbnZhcyBldmVudHNcblx0XHRcdFx0X2RldGVjdEV2ZW50cygkY2FudmFzZXNbZV0sIGN0eCwgcGFyYW1zKTtcblx0XHRcdFx0Ly8gT3B0aW9uYWxseSBjbG9zZSBwYXRoXG5cdFx0XHRcdF9jbG9zZVBhdGgoJGNhbnZhc2VzW2VdLCBjdHgsIHBhcmFtcyk7XG5cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuICRjYW52YXNlcztcbn07XG5cbi8vIERyYXdzIEJlemllciBjdXJ2ZSAoaW50ZXJuYWwpXG5mdW5jdGlvbiBfZHJhd0JlemllcihjYW52YXMsIGN0eCwgcGFyYW1zLCBwYXRoKSB7XG5cdHZhciBsLCBsYyxcblx0XHRseCwgbHksXG5cdFx0bGN4MSwgbGN5MSxcblx0XHRsY3gyLCBsY3kyO1xuXG5cdGwgPSAyO1xuXHRsYyA9IDE7XG5cblx0X2FkZFN0YXJ0QXJyb3coXG5cdFx0Y2FudmFzLFxuXHRcdGN0eCxcblx0XHRwYXJhbXMsXG5cdFx0cGF0aCxcblx0XHRwYXRoLmN4MSArIHBhcmFtcy54LFxuXHRcdHBhdGguY3kxICsgcGFyYW1zLnksXG5cdFx0cGF0aC54MSArIHBhcmFtcy54LFxuXHRcdHBhdGgueTEgKyBwYXJhbXMueVxuXHQpO1xuXG5cdGlmIChwYXRoLngxICE9PSB1bmRlZmluZWQgJiYgcGF0aC55MSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0Y3R4Lm1vdmVUbyhwYXRoLngxICsgcGFyYW1zLngsIHBhdGgueTEgKyBwYXJhbXMueSk7XG5cdH1cblx0d2hpbGUgKHRydWUpIHtcblx0XHQvLyBDYWxjdWxhdGUgbmV4dCBjb29yZGluYXRlc1xuXHRcdGx4ID0gcGF0aFsneCcgKyBsXTtcblx0XHRseSA9IHBhdGhbJ3knICsgbF07XG5cdFx0bGN4MSA9IHBhdGhbJ2N4JyArIGxjXTtcblx0XHRsY3kxID0gcGF0aFsnY3knICsgbGNdO1xuXHRcdGxjeDIgPSBwYXRoWydjeCcgKyAobGMgKyAxKV07XG5cdFx0bGN5MiA9IHBhdGhbJ2N5JyArIChsYyArIDEpXTtcblx0XHQvLyBJZiBuZXh0IGNvb3JkaW5hdGVzIGFyZSBnaXZlblxuXHRcdGlmIChseCAhPT0gdW5kZWZpbmVkICYmIGx5ICE9PSB1bmRlZmluZWQgJiYgbGN4MSAhPT0gdW5kZWZpbmVkICYmIGxjeTEgIT09IHVuZGVmaW5lZCAmJiBsY3gyICE9PSB1bmRlZmluZWQgJiYgbGN5MiAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHQvLyBEcmF3IG5leHQgY3VydmVcblx0XHRcdGN0eC5iZXppZXJDdXJ2ZVRvKGxjeDEgKyBwYXJhbXMueCwgbGN5MSArIHBhcmFtcy55LCBsY3gyICsgcGFyYW1zLngsIGxjeTIgKyBwYXJhbXMueSwgbHggKyBwYXJhbXMueCwgbHkgKyBwYXJhbXMueSk7XG5cdFx0XHRsICs9IDE7XG5cdFx0XHRsYyArPSAyO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBPdGhlcndpc2UsIHN0b3AgZHJhd2luZ1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cdGwgLT0gMTtcblx0bGMgLT0gMjtcblx0X2FkZEVuZEFycm93KFxuXHRcdGNhbnZhcyxcblx0XHRjdHgsXG5cdFx0cGFyYW1zLFxuXHRcdHBhdGgsXG5cdFx0cGF0aFsnY3gnICsgKGxjICsgMSldICsgcGFyYW1zLngsXG5cdFx0cGF0aFsnY3knICsgKGxjICsgMSldICsgcGFyYW1zLnksXG5cdFx0cGF0aFsneCcgKyBsXSArIHBhcmFtcy54LFxuXHRcdHBhdGhbJ3knICsgbF0gKyBwYXJhbXMueVxuXHQpO1xufVxuXG4vLyBEcmF3cyBCZXppZXIgY3VydmVcbiQuZm4uZHJhd0JlemllciA9IGZ1bmN0aW9uIGRyYXdCZXppZXIoYXJncykge1xuXHR2YXIgJGNhbnZhc2VzID0gdGhpcywgZSwgY3R4LFxuXHRcdHBhcmFtcztcblxuXHRmb3IgKGUgPSAwOyBlIDwgJGNhbnZhc2VzLmxlbmd0aDsgZSArPSAxKSB7XG5cdFx0Y3R4ID0gX2dldENvbnRleHQoJGNhbnZhc2VzW2VdKTtcblx0XHRpZiAoY3R4KSB7XG5cblx0XHRcdHBhcmFtcyA9IG5ldyBqQ2FudmFzT2JqZWN0KGFyZ3MpO1xuXHRcdFx0X2FkZExheWVyKCRjYW52YXNlc1tlXSwgcGFyYW1zLCBhcmdzLCBkcmF3QmV6aWVyKTtcblx0XHRcdGlmIChwYXJhbXMudmlzaWJsZSkge1xuXG5cdFx0XHRcdF90cmFuc2Zvcm1TaGFwZSgkY2FudmFzZXNbZV0sIGN0eCwgcGFyYW1zKTtcblx0XHRcdFx0X3NldEdsb2JhbFByb3BzKCRjYW52YXNlc1tlXSwgY3R4LCBwYXJhbXMpO1xuXG5cdFx0XHRcdC8vIERyYXcgZWFjaCBwb2ludFxuXHRcdFx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0XHRcdF9kcmF3QmV6aWVyKCRjYW52YXNlc1tlXSwgY3R4LCBwYXJhbXMsIHBhcmFtcyk7XG5cdFx0XHRcdC8vIENoZWNrIGZvciBqQ2FudmFzIGV2ZW50c1xuXHRcdFx0XHRfZGV0ZWN0RXZlbnRzKCRjYW52YXNlc1tlXSwgY3R4LCBwYXJhbXMpO1xuXHRcdFx0XHQvLyBPcHRpb25hbGx5IGNsb3NlIHBhdGhcblx0XHRcdFx0X2Nsb3NlUGF0aCgkY2FudmFzZXNbZV0sIGN0eCwgcGFyYW1zKTtcblxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gJGNhbnZhc2VzO1xufTtcblxuLy8gUmV0cmlldmVzIHRoZSB4LWNvb3JkaW5hdGUgZm9yIHRoZSBnaXZlbiB2ZWN0b3IgYW5nbGUgYW5kIGxlbmd0aFxuZnVuY3Rpb24gX2dldFZlY3RvclgocGFyYW1zLCBhbmdsZSwgbGVuZ3RoKSB7XG5cdGFuZ2xlICo9IHBhcmFtcy5fdG9SYWQ7XG5cdGFuZ2xlIC09IChQSSAvIDIpO1xuXHRyZXR1cm4gKGxlbmd0aCAqIGNvcyhhbmdsZSkpO1xufVxuLy8gUmV0cmlldmVzIHRoZSB5LWNvb3JkaW5hdGUgZm9yIHRoZSBnaXZlbiB2ZWN0b3IgYW5nbGUgYW5kIGxlbmd0aFxuZnVuY3Rpb24gX2dldFZlY3RvclkocGFyYW1zLCBhbmdsZSwgbGVuZ3RoKSB7XG5cdGFuZ2xlICo9IHBhcmFtcy5fdG9SYWQ7XG5cdGFuZ2xlIC09IChQSSAvIDIpO1xuXHRyZXR1cm4gKGxlbmd0aCAqIHNpbihhbmdsZSkpO1xufVxuXG4vLyBEcmF3cyB2ZWN0b3IgKGludGVybmFsKSAjMlxuZnVuY3Rpb24gX2RyYXdWZWN0b3IoY2FudmFzLCBjdHgsIHBhcmFtcywgcGF0aCkge1xuXHR2YXIgbCwgYW5nbGUsIGxlbmd0aCxcblx0XHRvZmZzZXRYLCBvZmZzZXRZLFxuXHRcdHgsIHksXG5cdFx0eDMsIHkzLFxuXHRcdHg0LCB5NDtcblxuXHQvLyBEZXRlcm1pbmUgb2Zmc2V0IGZyb20gZHJhZ2dpbmdcblx0aWYgKHBhcmFtcyA9PT0gcGF0aCkge1xuXHRcdG9mZnNldFggPSAwO1xuXHRcdG9mZnNldFkgPSAwO1xuXHR9IGVsc2Uge1xuXHRcdG9mZnNldFggPSBwYXJhbXMueDtcblx0XHRvZmZzZXRZID0gcGFyYW1zLnk7XG5cdH1cblxuXHRsID0gMTtcblx0eCA9IHgzID0geDQgPSBwYXRoLnggKyBvZmZzZXRYO1xuXHR5ID0geTMgPSB5NCA9IHBhdGgueSArIG9mZnNldFk7XG5cblx0X2FkZFN0YXJ0QXJyb3coXG5cdFx0Y2FudmFzLCBjdHgsXG5cdFx0cGFyYW1zLCBwYXRoLFxuXHRcdHggKyBfZ2V0VmVjdG9yWChwYXJhbXMsIHBhdGguYTEsIHBhdGgubDEpLFxuXHRcdHkgKyBfZ2V0VmVjdG9yWShwYXJhbXMsIHBhdGguYTEsIHBhdGgubDEpLFxuXHRcdHgsXG5cdFx0eVxuXHQpO1xuXG5cdC8vIFRoZSB2ZWN0b3Igc3RhcnRzIGF0IHRoZSBnaXZlbiAoeCwgeSkgY29vcmRpbmF0ZXNcblx0aWYgKHBhdGgueCAhPT0gdW5kZWZpbmVkICYmIHBhdGgueSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0Y3R4Lm1vdmVUbyh4LCB5KTtcblx0fVxuXHR3aGlsZSAodHJ1ZSkge1xuXG5cdFx0YW5nbGUgPSBwYXRoWydhJyArIGxdO1xuXHRcdGxlbmd0aCA9IHBhdGhbJ2wnICsgbF07XG5cblx0XHRpZiAoYW5nbGUgIT09IHVuZGVmaW5lZCAmJiBsZW5ndGggIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Ly8gQ29udmVydCB0aGUgYW5nbGUgdG8gcmFkaWFucyB3aXRoIDAgZGVncmVlcyBzdGFydGluZyBhdCBub3J0aFxuXHRcdFx0Ly8gS2VlcCB0cmFjayBvZiBsYXN0IHR3byBjb29yZGluYXRlc1xuXHRcdFx0eDMgPSB4NDtcblx0XHRcdHkzID0geTQ7XG5cdFx0XHQvLyBDb21wdXRlICh4LCB5KSBjb29yZGluYXRlcyBmcm9tIGFuZ2xlIGFuZCBsZW5ndGhcblx0XHRcdHg0ICs9IF9nZXRWZWN0b3JYKHBhcmFtcywgYW5nbGUsIGxlbmd0aCk7XG5cdFx0XHR5NCArPSBfZ2V0VmVjdG9yWShwYXJhbXMsIGFuZ2xlLCBsZW5ndGgpO1xuXHRcdFx0Y3R4LmxpbmVUbyh4NCwgeTQpO1xuXHRcdFx0bCArPSAxO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBPdGhlcndpc2UsIHN0b3AgZHJhd2luZ1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdH1cblx0X2FkZEVuZEFycm93KFxuXHRcdGNhbnZhcywgY3R4LFxuXHRcdHBhcmFtcywgcGF0aCxcblx0XHR4MywgeTMsXG5cdFx0eDQsIHk0XG5cdCk7XG59XG5cbi8vIERyYXdzIHZlY3RvclxuJC5mbi5kcmF3VmVjdG9yID0gZnVuY3Rpb24gZHJhd1ZlY3RvcihhcmdzKSB7XG5cdHZhciAkY2FudmFzZXMgPSB0aGlzLCBlLCBjdHgsXG5cdFx0cGFyYW1zO1xuXG5cdGZvciAoZSA9IDA7IGUgPCAkY2FudmFzZXMubGVuZ3RoOyBlICs9IDEpIHtcblx0XHRjdHggPSBfZ2V0Q29udGV4dCgkY2FudmFzZXNbZV0pO1xuXHRcdGlmIChjdHgpIHtcblxuXHRcdFx0cGFyYW1zID0gbmV3IGpDYW52YXNPYmplY3QoYXJncyk7XG5cdFx0XHRfYWRkTGF5ZXIoJGNhbnZhc2VzW2VdLCBwYXJhbXMsIGFyZ3MsIGRyYXdWZWN0b3IpO1xuXHRcdFx0aWYgKHBhcmFtcy52aXNpYmxlKSB7XG5cblx0XHRcdFx0X3RyYW5zZm9ybVNoYXBlKCRjYW52YXNlc1tlXSwgY3R4LCBwYXJhbXMpO1xuXHRcdFx0XHRfc2V0R2xvYmFsUHJvcHMoJGNhbnZhc2VzW2VdLCBjdHgsIHBhcmFtcyk7XG5cblx0XHRcdFx0Ly8gRHJhdyBlYWNoIHBvaW50XG5cdFx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdFx0X2RyYXdWZWN0b3IoJGNhbnZhc2VzW2VdLCBjdHgsIHBhcmFtcywgcGFyYW1zKTtcblx0XHRcdFx0Ly8gQ2hlY2sgZm9yIGpDYW52YXMgZXZlbnRzXG5cdFx0XHRcdF9kZXRlY3RFdmVudHMoJGNhbnZhc2VzW2VdLCBjdHgsIHBhcmFtcyk7XG5cdFx0XHRcdC8vIE9wdGlvbmFsbHkgY2xvc2UgcGF0aFxuXHRcdFx0XHRfY2xvc2VQYXRoKCRjYW52YXNlc1tlXSwgY3R4LCBwYXJhbXMpO1xuXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiAkY2FudmFzZXM7XG59O1xuXG4vLyBEcmF3cyBhIHBhdGggY29uc2lzdGluZyBvZiBvbmUgb3IgbW9yZSBzdWJwYXRoc1xuJC5mbi5kcmF3UGF0aCA9IGZ1bmN0aW9uIGRyYXdQYXRoKGFyZ3MpIHtcblx0dmFyICRjYW52YXNlcyA9IHRoaXMsIGUsIGN0eCxcblx0XHRwYXJhbXMsXG5cdFx0bCwgbHA7XG5cblx0Zm9yIChlID0gMDsgZSA8ICRjYW52YXNlcy5sZW5ndGg7IGUgKz0gMSkge1xuXHRcdGN0eCA9IF9nZXRDb250ZXh0KCRjYW52YXNlc1tlXSk7XG5cdFx0aWYgKGN0eCkge1xuXG5cdFx0XHRwYXJhbXMgPSBuZXcgakNhbnZhc09iamVjdChhcmdzKTtcblx0XHRcdF9hZGRMYXllcigkY2FudmFzZXNbZV0sIHBhcmFtcywgYXJncywgZHJhd1BhdGgpO1xuXHRcdFx0aWYgKHBhcmFtcy52aXNpYmxlKSB7XG5cblx0XHRcdFx0X3RyYW5zZm9ybVNoYXBlKCRjYW52YXNlc1tlXSwgY3R4LCBwYXJhbXMpO1xuXHRcdFx0XHRfc2V0R2xvYmFsUHJvcHMoJGNhbnZhc2VzW2VdLCBjdHgsIHBhcmFtcyk7XG5cblx0XHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0XHRsID0gMTtcblx0XHRcdFx0d2hpbGUgKHRydWUpIHtcblx0XHRcdFx0XHRscCA9IHBhcmFtc1sncCcgKyBsXTtcblx0XHRcdFx0XHRpZiAobHAgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0bHAgPSBuZXcgakNhbnZhc09iamVjdChscCk7XG5cdFx0XHRcdFx0XHRpZiAobHAudHlwZSA9PT0gJ2xpbmUnKSB7XG5cdFx0XHRcdFx0XHRcdF9kcmF3TGluZSgkY2FudmFzZXNbZV0sIGN0eCwgcGFyYW1zLCBscCk7XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKGxwLnR5cGUgPT09ICdxdWFkcmF0aWMnKSB7XG5cdFx0XHRcdFx0XHRcdF9kcmF3UXVhZHJhdGljKCRjYW52YXNlc1tlXSwgY3R4LCBwYXJhbXMsIGxwKTtcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAobHAudHlwZSA9PT0gJ2JlemllcicpIHtcblx0XHRcdFx0XHRcdFx0X2RyYXdCZXppZXIoJGNhbnZhc2VzW2VdLCBjdHgsIHBhcmFtcywgbHApO1xuXHRcdFx0XHRcdFx0fSBlbHNlIGlmIChscC50eXBlID09PSAndmVjdG9yJykge1xuXHRcdFx0XHRcdFx0XHRfZHJhd1ZlY3RvcigkY2FudmFzZXNbZV0sIGN0eCwgcGFyYW1zLCBscCk7XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKGxwLnR5cGUgPT09ICdhcmMnKSB7XG5cdFx0XHRcdFx0XHRcdF9kcmF3QXJjKCRjYW52YXNlc1tlXSwgY3R4LCBwYXJhbXMsIGxwKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGwgKz0gMTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gQ2hlY2sgZm9yIGpDYW52YXMgZXZlbnRzXG5cdFx0XHRcdF9kZXRlY3RFdmVudHMoJGNhbnZhc2VzW2VdLCBjdHgsIHBhcmFtcyk7XG5cdFx0XHRcdC8vIE9wdGlvbmFsbHkgY2xvc2UgcGF0aFxuXHRcdFx0XHRfY2xvc2VQYXRoKCRjYW52YXNlc1tlXSwgY3R4LCBwYXJhbXMpO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cdH1cblx0cmV0dXJuICRjYW52YXNlcztcbn07XG5cbi8qIFRleHQgQVBJICovXG5cbi8vIENhbGN1bGF0ZXMgZm9udCBzdHJpbmcgYW5kIHNldCBpdCBhcyB0aGUgY2FudmFzIGZvbnRcbmZ1bmN0aW9uIF9zZXRDYW52YXNGb250KGNhbnZhcywgY3R4LCBwYXJhbXMpIHtcblx0Ly8gT3RoZXJ3aXNlLCB1c2UgdGhlIGdpdmVuIGZvbnQgYXR0cmlidXRlc1xuXHRpZiAoIWlzTmFOKE51bWJlcihwYXJhbXMuZm9udFNpemUpKSkge1xuXHRcdC8vIEdpdmUgZm9udCBzaXplIHVuaXRzIGlmIGl0IGRvZXNuJ3QgaGF2ZSBhbnlcblx0XHRwYXJhbXMuZm9udFNpemUgKz0gJ3B4Jztcblx0fVxuXHQvLyBTZXQgZm9udCB1c2luZyBnaXZlbiBmb250IHByb3BlcnRpZXNcblx0Y3R4LmZvbnQgPSBwYXJhbXMuZm9udFN0eWxlICsgJyAnICsgcGFyYW1zLmZvbnRTaXplICsgJyAnICsgcGFyYW1zLmZvbnRGYW1pbHk7XG59XG5cbi8vIE1lYXN1cmVzIGNhbnZhcyB0ZXh0XG5mdW5jdGlvbiBfbWVhc3VyZVRleHQoY2FudmFzLCBjdHgsIHBhcmFtcywgbGluZXMpIHtcblx0dmFyIG9yaWdpbmFsU2l6ZSwgY3VyV2lkdGgsIGwsXG5cdFx0cHJvcENhY2hlID0gY2FjaGVzLnByb3BDYWNoZTtcblxuXHQvLyBVc2VkIGNhY2hlZCB3aWR0aC9oZWlnaHQgaWYgcG9zc2libGVcblx0aWYgKHByb3BDYWNoZS50ZXh0ID09PSBwYXJhbXMudGV4dCAmJiBwcm9wQ2FjaGUuZm9udFN0eWxlID09PSBwYXJhbXMuZm9udFN0eWxlICYmIHByb3BDYWNoZS5mb250U2l6ZSA9PT0gcGFyYW1zLmZvbnRTaXplICYmIHByb3BDYWNoZS5mb250RmFtaWx5ID09PSBwYXJhbXMuZm9udEZhbWlseSAmJiBwcm9wQ2FjaGUubWF4V2lkdGggPT09IHBhcmFtcy5tYXhXaWR0aCAmJiBwcm9wQ2FjaGUubGluZUhlaWdodCA9PT0gcGFyYW1zLmxpbmVIZWlnaHQpIHtcblxuXHRcdHBhcmFtcy53aWR0aCA9IHByb3BDYWNoZS53aWR0aDtcblx0XHRwYXJhbXMuaGVpZ2h0ID0gcHJvcENhY2hlLmhlaWdodDtcblxuXHR9IGVsc2Uge1xuXHRcdC8vIENhbGN1bGF0ZSB0ZXh0IGRpbWVuc2lvbnMgb25seSBvbmNlXG5cblx0XHQvLyBDYWxjdWxhdGUgd2lkdGggb2YgZmlyc3QgbGluZSAoZm9yIGNvbXBhcmlzb24pXG5cdFx0cGFyYW1zLndpZHRoID0gY3R4Lm1lYXN1cmVUZXh0KGxpbmVzWzBdKS53aWR0aDtcblxuXHRcdC8vIEdldCB3aWR0aCBvZiBsb25nZXN0IGxpbmVcblx0XHRmb3IgKGwgPSAxOyBsIDwgbGluZXMubGVuZ3RoOyBsICs9IDEpIHtcblxuXHRcdFx0Y3VyV2lkdGggPSBjdHgubWVhc3VyZVRleHQobGluZXNbbF0pLndpZHRoO1xuXHRcdFx0Ly8gRW5zdXJlIHRleHQncyB3aWR0aCBpcyB0aGUgd2lkdGggb2YgaXRzIGxvbmdlc3QgbGluZVxuXHRcdFx0aWYgKGN1cldpZHRoID4gcGFyYW1zLndpZHRoKSB7XG5cdFx0XHRcdHBhcmFtcy53aWR0aCA9IGN1cldpZHRoO1xuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0Ly8gU2F2ZSBvcmlnaW5hbCBmb250IHNpemVcblx0XHRvcmlnaW5hbFNpemUgPSBjYW52YXMuc3R5bGUuZm9udFNpemU7XG5cdFx0Ly8gVGVtcG9yYXJpbHkgc2V0IGNhbnZhcyBmb250IHNpemUgdG8gcmV0cmlldmUgc2l6ZSBpbiBwaXhlbHNcblx0XHRjYW52YXMuc3R5bGUuZm9udFNpemUgPSBwYXJhbXMuZm9udFNpemU7XG5cdFx0Ly8gU2F2ZSB0ZXh0IHdpZHRoIGFuZCBoZWlnaHQgaW4gcGFyYW1ldGVycyBvYmplY3Rcblx0XHRwYXJhbXMuaGVpZ2h0ID0gcGFyc2VGbG9hdCgkLmNzcyhjYW52YXMsICdmb250U2l6ZScpKSAqIGxpbmVzLmxlbmd0aCAqIHBhcmFtcy5saW5lSGVpZ2h0O1xuXHRcdC8vIFJlc2V0IGZvbnQgc2l6ZSB0byBvcmlnaW5hbCBzaXplXG5cdFx0Y2FudmFzLnN0eWxlLmZvbnRTaXplID0gb3JpZ2luYWxTaXplO1xuXHR9XG59XG5cbi8vIFdyYXBzIGEgc3RyaW5nIG9mIHRleHQgd2l0aGluIGEgZGVmaW5lZCB3aWR0aFxuZnVuY3Rpb24gX3dyYXBUZXh0KGN0eCwgcGFyYW1zKSB7XG5cdHZhciBhbGxUZXh0ID0gU3RyaW5nKHBhcmFtcy50ZXh0KSxcblx0XHQvLyBNYXhpbXVtIGxpbmUgd2lkdGggKG9wdGlvbmFsKVxuXHRcdG1heFdpZHRoID0gcGFyYW1zLm1heFdpZHRoLFxuXHRcdC8vIExpbmVzIGNyZWF0ZWQgYnkgbWFudWFsIGxpbmUgYnJlYWtzIChcXG4pXG5cdFx0bWFudWFsTGluZXMgPSBhbGxUZXh0LnNwbGl0KCdcXG4nKSxcblx0XHQvLyBBbGwgbGluZXMgY3JlYXRlZCBtYW51YWxseSBhbmQgYnkgd3JhcHBpbmdcblx0XHRhbGxMaW5lcyA9IFtdLFxuXHRcdC8vIE90aGVyIHZhcmlhYmxlc1xuXHRcdGxpbmVzLCBsaW5lLCBsLFxuXHRcdHRleHQsIHdvcmRzLCB3O1xuXG5cdC8vIExvb3AgdGhyb3VnaCBtYW51YWxseS1icm9rZW4gbGluZXNcblx0Zm9yIChsID0gMDsgbCA8IG1hbnVhbExpbmVzLmxlbmd0aDsgbCArPSAxKSB7XG5cblx0XHR0ZXh0ID0gbWFudWFsTGluZXNbbF07XG5cdFx0Ly8gU3BsaXQgbGluZSBpbnRvIGxpc3Qgb2Ygd29yZHNcblx0XHR3b3JkcyA9IHRleHQuc3BsaXQoJyAnKTtcblx0XHRsaW5lcyA9IFtdO1xuXHRcdGxpbmUgPSAnJztcblxuXHRcdC8vIElmIHRleHQgaXMgc2hvcnQgZW5vdWdoIGluaXRpYWxseVxuXHRcdC8vIE9yLCBpZiB0aGUgdGV4dCBjb25zaXN0cyBvZiBvbmx5IG9uZSB3b3JkXG5cdFx0aWYgKHdvcmRzLmxlbmd0aCA9PT0gMSB8fCBjdHgubWVhc3VyZVRleHQodGV4dCkud2lkdGggPCBtYXhXaWR0aCkge1xuXG5cdFx0XHQvLyBObyBuZWVkIHRvIHdyYXAgdGV4dFxuXHRcdFx0bGluZXMgPSBbdGV4dF07XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHQvLyBXcmFwIGxpbmVzXG5cdFx0XHRmb3IgKHcgPSAwOyB3IDwgd29yZHMubGVuZ3RoOyB3ICs9IDEpIHtcblxuXHRcdFx0XHQvLyBPbmNlIGxpbmUgZ2V0cyB0b28gd2lkZSwgcHVzaCB3b3JkIHRvIG5leHQgbGluZVxuXHRcdFx0XHRpZiAoY3R4Lm1lYXN1cmVUZXh0KGxpbmUgKyB3b3Jkc1t3XSkud2lkdGggPiBtYXhXaWR0aCkge1xuXHRcdFx0XHRcdC8vIFRoaXMgY2hlY2sgcHJldmVudHMgZW1wdHkgbGluZXMgZnJvbSBiZWluZyBjcmVhdGVkXG5cdFx0XHRcdFx0aWYgKGxpbmUgIT09ICcnKSB7XG5cdFx0XHRcdFx0XHRsaW5lcy5wdXNoKGxpbmUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBTdGFydCBuZXcgbGluZSBhbmQgcmVwZWF0IHByb2Nlc3Ncblx0XHRcdFx0XHRsaW5lID0gJyc7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gQWRkIHdvcmRzIHRvIGxpbmUgdW50aWwgdGhlIGxpbmUgaXMgdG9vIHdpZGVcblx0XHRcdFx0bGluZSArPSB3b3Jkc1t3XTtcblx0XHRcdFx0Ly8gRG8gbm90IGFkZCBhIHNwYWNlIGFmdGVyIHRoZSBsYXN0IHdvcmRcblx0XHRcdFx0aWYgKHcgIT09ICh3b3Jkcy5sZW5ndGggLSAxKSkge1xuXHRcdFx0XHRcdGxpbmUgKz0gJyAnO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQvLyBUaGUgbGFzdCB3b3JkIHNob3VsZCBhbHdheXMgYmUgcHVzaGVkXG5cdFx0XHRsaW5lcy5wdXNoKGxpbmUpO1xuXG5cdFx0fVxuXHRcdC8vIFJlbW92ZSBleHRyYSBzcGFjZSBhdCB0aGUgZW5kIG9mIGVhY2ggbGluZVxuXHRcdGFsbExpbmVzID0gYWxsTGluZXMuY29uY2F0KFxuXHRcdFx0bGluZXNcblx0XHRcdC5qb2luKCdcXG4nKVxuXHRcdFx0LnJlcGxhY2UoLygoXFxuKSl8KCQpL2dpLCAnJDInKVxuXHRcdFx0LnNwbGl0KCdcXG4nKVxuXHRcdCk7XG5cblx0fVxuXG5cdHJldHVybiBhbGxMaW5lcztcbn1cblxuLy8gRHJhd3MgdGV4dCBvbiBjYW52YXNcbiQuZm4uZHJhd1RleHQgPSBmdW5jdGlvbiBkcmF3VGV4dChhcmdzKSB7XG5cdHZhciAkY2FudmFzZXMgPSB0aGlzLCBlLCBjdHgsXG5cdFx0cGFyYW1zLCBsYXllcixcblx0XHRsaW5lcywgbGluZSwgbCxcblx0XHRmb250U2l6ZSwgY29uc3RhbnRDbG9zZW5lc3MgPSA1MDAsXG5cdFx0bmNoYXJzLCBjaGFycywgY2gsIGMsXG5cdFx0eCwgeTtcblxuXHRmb3IgKGUgPSAwOyBlIDwgJGNhbnZhc2VzLmxlbmd0aDsgZSArPSAxKSB7XG5cdFx0Y3R4ID0gX2dldENvbnRleHQoJGNhbnZhc2VzW2VdKTtcblx0XHRpZiAoY3R4KSB7XG5cblx0XHRcdHBhcmFtcyA9IG5ldyBqQ2FudmFzT2JqZWN0KGFyZ3MpO1xuXHRcdFx0X2FkZExheWVyKCRjYW52YXNlc1tlXSwgcGFyYW1zLCBhcmdzLCBkcmF3VGV4dCk7XG5cdFx0XHRpZiAocGFyYW1zLnZpc2libGUpIHtcblxuXHRcdFx0XHQvLyBTZXQgdGV4dC1zcGVjaWZpYyBwcm9wZXJ0aWVzXG5cdFx0XHRcdGN0eC50ZXh0QmFzZWxpbmUgPSBwYXJhbXMuYmFzZWxpbmU7XG5cdFx0XHRcdGN0eC50ZXh0QWxpZ24gPSBwYXJhbXMuYWxpZ247XG5cblx0XHRcdFx0Ly8gU2V0IGNhbnZhcyBmb250IHVzaW5nIGdpdmVuIHByb3BlcnRpZXNcblx0XHRcdFx0X3NldENhbnZhc0ZvbnQoJGNhbnZhc2VzW2VdLCBjdHgsIHBhcmFtcyk7XG5cblx0XHRcdFx0aWYgKHBhcmFtcy5tYXhXaWR0aCAhPT0gbnVsbCkge1xuXHRcdFx0XHRcdC8vIFdyYXAgdGV4dCB1c2luZyBhbiBpbnRlcm5hbCBmdW5jdGlvblxuXHRcdFx0XHRcdGxpbmVzID0gX3dyYXBUZXh0KGN0eCwgcGFyYW1zKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBDb252ZXJ0IHN0cmluZyBvZiB0ZXh0IHRvIGxpc3Qgb2YgbGluZXNcblx0XHRcdFx0XHRsaW5lcyA9IHBhcmFtcy50ZXh0XG5cdFx0XHRcdFx0LnRvU3RyaW5nKClcblx0XHRcdFx0XHQuc3BsaXQoJ1xcbicpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gQ2FsY3VsYXRlIHRleHQncyB3aWR0aCBhbmQgaGVpZ2h0XG5cdFx0XHRcdF9tZWFzdXJlVGV4dCgkY2FudmFzZXNbZV0sIGN0eCwgcGFyYW1zLCBsaW5lcyk7XG5cblx0XHRcdFx0Ly8gSWYgdGV4dCBpcyBhIGxheWVyXG5cdFx0XHRcdGlmIChsYXllcikge1xuXHRcdFx0XHRcdC8vIENvcHkgY2FsY3VsYXRlZCB3aWR0aC9oZWlnaHQgdG8gbGF5ZXIgb2JqZWN0XG5cdFx0XHRcdFx0bGF5ZXIud2lkdGggPSBwYXJhbXMud2lkdGg7XG5cdFx0XHRcdFx0bGF5ZXIuaGVpZ2h0ID0gcGFyYW1zLmhlaWdodDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdF90cmFuc2Zvcm1TaGFwZSgkY2FudmFzZXNbZV0sIGN0eCwgcGFyYW1zLCBwYXJhbXMud2lkdGgsIHBhcmFtcy5oZWlnaHQpO1xuXHRcdFx0XHRfc2V0R2xvYmFsUHJvcHMoJGNhbnZhc2VzW2VdLCBjdHgsIHBhcmFtcyk7XG5cblx0XHRcdFx0Ly8gQWRqdXN0IHRleHQgcG9zaXRpb24gdG8gYWNjb21vZGF0ZSBkaWZmZXJlbnQgaG9yaXpvbnRhbCBhbGlnbm1lbnRzXG5cdFx0XHRcdHggPSBwYXJhbXMueDtcblx0XHRcdFx0aWYgKHBhcmFtcy5hbGlnbiA9PT0gJ2xlZnQnKSB7XG5cdFx0XHRcdFx0aWYgKHBhcmFtcy5yZXNwZWN0QWxpZ24pIHtcblx0XHRcdFx0XHRcdC8vIFJlYWxpZ24gdGV4dCB0byB0aGUgbGVmdCBpZiBjaG9zZW5cblx0XHRcdFx0XHRcdHBhcmFtcy54ICs9IHBhcmFtcy53aWR0aCAvIDI7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdC8vIENlbnRlciB0ZXh0IGJsb2NrIGJ5IGRlZmF1bHRcblx0XHRcdFx0XHRcdHggLT0gcGFyYW1zLndpZHRoIC8gMjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSBpZiAocGFyYW1zLmFsaWduID09PSAncmlnaHQnKSB7XG5cdFx0XHRcdFx0aWYgKHBhcmFtcy5yZXNwZWN0QWxpZ24pIHtcblx0XHRcdFx0XHRcdC8vIFJlYWxpZ24gdGV4dCB0byB0aGUgcmlnaHQgaWYgY2hvc2VuXG5cdFx0XHRcdFx0XHRwYXJhbXMueCAtPSBwYXJhbXMud2lkdGggLyAyO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQvLyBDZW50ZXIgdGV4dCBibG9jayBieSBkZWZhdWx0XG5cdFx0XHRcdFx0XHR4ICs9IHBhcmFtcy53aWR0aCAvIDI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKHBhcmFtcy5yYWRpdXMpIHtcblxuXHRcdFx0XHRcdGZvbnRTaXplID0gcGFyc2VGbG9hdChwYXJhbXMuZm9udFNpemUpO1xuXG5cdFx0XHRcdFx0Ly8gR3JlYXRlciB2YWx1ZXMgbW92ZSBjbG9ja3dpc2Vcblx0XHRcdFx0XHRpZiAocGFyYW1zLmxldHRlclNwYWNpbmcgPT09IG51bGwpIHtcblx0XHRcdFx0XHRcdHBhcmFtcy5sZXR0ZXJTcGFjaW5nID0gZm9udFNpemUgLyBjb25zdGFudENsb3NlbmVzcztcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBMb29wIHRocm91Z2ggZWFjaCBsaW5lIG9mIHRleHRcblx0XHRcdFx0XHRmb3IgKGwgPSAwOyBsIDwgbGluZXMubGVuZ3RoOyBsICs9IDEpIHtcblx0XHRcdFx0XHRcdGN0eC5zYXZlKCk7XG5cdFx0XHRcdFx0XHRjdHgudHJhbnNsYXRlKHBhcmFtcy54LCBwYXJhbXMueSk7XG5cdFx0XHRcdFx0XHRsaW5lID0gbGluZXNbbF07XG5cdFx0XHRcdFx0XHRpZiAocGFyYW1zLmZsaXBBcmNUZXh0KSB7XG5cdFx0XHRcdFx0XHRcdGNoYXJzID0gbGluZS5zcGxpdCgnJyk7XG5cdFx0XHRcdFx0XHRcdGNoYXJzLnJldmVyc2UoKTtcblx0XHRcdFx0XHRcdFx0bGluZSA9IGNoYXJzLmpvaW4oJycpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0bmNoYXJzID0gbGluZS5sZW5ndGg7XG5cdFx0XHRcdFx0XHRjdHgucm90YXRlKC0oUEkgKiBwYXJhbXMubGV0dGVyU3BhY2luZyAqIChuY2hhcnMgLSAxKSkgLyAyKTtcblx0XHRcdFx0XHRcdC8vIExvb3AgdGhyb3VnaCBjaGFyYWN0ZXJzIG9uIGVhY2ggbGluZVxuXHRcdFx0XHRcdFx0Zm9yIChjID0gMDsgYyA8IG5jaGFyczsgYyArPSAxKSB7XG5cdFx0XHRcdFx0XHRcdGNoID0gbGluZVtjXTtcblx0XHRcdFx0XHRcdFx0Ly8gSWYgY2hhcmFjdGVyIGlzIG5vdCB0aGUgZmlyc3QgY2hhcmFjdGVyXG5cdFx0XHRcdFx0XHRcdGlmIChjICE9PSAwKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gUm90YXRlIGNoYXJhY3RlciBvbnRvIGFyY1xuXHRcdFx0XHRcdFx0XHRcdGN0eC5yb3RhdGUoUEkgKiBwYXJhbXMubGV0dGVyU3BhY2luZyk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0Y3R4LnNhdmUoKTtcblx0XHRcdFx0XHRcdFx0Y3R4LnRyYW5zbGF0ZSgwLCAtcGFyYW1zLnJhZGl1cyk7XG5cdFx0XHRcdFx0XHRcdGlmIChwYXJhbXMuZmxpcEFyY1RleHQpIHtcblx0XHRcdFx0XHRcdFx0XHRjdHguc2NhbGUoLTEsIC0xKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRjdHguZmlsbFRleHQoY2gsIDAsIDApO1xuXHRcdFx0XHRcdFx0XHQvLyBQcmV2ZW50IGV4dHJhIHNoYWRvdyBjcmVhdGVkIGJ5IHN0cm9rZSAoYnV0IG9ubHkgd2hlbiBmaWxsIGlzIHByZXNlbnQpXG5cdFx0XHRcdFx0XHRcdGlmIChwYXJhbXMuZmlsbFN0eWxlICE9PSAndHJhbnNwYXJlbnQnKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y3R4LnNoYWRvd0NvbG9yID0gJ3RyYW5zcGFyZW50Jztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRpZiAocGFyYW1zLnN0cm9rZVdpZHRoICE9PSAwKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gT25seSBzdHJva2UgaWYgdGhlIHN0cm9rZSBpcyBub3QgMFxuXHRcdFx0XHRcdFx0XHRcdGN0eC5zdHJva2VUZXh0KGNoLCAwLCAwKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRjdHgucmVzdG9yZSgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cGFyYW1zLnJhZGl1cyAtPSBmb250U2l6ZTtcblx0XHRcdFx0XHRcdHBhcmFtcy5sZXR0ZXJTcGFjaW5nICs9IGZvbnRTaXplIC8gKGNvbnN0YW50Q2xvc2VuZXNzICogMiAqIFBJKTtcblx0XHRcdFx0XHRcdGN0eC5yZXN0b3JlKCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHQvLyBEcmF3IGVhY2ggbGluZSBvZiB0ZXh0IHNlcGFyYXRlbHlcblx0XHRcdFx0XHRmb3IgKGwgPSAwOyBsIDwgbGluZXMubGVuZ3RoOyBsICs9IDEpIHtcblx0XHRcdFx0XHRcdGxpbmUgPSBsaW5lc1tsXTtcblx0XHRcdFx0XHRcdC8vIEFkZCBsaW5lIG9mZnNldCB0byBjZW50ZXIgcG9pbnQsIGJ1dCBzdWJ0cmFjdCBzb21lIHRvIGNlbnRlciBldmVyeXRoaW5nXG5cdFx0XHRcdFx0XHR5ID0gcGFyYW1zLnkgKyAobCAqIHBhcmFtcy5oZWlnaHQgLyBsaW5lcy5sZW5ndGgpIC0gKCgobGluZXMubGVuZ3RoIC0gMSkgKiBwYXJhbXMuaGVpZ2h0IC8gbGluZXMubGVuZ3RoKSAvIDIpO1xuXG5cdFx0XHRcdFx0XHRjdHguc2hhZG93Q29sb3IgPSBwYXJhbXMuc2hhZG93Q29sb3I7XG5cblx0XHRcdFx0XHRcdC8vIEZpbGwgJiBzdHJva2UgdGV4dFxuXHRcdFx0XHRcdFx0Y3R4LmZpbGxUZXh0KGxpbmUsIHgsIHkpO1xuXHRcdFx0XHRcdFx0Ly8gUHJldmVudCBleHRyYSBzaGFkb3cgY3JlYXRlZCBieSBzdHJva2UgKGJ1dCBvbmx5IHdoZW4gZmlsbCBpcyBwcmVzZW50KVxuXHRcdFx0XHRcdFx0aWYgKHBhcmFtcy5maWxsU3R5bGUgIT09ICd0cmFuc3BhcmVudCcpIHtcblx0XHRcdFx0XHRcdFx0Y3R4LnNoYWRvd0NvbG9yID0gJ3RyYW5zcGFyZW50Jztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGlmIChwYXJhbXMuc3Ryb2tlV2lkdGggIT09IDApIHtcblx0XHRcdFx0XHRcdFx0Ly8gT25seSBzdHJva2UgaWYgdGhlIHN0cm9rZSBpcyBub3QgMFxuXHRcdFx0XHRcdFx0XHRjdHguc3Ryb2tlVGV4dChsaW5lLCB4LCB5KTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gQWRqdXN0IGJvdW5kaW5nIGJveCBhY2NvcmRpbmcgdG8gdGV4dCBiYXNlbGluZVxuXHRcdFx0XHR5ID0gMDtcblx0XHRcdFx0aWYgKHBhcmFtcy5iYXNlbGluZSA9PT0gJ3RvcCcpIHtcblx0XHRcdFx0XHR5ICs9IHBhcmFtcy5oZWlnaHQgLyAyO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHBhcmFtcy5iYXNlbGluZSA9PT0gJ2JvdHRvbScpIHtcblx0XHRcdFx0XHR5IC09IHBhcmFtcy5oZWlnaHQgLyAyO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gRGV0ZWN0IGpDYW52YXMgZXZlbnRzXG5cdFx0XHRcdGlmIChwYXJhbXMuX2V2ZW50KSB7XG5cdFx0XHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0XHRcdGN0eC5yZWN0KFxuXHRcdFx0XHRcdFx0cGFyYW1zLnggLSAocGFyYW1zLndpZHRoIC8gMiksXG5cdFx0XHRcdFx0XHRwYXJhbXMueSAtIChwYXJhbXMuaGVpZ2h0IC8gMikgKyB5LFxuXHRcdFx0XHRcdFx0cGFyYW1zLndpZHRoLFxuXHRcdFx0XHRcdFx0cGFyYW1zLmhlaWdodFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0X2RldGVjdEV2ZW50cygkY2FudmFzZXNbZV0sIGN0eCwgcGFyYW1zKTtcblx0XHRcdFx0XHQvLyBDbG9zZSBwYXRoIGFuZCBjb25maWd1cmUgbWFza2luZ1xuXHRcdFx0XHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRfcmVzdG9yZVRyYW5zZm9ybShjdHgsIHBhcmFtcyk7XG5cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0Ly8gQ2FjaGUgakNhbnZhcyBwYXJhbWV0ZXJzIG9iamVjdCBmb3IgZWZmaWNpZW5jeVxuXHRjYWNoZXMucHJvcENhY2hlID0gcGFyYW1zO1xuXHRyZXR1cm4gJGNhbnZhc2VzO1xufTtcblxuLy8gTWVhc3VyZXMgdGV4dCB3aWR0aC9oZWlnaHQgdXNpbmcgdGhlIGdpdmVuIHBhcmFtZXRlcnNcbiQuZm4ubWVhc3VyZVRleHQgPSBmdW5jdGlvbiBtZWFzdXJlVGV4dChhcmdzKSB7XG5cdHZhciAkY2FudmFzZXMgPSB0aGlzLCBjdHgsXG5cdFx0cGFyYW1zLCBsaW5lcztcblxuXHQvLyBBdHRlbXB0IHRvIHJldHJpZXZlIGxheWVyXG5cdHBhcmFtcyA9ICRjYW52YXNlcy5nZXRMYXllcihhcmdzKTtcblx0Ly8gSWYgbGF5ZXIgZG9lcyBub3QgZXhpc3Qgb3IgaWYgcmV0dXJuZWQgb2JqZWN0IGlzIG5vdCBhIGpDYW52YXMgbGF5ZXJcblx0aWYgKCFwYXJhbXMgfHwgKHBhcmFtcyAmJiAhcGFyYW1zLl9sYXllcikpIHtcblx0XHRwYXJhbXMgPSBuZXcgakNhbnZhc09iamVjdChhcmdzKTtcblx0fVxuXG5cdGN0eCA9IF9nZXRDb250ZXh0KCRjYW52YXNlc1swXSk7XG5cdGlmIChjdHgpIHtcblxuXHRcdC8vIFNldCBjYW52YXMgZm9udCB1c2luZyBnaXZlbiBwcm9wZXJ0aWVzXG5cdFx0X3NldENhbnZhc0ZvbnQoJGNhbnZhc2VzWzBdLCBjdHgsIHBhcmFtcyk7XG5cdFx0Ly8gQ2FsY3VsYXRlIHdpZHRoIGFuZCBoZWlnaHQgb2YgdGV4dFxuXHRcdGlmIChwYXJhbXMubWF4V2lkdGggIT09IG51bGwpIHtcblx0XHRcdGxpbmVzID0gX3dyYXBUZXh0KGN0eCwgcGFyYW1zKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bGluZXMgPSBwYXJhbXMudGV4dC5zcGxpdCgnXFxuJyk7XG5cdFx0fVxuXHRcdF9tZWFzdXJlVGV4dCgkY2FudmFzZXNbMF0sIGN0eCwgcGFyYW1zLCBsaW5lcyk7XG5cblxuXHR9XG5cblx0cmV0dXJuIHBhcmFtcztcbn07XG5cbi8qIEltYWdlIEFQSSAqL1xuXG4vLyBEcmF3cyBpbWFnZSBvbiBjYW52YXNcbiQuZm4uZHJhd0ltYWdlID0gZnVuY3Rpb24gZHJhd0ltYWdlKGFyZ3MpIHtcblx0dmFyICRjYW52YXNlcyA9IHRoaXMsIGNhbnZhcywgZSwgY3R4LCBkYXRhLFxuXHRcdHBhcmFtcywgbGF5ZXIsXG5cdFx0aW1nLCBpbWdDdHgsIHNvdXJjZSxcblx0XHRpbWFnZUNhY2hlID0gY2FjaGVzLmltYWdlQ2FjaGU7XG5cblx0Ly8gRHJhdyBpbWFnZSBmdW5jdGlvblxuXHRmdW5jdGlvbiBkcmF3KGNhbnZhcywgY3R4LCBkYXRhLCBwYXJhbXMsIGxheWVyKSB7XG5cblx0XHQvLyBJZiB3aWR0aCBhbmQgc1dpZHRoIGFyZSBub3QgZGVmaW5lZCwgdXNlIGltYWdlIHdpZHRoXG5cdFx0aWYgKHBhcmFtcy53aWR0aCA9PT0gbnVsbCAmJiBwYXJhbXMuc1dpZHRoID09PSBudWxsKSB7XG5cdFx0XHRwYXJhbXMud2lkdGggPSBwYXJhbXMuc1dpZHRoID0gaW1nLndpZHRoO1xuXHRcdH1cblx0XHQvLyBJZiB3aWR0aCBhbmQgc0hlaWdodCBhcmUgbm90IGRlZmluZWQsIHVzZSBpbWFnZSBoZWlnaHRcblx0XHRpZiAocGFyYW1zLmhlaWdodCA9PT0gbnVsbCAmJiBwYXJhbXMuc0hlaWdodCA9PT0gbnVsbCkge1xuXHRcdFx0cGFyYW1zLmhlaWdodCA9IHBhcmFtcy5zSGVpZ2h0ID0gaW1nLmhlaWdodDtcblx0XHR9XG5cblx0XHQvLyBFbnN1cmUgaW1hZ2UgbGF5ZXIncyB3aWR0aCBhbmQgaGVpZ2h0IGFyZSBhY2N1cmF0ZVxuXHRcdGlmIChsYXllcikge1xuXHRcdFx0bGF5ZXIud2lkdGggPSBwYXJhbXMud2lkdGg7XG5cdFx0XHRsYXllci5oZWlnaHQgPSBwYXJhbXMuaGVpZ2h0O1xuXHRcdH1cblxuXHRcdC8vIE9ubHkgY3JvcCBpbWFnZSBpZiBhbGwgY3JvcHBpbmcgcHJvcGVydGllcyBhcmUgZ2l2ZW5cblx0XHRpZiAocGFyYW1zLnNXaWR0aCAhPT0gbnVsbCAmJiBwYXJhbXMuc0hlaWdodCAhPT0gbnVsbCAmJiBwYXJhbXMuc3ggIT09IG51bGwgJiYgcGFyYW1zLnN5ICE9PSBudWxsKSB7XG5cblx0XHRcdC8vIElmIHdpZHRoIGlzIG5vdCBkZWZpbmVkLCB1c2UgdGhlIGdpdmVuIHNXaWR0aFxuXHRcdFx0aWYgKHBhcmFtcy53aWR0aCA9PT0gbnVsbCkge1xuXHRcdFx0XHRwYXJhbXMud2lkdGggPSBwYXJhbXMuc1dpZHRoO1xuXHRcdFx0fVxuXHRcdFx0Ly8gSWYgaGVpZ2h0IGlzIG5vdCBkZWZpbmVkLCB1c2UgdGhlIGdpdmVuIHNIZWlnaHRcblx0XHRcdGlmIChwYXJhbXMuaGVpZ2h0ID09PSBudWxsKSB7XG5cdFx0XHRcdHBhcmFtcy5oZWlnaHQgPSBwYXJhbXMuc0hlaWdodDtcblx0XHRcdH1cblxuXHRcdFx0Ly8gT3B0aW9uYWxseSBjcm9wIGZyb20gdG9wLWxlZnQgY29ybmVyIG9mIHJlZ2lvblxuXHRcdFx0aWYgKHBhcmFtcy5jcm9wRnJvbUNlbnRlcikge1xuXHRcdFx0XHRwYXJhbXMuc3ggKz0gcGFyYW1zLnNXaWR0aCAvIDI7XG5cdFx0XHRcdHBhcmFtcy5zeSArPSBwYXJhbXMuc0hlaWdodCAvIDI7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEVuc3VyZSBjcm9wcGVkIHJlZ2lvbiBkb2VzIG5vdCBlc2NhcGUgaW1hZ2UgYm91bmRhcmllc1xuXG5cdFx0XHQvLyBUb3Bcblx0XHRcdGlmICgocGFyYW1zLnN5IC0gKHBhcmFtcy5zSGVpZ2h0IC8gMikpIDwgMCkge1xuXHRcdFx0XHRwYXJhbXMuc3kgPSAocGFyYW1zLnNIZWlnaHQgLyAyKTtcblx0XHRcdH1cblx0XHRcdC8vIEJvdHRvbVxuXHRcdFx0aWYgKChwYXJhbXMuc3kgKyAocGFyYW1zLnNIZWlnaHQgLyAyKSkgPiBpbWcuaGVpZ2h0KSB7XG5cdFx0XHRcdHBhcmFtcy5zeSA9IGltZy5oZWlnaHQgLSAocGFyYW1zLnNIZWlnaHQgLyAyKTtcblx0XHRcdH1cblx0XHRcdC8vIExlZnRcblx0XHRcdGlmICgocGFyYW1zLnN4IC0gKHBhcmFtcy5zV2lkdGggLyAyKSkgPCAwKSB7XG5cdFx0XHRcdHBhcmFtcy5zeCA9IChwYXJhbXMuc1dpZHRoIC8gMik7XG5cdFx0XHR9XG5cdFx0XHQvLyBSaWdodFxuXHRcdFx0aWYgKChwYXJhbXMuc3ggKyAocGFyYW1zLnNXaWR0aCAvIDIpKSA+IGltZy53aWR0aCkge1xuXHRcdFx0XHRwYXJhbXMuc3ggPSBpbWcud2lkdGggLSAocGFyYW1zLnNXaWR0aCAvIDIpO1xuXHRcdFx0fVxuXG5cdFx0XHRfdHJhbnNmb3JtU2hhcGUoY2FudmFzLCBjdHgsIHBhcmFtcywgcGFyYW1zLndpZHRoLCBwYXJhbXMuaGVpZ2h0KTtcblx0XHRcdF9zZXRHbG9iYWxQcm9wcyhjYW52YXMsIGN0eCwgcGFyYW1zKTtcblxuXHRcdFx0Ly8gRHJhdyBpbWFnZVxuXHRcdFx0Y3R4LmRyYXdJbWFnZShcblx0XHRcdFx0aW1nLFxuXHRcdFx0XHRwYXJhbXMuc3ggLSAocGFyYW1zLnNXaWR0aCAvIDIpLFxuXHRcdFx0XHRwYXJhbXMuc3kgLSAocGFyYW1zLnNIZWlnaHQgLyAyKSxcblx0XHRcdFx0cGFyYW1zLnNXaWR0aCxcblx0XHRcdFx0cGFyYW1zLnNIZWlnaHQsXG5cdFx0XHRcdHBhcmFtcy54IC0gKHBhcmFtcy53aWR0aCAvIDIpLFxuXHRcdFx0XHRwYXJhbXMueSAtIChwYXJhbXMuaGVpZ2h0IC8gMiksXG5cdFx0XHRcdHBhcmFtcy53aWR0aCxcblx0XHRcdFx0cGFyYW1zLmhlaWdodFxuXHRcdFx0KTtcblxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBTaG93IGVudGlyZSBpbWFnZSBpZiBubyBjcm9wIHJlZ2lvbiBpcyBkZWZpbmVkXG5cblx0XHRcdF90cmFuc2Zvcm1TaGFwZShjYW52YXMsIGN0eCwgcGFyYW1zLCBwYXJhbXMud2lkdGgsIHBhcmFtcy5oZWlnaHQpO1xuXHRcdFx0X3NldEdsb2JhbFByb3BzKGNhbnZhcywgY3R4LCBwYXJhbXMpO1xuXG5cdFx0XHQvLyBEcmF3IGltYWdlIG9uIGNhbnZhc1xuXHRcdFx0Y3R4LmRyYXdJbWFnZShcblx0XHRcdFx0aW1nLFxuXHRcdFx0XHRwYXJhbXMueCAtIChwYXJhbXMud2lkdGggLyAyKSxcblx0XHRcdFx0cGFyYW1zLnkgLSAocGFyYW1zLmhlaWdodCAvIDIpLFxuXHRcdFx0XHRwYXJhbXMud2lkdGgsXG5cdFx0XHRcdHBhcmFtcy5oZWlnaHRcblx0XHRcdCk7XG5cblx0XHR9XG5cblx0XHQvLyBEcmF3IGludmlzaWJsZSByZWN0YW5nbGUgdG8gYWxsb3cgZm9yIGV2ZW50cyBhbmQgbWFza2luZ1xuXHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRjdHgucmVjdChcblx0XHRcdHBhcmFtcy54IC0gKHBhcmFtcy53aWR0aCAvIDIpLFxuXHRcdFx0cGFyYW1zLnkgLSAocGFyYW1zLmhlaWdodCAvIDIpLFxuXHRcdFx0cGFyYW1zLndpZHRoLFxuXHRcdFx0cGFyYW1zLmhlaWdodFxuXHRcdCk7XG5cdFx0Ly8gQ2hlY2sgZm9yIGpDYW52YXMgZXZlbnRzXG5cdFx0X2RldGVjdEV2ZW50cyhjYW52YXMsIGN0eCwgcGFyYW1zKTtcblx0XHQvLyBDbG9zZSBwYXRoIGFuZCBjb25maWd1cmUgbWFza2luZ1xuXHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0XHRfcmVzdG9yZVRyYW5zZm9ybShjdHgsIHBhcmFtcyk7XG5cdFx0X2VuYWJsZU1hc2tpbmcoY3R4LCBkYXRhLCBwYXJhbXMpO1xuXHR9XG5cdC8vIE9uIGxvYWQgZnVuY3Rpb25cblx0ZnVuY3Rpb24gb25sb2FkKGNhbnZhcywgY3R4LCBkYXRhLCBwYXJhbXMsIGxheWVyKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uICgpIHtcblx0XHRcdHZhciAkY2FudmFzID0gJChjYW52YXMpO1xuXHRcdFx0ZHJhdyhjYW52YXMsIGN0eCwgZGF0YSwgcGFyYW1zLCBsYXllcik7XG5cdFx0XHRpZiAocGFyYW1zLmxheWVyKSB7XG5cdFx0XHRcdC8vIFRyaWdnZXIgJ2xvYWQnIGV2ZW50IGZvciBsYXllcnNcblx0XHRcdFx0X3RyaWdnZXJMYXllckV2ZW50KCRjYW52YXMsIGRhdGEsIGxheWVyLCAnbG9hZCcpO1xuXHRcdFx0fSBlbHNlIGlmIChwYXJhbXMubG9hZCkge1xuXHRcdFx0XHQvLyBSdW4gJ2xvYWQnIGNhbGxiYWNrIGZvciBub24tbGF5ZXJzXG5cdFx0XHRcdHBhcmFtcy5sb2FkLmNhbGwoJGNhbnZhc1swXSwgbGF5ZXIpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gQ29udGludWUgZHJhd2luZyBzdWNjZXNzaXZlIGxheWVycyBhZnRlciB0aGlzIGltYWdlIGxheWVyIGhhcyBsb2FkZWRcblx0XHRcdGlmIChwYXJhbXMubGF5ZXIpIHtcblx0XHRcdFx0Ly8gU3RvcmUgbGlzdCBvZiBwcmV2aW91cyBtYXNrcyBmb3IgZWFjaCBsYXllclxuXHRcdFx0XHRsYXllci5fbWFza3MgPSBkYXRhLnRyYW5zZm9ybXMubWFza3Muc2xpY2UoMCk7XG5cdFx0XHRcdGlmIChwYXJhbXMuX25leHQpIHtcblx0XHRcdFx0XHQvLyBEcmF3IHN1Y2Nlc3NpdmUgbGF5ZXJzXG5cdFx0XHRcdFx0dmFyIGNvbXBsZXRlID0gZGF0YS5kcmF3TGF5ZXJzQ29tcGxldGU7XG5cdFx0XHRcdFx0ZGVsZXRlIGRhdGEuZHJhd0xheWVyc0NvbXBsZXRlO1xuXHRcdFx0XHRcdCRjYW52YXMuZHJhd0xheWVycyh7XG5cdFx0XHRcdFx0XHRjbGVhcjogZmFsc2UsXG5cdFx0XHRcdFx0XHRyZXNldEZpcmU6IHRydWUsXG5cdFx0XHRcdFx0XHRpbmRleDogcGFyYW1zLl9uZXh0LFxuXHRcdFx0XHRcdFx0Y29tcGxldGU6IGNvbXBsZXRlXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cdGZvciAoZSA9IDA7IGUgPCAkY2FudmFzZXMubGVuZ3RoOyBlICs9IDEpIHtcblx0XHRjYW52YXMgPSAkY2FudmFzZXNbZV07XG5cdFx0Y3R4ID0gX2dldENvbnRleHQoJGNhbnZhc2VzW2VdKTtcblx0XHRpZiAoY3R4KSB7XG5cblx0XHRcdGRhdGEgPSBfZ2V0Q2FudmFzRGF0YSgkY2FudmFzZXNbZV0pO1xuXHRcdFx0cGFyYW1zID0gbmV3IGpDYW52YXNPYmplY3QoYXJncyk7XG5cdFx0XHRsYXllciA9IF9hZGRMYXllcigkY2FudmFzZXNbZV0sIHBhcmFtcywgYXJncywgZHJhd0ltYWdlKTtcblx0XHRcdGlmIChwYXJhbXMudmlzaWJsZSkge1xuXG5cdFx0XHRcdC8vIENhY2hlIHRoZSBnaXZlbiBzb3VyY2Vcblx0XHRcdFx0c291cmNlID0gcGFyYW1zLnNvdXJjZTtcblxuXHRcdFx0XHRpbWdDdHggPSBzb3VyY2UuZ2V0Q29udGV4dDtcblx0XHRcdFx0aWYgKHNvdXJjZS5zcmMgfHwgaW1nQ3R4KSB7XG5cdFx0XHRcdFx0Ly8gVXNlIGltYWdlIG9yIGNhbnZhcyBlbGVtZW50IGlmIGdpdmVuXG5cdFx0XHRcdFx0aW1nID0gc291cmNlO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHNvdXJjZSkge1xuXHRcdFx0XHRcdGlmIChpbWFnZUNhY2hlW3NvdXJjZV0gJiYgaW1hZ2VDYWNoZVtzb3VyY2VdLmNvbXBsZXRlKSB7XG5cdFx0XHRcdFx0XHQvLyBHZXQgdGhlIGltYWdlIGVsZW1lbnQgZnJvbSB0aGUgY2FjaGUgaWYgcG9zc2libGVcblx0XHRcdFx0XHRcdGltZyA9IGltYWdlQ2FjaGVbc291cmNlXTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Ly8gT3RoZXJ3aXNlLCBnZXQgdGhlIGltYWdlIGZyb20gdGhlIGdpdmVuIHNvdXJjZSBVUkxcblx0XHRcdFx0XHRcdGltZyA9IG5ldyBJbWFnZSgpO1xuXHRcdFx0XHRcdFx0Ly8gSWYgc291cmNlIFVSTCBpcyBub3QgYSBkYXRhIFVSTFxuXHRcdFx0XHRcdFx0aWYgKCFzb3VyY2UubWF0Y2goL15kYXRhOi9pKSkge1xuXHRcdFx0XHRcdFx0XHQvLyBTZXQgY3Jvc3NPcmlnaW4gZm9yIHRoaXMgaW1hZ2Vcblx0XHRcdFx0XHRcdFx0aW1nLmNyb3NzT3JpZ2luID0gcGFyYW1zLmNyb3NzT3JpZ2luO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aW1nLnNyYyA9IHNvdXJjZTtcblx0XHRcdFx0XHRcdC8vIFNhdmUgaW1hZ2UgaW4gY2FjaGUgZm9yIGltcHJvdmVkIHBlcmZvcm1hbmNlXG5cdFx0XHRcdFx0XHRpbWFnZUNhY2hlW3NvdXJjZV0gPSBpbWc7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGltZykge1xuXHRcdFx0XHRcdGlmIChpbWcuY29tcGxldGUgfHwgaW1nQ3R4KSB7XG5cdFx0XHRcdFx0XHQvLyBEcmF3IGltYWdlIGlmIGFscmVhZHkgbG9hZGVkXG5cdFx0XHRcdFx0XHRvbmxvYWQoY2FudmFzLCBjdHgsIGRhdGEsIHBhcmFtcywgbGF5ZXIpKCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdC8vIE90aGVyd2lzZSwgZHJhdyBpbWFnZSB3aGVuIGl0IGxvYWRzXG5cdFx0XHRcdFx0XHRpbWcub25sb2FkID0gb25sb2FkKGNhbnZhcywgY3R4LCBkYXRhLCBwYXJhbXMsIGxheWVyKTtcblx0XHRcdFx0XHRcdC8vIEZpeCBvbmxvYWQoKSBidWcgaW4gSUU5XG5cdFx0XHRcdFx0XHRpbWcuc3JjID0gaW1nLnNyYztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gJGNhbnZhc2VzO1xufTtcblxuLy8gQ3JlYXRlcyBhIGNhbnZhcyBwYXR0ZXJuIG9iamVjdFxuJC5mbi5jcmVhdGVQYXR0ZXJuID0gZnVuY3Rpb24gY3JlYXRlUGF0dGVybihhcmdzKSB7XG5cdHZhciAkY2FudmFzZXMgPSB0aGlzLCBjdHgsXG5cdFx0cGFyYW1zLFxuXHRcdGltZywgaW1nQ3R4LFxuXHRcdHBhdHRlcm4sIHNvdXJjZTtcblxuXHQvLyBGdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiBwYXR0ZXJuIGxvYWRzXG5cdGZ1bmN0aW9uIG9ubG9hZCgpIHtcblx0XHQvLyBDcmVhdGUgcGF0dGVyblxuXHRcdHBhdHRlcm4gPSBjdHguY3JlYXRlUGF0dGVybihpbWcsIHBhcmFtcy5yZXBlYXQpO1xuXHRcdC8vIFJ1biBjYWxsYmFjayBmdW5jdGlvbiBpZiBkZWZpbmVkXG5cdFx0aWYgKHBhcmFtcy5sb2FkKSB7XG5cdFx0XHRwYXJhbXMubG9hZC5jYWxsKCRjYW52YXNlc1swXSwgcGF0dGVybik7XG5cdFx0fVxuXHR9XG5cblx0Y3R4ID0gX2dldENvbnRleHQoJGNhbnZhc2VzWzBdKTtcblx0aWYgKGN0eCkge1xuXG5cdFx0cGFyYW1zID0gbmV3IGpDYW52YXNPYmplY3QoYXJncyk7XG5cblx0XHQvLyBDYWNoZSB0aGUgZ2l2ZW4gc291cmNlXG5cdFx0c291cmNlID0gcGFyYW1zLnNvdXJjZTtcblxuXHRcdC8vIERyYXcgd2hlbiBpbWFnZSBpcyBsb2FkZWQgKGlmIGxvYWQoKSBjYWxsYmFjayBmdW5jdGlvbiBpcyBkZWZpbmVkKVxuXG5cdFx0aWYgKGlzRnVuY3Rpb24oc291cmNlKSkge1xuXHRcdFx0Ly8gRHJhdyBwYXR0ZXJuIHVzaW5nIGZ1bmN0aW9uIGlmIGdpdmVuXG5cblx0XHRcdGltZyA9ICQoJzxjYW52YXMgLz4nKVswXTtcblx0XHRcdGltZy53aWR0aCA9IHBhcmFtcy53aWR0aDtcblx0XHRcdGltZy5oZWlnaHQgPSBwYXJhbXMuaGVpZ2h0O1xuXHRcdFx0aW1nQ3R4ID0gX2dldENvbnRleHQoaW1nKTtcblx0XHRcdHNvdXJjZS5jYWxsKGltZywgaW1nQ3R4KTtcblx0XHRcdG9ubG9hZCgpO1xuXG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIE90aGVyd2lzZSwgZHJhdyBwYXR0ZXJuIHVzaW5nIHNvdXJjZSBpbWFnZVxuXG5cdFx0XHRpbWdDdHggPSBzb3VyY2UuZ2V0Q29udGV4dDtcblx0XHRcdGlmIChzb3VyY2Uuc3JjIHx8IGltZ0N0eCkge1xuXHRcdFx0XHQvLyBVc2UgaW1hZ2UgZWxlbWVudCBpZiBnaXZlblxuXHRcdFx0XHRpbWcgPSBzb3VyY2U7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBVc2UgVVJMIGlmIGdpdmVuIHRvIGdldCB0aGUgaW1hZ2Vcblx0XHRcdFx0aW1nID0gbmV3IEltYWdlKCk7XG5cdFx0XHRcdC8vIElmIHNvdXJjZSBVUkwgaXMgbm90IGEgZGF0YSBVUkxcblx0XHRcdFx0aWYgKCFzb3VyY2UubWF0Y2goL15kYXRhOi9pKSkge1xuXHRcdFx0XHRcdC8vIFNldCBjcm9zc09yaWdpbiBmb3IgdGhpcyBpbWFnZVxuXHRcdFx0XHRcdGltZy5jcm9zc09yaWdpbiA9IHBhcmFtcy5jcm9zc09yaWdpbjtcblx0XHRcdFx0fVxuXHRcdFx0XHRpbWcuc3JjID0gc291cmNlO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBDcmVhdGUgcGF0dGVybiBpZiBhbHJlYWR5IGxvYWRlZFxuXHRcdFx0aWYgKGltZy5jb21wbGV0ZSB8fCBpbWdDdHgpIHtcblx0XHRcdFx0b25sb2FkKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpbWcub25sb2FkID0gb25sb2FkO1xuXHRcdFx0XHQvLyBGaXggb25sb2FkKCkgYnVnIGluIElFOVxuXHRcdFx0XHRpbWcuc3JjID0gaW1nLnNyYztcblx0XHRcdH1cblxuXHRcdH1cblxuXHR9IGVsc2Uge1xuXG5cdFx0cGF0dGVybiA9IG51bGw7XG5cblx0fVxuXHRyZXR1cm4gcGF0dGVybjtcbn07XG5cbi8vIENyZWF0ZXMgYSBjYW52YXMgZ3JhZGllbnQgb2JqZWN0XG4kLmZuLmNyZWF0ZUdyYWRpZW50ID0gZnVuY3Rpb24gY3JlYXRlR3JhZGllbnQoYXJncykge1xuXHR2YXIgJGNhbnZhc2VzID0gdGhpcywgY3R4LFxuXHRcdHBhcmFtcyxcblx0XHRncmFkaWVudCxcblx0XHRzdG9wcyA9IFtdLCBuc3RvcHMsXG5cdFx0c3RhcnQsIGVuZCxcblx0XHRpLCBhLCBuLCBwO1xuXG5cdHBhcmFtcyA9IG5ldyBqQ2FudmFzT2JqZWN0KGFyZ3MpO1xuXHRjdHggPSBfZ2V0Q29udGV4dCgkY2FudmFzZXNbMF0pO1xuXHRpZiAoY3R4KSB7XG5cblx0XHQvLyBHcmFkaWVudCBjb29yZGluYXRlcyBtdXN0IGJlIGRlZmluZWRcblx0XHRwYXJhbXMueDEgPSBwYXJhbXMueDEgfHwgMDtcblx0XHRwYXJhbXMueTEgPSBwYXJhbXMueTEgfHwgMDtcblx0XHRwYXJhbXMueDIgPSBwYXJhbXMueDIgfHwgMDtcblx0XHRwYXJhbXMueTIgPSBwYXJhbXMueTIgfHwgMDtcblxuXHRcdGlmIChwYXJhbXMucjEgIT09IG51bGwgJiYgcGFyYW1zLnIyICE9PSBudWxsKSB7XG5cdFx0XHQvLyBDcmVhdGUgcmFkaWFsIGdyYWRpZW50IGlmIGNob3NlblxuXHRcdFx0Z3JhZGllbnQgPSBjdHguY3JlYXRlUmFkaWFsR3JhZGllbnQocGFyYW1zLngxLCBwYXJhbXMueTEsIHBhcmFtcy5yMSwgcGFyYW1zLngyLCBwYXJhbXMueTIsIHBhcmFtcy5yMik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIE90aGVyd2lzZSwgY3JlYXRlIGEgbGluZWFyIGdyYWRpZW50IGJ5IGRlZmF1bHRcblx0XHRcdGdyYWRpZW50ID0gY3R4LmNyZWF0ZUxpbmVhckdyYWRpZW50KHBhcmFtcy54MSwgcGFyYW1zLnkxLCBwYXJhbXMueDIsIHBhcmFtcy55Mik7XG5cdFx0fVxuXG5cdFx0Ly8gQ291bnQgbnVtYmVyIG9mIGNvbG9yIHN0b3BzXG5cdFx0Zm9yIChpID0gMTsgcGFyYW1zWydjJyArIGldICE9PSB1bmRlZmluZWQ7IGkgKz0gMSkge1xuXHRcdFx0aWYgKHBhcmFtc1sncycgKyBpXSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHN0b3BzLnB1c2gocGFyYW1zWydzJyArIGldKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHN0b3BzLnB1c2gobnVsbCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdG5zdG9wcyA9IHN0b3BzLmxlbmd0aDtcblxuXHRcdC8vIERlZmluZSBzdGFydCBzdG9wIGlmIG5vdCBhbHJlYWR5IGRlZmluZWRcblx0XHRpZiAoc3RvcHNbMF0gPT09IG51bGwpIHtcblx0XHRcdHN0b3BzWzBdID0gMDtcblx0XHR9XG5cdFx0Ly8gRGVmaW5lIGVuZCBzdG9wIGlmIG5vdCBhbHJlYWR5IGRlZmluZWRcblx0XHRpZiAoc3RvcHNbbnN0b3BzIC0gMV0gPT09IG51bGwpIHtcblx0XHRcdHN0b3BzW25zdG9wcyAtIDFdID0gMTtcblx0XHR9XG5cblx0XHQvLyBMb29wIHRocm91Z2ggY29sb3Igc3RvcHMgdG8gZmlsbCBpbiB0aGUgYmxhbmtzXG5cdFx0Zm9yIChpID0gMDsgaSA8IG5zdG9wczsgaSArPSAxKSB7XG5cdFx0XHQvLyBBIHByb2dyZXNzaW9uLCBpbiB0aGlzIGNvbnRleHQsIGlzIGRlZmluZWQgYXMgYWxsIG9mIHRoZSBjb2xvciBzdG9wcyBiZXR3ZWVuIGFuZCBpbmNsdWRpbmcgdHdvIGtub3duIGNvbG9yIHN0b3BzXG5cblx0XHRcdGlmIChzdG9wc1tpXSAhPT0gbnVsbCkge1xuXHRcdFx0XHQvLyBTdGFydCBhIG5ldyBwcm9ncmVzc2lvbiBpZiBzdG9wIGlzIGEgbnVtYmVyXG5cblx0XHRcdFx0Ly8gTnVtYmVyIG9mIHN0b3BzIGluIGN1cnJlbnQgcHJvZ3Jlc3Npb25cblx0XHRcdFx0biA9IDE7XG5cdFx0XHRcdC8vIEN1cnJlbnQgaXRlcmF0aW9uIGluIGN1cnJlbnQgcHJvZ3Jlc3Npb25cblx0XHRcdFx0cCA9IDA7XG5cdFx0XHRcdHN0YXJ0ID0gc3RvcHNbaV07XG5cblx0XHRcdFx0Ly8gTG9vayBhaGVhZCB0byBmaW5kIGVuZCBzdG9wXG5cdFx0XHRcdGZvciAoYSA9IChpICsgMSk7IGEgPCBuc3RvcHM7IGEgKz0gMSkge1xuXHRcdFx0XHRcdGlmIChzdG9wc1thXSAhPT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0Ly8gSWYgdGhpcyBmdXR1cmUgc3RvcCBpcyBhIG51bWJlciwgbWFrZSBpdCB0aGUgZW5kIHN0b3AgZm9yIHRoaXMgcHJvZ3Jlc3Npb25cblx0XHRcdFx0XHRcdGVuZCA9IHN0b3BzW2FdO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdC8vIE90aGVyd2lzZSwga2VlcCBsb29raW5nIGFoZWFkXG5cdFx0XHRcdFx0XHRuICs9IDE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gRW5zdXJlIHN0YXJ0IHN0b3AgaXMgbm90IGdyZWF0ZXIgdGhhbiBlbmQgc3RvcFxuXHRcdFx0XHRpZiAoc3RhcnQgPiBlbmQpIHtcblx0XHRcdFx0XHRzdG9wc1thXSA9IHN0b3BzW2ldO1xuXHRcdFx0XHR9XG5cblx0XHRcdH0gZWxzZSBpZiAoc3RvcHNbaV0gPT09IG51bGwpIHtcblx0XHRcdFx0Ly8gQ2FsY3VsYXRlIHN0b3AgaWYgbm90IGluaXRpYWxseSBnaXZlblxuXHRcdFx0XHRwICs9IDE7XG5cdFx0XHRcdHN0b3BzW2ldID0gc3RhcnQgKyAocCAqICgoZW5kIC0gc3RhcnQpIC8gbikpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gQWRkIGNvbG9yIHN0b3AgdG8gZ3JhZGllbnQgb2JqZWN0XG5cdFx0XHRncmFkaWVudC5hZGRDb2xvclN0b3Aoc3RvcHNbaV0sIHBhcmFtc1snYycgKyAoaSArIDEpXSk7XG5cdFx0fVxuXG5cdH0gZWxzZSB7XG5cdFx0Z3JhZGllbnQgPSBudWxsO1xuXHR9XG5cdHJldHVybiBncmFkaWVudDtcbn07XG5cbi8vIE1hbmlwdWxhdGVzIHBpeGVscyBvbiB0aGUgY2FudmFzXG4kLmZuLnNldFBpeGVscyA9IGZ1bmN0aW9uIHNldFBpeGVscyhhcmdzKSB7XG5cdHZhciAkY2FudmFzZXMgPSB0aGlzLFxuXHRcdGNhbnZhcywgZSwgY3R4LCBjYW52YXNEYXRhLFxuXHRcdHBhcmFtcyxcblx0XHRweCxcblx0XHRpbWdEYXRhLCBwaXhlbERhdGEsIGksIGxlbjtcblxuXHRmb3IgKGUgPSAwOyBlIDwgJGNhbnZhc2VzLmxlbmd0aDsgZSArPSAxKSB7XG5cdFx0Y2FudmFzID0gJGNhbnZhc2VzW2VdO1xuXHRcdGN0eCA9IF9nZXRDb250ZXh0KGNhbnZhcyk7XG5cdFx0Y2FudmFzRGF0YSA9IF9nZXRDYW52YXNEYXRhKCRjYW52YXNlc1tlXSk7XG5cdFx0aWYgKGN0eCkge1xuXG5cdFx0XHRwYXJhbXMgPSBuZXcgakNhbnZhc09iamVjdChhcmdzKTtcblx0XHRcdF9hZGRMYXllcihjYW52YXMsIHBhcmFtcywgYXJncywgc2V0UGl4ZWxzKTtcblx0XHRcdF90cmFuc2Zvcm1TaGFwZSgkY2FudmFzZXNbZV0sIGN0eCwgcGFyYW1zLCBwYXJhbXMud2lkdGgsIHBhcmFtcy5oZWlnaHQpO1xuXG5cdFx0XHQvLyBVc2UgZW50aXJlIGNhbnZhcyBvZiB4LCB5LCB3aWR0aCwgb3IgaGVpZ2h0IGlzIG5vdCBkZWZpbmVkXG5cdFx0XHRpZiAocGFyYW1zLndpZHRoID09PSBudWxsIHx8IHBhcmFtcy5oZWlnaHQgPT09IG51bGwpIHtcblx0XHRcdFx0cGFyYW1zLndpZHRoID0gY2FudmFzLndpZHRoO1xuXHRcdFx0XHRwYXJhbXMuaGVpZ2h0ID0gY2FudmFzLmhlaWdodDtcblx0XHRcdFx0cGFyYW1zLnggPSBwYXJhbXMud2lkdGggLyAyO1xuXHRcdFx0XHRwYXJhbXMueSA9IHBhcmFtcy5oZWlnaHQgLyAyO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAocGFyYW1zLndpZHRoICE9PSAwICYmIHBhcmFtcy5oZWlnaHQgIT09IDApIHtcblx0XHRcdFx0Ly8gT25seSBzZXQgcGl4ZWxzIGlmIHdpZHRoIGFuZCBoZWlnaHQgYXJlIG5vdCB6ZXJvXG5cblx0XHRcdFx0aW1nRGF0YSA9IGN0eC5nZXRJbWFnZURhdGEoXG5cdFx0XHRcdFx0KHBhcmFtcy54IC0gKHBhcmFtcy53aWR0aCAvIDIpKSAqIGNhbnZhc0RhdGEucGl4ZWxSYXRpbyxcblx0XHRcdFx0XHQocGFyYW1zLnkgLSAocGFyYW1zLmhlaWdodCAvIDIpKSAqIGNhbnZhc0RhdGEucGl4ZWxSYXRpbyxcblx0XHRcdFx0XHRwYXJhbXMud2lkdGggKiBjYW52YXNEYXRhLnBpeGVsUmF0aW8sXG5cdFx0XHRcdFx0cGFyYW1zLmhlaWdodCAqIGNhbnZhc0RhdGEucGl4ZWxSYXRpb1xuXHRcdFx0XHQpO1xuXHRcdFx0XHRwaXhlbERhdGEgPSBpbWdEYXRhLmRhdGE7XG5cdFx0XHRcdGxlbiA9IHBpeGVsRGF0YS5sZW5ndGg7XG5cblx0XHRcdFx0Ly8gTG9vcCB0aHJvdWdoIHBpeGVscyB3aXRoIHRoZSBcImVhY2hcIiBjYWxsYmFjayBmdW5jdGlvblxuXHRcdFx0XHRpZiAocGFyYW1zLmVhY2gpIHtcblx0XHRcdFx0XHRmb3IgKGkgPSAwOyBpIDwgbGVuOyBpICs9IDQpIHtcblx0XHRcdFx0XHRcdHB4ID0ge1xuXHRcdFx0XHRcdFx0XHRyOiBwaXhlbERhdGFbaV0sXG5cdFx0XHRcdFx0XHRcdGc6IHBpeGVsRGF0YVtpICsgMV0sXG5cdFx0XHRcdFx0XHRcdGI6IHBpeGVsRGF0YVtpICsgMl0sXG5cdFx0XHRcdFx0XHRcdGE6IHBpeGVsRGF0YVtpICsgM11cblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRwYXJhbXMuZWFjaC5jYWxsKGNhbnZhcywgcHgsIHBhcmFtcyk7XG5cdFx0XHRcdFx0XHRwaXhlbERhdGFbaV0gPSBweC5yO1xuXHRcdFx0XHRcdFx0cGl4ZWxEYXRhW2kgKyAxXSA9IHB4Lmc7XG5cdFx0XHRcdFx0XHRwaXhlbERhdGFbaSArIDJdID0gcHguYjtcblx0XHRcdFx0XHRcdHBpeGVsRGF0YVtpICsgM10gPSBweC5hO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBQdXQgcGl4ZWxzIG9uIGNhbnZhc1xuXHRcdFx0XHRjdHgucHV0SW1hZ2VEYXRhKFxuXHRcdFx0XHRcdGltZ0RhdGEsXG5cdFx0XHRcdFx0KHBhcmFtcy54IC0gKHBhcmFtcy53aWR0aCAvIDIpKSAqIGNhbnZhc0RhdGEucGl4ZWxSYXRpbyxcblx0XHRcdFx0XHQocGFyYW1zLnkgLSAocGFyYW1zLmhlaWdodCAvIDIpKSAqIGNhbnZhc0RhdGEucGl4ZWxSYXRpb1xuXHRcdFx0XHQpO1xuXHRcdFx0XHQvLyBSZXN0b3JlIHRyYW5zZm9ybWF0aW9uXG5cdFx0XHRcdGN0eC5yZXN0b3JlKCk7XG5cblx0XHRcdH1cblxuXHRcdH1cblx0fVxuXHRyZXR1cm4gJGNhbnZhc2VzO1xufTtcblxuLy8gUmV0cmlldmVzIGNhbnZhcyBpbWFnZSBhcyBkYXRhIFVSTFxuJC5mbi5nZXRDYW52YXNJbWFnZSA9IGZ1bmN0aW9uIGdldENhbnZhc0ltYWdlKHR5cGUsIHF1YWxpdHkpIHtcblx0dmFyICRjYW52YXNlcyA9IHRoaXMsIGNhbnZhcyxcblx0XHRkYXRhVVJMID0gbnVsbDtcblx0aWYgKCRjYW52YXNlcy5sZW5ndGggIT09IDApIHtcblx0XHRjYW52YXMgPSAkY2FudmFzZXNbMF07XG5cdFx0aWYgKGNhbnZhcy50b0RhdGFVUkwpIHtcblx0XHRcdC8vIEpQRUcgcXVhbGl0eSBkZWZhdWx0cyB0byAxXG5cdFx0XHRpZiAocXVhbGl0eSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHF1YWxpdHkgPSAxO1xuXHRcdFx0fVxuXHRcdFx0ZGF0YVVSTCA9IGNhbnZhcy50b0RhdGFVUkwoJ2ltYWdlLycgKyB0eXBlLCBxdWFsaXR5KTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGRhdGFVUkw7XG59O1xuXG4vLyBTY2FsZXMgY2FudmFzIGJhc2VkIG9uIHRoZSBkZXZpY2UncyBwaXhlbCByYXRpb1xuJC5mbi5kZXRlY3RQaXhlbFJhdGlvID0gZnVuY3Rpb24gZGV0ZWN0UGl4ZWxSYXRpbyhjYWxsYmFjaykge1xuXHR2YXIgJGNhbnZhc2VzID0gdGhpcyxcblx0XHRjYW52YXMsIGUsIGN0eCxcblx0XHRkZXZpY2VQaXhlbFJhdGlvLCBiYWNraW5nU3RvcmVSYXRpbywgcmF0aW8sXG5cdFx0b2xkV2lkdGgsIG9sZEhlaWdodCxcblx0XHRkYXRhO1xuXG5cdGZvciAoZSA9IDA7IGUgPCAkY2FudmFzZXMubGVuZ3RoOyBlICs9IDEpIHtcblx0XHQvLyBHZXQgY2FudmFzIGFuZCBpdHMgYXNzb2NpYXRlZCBkYXRhXG5cdFx0Y2FudmFzID0gJGNhbnZhc2VzW2VdO1xuXHRcdGN0eCA9IF9nZXRDb250ZXh0KGNhbnZhcyk7XG5cdFx0ZGF0YSA9IF9nZXRDYW52YXNEYXRhKCRjYW52YXNlc1tlXSk7XG5cblx0XHQvLyBJZiBjYW52YXMgaGFzIG5vdCBhbHJlYWR5IGJlZW4gc2NhbGVkIHdpdGggdGhpcyBtZXRob2Rcblx0XHRpZiAoIWRhdGEuc2NhbGVkKSB7XG5cblx0XHRcdC8vIERldGVybWluZSBkZXZpY2UgcGl4ZWwgcmF0aW9zXG5cdFx0XHRkZXZpY2VQaXhlbFJhdGlvID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMTtcblx0XHRcdGJhY2tpbmdTdG9yZVJhdGlvID0gY3R4LndlYmtpdEJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHxcblx0XHRcdFx0Y3R4Lm1vekJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHxcblx0XHRcdFx0Y3R4Lm1zQmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fFxuXHRcdFx0XHRjdHgub0JhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHxcblx0XHRcdFx0Y3R4LmJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHwgMTtcblxuXHRcdFx0Ly8gQ2FsY3VsYXRlIGdlbmVyYWwgcmF0aW8gYmFzZWQgb24gdGhlIHR3byBnaXZlbiByYXRpb3Ncblx0XHRcdHJhdGlvID0gZGV2aWNlUGl4ZWxSYXRpbyAvIGJhY2tpbmdTdG9yZVJhdGlvO1xuXG5cdFx0XHRpZiAocmF0aW8gIT09IDEpIHtcblx0XHRcdFx0Ly8gU2NhbGUgY2FudmFzIHJlbGF0aXZlIHRvIHJhdGlvXG5cblx0XHRcdFx0Ly8gR2V0IHRoZSBjdXJyZW50IGNhbnZhcyBkaW1lbnNpb25zIGZvciBmdXR1cmUgdXNlXG5cdFx0XHRcdG9sZFdpZHRoID0gY2FudmFzLndpZHRoO1xuXHRcdFx0XHRvbGRIZWlnaHQgPSBjYW52YXMuaGVpZ2h0O1xuXG5cdFx0XHRcdC8vIFJlc2l6ZSBjYW52YXMgcmVsYXRpdmUgdG8gdGhlIGRldGVybWluZWQgcmF0aW9cblx0XHRcdFx0Y2FudmFzLndpZHRoID0gb2xkV2lkdGggKiByYXRpbztcblx0XHRcdFx0Y2FudmFzLmhlaWdodCA9IG9sZEhlaWdodCAqIHJhdGlvO1xuXG5cdFx0XHRcdC8vIFNjYWxlIGNhbnZhcyBiYWNrIHRvIG9yaWdpbmFsIGRpbWVuc2lvbnMgdmlhIENTU1xuXHRcdFx0XHRjYW52YXMuc3R5bGUud2lkdGggPSBvbGRXaWR0aCArICdweCc7XG5cdFx0XHRcdGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBvbGRIZWlnaHQgKyAncHgnO1xuXG5cdFx0XHRcdC8vIFNjYWxlIGNvbnRleHQgdG8gY291bnRlciB0aGUgbWFudWFsIHNjYWxpbmcgb2YgY2FudmFzXG5cdFx0XHRcdGN0eC5zY2FsZShyYXRpbywgcmF0aW8pO1xuXG5cdFx0XHR9XG5cblx0XHRcdC8vIFNldCBwaXhlbCByYXRpbyBvbiBjYW52YXMgZGF0YSBvYmplY3Rcblx0XHRcdGRhdGEucGl4ZWxSYXRpbyA9IHJhdGlvO1xuXHRcdFx0Ly8gRW5zdXJlIHRoYXQgdGhpcyBtZXRob2QgY2FuIG9ubHkgYmUgY2FsbGVkIG9uY2UgZm9yIGFueSBnaXZlbiBjYW52YXNcblx0XHRcdGRhdGEuc2NhbGVkID0gdHJ1ZTtcblxuXHRcdFx0Ly8gQ2FsbCB0aGUgZ2l2ZW4gY2FsbGJhY2sgZnVuY3Rpb24gd2l0aCB0aGUgcmF0aW8gYXMgaXRzIG9ubHkgYXJndW1lbnRcblx0XHRcdGlmIChjYWxsYmFjaykge1xuXHRcdFx0XHRjYWxsYmFjay5jYWxsKGNhbnZhcywgcmF0aW8pO1xuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH1cblx0cmV0dXJuICRjYW52YXNlcztcbn07XG5cbi8vIENsZWFycyB0aGUgakNhbnZhcyBjYWNoZVxuakNhbnZhcy5jbGVhckNhY2hlID0gZnVuY3Rpb24gY2xlYXJDYWNoZSgpIHtcblx0dmFyIGNhY2hlTmFtZTtcblx0Zm9yIChjYWNoZU5hbWUgaW4gY2FjaGVzKSB7XG5cdFx0aWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChjYWNoZXMsIGNhY2hlTmFtZSkpIHtcblx0XHRcdGNhY2hlc1tjYWNoZU5hbWVdID0ge307XG5cdFx0fVxuXHR9XG59O1xuXG4vLyBFbmFibGUgY2FudmFzIGZlYXR1cmUgZGV0ZWN0aW9uIHdpdGggJC5zdXBwb3J0XG4kLnN1cHBvcnQuY2FudmFzID0gKCQoJzxjYW52YXMgLz4nKVswXS5nZXRDb250ZXh0ICE9PSB1bmRlZmluZWQpO1xuXG4vLyBFeHBvcnQgakNhbnZhcyBmdW5jdGlvbnNcbmV4dGVuZE9iamVjdChqQ2FudmFzLCB7XG5cdGRlZmF1bHRzOiBkZWZhdWx0cyxcblx0c2V0R2xvYmFsUHJvcHM6IF9zZXRHbG9iYWxQcm9wcyxcblx0dHJhbnNmb3JtU2hhcGU6IF90cmFuc2Zvcm1TaGFwZSxcblx0ZGV0ZWN0RXZlbnRzOiBfZGV0ZWN0RXZlbnRzLFxuXHRjbG9zZVBhdGg6IF9jbG9zZVBhdGgsXG5cdHNldENhbnZhc0ZvbnQ6IF9zZXRDYW52YXNGb250LFxuXHRtZWFzdXJlVGV4dDogX21lYXN1cmVUZXh0XG59KTtcbiQuakNhbnZhcyA9IGpDYW52YXM7XG4kLmpDYW52YXNPYmplY3QgPSBqQ2FudmFzT2JqZWN0O1xuXG59KSk7XG4iXSwic291cmNlUm9vdCI6IiJ9