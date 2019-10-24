//Anfragen per RFID an WSS schicken
//Mit WebsocketServer verbinden
console.log("connect to WS Server");
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:7070');

//RFID-Config-Datei lesen
console.log("read rfid config file");
const fs = require('fs-extra');
const configObj = fs.readJsonSync(__dirname + '/config_cards_rc522.json');

//RFID Bibliothek laden
var rc522 = require("rc522");

//Wenn Verbindung mit WSS hergestellt wird
ws.on('open', function open() {
    console.log("connected to wss");

    //Wenn ein RFID-Karte ausgelesen wurde
    rc522(function (rfidSerialNumber) {
        console.log("detected id: " + rfidSerialNumber);

        //Wenn Karten-ID in Config vorkommt
        if (configObj[rfidSerialNumber] !== undefined) {

            //Karten-Daten auslesen aus Config
            let cardData = configObj[rfidSerialNumber];

            //MessageObjekt mit Info welche Audioplaylist / Video gespielt werden soll
            let messageObj = {
                type: cardData.type,
                value: cardData.value
            };
            console.log("send card data: " + JSON.stringify(messageObj));

            //Nachricht an WSS schicken
            ws.send(JSON.stringify({
                type: "send-card-data",
                value: JSON.stringify(messageObj)
            }));
        }

        //Karte nicht in Config
        else {
            console.log("id not in config: " + rfidSerialNumber);
        }
    });
});