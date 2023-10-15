# api-justify

utiliser la commande on envoie un email à l'api/token qui retournera un token de la forme {'token' : "un token ...."}

curl -X POST -H "Content-Type: application/json" -d '{"email": "foo@bar.com"}' http://localhost:3000/api/token
