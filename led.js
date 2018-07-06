//Mit WebsocketServer verbinden
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:8080');

//GPIO Bibliothek laden
const Gpio = require('onoff').Gpio;

//LED 20 gruenes Licht fuer korrekte Antwort
const ledGreen = new Gpio(20, 'out');

//Wenn Verbindung mit WSS hergestellt wird
ws.on('open', function open() {
    console.log("connected to wss");

    //Wenn WS eine Nachricht von WSS empfaengt
    ws.on('message', function incoming(message) {

        //Nachricht kommt als String -> in JSON Objekt konvertieren
        var obj = JSON.parse(message);

        //Wenn Auswertung der Frage geliefert wird
        if (obj.type === "answer-state") {

            //Wenn die Antwort richtig war
            if (obj.value === true) {
                console.log("correct answer. Turn on green led");

                //Gruene LED anschalten
                ledGreen.writeSync(1);

                //Nach 3 Sekunden wieder LED aus
                setTimeout(() => {
                    ledGreen.writeSync(0);
                }, 3000);
            }

            //die Antwort war falsch
            else {
                console.log("wrong answer. Turn on red led");
            }
        }
    });
});