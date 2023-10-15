// Importez les dépendances nécessaires
import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';

// Créez une instance de l'application Express
const app = express();

// Configurez bodyParser pour analyser le JSON dans les requêtes
app.use(bodyParser.json());

let tokens: string[] = [];

function createToken(){


// Remplacez la clé secrète par un mot de passe solide
const secretKey = 'votre_cle_secrete';

// Créez la route `/api/token`
app.post('/api/token', (req, res) => {
  const { email } = req.body;

  // Vérifiez si l'email est fourni dans la requête
  if (!email) {
    return res.status(400).json({ message: 'veuillez fournir un email' });
  }

  // Génére un token unique 
  // modifie la durée d'expiration
  var token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });
  console.log(token);
  tokens.push(token);

  const result =  res.status(200).json({ token });

});

// Port sur lequel l'application écoutera
const port = 3000;

// Démarrez le serveur
app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur le port ${port}`);
});

}


function createJustifyAPI(tokens: string[]){
  // Appliquez le rate limit et l'authentification à la route `/api/justify`
  app.post('/api/justify', (req, res) => {
    const text = req.body.text;
    const token = req.body.token;
    if(!tokens.includes(token)){
      return res.status(400).json({message : 'invalid token'});
    }
    if (!text) {
      return res.status(400).json({ message: 'Le texte est requis' });
    }
    console.log(tokens);
    if(!tokens.includes(req.body.token)){
      return res.status(400).json({ message: 'token invalide' });
    }

    //justification du text        
    

    res.status(200).send(text);
  });

  // Fonction pour justifier le texte

  // Port sur lequel l'application écoutera
  const port = 8080;

  // Démarrez le serveur
  app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
  });
}

createToken();
createJustifyAPI(tokens);
