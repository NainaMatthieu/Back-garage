const mongoose = require('mongoose');

const beneficeSchema = mongoose.Schema({
    salaire : Number,
    loyer : Number,
    achat_piece : Number,
    autres_depenses : Number,
    mois : Number,
    annee : Number,
    benefice : Number
})
module.exports = mongoose.model('Benefice',beneficeSchema);