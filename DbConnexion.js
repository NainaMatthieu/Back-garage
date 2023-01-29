const mongoose = require('mongoose')
require('dotenv/config');
mongoose.set('strictQuery',true);
console.log(process.env.DB_URL)
const url = "mongodb+srv://naina:naina@cluster0.gxgp8ti.mongodb.net/garage"
mongoose.connect(
    process.env.DB_URL,
    // {userNewUrlParser: true}, 
    (err)=>{
        if(!err) console.log('Connexion réussie')
        else
            console.log('Erreur de connexion : '+err);
    }
)

module.exports = mongoose;