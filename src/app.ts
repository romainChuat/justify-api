import express from 'express';
import {v4 as uuidv4} from 'uuid';



const app = express();
const port = 3000; // Le port sur lequel votre serveur écoutera

app.use(express.json());

// Route pour générer un token
app.post('/api/token', (req, res) => {
  // Générez un token unique ici (vous pouvez utiliser une bibliothèque pour cela)
  let token = uuidv4();

  console.log(token);
  // Retournez le token généré en réponse
  res.json({ token: token });
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur le port ${port}`);
});
