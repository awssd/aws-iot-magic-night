'use strict'
const aws = require('aws-sdk');
const dynamodb = new aws.DynamoDB({ apiVersion: '2012-08-10' });
const sqs = new aws.SQS({
    apiVersion: '2012-11-05',
    region: 'us-west-2'
});
exports.handler = (event, context, callback) => {
    dynamodb.scan({

        // TODO: update to real DynamoDB table
        TableName : 'aws-magic-night_pingpong-scores',
        Limit : 100
    }, (err, data) => {
        if(err) {
            callback(new Error('Reading DynamoDB failed: ' + err));
            return;
        }
        const scores = {};

        // NOTE assumes 'team' is an attribute primary key, sort key, etc...
        data.Items.forEach((item) => {
            let team = item.team.S;
            if(team in scores) {
                scores[team]++;
            } else {
                scores[team] = 1;
            }
        });
        const message = JSON.stringify(scores);
        sqs.sendMessage({
            MessageBody: message,

            // TODO: update to real SQS url
            QueueUrl: '...'
        }, (err, data) => {
            if(err) {
                callback(new Error('Sending SQS message failed: ' + err));
                return;
            }
            console.log('Sent SQS message: ' + JSON.stringify({
                message: message,
                response: data
            }));
        });
    });
    callback(null, { success: true });
};
