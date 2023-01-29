const { request, response } = require('express');
const express = require('express');
const DemandePaiement = require('../models/DemandePaiement');
const router = express.Router();


// demandePaiement
router.post('/',async (request,response)=>{
    let counter = 0;
    request.body.listeDemandePaiement.forEach(async dP => {
        const demandePaiement = new DemandePaiement(dP);
        await demandePaiement.save()
        .then(rep=>{
            counter++;
            if(counter === request.body.listeDemandePaiement.length){
                const reponse = {
                    message : 'OK',
                    value : rep,
                    code :200
                }
                response.json(reponse);
             }//else{
            //     const reponse = {
            //         message : 'KO',
            //         value : request.body.listeDemandePaiement[i].idReparation +' n\'a pas été inserer',
            //         code :404
            //     }
            //     response.json(reponse);
            // }
        })
        .catch(err=>{
            const reponse ={
                message : 'KO',
                value : err,
                code :404
            }
            response.json(reponse);
            console.log(err)
        })
    });
    
    
})


//liste demande paiement en attente
router.get('/pendingValidation',(request,response)=>{
    DemandePaiement.find({valid:false},(err,success) => {
        if(err){
            const rep = {
                message : 'KO',
                code : 404,
                value :  err
            }
            response.json(rep);
        }
        // console.log(success)
        const reponse = {
            message : 'OK',
            value : success,
            code : 200
        }
        response.json(reponse)
    });
})
//liste demande paiement en attente par idVoiture
router.get('/pendingValidation/:idVoiture',(request,response)=>{
    DemandePaiement.find({idVoiture: request.params.idVoiture,valid:false},(err,success) => {
        if(err){
            const rep = {
                message : 'KO',
                code : 404,
                value :  err
            }
            response.json(rep);
        }
        // console.log('_______________________________________Liste demande paiement voiture_______________________________________')
        // console.log(success)
        const reponse = {
            message : 'OK',
            value : success,
            code : 200
        }
        response.json(reponse)
    });
})
router.put('/validation',(request,response)=>{
    DemandePaiement.findOneAndUpdate({_id: request.body.idDemandePaiement},{$set:{valid:true}}, {new: true})
        .then(success => {
            const reponse = {
                message : 'OK',
                value : success,
                code : 200
            }
        response.json(reponse)
        })
        .catch(err=>{
            const rep = {
                message : 'KO',
                code : 404,
                value :  err
            }
            response.json(rep);
        })
})

module.exports = router;