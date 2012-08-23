/*
Backbone.ValidityModel.js
(c) 2012 James Cracknell
Backbone.ValidityModel may be freely distributed under the WTFPL.
For more information visit:
http://github.com/jcracknell/backbone.validitymodel
*/ 
(function(_, Backbone) {

var __name__ = 'Backbone.ValidityModel';

if(!_) throw __name__ + ' requires underscore.js';
if(!Backbone) throw __name__ + ' requires backbone.js';

var __module__ = Backbone.ValidityModel || (Backbone.ValidityModel = { });

var defaultConfiguration = {
	events: true,
	lazy: true,
	modelEvents: true,
	separator: '/',
	validationProperty: 'validation',
	validityModelEvents: true
};

var configuration;

var Binding = (function() {
	function Binding(model, validityModel) {
		if(!_.isObject(model)) throw 'expected model';
		this._model = model;
		this._validityModel = validityModel || model;
	}

	_.extend(Binding.prototype, {
		bind: function() {
			this._validate();
			this._model.on('change', this._validate, this);
		},
		unbind: function() {
			this._model.off('change', this._validate, this);
		},
		_updateValidity: function(path, validity) {
			var validKey = ['$valid'].concat(path).join(configuration.separator);
			var invalidKey = ['$invalid'].concat(path).join(configuration.separator);

			// Check if this update represents a change in state
			if(this._validityModel.get(validKey) === validity) return;

			this._validityModel.set(validKey, validity);
			this._validityModel.set(invalidKey, !validity);

			if(!(configuration.events && (configuration.modelEvents || configuration.validityModelEvents))) return;

			var e = (validity ? 'valid' : 'invalid') + (path.length ? ':' + path.join(configuration.separator) : '');

			// Trigger the event on the model if model events are enabled
			if(configuration.modelEvents)
				this._model.trigger(e);
			// Trigger the event on the validity model if validity model events are enabled
			// and the event has not already been triggered (model events enabled and the model
			// is the validity model)
			if(configuration.validityModelEvents && !(configuration.modelEvents && this._validityModel === this._model))
				this._validityModel.trigger(e);
		},
		_validate: function() {
			var model = this._model;
			var validity = true;

			_.each(model[configuration.validationProperty], function(attributeTests, attributeName) {
				var attributeValidity = true;

				_.each(attributeTests, function(attributeTest, attributeTestName) {
					// If lazy mode is enabled then only run the test if the attribute
					// is still valid (if no previous test has failed)
					var attributeTestValidity = !!(
						(configuration.lazy && !attributeValidity)
						|| attributeTest.call(model, model.get(attributeName))
					);

					// Update the validity dependency chain
					// Cannot use &= here because it coerces to number
					attributeValidity = attributeValidity && attributeTestValidity;
					validity = validity && attributeTestValidity;

					this._updateValidity([attributeName, attributeTestName], attributeTestValidity);
				}, this);

				this._updateValidity([attributeName], attributeValidity);
			}, this);

			this._updateValidity([], validity);
		}
	});

	return Binding;
})();

_.extend(__module__, {
	bind: function(model, validityModel) {
		var binding = new Binding(model, validityModel);
		binding.bind();
		return binding;
	},
	configure: function(o) {
		_.extend(configuration, o);
	},
	resetConfiguration: function(o) {
		configuration = _.extend({}, defaultConfiguration);
	}
});

__module__.resetConfiguration();

})(_, Backbone);
