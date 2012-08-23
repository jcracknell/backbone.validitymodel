(function() {

describe('binding', function() {

	var TestModel = Backbone.Model.extend({
		defaults: {
			name: '',
			age: 0
		},
		initialize: function() {
			Backbone.ValidityModel.bind(this);
		},
		validation: {
			name: {
				required: function(value) { return '' !== value; },
				length: function(value) { return value.length >= 3; }
			},
			age: {
				required: function(value) { return !!value; },
				positive: function(value) { return +value > 0; }
			}
		}	
	});

	var PristineTestModel = TestModel.extend({
		initialize: function() { }
	});

	describe('with separate validity model', function() {
		var validityModel;
		var model;

		beforeEach(function() {
			validityModel = new Backbone.Model();
			model = new PristineTestModel();

			Backbone.ValidityModel.bind(model, validityModel);
		});

		it('should store validity metadata in the validity model', function() {
			expect(model.get('$valid')).toBeUndefined();
			expect(model.get('$invalid')).toBeUndefined();
			expect(validityModel.get('$valid')).toEqual(false);
			expect(validityModel.get('$invalid')).toEqual(true);
		});

		it('should trigger validity events on both the model and validity model', function() {
			var modelTriggered = false;
			var validityModelTriggered = false;
			model.on('valid:name', function() { modelTriggered = true; });
			validityModel.on('valid:name', function() { validityModelTriggered = true; });

			model.set('name', 'James Cracknell');

			expect(modelTriggered).toEqual(true);
			expect(validityModelTriggered).toEqual(true);
		});
	});
	
	describe('when the model defines no validation', function() {

		var NoValidationModel = Backbone.Model.extend({
			initialize: function() {
				Backbone.ValidityModel.bind(this);
			}
		});

		it('should be valid', function() {
			var model = new NoValidationModel();	

			expect(model.get('$valid')).toEqual(true);
			expect(model.get('$invalid')).toEqual(false);
		});
	});

	describe('when the model defines no validatable attributes', function() {
		var NoAttributeTestsModel = Backbone.Model.extend({
			defaults: function() {
				name: ''
			},
			initialize: function() {
				Backbone.ValidityModel.bind(this);
			},
			validation: {
			}
		});

		it('should work', function() {
			var model = new NoAttributeTestsModel();

			expect(model.get('$valid')).toEqual(true);
			expect(model.get('$invalid')).toEqual(false);
			expect(model.get('$valid/name')).toBeUndefined();
			expect(model.get('$invalid/name')).toBeUndefined();
		});
	});
});

})();
