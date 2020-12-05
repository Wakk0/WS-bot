const { Client, Chat } = require('whatsapp-web.js');
const AWS = require('aws-sdk');
const uuid = require('uuid');
const i = 0;
const db = new AWS.DynamoDB.DocumentClient();
let sessionData, client;
function sleep (time) { return new Promise((resolve) => setTimeout(resolve, time)); }
AWS.config.update({region: 'us-east-1'});

if(process.env.WABrowserId){
    sessionData = { 
        WABrowserId: process.env.WABrowserId,
        WASecretBundle: process.env.WASecretBundle,
        WAToken1: process.env.WAToken1,
        WAToken2: process.env.WAToken2
    }
} else {
    console.log("Error, var not defined!")
}

if(sessionData){
    client = new Client({ 
        puppeteer: {
            ignoreDefaultArgs: ['--disable-extensions'],
            args: ['--no-sandbox']
    }, session: sessionData });
} else {
    console.log("sessionData not defined!\nUse login.js to get the login data!");
}

client.initialize();

async function PresenceStatus() {
    while (i != 1) {
    await sleep(10000);
    client.sendPresenceAvailable();
    }
}

PresenceStatus();

client.on('message', async (msg) => {
    client.sendPresenceAvailable();
});

client.on('message_revoke_everyone', async (msg,rmsg) => {
    const chat = await rmsg.getChat();
    const user = await msg.getContact();
    const ddate = Math.round(new Date(Date.now()).getTime() / 1000);
    const dataDB = {
        TableName: 'REVOKED_MESSAGES',
        Item: {
            "uuid": uuid.v4(),
            "chat": chat.name,
            "date": msg.timestamp,
            "deletion_date": ddate,
            "from": user.pushname,
            "from_ph": rmsg.from,
            "message": rmsg.body
        }
    };

    await db.put(dataDB).promise();
    console.log(rmsg);
});