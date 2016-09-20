# AWS IoT Magic Night

# Requirements

1. AWS account
2. NodeJS v6 (preferrably in a Linux, BSD, or OSX environment)
    - Install NVM (Node Version Manager)
    ```sh
    $ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash
    ```
    - Install or, if NVM already installed, use NodeJS 6
    ```sh
    $ nvm install 6
    ```
    ```sh
    $ nvm use 6
    ```
3. AWS IoT programmable button
4. Git client

# Setup

The challenge introduction will explain how to create TLS private signing keys and certificates for AWS IoT.

1. Clone this repo
```sh
$ git clone git@github.com:awssd/aws-iot-magic-night.git
```
2. Install NPM (Node Package Manager) dependencies for the Scorekeeper "device" application
```sh
$ cd aws-iot-magic-night/scorekeeper
$ npm install
```
3. Create an AWS SQS queue for this challenge
4. Configure Scorekeeper "device" application's scorekeper.js with the following values
    - The paths to the private signing key and certificate generated for this device
    - The AWS Account ID (You can get this from any ARN)
    - The AWS region you are using for this challenge
    - An AWS access key and secret that can read from your AWS SQS queue
    - The AWS SQS queue url
    - The AWS Iot Button device serial number (DSN). The DSN will be the MQTT topic that is published and subscribed to for button click messages.    
5. Configure AWS IoT button with MindTouch WiFi password, TLS private signing key, and certificate
    - MindTouch WiFi password will be available in the challenge introduction
    - [AWS IoT Button Configuration Documentation](http://docs.aws.amazon.com/iot/latest/developerguide/configure-iot.html)
6. Create a DynamoDB table for storing the Scorekeeper "point" message
    - The Scorekeeper "point" message contains properties for id, team, and timestamp
    - The DynamoDB trigger lambda function assumes that "team" is an index
7. Create an IAM role for a DynanmoDB trigger Lambda function
    - Example policies are available in lambda/polices. Look for any places that need values to be replaced such as Lambda function names and DynamoDB tables.
8. Install and configure the DynamoDB trigger Lambda function (lambda/dynamodb-trigger.js) with the following values
    - The AWS SQS queue url
    - The AWS region you are using for this challenge
    - The DynamoDB table name
9. Run the Scorekeper "device" application
```sh
$ node scorekeeper.js
```
# Challenge

Using the boilerplate code provided and setup described above, configure the AWS IoT rules engine to store the Scorekeeper's results in DynamoDB. Ensure that when the AWS IoT button is clicked, the Scorekeeper "device" application announces the point that was scored, correctly, and outputs the current results of the game (the data persisted in DynamoDB).

Now that you can see how AWS IoT interacts with devices over MQTT and how its messages are forwarded to the rest of the AWS infrastructure, its time to move forward in two distinct challenges. You can pick one, or both.

1. Collect stats such as CPU temperature, memory pressure, and other properties of the environment running the Scorekeeper "device" application and the battery voltage of the AWS IoT button, and send them as topics via MQTT. Create rules to forward messages to Cloudwatch for alerts, measurements, and graphing.

2. Upgrade the Scorekeper "device" application from a simple MQTT pubsub client, to a AWS IoT "Thing", with a device shadow. Create a second "device" application using an [AWS IoT SDK](https://aws.amazon.com/iot/sdk/), that can turn the Scorekeeper "device" on and off, by changing state via the device shadow. When the Scorekeeper "device" is turned off, it should output that it is disabled and no points should be sent to DynamoDB and no scorekeeping results should be announced.

# Additional Resources

* Setup Node Client:
    - http://docs.aws.amazon.com/iot/latest/developerguide/iot-device-sdk-node.html

* AWS IoT DynamoDB Rule:
    - http://docs.aws.amazon.com/iot/latest/developerguide/iot-ddb-rule.html

* AWS IoT Lambda Rule:
    - http://docs.aws.amazon.com/iot/latest/developerguide/iot-lambda-rule.html
