'use strict';

let TelegramBot = require('node-telegram-bot-api');
let config = require('./src/config');

let options = {
    polling: true
};

let bot = new TelegramBot(config.telegramBotToken, options);

bot.getMe().then(user => {
    console.log('Hello, my name is %s!', user.username);
});

bot.onText(/\/help/, function (msg) {
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

bot.onText(/\/search (.+)/, function (msg, match) {
    let chatId = msg.chat.id;

    bot.sendMessage(chatId, `You are looking for *${match[1]}*`, {
        parse_mode: 'markdown'
    });
});