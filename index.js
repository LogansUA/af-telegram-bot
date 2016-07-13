'use strict';
var http = require('http');
let request = require('request');
let TelegramBot = require('node-telegram-bot-api');
let config = require('./src/config');
let fs = require('fs');
var multer  = require('multer');
var VK = require('vksdk');

var vk = new VK({
    'appId': config.vkId,
    'appSecret': config.vkSecret,
    'language': 'ru'
});

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

bot.onText(/\/test (.+)/, function (msg, match) {
    let chatId = msg.chat.id;
    let userId = msg.from.id;
    let photos = bot.getUserProfilePhotos(userId).then(function (data) {
        let photoId = data['photos'][0][0]['file_id'];
        bot.sendPhoto(chatId, photoId, {
            caption: 'ava'
        });
    });
});

bot.onText(/\/vk_user (.+)/, function (msg, match) {
    let chatId = msg.chat.id;
    vk.setSecureRequests(false);
    if (!Number.isInteger(parseInt(match[1]))) {
        bot.sendMessage(chatId, 'Id must be integer');
    } else {
        vk.request('users.get', {
            'user_id': match[1]
        });
        vk.on('done:users.get', function (_o) {
            let name = _o['response'][0]['first_name'];
            let last_name = _o['response'][0]['last_name'];
            bot.sendMessage(chatId, 'This is ' + name + ' ' + last_name);
        });
    }
});

bot.onText(/\/vk_af_ua (.+)/, function (msg, match) {
    var chatId = msg.chat.id;
    vk.setSecureRequests(false);
    if (!Number.isInteger(parseInt(match[1]))) {
        bot.sendMessage(chatId, 'Value must be integer');
    } else {
        vk.request('wall.get', {
            'domain': 'americanfootball_ua',
            'offset': match[1],
            'count': 1,
            'filter': 'owner',
            'extended': 1,
        });
        vk.on('done:wall.get', function (_o) {
            let text = _o['response']['items'][0]['text'];
            let likes = _o['response']['items'][0]['likes'];
            let reposts = _o['response']['items'][0]['reposts'];
            // console.log(_o['response']['items'][0]['copy_history']);
            if (_o['response']['items'][0]['copy_history'] == undefined) {
                let attachments = _o['response']['items'][0]['attachments'][0];
                switchAttachments(attachments, chatId, text);
            } else {
                let attachments = _o['response']['items'][0]['copy_history'][0]['attachments'][0];
                switchAttachments(attachments, chatId, text);
            }
            // bot.sendMessage(chatId, 'This is ' + name + ' ' + last_name);
        });
    }
});

var download = function (url, dest, cb) {
    var file = fs.createWriteStream(dest);
    var request = http.get(url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            file.close(cb);  // close() is async, call cb after close completes.
        });
    }).on('error', function (err) { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        if (cb) cb(err.message);
    });
};

function switchAttachments(attachments, chatId, text) {
    switch (attachments['type']) {
        case 'photo' :
            let photo = attachments['photo']['photo_604'];

            download(photo, 'images/test.jpg');


            //@TODO NEED TO UPLOAD PHOTO FROM INPUT FILE

            bot.sendPhoto(chatId, '', {
                caption: text
            });

            break;

        case 'link' :
            console.log('link');
            break;

        case 'video' :
            console.log('video');
            break;

        default :
            console.log(attachments);
            break;
    }
}