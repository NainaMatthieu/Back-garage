const { request, response } = require('express');
const express = require('express');
const router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;


const Benefice = require('../models/Benefice');



router.get('/find/:mois/:annee',(req,res)=>{
    Benefice.find({mois:req.params.mois,annee:req.params.annee},(err,docs)=>{
        if (!err) { res.send(docs); }
        else { console.log('Erreur : ' + JSON.stringify(err, undefined, 2)); }
    });
});

router.get('/insert/:salaire/:loyer/:achatPiece/:autres/:mois/:annee/:benefice',(req,res)=>{
    var benefice = new Benefice({
        salaire:req.params.salaire,
        loyer:req.params.loyer,
        achat_piece:req.params.achatPiece,
        autres_depenses:req.params.autres,
        mois:req.params.mois,
        annee:req.params.annee,
        benefice:req.params.benefice
    });
    benefice.save((err, doc) => {
        if (!err) { res.send(doc); }
        else { console.log('Error') }
    });
})

module.exports = router;

