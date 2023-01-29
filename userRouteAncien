const { request, response } = require('express');
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const Utilisateur = require('../models/Utilisateur');

// inscription de l'utilisateur pour créer un nouveau compte
router.post('/inscription',(request,response)=>{
    const user = new Utilisateur({
        identfiant : request.body.identfiant,
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
    // var body = '<h1>Bonjour!</h1><p>Veuillez confirmer par cette email la création de votre compte</p>'
    // var body ='<h1>Bonjour!</h1><p>Veuillez confirmer par cette email la création de votre compte</p><p><a href=\'localhost:9000/user/confirmation/'+data._id+'\'> cliquer ici '+data._id+'!</a></p>'; 

    user.save()
        .then(data=>{
            var body = '<h1>Bonjour!</h1><p>Veuillez cliquer ici pour confirmer la création de votre compte <a href="http://localhost:9000/user/confirmation/'+data._id+'">Ici</a> pour confirmer.</p>'; 
            let mailOptions = {
                to: 'andrianmattax@gmail.com',
                subject: 'Email de confirmation de création de compte',
                html: body
            };
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    const rep = {
                        message : 'OK',
                        value : null,
                        code : 200
                    }
                    response.json(rep);
                    console.log('Email sent: ' + info.response);
                }
            });
        })
        .catch(err=>{
            console.log(err)
        })
   
    
})
// confirmation compte utilisateur par email
router.get('/confirmation/:id',async (request,response)=>{
    console.log(request.params.id)
    try {
        const updatedUser = await Utilisateur.updateOne(
            { _id: request.params.id }, 
            {$set : {valid:true}}
        )
        const reponse = {
            message : 'OK',
            value : updatedUser,
            code : 200
        }
        response.json(reponse);
    } catch (error) {
        response.json({code : 404,message : error});
    }
})
// connexion utilisateur
router.post('/login',(request,response)=>{
    console.log({mail : request.body.mail, motDePasse: request.body.password,valid:true})
    Utilisateur.find({mail : request.body.mail, motDePasse: request.body.password},(err,user)=>{
        if(err)
            response.send(err);
        else if(user.length==0){
            const reponse = {
                message : 'KO',
                value : 'Votre email ou votre mots de passe est incorrect',
                code : 404
            }
            response.json(reponse)
        }
        console.log(user)
        const reponse = {
            message : 'OK',
            value : user,
            code : 200
        }
        response.json(reponse)
        console.log('----------------------------------------------------')
        console.log(reponse);
    })
})
module.exports = router;