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

// ✅ INDIAN TIME FORMATTER (BINA AM/PM)
function getIndianTime(date) {
  const d = date || new Date();
  const options = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };
  const formatter = new Intl.DateTimeFormat('en-IN', options);
  const parts = formatter.formatToParts(d);
  let day, month, year, hour, minute, second;
  parts.forEach(part => {
    if (part.type === 'day') day = part.value;
    if (part.type === 'month') month = part.value;
    if (part.type === 'year') year = part.value;
    if (part.type === 'hour') hour = part.value;
    if (part.type === 'minute') minute = part.value;
    if (part.type === 'second') second = part.value;
  });
  return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
}

// ✅ USER ID GENERATE - **** KE SATH
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
    let first4 = Math.floor(Math.random() * 4000 + 6000);
    let last4 = Math.floor(Math.random() * 9000 + 1000);
    let uid = `${first4}****${last4}`;
    if (!userLastUsed[uid]) {
      userLastUsed[uid] = now;
      return uid;
    }
  }
}

// ✅ MESSAGE FORMAT - <b> HTML TAG SE BOLD
function buildMessage(userId, amount, runTime, trackTime) {
  return (
`<b> Conversation Count 💝</b>

<b>🎁 Offer Name - Policybazar</b>

<b>User Id : ${userId}</b>
<b>User Amount : ₹${amount}</b>
<b>🥳 User Payment : Success</b>

<b>Run Time - ${runTime}</b>
<b>Track Time - ${trackTime}</b>

<b>Powered By - CashFlix</b>`
  );
}

// ✅ SECOND MESSAGE - RANDOM 1-2 MIN
function sendSecondMessage(userId, runTime) {
  const randomDelay = Math.floor(Math.random() * 60000) + 60000;

  setTimeout(() => {
    if (!running) return;
    const trackTime = getIndianTime(new Date());
    bot.sendMessage(
      CHANNEL_ID,
      buildMessage(userId, "5", runTime, trackTime),
      { parse_mode: "HTML" }
    ).catch(err => console.log("Second msg error:", err.message));
  }, randomDelay);
}

// ✅ MAIN SCHEDULER - HAR MINUTE 3 MESSAGES WITH 10-15 SECOND GAP
function startConversation() {
  console.log("🚀 Started - 3 messages per minute with 10-15 sec gap");

  timer = setInterval(async () => {
    if (!running) {
      clearInterval(timer);
      timer = null;
      return;
    }

    const now = new Date();

    for (let i = 0; i < 3; i++) {
      try {
        let userId = generateRandomUserId();

        // Run Time - Random 1-2 Minute Pehle
        const randomSeconds = Math.floor(Math.random() * 60) + 60;
        let runTimeDate = new Date(now.getTime() - (randomSeconds * 1000));
        let runTime = getIndianTime(runTimeDate);

        // Track Time - Current Indian Time
        let trackTime = getIndianTime(now);

        await bot.sendMessage(
          CHANNEL_ID,
          buildMessage(userId, "0.1", runTime, trackTime),
          { parse_mode: "HTML" }
        );
        messageCount++;
        console.log(`✅ ₹0.1 message ${i+1}/3 sent for ${userId}`);

        sendSecondMessage(userId, runTime);

        // ✅ 10-15 SECOND GAP BETWEEN MESSAGES
        const gap = Math.floor(Math.random() * 5000) + 10000; // 10,000ms to 15,000ms
        console.log(`⏳ Waiting ${gap/1000} seconds before next message...`);
        await new Promise(resolve => setTimeout(resolve, gap));

      } catch (error) {
        console.log("Error:", error.message);
        if (error.response?.body?.description?.includes('429')) {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }
  }, 60000); // 🔥 HAR 1 MINUTE
}

// ===== COMMANDS =====
bot.onText(/\/test/, async (msg) => {
  if (running) {
    return bot.sendMessage(msg.chat.id, "⚠️ Already running!");
  }

  try {
    const botInfo = await bot.getMe();
    await bot.getChatMember(CHANNEL_ID, botInfo.id);
  } catch (error) {
    return bot.sendMessage(msg.chat.id, "❌ Bot is not admin in channel!");
  }

  running = true;
  messageCount = 0;
  startConversation();
  bot.sendMessage(msg.chat.id, "✅ Started! 3 msgs/min with 10-15 sec gap");
});

bot.onText(/\/stop/, (msg) => {
  running = false;
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  bot.sendMessage(msg.chat.id, `🛑 Stopped. Total: ${messageCount}`);
});

bot.onText(/\/status/, (msg) => {
  bot.sendMessage(msg.chat.id, `
📊 Status:
Running: ${running ? "✅ Yes" : "❌ No"}
Total Messages: ${messageCount}
Users: ${Object.keys(userLastUsed).length}
Time: ${getIndianTime(new Date())}
  `);
});

// ===== PORT (RENDER KE LIYE) =====
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('🤖 Bot is running!'));
app.listen(PORT, () => console.log(`🌐 Web server running on port ${PORT}`));

console.log("🤖 Bot Started...");
console.log(`📢 Channel: ${CHANNEL_ID}`);
console.log(`🕐 Indian Time: ${getIndianTime(new Date())}`);
console.log("✨ 3 msgs/min | 10-15 sec gap | <b> Bold");
