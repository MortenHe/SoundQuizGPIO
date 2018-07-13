//Mit WebsocketServer verbinden
console.log("connect to WS Server");
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:8080');

//Input von Kommandozeile lesen
var stdin = process.stdin;
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');

//Game-Config-JSON-Objekt aus Datei holen, um daraus passende Datenstruktur zu bauen
const fs = require('fs-extra');
console.log("read game config".green);
const gameConfigJSON = fs.readJsonSync('config.json');

//Antworten und Spiele sammeln
var gameConfig = {};
var games = [];

//Ueber Karten gehen
for (let card in gameConfigJSON) {

    //Karteninfo laden
    let cardInfo = gameConfigJSON[card];

    //Wenn es eine Antwortkarte ist
    if (cardInfo["type"] === "answer") {

        //Ueber die Spiele gehen, denen diese Karte zugeordnet ist
        for (let game of cardInfo["games"]) {

            //Wenn es bei diesem Spiel noch keine Eintraege gibt ein Array anlagen, ansonsten weiteren Wert hinzufuegen
            !gameConfig[game] ? gameConfig[game] = [cardInfo["value"]] : gameConfig[game].push(cardInfo["value"])
        }
    }

    //wenn es  eine game-select Karte ist
    else if (cardInfo["type"] === "game-select") {

        //Spiele sammeln
        games.push(cardInfo["value"]);
    }
}
console.log("available games: " + JSON.stringify(games).green);
console.log("available questions: " + JSON.stringify(gameConfig).green);

//durch Spiele und Antworten durchschalten
var gameIndex = 0;
var answerIndex = 0;

//Abfrage-Objekt
var messageObj = {
    type: "",
    value: ""
};

//Wenn Verbindung mit WSS hergestellt wird
ws.on('open', function open() {
    console.log("connected to wss");

    // on any data into stdin
    stdin.on('data', function (key) {

        // write the key to stdout
        console.log(key);

        //verschiedene Aktionen ausfuehren
        switch (key) {
            case "q":
                process.exit();
                break;

            //Spiel beenden
            case "w":
                messageObj.type = "shutdown";
                console.log("send card data: " + JSON.stringify(messageObj));

                //Nachricht an WSS schicken
                ws.send(JSON.stringify({
                    type: "send-card-data",
                    value: JSON.stringify(messageObj)
                }));
                break;

            //durch die Spiele schalten
            case "a":

                //Spiel setzen
                currentGame = games[gameIndex];
                console.log("select game " + currentGame);

                //Game-Select fuer WS setzen
                messageObj.type = "game-select";
                messageObj.value = currentGame;

                //zum naechsten Spiel blaettern
                gameIndex = ((gameIndex + 1) % games.length);

                //Antworten wieder von vorne beginnen
                answerIndex = 0;
                break;

            //durch die Antworten blaettern
            case "y":

                //Antwort setzen
                currentAnswer = gameConfig[currentGame][answerIndex];
                console.log("select answer " + currentAnswer);

                //Answer fuer WS setzen
                messageObj.type = "answer";
                messageObj.value = currentAnswer;

                //zur naechsten Antwort blaettern
                answerIndex = ((answerIndex + 1) % gameConfig[currentGame].length);
                break;

            //Anfrage abschicken
            case "s":
                console.log("send card data: " + JSON.stringify(messageObj));

                //Nachricht an WSS schicken
                ws.send(JSON.stringify({
                    type: "send-card-data",
                    value: JSON.stringify(messageObj)
                }));
                break;
        }
    });
});