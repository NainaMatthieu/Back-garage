const mongoose = require('mongoose');
const userConfirmCompte = mongoose.Schema({
    userId:String,
    code : String
});
userConfirmCompte.pre('save', async function(next) {
  let objet = this;
  if (!objet.isNew) {
      return next();
  }
  let codeExist = true;
  let code;
  while (codeExist) {
      code = Math.random().toString().slice(-4);
      let userConfirmCompte = await mongoose.model('ConfirmCompte').findOne({ code: code });
      
      if (userConfirmCompte==null) {
          codeExist = false;
      }
  }
  objet.code = code;
  next();
})
module.exports = mongoose.model('ConfirmCompte',userConfirmCompte);