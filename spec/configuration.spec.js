(function() {

describe('configuration', function() {
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

	afterEach(function() {
		Backbone.ValidityModel.resetConfiguration();
	});

	describe('events', function() {
	}); // events


	describe('lazy', function() {

		it('is true', function() {
			Backbone.ValidityModel.configure({ lazy: true });
			var model = new TestModel();

			expect(model.get('$invalid')).toEqual(true);
			expect(model.get('$invalid/name')).toEqual(true);
			expect(model.get('$invalid/name/required')).toEqual(true);
			expect(model.get('$invalid/name/length')).toEqual(false);
			expect(model.get('$invalid/age')).toEqual(true);
			expect(model.get('$invalid/age/required')).toEqual(true);
			expect(model.get('$invalid/age/positive')).toEqual(false);
		});

		it('is false', function() {
			Backbone.ValidityModel.configure({ lazy: false });
			var model = new TestModel();

			expect(model.get('$invalid')).toEqual(true);
			expect(model.get('$invalid/name')).toEqual(true);
			expect(model.get('$invalid/name/required')).toEqual(true);
			expect(model.get('$invalid/name/length')).toEqual(true);
			expect(model.get('$invalid/age')).toEqual(true);
			expect(model.get('$invalid/age/required')).toEqual(true);
			expect(model.get('$invalid/age/positive')).toEqual(true);
		});	

	}); // lazy

	describe('modelEvents', function() {
	}); // modelEvents

	describe('separator', function() {

		describe('is "#"', function() {
			beforeEach(function() {
				Backbone.ValidityModel.configure({ separator: '#' });
			});

			it('path separator should be "#"', function() {
				var model = new TestModel();

				expect(model.get('$valid')).toEqual(false);
				expect(model.get('$invalid')).toEqual(true);
				expect(model.get('$valid/name')).toBeUndefined();
				expect(model.get('$invalid/name')).toBeUndefined();
				expect(model.get('$valid#name')).toEqual(false);
				expect(model.get('$invalid#name')).toEqual(true);
				expect(model.get('$valid#name#required')).toEqual(false);
				expect(model.get('$invalid#name#required')).toEqual(true);
			});

			it('event separator should be "#"', function() {
				var badEventTriggered = false;
				var goodEventTriggered = false;
				var model = new TestModel();

				model.on('valid:name/required', function() { badEventTriggered = true; });
				model.on('valid:name#required', function() { goodEventTriggered = true; });
				model.set('name', 'James Cracknell');

				expect(badEventTriggered).toEqual(false);
				expect(goodEventTriggered).toEqual(true);
			});
		});

	}); // separator

	describe('validityModelEvents', function() {
	}); // validityModelEvents
});

})();
