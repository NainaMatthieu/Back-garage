const mongoose = require('mongoose');
const Voiture = require('./Voiture');

const DemandeDepotSchema = mongoose.Schema({
    idUser:String,
    date : {
        type : Date,
        default : Date.now
    },
    voiture : Voiture,
    confirm : {
        type : Boolean,
        default : false
    }
})
module.exports = mongoose.model('DemandeDepotVoiture',DemandeDepotSchema);