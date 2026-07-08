require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = "-1003924350648";
const PORT = process.env.PORT || 3000;

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

let running = false;
let timer = null;
let userLastUsed = {};
let messageCount = 0;

// ✅ Tera hi function - Bilkul waise hi
function generateRandomUserId() {
  const now = Date.now();

  let repeatUsers = Object.keys(userLastUsed).filter(uid => {
    let diff = (now - userLastUsed[uid]) / 1000;
    return diff >= 300 && diff <= 600;
  });

  if (repeatUsers.length && Math.random() <= 0.4) {
    let uid = repeatUsers[Math.floor(Math.random() * repeatUsers.length)];
    userLastUsed[uid] = now;
    return uid;
  }

  while (true) {
    let uid = `${Math.floor(Math.random() * 4000 + 6000)}****${Math.floor(Math.random() * 9000 + 1000)}`;
    // 👆 YAHAN **** LAGA HUA HAI - YE SAHI HAI!
    if (!userLastUsed[uid]) {
      userLastUsed[uid] = now;
      return uid;
    }
  }
}

// ✅ Tera hi message format
function buildMessage(userId, amount, runTime, trackTime) {
  return (
`*Test Conversation Count 💝*

*🎁 Offer Name - Test*

*User Id :* ${userId}
*User Amount :* ₹${amount}
*🥳 User Payment :* Success

*Run Time -* ${runTime}
*Track Time -* ${trackTime}

*Powered By - CashFlix*`
  );
}

// ✅ Second message function
function sendSecondMessage(userId, runTime) {
  const randomDelay = Math.floor(Math.random() * 60000) + 60000;
  
  setTimeout(() => {
    if (!running) return;
    const trackTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    bot.sendMessage(
      CHANNEL_ID,
      buildMessage(userId, "5", runTime, trackTime),
      { parse_mode: "Markdown" }
    );
  }, randomDelay);
}

// ✅ Main function - Tera hi logic
function startConversation() {
  timer = setInterval(async () => {
    if (!running) return;

    for (let i = 0; i < 3; i++) {
      let now = new Date();
      let userId = generateRandomUserId();
      
      // Run Time - Random 1-2 Minute Pehle
      const randomSeconds = Math.floor(Math.random() * 60) + 60;
      let runTimeDate = new Date(now.getTime() - (randomSeconds * 1000));
      let runTime = runTimeDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      let trackTime = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

      await bot.sendMessage(
        CHANNEL_ID,
        buildMessage(userId, "0.1", runTime, trackTime),
        { parse_mode: "Markdown" }
      );

      sendSecondMessage(userId, runTime);
    }
  }, 60000);
}

// Commands
bot.onText(/\/test/, (msg) => {
  if (running) {
    return bot.sendMessage(msg.chat.id, "⚠️ Test already running.");
  }

  running = true;
  messageCount = 0;
  startConversation();
  bot.sendMessage(msg.chat.id, "✅ Test Started.");
});

bot.onText(/\/stop/, (msg) => {
  running = false;
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  bot.sendMessage(msg.chat.id, `🛑 Test Stopped.`);
});

// PORT for Render
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('🤖 Bot is running!'));
app.listen(PORT, () => console.log(`🌐 Web server running on port ${PORT}`));

console.log("🤖 Bot Started...");
console.log("✨ User ID Format: XXXX****XXXX");
