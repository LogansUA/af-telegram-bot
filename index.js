'use strict';

var TelegramBot = require('node-telegram-bot-api');
var config = require('./src/config');
var VK = require('vksdk');

var vk = new VK({
    appId: config.vk.id,
    appSecret: config.vk.secret,
    language: config.vk.language
});

var bot = new TelegramBot(config.telegramBotToken, {
    polling: true
});

bot.getMe().then(user => {
    console.log('Hello, my name is %s!', user.username);
});

bot.onText(/\/help/, function (msg) {
    var chatId = msg.chat.id;
    bot.getMe().then(user => {
        var message = `
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
    var chatId = msg.chat.id;

    vk.setSecureRequests(false);

    vk.request('wall.search', {
        domain: 'americanfootball_ua',
        offset: 0,
        count: 1,
        extended: 1,
        query: match[1]
    });
    vk.on('done:wall.search', function (object) {
        var vkItems = object.response.items;

        if (vkItems != undefined && vkItems.length > 0) {
            var items = [];

            // Removing duplicates
            for (var i = 0; i < vkItems.length; i++) {
                var item = vkItems[i];

                items[item.id] = item;
            }

            renderItems(items, chatId);
        } else {
            bot.sendMessage(chatId, `For query ${match[1]} nothing found!`);
        }
    });
});

var renderItems = function (items, chatId) {
    var itemsLength = items.length;

    for (var i = 0; i < itemsLength; i++) {
        if (items[i] != undefined) {
            if (items[i].copy_history == undefined) {
                var item = items[i];
            } else {
                // Getting only one value
                if (items[i].copy_history.length > 0) {
                    item = items[i].copy_history.shift();
                } else {
                    item = items[i].copy_history;
                }
            }

            if (item.attachments != undefined && item.attachments.length > 0) {
                renderAttachments(item.attachments, chatId);

                bot.sendMessage(chatId, item.text);
            }
        }
    }
};

var renderAttachments = function (attachments, chatId) {
    for (var i = 0; i < attachments.length; i++) {
        var attachment = attachments[i];

        if (attachment.type == 'photo') {
            bot.sendMessage(chatId, attachment.photo.photo_604);
        }
        if (attachment.type == 'link') {
            bot.sendMessage(chatId, attachment.link.url);
        }
        if (attachment.type == 'video') {
            bot.sendMessage(chatId, attachment.video.photo_800);
        }
    }
};