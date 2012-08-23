/*
Backbone.ValidityModel.js
(c) 2012 Jamse Cracknell
Backbone.ValidityModel may be freely distributed under the WTFPL.
For more information visit:
http://github.com/jcracknell/backbone.validitymodel
*/ 
(function(_, Backbone) {
	if(!_) throw 'Backbone.ValidityModel requires underscore.js';
	if(!Backbone) throw 'Backbone.ValidityModel requires backbone.js';

	var __module__ = Backbone.ValidityModel || (Backbone.ValidityModel = { });

	var configuration = {
		events: true,
		lazy: true,
		modelEvents: true,
		separator: '/',
		testsProperty: 'validation',
		validityModelEvents: true
	};

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
				var modelValidity = true;

				_.each(this._model[configuration.testsProperty], function(tests, attributeName) {
					var attributeValidity = true;

					_.each(tests, function(test, testName) {
						// If lazy mode is enabled then only run the test if the attribute
						// is still valid (if no previous test has failed)
						var testValidity = (configuration.lazy && !attributeValidity)
							|| !!test.call(this._model, this._model.get(attributeName));

						// Update the validity dependency chain
						modelValidity &= attributeValidity &= testValidity;	

						this._updateValidity([attributeName, testName], testValidity);
					}, this);

					this._updateValidity([attributeName], attributeValidity);
				}, this);

				this._updateValidity([], modelValidity);
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
		configure: function(o) { _.extend(configuration, o); }
	});

})(_, Backbone);
