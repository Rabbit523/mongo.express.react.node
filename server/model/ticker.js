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
var TickerSchema = new Schema({
  ticker: { type: String, required: true }  
}, {
  // Define MongoDB Collection
  collection: 'ticker'
}, schemaOptions);

module.exports = mongoose.model('Ticker', TickerSchema); // Export Puzzle Model for us in API