# Backbone.ValidityModel

Backbone.ValidityModel provides a declarative validation facility for Backbone models. It allows for AngularJS-like databinding of validation messages when used in conjunction with the databinding facility of your choice, all in under two kilobytes (minified).

Backbone.ValidityModel works by storing validity metadata for the model in either the model itself, or a separate Backbone.Model (the *validity model*).  Backbone.ValidityModel makes no attempt whatsoever to integrate with or make use of Backbone's built-in validation infrastructure, as it operates under the assumption that the model should always reflect the view regardless of whether or not the model is valid.

## Up and running in 60 seconds:

Declare tests for your model attributes in the `validation` property of the model:
```js
var MyModel = Backbone.Model.extend({
	initialize: function() {
		Backbone.ValidityModel.bind(this);
	},
	validation: {
		name: {
			required: function(value) { return  '' !== value; },
			length: function(value) { return value.length >= 3; }
		}
	}	
});
```

Test the validity of the model:
```js
if(model.get('$invalid'))
	alert('model is invalid!');
```	

Test the validity of a specific attribute:
```js
if(model.get('$invalid/name'))
	alert('name is invalid!');
```	

Test the validity of a specific attribute test:
```js
if(model.get('$invalid/name/required'))
	alert('name is required!');
```

Use the validity model with the databinding facility of your choice:
```html
<div data-bind-show="model.$invalid">
	<div>Validation Errors:</div>
	<ul>
		<li data-bind-show="model.$invalid/name">
			Invalid name:
			<span data-bind-show="model.$invalid/name/required">name is required.</span>
			<span data-bind-show="model.$invalid/name/length">name must be at least 3 characters long.</span>
		</li>
	</ul>
</div>
```

Avoid polluting your model with metadata by using a separate validity model:
```js
Backbone.ValidityModel.bind(model, validityModel);
```

Listen for changes in validation state:
```js
model.on('valid', function() { alert('model valid!'); });
model.on('invalid:name', function() { alert('name is invalid!'); });
model.on('invalid:name/required', function() { alert('name is required!'); });
```

## Configuration
```js
Backbone.ValidityModel.configure({
	// Enable/disable triggering validation events.
	events: true,

	// Stop evaluating an attribute's test after one fails. All subsequent tests will
	// be reported successful until the failing test passes.
	lazy: true,

	// Enable/disable triggering validation events on the model.
	// `events` must be true.
	modelEvents: true,
	
	// Specify the separator used to generate keys in the validity model. This should be
	// something that does not conflict with your databinding facility (for example,
	// '.' will not work with rivets.js).
	separator: '/',

	// Specify the model property defining attribute tests.
	validationProperty: 'validation',

	// Enable/disable triggering validation events on the validity model.
	// `events` must be true.
	validityModelEvents: true
});
```
