"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_develop_1 = require("telegraf-develop");
const config_1 = require("./config");
const BOT_TOKEN = config_1.Config.TOKEN;
if (typeof BOT_TOKEN !== 'string') {
    throw Error('Telegram bot token not found');
}
const bot = new telegraf_develop_1.Telegraf(BOT_TOKEN);
