'use strict'

// dependencies
const iot = require('aws-iot-device-sdk');
const aws = require('aws-sdk');
const consumer = require('sqs-consumer');
const uuid = require('node-uuid');

// configuration
const device = iot.device({
    keyPath: './certs/<private key>',
    certPath: './certs/<public certificate>',
    caPath: './certs/VeriSign-Class 3-Public-Primary-Certification-Authority-G5.pem',
    clientId: '<account id>',
    region: 'us-west-2'
});
const sqs = new aws.SQS({
    apiVersion: '2012-11-05',
    region: 'us-west-2',
    accessKeyId: '<aws access key>',
    secretAccessKey: '<aws access secret>'
});
const teams = {
    single: 'Red Team',
    double: 'Blue Team',
    long: 'Green Team'
}

// the scorekeeper device
device
    .on('connect', () => {

        // TODO: update with real iotbutton topic
        device.subscribe('iotbutton/<iotbutton dsn>');
        device.subscribe('scorekeeper/point');
    });
device
    .on('message', (topic, payload) => {
        const json = payload.toString();
        const message = JSON.parse(json);
        switch(topic) {

            // TODO: update with real iotbutton topic
            case 'iotbutton/<iotbutton dsn>':
                const clickType = message.clickType.toLowerCase();
                const msg = {
                    id: uuid.v1(),
                    team: teams[message.clickType.toLowerCase()],
                    timestamp: new Date().toISOString()
                };

                // NOTE: MQTT is not ideal for publishing non-device actions or status, this is simply
                // an example of how MQTT topics function
                device.publish('scorekeeper/point', JSON.stringify(msg));
                break;
            case 'scorekeeper/point':
                console.log(`POINT (${message.timestamp}): ${message.team}`);
                break;
        }
    });
const scorekeeperResults = consumer.create({

    // TODO: update to real SQS url
    queueUrl: '...',
    handleMessage: (message, done) => {
        const parsed = JSON.parse(message.Body);
        for(let team in parsed) {
            console.log(`Current score for ${team}: ${parsed[team]}`);
        }
        done();
    },
    sqs: sqs
});
scorekeeperResults.on('error', (err) => {
    console.log('ERROR: ' + err.message);
});
scorekeeperResults.start();

// TODO: Send MQTT message(s) about the status of the scorekeeper machine
// used vs available memory, cpu temp, etc

// TODO: Update the device's on/off status via the thing shadow
