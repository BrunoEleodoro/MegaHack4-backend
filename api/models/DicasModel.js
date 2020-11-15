var mongoose = require("mongoose");

var DicasSchema = new mongoose.Schema({
	title: { type: String, required: true },
	description: { type: String, required: true },
	image: { type: String, required: false }
}, { timestamps: true });

module.exports = mongoose.model("Dicas", DicasSchema);
