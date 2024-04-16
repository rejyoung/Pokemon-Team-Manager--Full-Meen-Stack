const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.Types.ObjectId;


const moveSchema = new mongoose.Schema({
	Level: {
		type: Number,
		required: true,
		default: ""
	}, 
	MoveName: {
		type: String,
		required: true
	}
},
{_id: false}
)

const evolutionSchema = new mongoose.Schema({
	SpeciesName: {
		type: String,
		required: true
	},
	MinLevel: {
		type: Number,
		required: true,
		default: 0
	},
},
{_id: false}
)

const evolutionTreeSchema = new mongoose.Schema({
	basePokemon: {
		type: String
	},
	firstEvolution: [evolutionSchema],
	finalEvolution: [evolutionSchema]
},
{_id: false})

const pokemonSchema = new mongoose.Schema(
	{
		Name: {
			type: String,
			required: true,
			unique: true,
		},
		Type: [{
			type: String,
			required: true,
			lowercase: true
		}],
		PokedexID: {
			type: Number,
			required: true,
		},
		StartingLevel: {
			type: Number,
			required: true,
			default: 1
		},
		EvolutionLevel: {
			type: Number,
			required: true,
			default: 0
		},
		ImgPath: {
			type: String
		},
		Moves: [moveSchema],
		EvolutionTree: evolutionTreeSchema,
		NextEvolution: [evolutionSchema],
		TeamsOn: [
				{
					type: ObjectId,
					ref: "trainers",
				},
			],
	},
);


const Pokemon = mongoose.model("Pokemon", pokemonSchema);

module.exports = Pokemon;
