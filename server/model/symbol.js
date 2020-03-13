var mongoose = require('mongoose'); // Import Mongoose Package
var Schema = mongoose.Schema; // Assign Mongoose Schema function to variable

// SchemaOptions
let schemaOptions = {
	timestamps: true,
	toObject: {
		virtuals: true
	},
	toJSON: {
		virtuals: true
	}
};

// User Mongoose Schema
var SymbolSchema = new Schema({
  ticker: { type: String, required: true },
  time_o: { type: Number, required: true },
  time_t: { type: Date, required: true }
}, {
  // Define MongoDB Collection
  collection: 'symbol'
}, schemaOptions);

module.exports = mongoose.model('Symbol', SymbolSchema); // Export Puzzle Model for us in API