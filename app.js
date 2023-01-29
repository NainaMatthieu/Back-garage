const express = require('express');
const app = express();

const cors  = require('cors');
const bodyParser = require('body-parser');
require('./DbConnexion');

const reparationsRoute = require('./routes/reparationsRoute');
const pieceRoute = require('./routes/pieceRoute');
const demandePaiementRoute = require('./routes/demandePaiementRoute');
const beneficeRoute = require('./routes/beneficeRoute');
app.use(bodyParser.json());
app.use(cors());

const userRoute = require('./routes/userRoute');
app.use('/user',userRoute);
app.use('/reparation',reparationsRoute);
app.use('/piece',pieceRoute);
app.use('/demandepaiement',demandePaiementRoute);
app.use('/benefice',beneficeRoute);
app.listen(9000);