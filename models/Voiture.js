const mongoose = require('mongoose');

const Voiture = mongoose.Schema({
    numero:String,
    modele :String,
    dateAjout : {
        type :Date,
    },
    enCoursDepot : {
        type : Boolean,
        default :true
    }
})
module.exports = Voiture;