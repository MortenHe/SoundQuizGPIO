//Mit WebsocketServer verbinden
console.log("connect to WS Server");
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:8080');

//Input von Kommandozeile lesen
var stdin = process.stdin;

// without this, we would only get streams once enter is pressed
stdin.setRawMode(true);

// resume stdin in the parent process (node app won't quit all by itself
// unless an error or process.exit() happens)
stdin.resume();

// i don't want binary, do you?
stdin.setEncoding('utf8');

//Wenn Verbindung mit WSS hergestellt wird
ws.on('open', function open() {
    console.log("connected to wss");

    // on any data into stdin
    stdin.on('data', function (key) {

        //MessageObjekt anlegen
        let messageObj = {
            type: "answer",
            value: ""
        };

        // write the key to stdout all normal like
        //console.log(key);

        //verschiedene Aktionen ausfuehren
        switch (key) {
            case "q":
                process.exit();
                break;

            case "a":
                messageObj.type = "game-select";
                messageObj.value = "sounds";
                break;

            case "y":
                messageObj.type = "game-select";
                messageObj.value = "people";
                break;

            case "s":
                messageObj.value = "car";
                break;

            case "d":
                messageObj.value = "cat";
                break;

            case "f":
                messageObj.value = "dog";
                break;

            case "x":
                messageObj.value = "steffi";
                break;

            case "c":
                messageObj.value = "martin";
                break;

            case "v":
                messageObj.value = "luis";
                break;

            //Spiel beenden
            case "w":
                messageObj.type = "shutdown";
                break;
        }
        console.log("send card data: " + JSON.stringify(messageObj));

        //Nachricht an WSS schicken
        ws.send(JSON.stringify({
            type: "send-card-data",
            value: JSON.stringify(messageObj)
        }));
    });
});