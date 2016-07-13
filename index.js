'use strict';
let TelegramBot = require('node-telegram-bot-api');
let config = require('./src/config');
var VK = require('vksdk');
var vk = new VK({
    'appId': 5538828,
    'appSecret': 'oc1hskEA0Y4UHAlXADGL',
    'language': 'ru'
});
let options = {
    polling: true
};
let bot = new TelegramBot(config.telegramBotToken, options);
bot.getMe().then(user => {
    console.log('Hello, my name is %s!', user.username);
});
bot.onText(/\/help/, function(msg) {
    let chatId = msg.chat.id;
    bot.getMe().then(user => {
        let message = `
Hello my name is ${user.first_name}.
        
List of commands:

/search - Search by phrase
        `;
        bot.sendMessage(chatId, message, {
            parse_mode: 'markdown'
        });
    });
});
bot.onText(/\/search (.+)/, function(msg, match) {
    let chatId = msg.chat.id;
    bot.sendMessage(chatId, `You are looking for *${match[1]}*`, {
        parse_mode: 'markdown'
    });
});
bot.onText(/\/test (.+)/, function(msg, match) {
    let chatId = msg.chat.id;
    let userId = msg.from.id;
    let photos = bot.getUserProfilePhotos(userId).then(function(data) {
        let photoId = data['photos'][0][0]['file_id'];
        bot.sendPhoto(chatId, photoId, {
            caption: 'ava'
        });
    });
})
bot.onText(/\/vk_user (.+)/, function(msg, match) {
    let chatId = msg.chat.id;
    vk.setSecureRequests(false);
    if (!Number.isInteger(parseInt(match[1]))) {
        bot.sendMessage(chatId, 'Id must be integer');
    } else {
        vk.request('users.get', {
            'user_id': match[1]
        });
        vk.on('done:users.get', function(_o) {
            let name = _o['response'][0]['first_name'];
            let last_name = _o['response'][0]['last_name'];
            bot.sendMessage(chatId, 'This is ' + name + ' ' + last_name);
        });
    }
})