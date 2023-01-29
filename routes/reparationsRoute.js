const { request, response } = require('express');
const express = require('express');
const router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;



const Utilisateur = require('../models/Utilisateur');
const ReparationsVoiture = require('../models/ReparationsVoiture');
const DemandePaiement = require('../models/DemandePaiement');
const Piece = require('../models/Piece')


router.get('/', (req, res) => {
    ReparationsVoiture.find((err, docs) => {
        if (!err) { res.send(docs); }
        else { console.log('Erreur : ' + JSON.stringify(err, undefined, 2)); }
    });
});

router.get('/:idUser', (req, res) => {
    ReparationsVoiture.find({idUtilisateur:req.params.idUser},(err, docs) => {
        if (!err) { res.send(docs); }
        else { console.log('Erreur : ' + JSON.stringify(err, undefined, 2)); }
    });
});


router.post('/insert', (req, res) => {
    var rep = new ReparationsVoiture({
        idVoiture: req.body.idVoiture,
        idUtilisateur: req.body.idUser,
        listeReparation : [],
        dateArrivee:new Date(),
        dateSortie:null,
        estDepose:false
    });
    rep.save()
            .then(async success=> {
                let rep = {
                    message : 'OK',
                    code :200,
                    value : success
                }
                console.log('_______________________Depot voiture SUCCES_____________________________');
                console.log(success);

                const utilisateur = await Utilisateur.findById(success.idUtilisateur);
                console.log('**************************************************')
                console.log(utilisateur);
                console.log('**************************************************')

                const voitureToUpdate=  utilisateur.listeVoiture.find(voiture => voiture._id==success.idVoiture);
                voitureToUpdate.enCoursDepot = false;
                utilisateur.save()
                    .catch(diso=>{
                        console.log('___________________UPDATE enCoursDepot ERREUR___________________');
                        let rep = {
                            message : 'KO',
                            code :404,
                            err :'erreur de changement d\' en cours de dépot',
                            value : diso
                        } 
                        res.json(rep); 
                        console.log('Erreur : ' + diso) 
                    })
                console.log(rep);
                res.json(rep); 
            })
            .catch(erreur=>{
                let rep = {
                    message : 'KO',
                    code :404,
                    value : erreur
                } 
                console.log('_______________________Depot voiture ERREUR_____________________________');
                res.json(rep); 
                console.log('Erreur : ' + erreur) 
            })
});

router.put('/add/:id', (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send('No record with given id :' + (req.params.id));
    var reparation = {
        listeReparation : [{
            idPiece:req.body.idPiece,
            prix:req.body.prix,
            avancement:req.body.avancement,
            description:req.body.description,
            estPaye:false,
            datePaiement:null,
            dateDebut:null,
            dateFin:null
        }],
    };
    ReparationsVoiture.findByIdAndUpdate(req.params.id, { $push: reparation }, { new: true }, (err, doc) => {
        if (!err) { res.send(doc); }
        else { console.log('Error in Employee update : '+JSON.stringify(err,undefined,2)); }
    });
});

router.get('/enCours/:id', (req, res) => {
    ReparationsVoiture.find({idUtilisateur:req.params.id,dateSortie:null,estDepose:true},{listeReparation:1},(err, docs) => {
        if (!err) { res.send(docs); }
        else { console.log('Erreur : ' + JSON.stringify(err, undefined, 2)); }
    });
});

router.get('/historique/:idUser/:idVoiture', (req, res) => {
    ReparationsVoiture.find({idUtilisateur:req.params.idUser,idVoiture:req.params.idVoiture},(err, docs) => {
        let response = {}
        if (!err) {
            response = {
                message : 'OK',
                value : docs,
                code : 200
            }
            // console.log('usssssssss')
            // console.log(docs);
            res.json(response)
        }
        else {
            console.log('Erreur : ' + JSON.stringify(err, undefined, 2));
            response = {
                message : 'KO',
                code : 404,
                value :  err
            }
            res.json(response); 
        }
    });
});

router.get('/get/:id',(req,res)=>{
    ReparationsVoiture.find({_id:req.params.id},(err, docs) => {
        if (!err) { res.send(docs); }
        else { console.log('Erreur : ' + JSON.stringify(err, undefined, 2)); }
    });
});

router.post('/depose',(req,res)=>{
    ReparationsVoiture.find({estDepose:false},(err, docs) => {
        if (!err) { res.send(docs); }
        else { console.log('Erreur : ' + JSON.stringify(err, undefined, 2)); }
    });
});

router.put('/estReceptionne/:id',(req,res)=>{
    const date = new Date();
    const options = { timeZone: 'Africa/Nairobi',day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    const formatter = new Intl.DateTimeFormat('fr-FR', options);
    const formattedDate = formatter.format(date);
    const dateParts = formattedDate.split(', ');
    const dateString = dateParts[0].split('/').reverse().join('-') + 'T' + dateParts[1] + 'Z';
    const parsedDate = new Date(dateString);

    ReparationsVoiture.updateMany({_id:req.params.id},{$set:{dateArrivee:parsedDate,estDepose:true,etat:"En cours"}},(err, docs) => {
        if (!err) { res.send(docs); }
        else { console.log('Erreur : ' + JSON.stringify(err, undefined, 2)); }
    });
});
router.post('/validation/paiement',async (req,res)=>{
    const datePaiement = req.body.datePaiement;
    const demandePaiement = new DemandePaiement(req.body.demandePaiement);
    ReparationsVoiture.find({idVoiture:demandePaiement.idVoiture,idUtilisateur:demandePaiement.idUser})
        .then(reparationvoitures=>{
            for(let i=0;i<reparationvoitures.length;i++){
                const reparation = reparationvoitures[i];
                let indexToUpdate = reparation.listeReparation.findIndex(lreparation=> lreparation._id.equals(demandePaiement.idReparation));
                if (indexToUpdate !== -1) {
                    reparation.listeReparation[indexToUpdate].datePaiement = datePaiement
                    reparation.listeReparation[indexToUpdate].estPaye = true;
                    ReparationsVoiture.findOneAndUpdate({_id:reparation._id},{$set:{listeReparation:reparation.listeReparation}}, {new: true})
                        .then(result=>{
                            const reponse = {
                                message : 'OK',
                                code:200,
                                value : result
                            }
                            // console.log('_______________Update reparationvoiture____________________')
                            // console.log(reponse)
                            res.json(reponse)
                        })
                        .catch(error => {
                            const reponse = {
                                message : 'KO',
                                code:500,
                                value : error
                            }
                            console.log('_______________XXXXXXXXXXXX Update reparationvoiture____________________')
                            console.log(reponse)
                            res.json(reponse)
                        });
                    break;
                }
                else{
                    continue;
                }
            }
        })
        .catch(err=>{
            console.log(err)
        })
    
});
router.put('/set/etat',(req,res)=>{
    console.log(req.body.idReparation)
    ReparationsVoiture.findOne({_id:req.body.idReparation})
        .then(reparation=>{
                let indexToUpdate = reparation.listeReparation.findIndex(lreparation=> lreparation.idPiece===(req.body.idPiece));
                if (indexToUpdate !== -1) {
                    reparation.listeReparation[indexToUpdate].avancement = req.body.etat
                    ReparationsVoiture.findOneAndUpdate({_id:reparation._id},{$set:{listeReparation:reparation.listeReparation}}, {new: true})
                        .then(result=>{
                            const reponse = {
                                message : 'OK',
                                code:200,
                                value : result
                            }
                            // console.log('_______________Update reparationvoiture____________________')
                            // console.log(reponse)
                            res.json(reponse)
                        })
                        .catch(error => {
                            const reponse = {
                                message : 'KO',
                                code:500,
                                value : error
                            }
                            console.log('_______________XXXXXXXXXXXX Update reparationvoiture____________________')
                            console.log(reponse)
                            res.json(reponse)
                        });
                }else{
                    const reponse = {
                        message : 'KO',
                        code:500,
                        value : 'Piece id : '+req.body.idPiece+' introuvable'
                    }
                    console.log('_______________XXXXXXXXXXXX INTROUVABLE reparationvoiture____________________')
                    console.log(reponse)
                    res.json(reponse)
                }
        })
        .catch(err=>{
            console.log(err)
        })
});

router.get('/stats/tempsMoyen',(req,res)=>{
    let totalDifference = 0;
    let count = 0;
    ReparationsVoiture.find({}, function (err, reparations) {
        if (err) {
            console.error(err);
            return res.status(500).json({error: "Une erreur est survenue lors de la récupération des données"});
        }
        
        reparations.forEach(function(rep) {
          if (rep.listeReparation) {
            
            rep.listeReparation.forEach(function(liste) {
                
              if (liste.dateDebut && liste.dateFin) {
                
                let difference = Math.abs(liste.dateFin.getTime() - liste.dateDebut.getTime()) / (1000 * 3600);
                totalDifference += difference;
                count++;
              }
            });
          }
        });
        let average = totalDifference / count;
        console.log("La moyenne des différences d'heures est : ", average);
        res.status(200).json({moyenne : average});
    });
});

router.get('/stats/tempsMoyen/:id',(req,res)=>{
    let totalDifference = 0;
    let count = 0;
    ReparationsVoiture.find({idVoiture:req.params.id}, function (err, reparations) {
        if (err) {
            console.error(err);
            return res.status(500).json({error: "Une erreur est survenue lors de la récupération des données"});
        }
        
        reparations.forEach(function(rep) {
          if (rep.listeReparation) {
            
            rep.listeReparation.forEach(function(liste) {
                
              if (liste.dateDebut && liste.dateFin) {
                
                let difference = Math.abs(liste.dateFin.getTime() - liste.dateDebut.getTime()) / (1000 * 3600);
                totalDifference += difference;
                count++;
              }
            });
          }
        });
        let average = totalDifference / count;
        console.log("La moyenne des différences d'heures est : ", average);
        res.status(200).json({moyenne : average});
    });
});

/*router.get('/stats/chiffreAffaire/:date1/:date2',(req,res)=>{
    let totalPrix = 0;
    let count = 0;
    let dateDebut = new Date(req.params.date1);
    let dateFin = new Date(req.params.date2);

    ReparationsVoiture.find({}, function (err, reparations) {
        if (err) {
            console.error(err);
            return res.status(500).json({error: "Une erreur est survenue lors de la récupération des données"});
        }
        
        reparations.forEach(function(rep) {
          if (rep.listeReparation) {
            
            rep.listeReparation.forEach(function(liste) {
                
              if (liste.datePaiement >= dateDebut && liste.datePaiement <= dateFin) {
                console.log(liste);
                totalPrix += liste.prix;
                count++;
              }
            });
          }
        });
        let average = totalPrix / count;
        console.log("La moyenne des prix est : ", average);
        res.status(200).json({moyenne : average});
    });
});*/

router.get('/stats/chiffreAffaire/:date1',(req,res)=>{
    let totalPrix = 0;
    let date = req.params.date1;

    ReparationsVoiture.find({}, function (err, reparations) {
        if (err) {
            console.error(err);
            return res.status(500).json({error: "Une erreur est survenue lors de la récupération des données"});
        }
        
        reparations.forEach(function(rep) {
          if (rep.listeReparation) {
            
            rep.listeReparation.forEach(function(liste) {
                let datePaiement = new Date(liste.datePaiement);
                datePaiement = datePaiement.toISOString().slice(0,10);
              if (datePaiement == date) {
                totalPrix += liste.prix;
              }
            });
          }
        });
        let chiffreAffaire = totalPrix 
        res.status(200).json(chiffreAffaire);
    });
});

router.get('/stats/chiffreAffaire/year/:date1',(req,res)=>{
    let totalPrix = 0;
    let date = req.params.date1;
    let chiffreAffairePerMonth = {};
    let months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

    ReparationsVoiture.find({}, function (err, reparations) {
        if (err) {
            console.error(err);
            return res.status(500).json({error: "Une erreur est survenue lors de la récupération des données"});
        }
        
        reparations.forEach(function(rep) {
          if (rep.listeReparation) {
            rep.listeReparation.forEach(function(liste) {
                let datePaiement = new Date(liste.datePaiement);
                datePaiement = datePaiement.toISOString().slice(0,10);
                datePaiement  = new Date(datePaiement);
                let month = datePaiement.getMonth() + 1; // adding 1 because month starts from 0
                let year = datePaiement.getFullYear();
                if (year == date) {
                  if(chiffreAffairePerMonth[month]){
                    chiffreAffairePerMonth[month] += liste.prix;
                  }
                  else {
                    chiffreAffairePerMonth[month] = liste.prix;
                  }
                }
            });
          }
        });
        let result = {}
        for(let i=1; i<=12; i++){
            if(!chiffreAffairePerMonth[i]){
              chiffreAffairePerMonth[i] = 0;
            }
            result[months[i-1]] = chiffreAffairePerMonth[i];
          }
        res.status(200).json(result);
    });
});

router.get("/byDate/:month/:year",(req,res)=>{
    const startDate = new Date(req.params.year+"-"+req.params.month+"-01");
    const endDate = new Date(req.params.year+"-"+req.params.month+"-31");
    let result = [];
    let sum = 0;
    ReparationsVoiture.find({ },{}, async function (err, reparations) {
        let idPieces = reparations.map(rep => rep.listeReparation.map(liste => liste.idPiece)).flat();
        let pieces = await Piece.find({ _id: { $in: idPieces } });
        let piecesMap = pieces.reduce((map, piece) => {
            map[piece._id] = piece;
            return map;
        }, {});
        reparations.forEach(function(rep) {
            if (rep.listeReparation) {
              rep.listeReparation.forEach(function(liste) {
                  let datePaiement = new Date(liste.datePaiement);
                  datePaiement = datePaiement.toISOString().slice(0,10);
                  datePaiement = new Date(datePaiement)
                if (datePaiement >= startDate && datePaiement<=endDate) {
                    liste.piece = piecesMap[liste.idPiece];
                    console.log("piece : "+liste.piece.designation)
                    console.log("prix : "+liste.piece.prix)
                    
                    sum+=liste.piece.prix;
                    result.push(liste);
                }
              });
            }
          });
        if (err) return res.status(500).send(err);
        result.push({totalPrix : sum})
        res.send(result,);
    });
})

module.exports = router;