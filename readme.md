# api-justify

Cette API réaliser avec Node.JS/Typescript vous permettra de justifier votre texte. L'API fonctionne avec un système de token.
D'abord, il vous faudra envoyer une première requête en fournissant votre adresse email et un token vous sera attribuer. Suite à cette attribution, vous pourrez justifier vos textes avec une limite de 80 000 mots par jour.
Pour justifier votre texte, vous devrez fournir un fichier inptut.txt contenant votre texte.
Lors de votre requête, il faudra fournir le chemin vers le fichier qui contiendra votre texte justifié.


## 1. Execution

### 1.1 Execution du projet

Après avoir récupéré le projet, vous trouverez le code source dans le répertoire ```/dist```. 
Utiliser les commandes suivantes pour l'exécuter:

 • Build le projet :
 ```
 $ tsc
```

 • Exécuter le projet :
 ```
 $ node /dist/app.js
```
### 1.2 Dépendances 

 Ce projet utilise différentes dépendances. 

 • Pour résoudre les problèmes de dépendances :
 ```
 $ npm i --save-dev @types/node
```

## 2. Utilisation

Pour la suite, nous utiliserons les commandes ```curl``` afin d'envoyer des requêtes POST
aux APIs.

### 2.1 API token

 • Utiliser la commande curl suivante pour envoyer la requête POST à l'api/token. Renseigner votre email dans le champ ```email``` :
 ```
 $ curl -X POST -H "Content-Type: application/json" -d '{"email": "foo@bar.com"}' http://localhost:3000/api/token
```
<strong>Cette requête retournera un token qu'il faudra conserver pour la suite.</strong>

### 2.2 API Justification texte

 • Utiliser la commande ```curl``` suivante pour envoyer la requête POST à l'api 
 api/justify. Remplacer ```mon_token```, par le token obtenu après la requête précédente.Placer le chemin de votre fichier non justifié à la place du fichier 
 "input.txt". L'option ```-o``` permet de renseigner le chemin du fichier qui contiendra votre texte justifié :
```
 $ curl -X POST -H "Authorization: Bearer mon_token" -F "fichier=@input.txt" http://localhost:8080/api/justify -o output.txt
```

## 3. Tests

Ce projet implémente des tests unitaires. Il se trouve dans le répertoire ```/test```.

### 3.1 tests
 • Pour exécuter le fichier test utiliser la commande :
```
$npm test
```
### 3.2 coverage

Pour générer un rapport de couverture du code ajouter l'option ```-- --coverage``` à la commande précédente.

```
$npm test -- --coverage
```
Vous pourrez alors visualiser le rapport de couverture dans le repértoire ```/coverage```.
Dans le dossier ```coverage/Icov-report``` vous trouver le fichier ```app.ts.html``` qui vous permettra d'obtenir plus de précisions sur la couverture du code par les tests.

## 4. Auteur

Ce travail à été réaliser par Romain Chuat.
