// Importez les dépendances nécessaires
import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import fs from 'fs';
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const lineWidth = 80;

// Créez une instance de l'application Express
export const app = express();

// Configurez bodyParser pour analyser le JSON dans les requêtes
app.use(bodyParser.json());

const secretKey = '123456';
export let data: { email: string; token: string; wordCount: number; expirationDate: Date }[] = [];


function listen(port: number) {
  // Démarrez le serveur
  app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
  });
}

/** 
 * Check if the token is valid 
 **/
export function checkToken(token: string) {
  if(token == '') return false;
  for(let i = 0; i < data.length; i++) {
    if(data[i].token == token) {
      return true;
    }
  }
  return false;
}
export function checkEmail(email: string) {
  if(email == '') return false;
  const emailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if(email.match(emailFormat)){
    return true;
  }
  return false;
}

export function createToken(email: string, key : string) {
  if(email == '' || key == '' ) return '';
  let token =  jwt.sign({ email }, key, { expiresIn: '24h' });
  return token;
}

export function createUser(email: string, token: string){
  if(email == '' || token == '') {
    return; 
  }; 
  // check if the email already exists
  for(let i = 0; i < data.length; i++) {
    if(data[i].email == email) {
      data[i].token = token;
      data[i].wordCount = 0;
      return;
    }
  }
  let expirationDate = new Date();
  //rajouter 24h en millisecondes
  expirationDate.setTime(expirationDate.getTime() + 86400000);
  data.push({email: email, token: token, wordCount: 0, expirationDate: expirationDate});
}



/**
 * Check if the number of words is less than 80000 for the day 
 */
export function checkWords(token: string, text: string) {
  let words = text.split(' ').length-1;
  if(token == '') return -1;
  if(words > 80000) return 0;   
  let remainingWords = 0;
  for(let i = 0; i < data.length; i++) {
    if(data[i].token == token) {
      let date = new Date();
      let expirationDate = data[i].expirationDate.getTime();
      //vérifier si la date est est la même que la date d'expiration 
      //console.log("date :"+date.getTime());
      //console.log("expiration :"+expirationDate);

      if(date.getTime() > expirationDate) {
        data[i].wordCount = words;
        //console.log("1 word count"+ data[i].wordCount);
        data[i].expirationDate.setTime(expirationDate + 86400000);
      }else{
        let newWordCount = data[i].wordCount + words;
        //console.log("newWord count :" + newWordCount);
        if(newWordCount > 80000){
          return 0;
        }
        data[i].wordCount = newWordCount; 
        //console.log("Word count :" + data[i].wordCount);

      }
      remainingWords = 80000 - data[i].wordCount;
    }
  }
  return remainingWords;
}



// A améliorer
export function justifyText(text: string, lineWidth: number, remainingWords: number) {
  const words = text.split(' ');
  let lines: string[] = ['Remaining Words: ' + remainingWords]; 
  lines.push('');
  let current_line = '';

  for (let j = 0; j < words.length; j++) {
    if (current_line.length + words[j].length <= lineWidth) {
      current_line += words[j] + ' ';
    } else {
      lines.push(current_line.trim());
      current_line = words[j] + ' ';
    }
  }
  lines.push(current_line);

  //répartision des espaces
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].length < lineWidth) {
      let words_line = lines[i].split(' ');
      let nb_gaps = words_line.length - 1;
      let space_need = lineWidth - lines[i].length;

      if (nb_gaps > 0) {
        let extraSpaces = space_need % nb_gaps;
        let spacesPerGap = Math.floor(space_need / nb_gaps);

        for (let j = 0; j < nb_gaps; j++) {
          words_line[j] += ' '.repeat(spacesPerGap);
          if (j < extraSpaces) {
            words_line[j] += ' ';
          }
        }
        lines[i] = words_line.join(' ');
      }
    }
  }
  
  let justified_text = lines.join('\n');
  
  /*fs.writeFile('justified_text.txt', justified_text, 'utf8', (err) => {
    if (err) {
      console.error('Erreur lors de l\'écriture du fichier :', err);
    } else {
      console.log('Texte justifié écrit dans le fichier justified_text.txt');
    }
  });*/

  return justified_text;
}

function createTokenApi() {
  // Créez la route `/api/token`

  app.post('/api/token', (req, res) => {
    const { email } = req.body;

    // Vérifiez si l'email est fourni dans la requête
    if (!email) {
      return res.status(400).json({ message: 'veuillez fournir un email' });
    }
    if(checkEmail(email)){
      // Génére un token unique 
      // modifie la durée d'expiration
      var token = createToken(email, secretKey);    
      console.log(token);
      createUser(email,token);
      res.status(200).json({ token });
    }else{
      res.status(400).json({ message : 'invalid email' });
    }

    
  });
  var port = 3000;
  // Démarrez le serveur
  listen(port);

}


function createJustifyAPI() {
  // Appliquez le rate limit et l'authentification à la route `/api/justify`
  app.post('/api/justify', upload.single('fichier'),(req, res) => {
    let text;
    let remainingWords = 0;
    // TO-DO : attention au ", ', ` 
    const fileBuffer = req.file?.buffer;
    console.log(fileBuffer);
    //lecture du file buffer
    if(fileBuffer){
      text = fileBuffer.toString('utf-8');
    }
    console.log(text);

    const token = req.header('Authorization')?.split(' ')[1];
    console.log(token);

    // Vérifiez si le token est fourni dans la requête
    if (!token) {
      console.log("empty token");
      return res.status(400).send({ message: 'Le token est requis' });
    }
    if (!checkToken(token)) {
      console.log("invalid token");
      return res.status(400).send({ message: 'invalid token' });
    }
    if(text){
      remainingWords = checkWords(token,text);
      if(remainingWords == 0) {
        console.log("Payment Required");
        return res.status(402).send({ message: 'Payment Required' });
      }
    }else{
      console.log("text is required");
      return res.status(400).send({ message: 'text is required' });
    }
    console.log(data);
    //justification of the text 
    let justify_text = justifyText(text, lineWidth,remainingWords);
    res.status(200).send(justify_text);
  });

  var port = 8080;
  // Démarrez le serveur
  listen(port);
}

createTokenApi();
createJustifyAPI();







