# api-justify

utiliser la commande curl suivante pour envoyer la requête post à l'api/token

curl -X POST -H "Content-Type: application/json" -d '{"email": "foo@bar.com"}' http://localhost:3000/api/token

utiliser la commande curl suivant pour envoyer la requête post à l'api justify
placer le chemin de votre fichier non justifier après --data-binary "in.txt"
et le chemin du fichier retourner après l'option -o  


curl -X POST -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImZvb0BiYXIuY29tIiwiaWF0IjoxNjk4MDk3NTIxLCJleHAiOjE2OTgxODM5MjF9.NZqVP1A6COeR8uNsr26HvQNC5Ta3jI8WARXPzCysyCM" -F "fichier=@input.txt" http://localhost:8080/api/justify -o out.txt

pour executer le test utiliser la commande npm test
pour générer un rappirt de couverture du code ajouter l'option -- --coverage
