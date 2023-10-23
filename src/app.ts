import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const app = express();
app.use(bodyParser.json());
const lineWidth = 80;
const secretKey = '123456';
//data contient les utilisateurs enregistres
export let data: { email: string; token: string; wordCount: number; expirationDate: Date }[] = [];

/**
 * Fonction de demarrage du serveur
 */
function listen(port: number) {
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}

/** 
 * Verifie si le token est enregistre dans data
 **/
export function checkToken(token: string) {
  if (token == '') return false;
  for (let i = 0; i < data.length; i++) {
    if (data[i].token == token) {
      return true;
    }
  }
  return false;
}
/**
 *  Verifie si un email est bien formate
 */
export function checkEmailFormat(email: string) {
  if (email == '') return false;
  const emailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (email.match(emailFormat)) {
    return true;
  }
  return false;
}

/**
 * Creation d'un token pour une cle et un email donnee.
 * Utilisation de la librairie jsonwebtoken. 
 */
export function createToken(email: string, key: string) {
  if (email == '' || key == '') return '';
  let token = jwt.sign({ email }, key, { expiresIn: '24h' });
  return token;
}

/**
 * Creation d'un utilisateur identifié par son email et son token
 * Ajout de l'utilisateur à data 
 */
export function createUser(email: string, token: string) {
  if (email == '' || token == '') {
    return;
  };
  // verification de l'exitence de l'utilisateur
  for (let i = 0; i < data.length; i++) {
    if (data[i].email == email) {
      data[i].token = token;
      data[i].wordCount = 0;
      return;
    }
  }
  let expirationDate = new Date();
  //rajoute de 24h en millisecondes
  expirationDate.setTime(expirationDate.getTime() + 86400000);
  data.push({ email: email, token: token, wordCount: 0, expirationDate: expirationDate });
}



/**
 * Verifie si le nombre de mots est inferieur à 80000
 * Si le token est vide, retourne -1
 * Si le nombre de mots est superieur à 80000, retourne 0
 * Sinon retourne le nombre de mots restants,
 * et met à jour le nombre de mots de l'utilisateur
 */
export function checkWords(token: string, text: string) {
  let words = text.split(' ').length - 1;
  if (token == '') return -1;
  if (words > 80000) return 0;
  let remainingWords = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i].token == token) {
      let date = new Date();
      let expirationDate = data[i].expirationDate.getTime();
      if (date.getTime() > expirationDate) {
        data[i].wordCount = words;
        data[i].expirationDate.setTime(expirationDate + 86400000);
      } else {
        let newWordCount = data[i].wordCount + words;
        if (newWordCount > 80000) {
          return 0;
        }
        data[i].wordCount = newWordCount;
      }
      remainingWords = 80000 - data[i].wordCount;
    }
  }
  return remainingWords;
}



/**
 * Fonction de justification du texte 
 */
export function justifyText(text: string, lineWidth: number, remainingWords: number) {
  const words = text.split(' ');
  // affichage du nombre de mot restant a l'utilisateur
  let lines: string[] = ['Remaining Words: ' + remainingWords];
  lines.push('');
  let currentLine = '';

  // separation du texte en lignes de longueur lineWidth
  for (let j = 0; j < words.length; j++) {
    if (currentLine.length + words[j].length <= lineWidth) {
      currentLine += words[j] + ' ';
    } else {
      lines.push(currentLine.trim());
      currentLine = words[j] + ' ';
    }
  }
  lines.push(currentLine);

  // repatition des espaces pour chaque lignes
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].length < lineWidth) {
      let wordsLine = lines[i].split(' ');
      let nbGaps = wordsLine.length - 1; 
      let spaceNeed = lineWidth - lines[i].length; 

      if (nbGaps > 0) {
        let extraSpaces = spaceNeed % nbGaps;
        let spacesPerGap = Math.floor(spaceNeed / nbGaps);

        for (let j = 0; j < nbGaps; j++) {
          wordsLine[j] += ' '.repeat(spacesPerGap);
          if (j < extraSpaces) {
            wordsLine[j] += ' ';
          }
        }
        lines[i] = wordsLine.join(' ');
      }
    }
  }
  let justified_text = lines.join('\n');
  return justified_text;
}

/**
 * Créez la route `/api/token`
 */
function createTokenApi() {
  app.post('/api/token', (req, res) => {
    const { email } = req.body;
    // Vérifiez si l'email est fourni dans la requête
    if (!email) {
      return res.status(400).json({ message: 'veuillez fournir un email' });
    }
    if (checkEmailFormat(email)) {
      var token = createToken(email, secretKey);
      createUser(email, token);
      res.status(200).json({ token });
    } else {
      res.status(400).json({ message: 'invalid email' });
    }
  });
  var port = 3000;
  // Demarre le serveur
  listen(port);
}

/**
 * Créez la route `/api/justify`
 */
function createJustifyAPI() {
  app.post('/api/justify',upload.single('fichier'),(req, res) => {
    let text;
    let remainingWords = 0;
    const fileBuffer = req.file?.buffer;

    //lecture du fichier envoye
    if (fileBuffer) {
      text = fileBuffer.toString('utf-8');
    }

    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
      console.log("empty token");
      return res.status(400).send({ message: 'Le token est requis' });
    }
    if (!checkToken(token)) {
      console.log("invalid token");
      return res.status(400).send({ message: 'invalid token' });
    }
    if (text) {
      remainingWords = checkWords(token, text);
      if (remainingWords == 0) {
        console.log("Payment Required");
        return res.status(402).send({ message: 'Payment Required' });
      }
    } else {
      console.log("text is required");
      return res.status(400).send({ message: 'text is required' });
    }
    let justifiedText = justifyText(text, lineWidth, remainingWords);
    res.status(200).send(justifiedText);
  });

  var port = 8080;
  //Demarre le serveur
  listen(port);
}

createTokenApi();
createJustifyAPI();







