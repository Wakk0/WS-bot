const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

client = new Client();
client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
    });

client.on('authenticated', (session) => {
    console.log(session);
});

client.on('ready', () => {
    console.log('WhatsApp Client Connected!');
});

client.initialize();