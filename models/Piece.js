const mongoose = require('mongoose');
const pieceSchema = mongoose.Schema({
    designation:String,
    prix:Number
})
module.exports = mongoose.model('Piece',pieceSchema);