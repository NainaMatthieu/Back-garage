const { request, response } = require('express');
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const Utilisateur = require('../models/Utilisateur');
const ConfirmCompte = require('../models/ConfirmCompte');
const DemandeDepotVoiture = require('../models/DemandeDepotVoiture');
const Voiture = require('../models/Voiture');

// inscription de l'utilisateur pour créer un nouveau compte
router.post('/inscription',(request,response)=>{
    const user = new Utilisateur({
        identifiant : request.body.identifiant,
        motDePasse : request.body.motDePasse,
        mail : request.body.mail,
    })
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'garagenotificiation@gmail.com',
            pass: 'xmfqlhsxkgslrbdp'
        }
    });
    //check compte s'il existe déjà
    Utilisateur.findOne({mail : user.mail} , (erreurFindUser,userExist)=>{
        let rep = {};
        //si utilisateur n'existe pas encore
        if(userExist==null){
            user.save()
            .then(data=>{
                const uuid = new ConfirmCompte({
                    userId : data._id,
                })
                uuid.save()
                    .then(code=>{
                        var body = '<h1>Bonjour,</h1><p>Nous avons reçu une demande de création de compte pour cette adresse e-mail.</p><p> Pour compléter la création de votre compte, veuillez entrer le code de confirmation suivant : '+code.code+' sur notre site web.</p> \n'
                        +'<p>Merci d\'avoir utiliser notre service.</p><p>Cordialement,</p> <p>L\'équipe de notre service</p>';
                        let mailOptions = {
                            to: user.mail,
                            subject: 'Email de confirmation de création de compte',
                            html: body
                        };
                        transporter.sendMail(mailOptions, function(error, info){
                            if (error) {
                                Utilisateur.remove({_id : data._id})
                            } else {
                                const rep = {
                                    message : 'OK',
                                    value : null,
                                    code : 200
                                }
                                console.log('Email sent: ' + info.response);
                                response.json(rep);
                            }
                        });
                    })
                
            })
            .catch(err=>{
                const rep ={
                    message : 'KO',
                    value : err,
                    code :404
                }
                response.json(rep);
                console.log(err)
            })
        }
        // utilisateur existe déja avec compte déja activé
        else if(userExist.valid){
            rep = {
                message : 'KO',
                erreur :'l\'email appartient déjà à un compte existant.',
                value : null,
                code:404
            }
        }
        else{
            rep = {
                message : 'KO',
                value :'/confirmation-required',
                code:404
            }
        }
        if(erreurFindUser){
            console.log(erreurFindUser)
        }
        response.json(rep);
        
    })   
    
})
// confirmation compte utilisateur par email
router.post('/confirmation',async (request,response)=>{
    console.log(request.body.code)
    let rep = {}
    try {
        let confirmUser = await ConfirmCompte.findOne({code : request.body.code});
            if(confirmUser!=null){
                await Utilisateur.findOneAndUpdate({ _id: confirmUser.userId}, {valid:true},{ new: true })
                        .then((updatedUser)=>{
                            ConfirmCompte.deleteOne({_id:confirmUser._id}).exec().then((result) => {
                                if(result.deletedCount>0){
                                    console.log("ConfirmCompte supprimé");
                                }else{
                                    console.log("ConfirmCompte n'a pas été supprimé");
                                }
                            });
                            
                            rep = {
                                message : 'OK',
                                value : updatedUser,
                                code : 200
                            }
                            console.log(rep)
                            response.json(rep);
                        })
            }
    } catch (error) {
        console.log(error)
        response.json({code : 404,message:'KO',error : error});
    }
})
// connexion utilisateur
router.post('/login',(request,response)=>{
    // console.log({mail : request.body.mail, motDePasse: request.body.password,valid:true})
    Utilisateur.findOne({mail : request.body.mail, motDePasse: request.body.password},(err,user)=>{
        if(err){
            const rep = {
                message : 'KO',
                code : 404,
                value :  err
            }
            response.send(rep);
        }
        else if(user==null){
            const reponse = {
                message : 'KO',
                value : 'Votre email ou votre mots de passe est incorrect',
                code : 404
            }
            response.json(reponse)
        }
        // console.log(user)
        else{
            const reponse = {
                message : 'OK',
                value : user,
                code : 200
            }
            response.json(reponse)
            // console.log('----------------------------------------------------')
            // console.log(reponse);
        }
    })
})
// ajout nouvelle voiture
router.post('/add/car',async (request,response)=>{
    let car = {
        numero : request.body.numero,
        modele : request.body.modele,
        dateAjout: request.body.dateAjout
    }
    // let demande = new DemandeDepotVoiture({
    //     idUser : request.body.idUser,
    //     voiture : car
    // })
    await Utilisateur.findOne({_id:request.body.idUser})
        .then(user=>{
            // user.listeVoiture.push(car);
            let exist = user.listeVoiture.find(voiture => voiture.numero ===car.numero);
            if(!exist){
                user.listeVoiture.push(car);
                Utilisateur.findOneAndUpdate({ _id: user._id}, {listeVoiture: user.listeVoiture})
                    .then((data)=>{
                        const rep = {
                            message  : 'OK',
                            code :200
                        }
                        console.log('______________________Update liste voiture SUCCES___________________________')
                        console.log(data);
                        response.json(rep);
                    })
                    .catch(err=>{
                        console.log('______________________Update liste voiture ERREUR___________________________')
                        console.log(err);
                        const rep = {
                            message  : 'KO',
                            code :404,
                            value : err 
                        }
                        response.json(rep);
                    })
            }else{
                const rep = {
                    message  : 'KO',
                    code :404,
                    value : "Voiture déja existante." 
                }
                response.json(rep);
            }
        })
})
//liste voiture
router.get('/car/:idUser',(request,response)=>{
    Utilisateur.findOne({_id : request.params.idUser},(err,user)=>{
        if(err){
            const rep = {
                message : 'KO',
                code : 404,
                value :  err
            }
            response.send(rep);
        }
        // console.log(user)
        const reponse = {
            message : 'OK',
            value : user.listeVoiture,
            code : 200
        }
        response.json(reponse)
    })
})
// //User by id
router.get('/proprio/:idUser',(request,response)=>{
    console.log(request.params.idUser)
    Utilisateur.findOne({_id : request.params.idUser},(err,user)=>{
        console.log(user)

        if(err){
            const rep = {
                message : 'KO',
                code : 404,
                value :  err
            }
            response.send(rep);
        }
        else{
            const reponse = {
                message : 'OK',
                value : user,
                code : 200
            }
            response.json(reponse)
        }
        
    })
})

//all cars
router.get('/car',(req,res)=>{
    Utilisateur.find({},{listeVoiture:1},(err, docs) => {
        if (!err) { res.send(docs); }
        else { console.log('Erreur : ' + JSON.stringify(err, undefined, 2)); }
    });
})

//liste utilisateur avec voiture
router.get('/carlist',(req,res)=>{
    Utilisateur.find({profil:'user'},{identifiant:1,listeVoiture:1},(err, all) => {
        let reponse = {};
        if (!err) { 
            reponse = {
                message :'OK',
                code:200,
                value:all
            }
        }
        else { 
            console.log('Erreur : ' + err); 
            reponse = {
                message :'KO',
                code:404,
                value:err
            }
        }
        res.json(reponse);
    });
})
module.exports = router;