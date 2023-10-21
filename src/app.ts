// Importez les dépendances nécessaires
import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import fs from 'fs';

const lineWidth = 80;

// Créez une instance de l'application Express
const app = express();

// Configurez bodyParser pour analyser le JSON dans les requêtes
app.use(bodyParser.json());

let tokens: string[] = [];
const secretKey = 'votre_cle_secrete';



function listen(port: number) {
  // Démarrez le serveur
  app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
  });
}

export function createToken(email: string) {
  if(email == '') {
    throw new Error('email is empty');
  }
  return jwt.sign({ email }, secretKey, { expiresIn: '1h' });
}

// A améliorer
function JustifyText(text: string, lineWidth: number) {
  const words = text.split(' ');
  let lines: string[] = [''];
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
  for (let i = 0; i < lines.length; i++) {
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
  return lines.join('\n');
}

function createTokenApi() {
  // Créez la route `/api/token`

  app.post('/api/token', (req, res) => {
    const { email } = req.body;

    // Vérifiez si l'email est fourni dans la requête
    if (!email) {
      return res.status(400).json({ message: 'veuillez fournir un email' });
    }

    // Génére un token unique 
    // modifie la durée d'expiration
    var token = createToken(email);    
    console.log(token);
    tokens.push(token);

    const result = res.status(200).json({ token });
  });
  var port = 3000;
  // Démarrez le serveur
  listen(port);

}


function createJustifyAPI(tokens: string[]) {
  
  // Appliquez le rate limit et l'authentification à la route `/api/justify`
  app.post('/api/justify', (req, res) => {
    const text = req.body.text;
    // TO-DO : attention au ", ', ` 

    const token = req.body.token;
    if (!tokens.includes(token)) {
      return res.status(400).json({ message: 'invalid token' });
    }
    if (!text) {
      return res.status(400).json({ message: 'Le texte est requis' });
    }
    console.log(tokens);

    //justification du text        
    let justified_text = JustifyText(text, lineWidth);
    res.status(200).send(justified_text);

  });
  var port = 8080;
  // Démarrez le serveur
  listen(port);
}

var test = `Longtemps, je me suis couché de bonne heure. Parfois, à peine ma bougie éteinte, mes yeux se fermaient si vite que je n’avais pas le temps de me dire: «Je m’endors.» Et, une demi-heure après, la pensée qu’il était temps de chercher le sommeil m’éveillait; je voulais poser le volume que je croyais avoir dans les mains et souffler ma lumière; je n’avais pas cessé en dormant de faire des réflexions sur ce que je venais de lire, mais ces réflexions avaient pris un tour un peu particulier; il me semblait que j’étais moi-même ce dont parlait l’ouvrage: une église, un quatuor, la rivalité de François Ier et de Charles-Quint. 
Cette croyance survivait pendant quelques secondes à mon réveil; elle ne choquait pas ma raison, mais pesait comme des écailles sur mes yeux et les empêchait de se rendre compte que le bougeoir n’était plus allumé. 
 Puis elle commençait à me devenir inintelligible, comme après la métempsycose les pensées d’une existence antérieure; le sujet du livre se détachait de moi, j’étais libre de m’y appliquer ou non; aussitôt je recouvrais la vue et j’étais bien étonné de trouver autour de moi une obscurité, douce et reposante pour mes yeux, mais peut-être plus encore pour mon esprit, à qui elle apparaissait comme une chose sans cause, incompréhensible, comme une chose vraiment obscure. Je me demandais quelle heure il pouvait être; j’entendais le sifflement des trains qui, plus ou moins éloigné, comme le chant d’un oiseau dans une forêt, relevant les distances, me décrivait l’étendue de la campagne déserte où le voyageur se hâte vers la station prochaine; et le petit chemin qu’il suit va être gravé dans son souvenir par l’excitation qu’il doit à des lieux nouveaux, à des actes inaccoutumés, à la causerie récente et aux adieux sous la lampe étrangère qui le suivent encore dans le silence de la nuit, à la douceur prochaine du retour.`


createTokenApi();
createJustifyAPI(tokens);


/*var justified = JustifyText(test, lineWidth);
console.log(justified);*/


/*fs.writeFile('justified_text.txt', justified, 'utf8', (err) => {
  if (err) {
    console.error('Erreur lors de l\'écriture du fichier :', err);
  } else {
    console.log('Texte justifié écrit dans le fichier justified_text.txt');
  }
});*/






