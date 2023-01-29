const mongoose = require('mongoose');
const Piece = require('./Piece');
const demandePaiementSchema = mongoose.Schema({
    idReparation:String,
    totalDue : String,
    piece : {},
    date : {
        type : Date
    },
    idVoiture :String,
    idUser:String,
    valid :{
        type : Boolean,
        default : false
    }
});

module.exports = mongoose.model('DemandePaiement',demandePaiementSchema);