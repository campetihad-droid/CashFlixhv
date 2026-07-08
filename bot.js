require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = "-1003924350648";
const PORT = process.env.PORT || 3000;

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

let running = false;
let running2 = false;
let timer = null;
let timer2 = null;
let userLastUsed = {};
let userLastUsed2 = {};
let messageCount = 0;
let messageCount2 = 0;

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
function generateRandomUserId(userMap) {
  const now = Date.now();
  const map = userMap || userLastUsed;

  let repeatUsers = Object.keys(map).filter(uid => {
    let diff = (now - map[uid]) / 1000;
    return diff >= 300 && diff <= 600;
  });

  if (repeatUsers.length && Math.random() <= 0.4) {
    let uid = repeatUsers[Math.floor(Math.random() * repeatUsers.length)];
    map[uid] = now;
    return uid;
  }

  while (true) {
    let first4 = Math.floor(Math.random() * 4000 + 6000);
    let last4 = Math.floor(Math.random() * 9000 + 1000);
    let uid = `${first4}****${last4}`;
    if (!map[uid]) {
      map[uid] = now;
      return uid;
    }
  }
}

// ✅ MESSAGE FORMAT 1 - Bot 1
function buildMessage1(userId, amount, runTime, trackTime) {
  return (
`<b>Test Conversation Count 💝</b>

<b>🎁 Offer Name - PolicyBazar</b>

<b>User Id : ${userId}</b>
<b>User Amount : ₹${amount}</b>
<b>🥳 User Payment : Success</b>

<b>Run Time - ${runTime}</b>
<b>Track Time - ${trackTime}</b>

<b>Powered By - CashFlix</b>`
  );
}

// ✅ MESSAGE FORMAT 2 - Bot 2 (Offer Name Hataya, Uper New Offer Likha)
function buildMessage2(userId, amount, runTime, trackTime) {
  return (
`<b>🔥 New Offer 💝</b>

<b>🎁 Offer Name - Test</b>

<b>User Id : ${userId}</b>
<b>User Amount : ₹${amount}</b>
<b>🥳 User Payment : Success</b>

<b>Run Time - ${runTime}</b>
<b>Track Time - ${trackTime}</b>

<b>Powered By - CashFlix</b>`
  );
}

// ✅ SECOND MESSAGE - RANDOM 1-1.5 MINUTE (60-90 SECONDS)
function sendSecondMessage(userId, runTime, buildFunction, msgCounter, userMap, runningFlag) {
  const randomDelay = Math.floor(Math.random() * 30000) + 60000;

  setTimeout(() => {
    if (!runningFlag()) return;
    const trackTime = getIndianTime(new Date());
    bot.sendMessage(
      CHANNEL_ID,
      buildFunction(userId, "5", runTime, trackTime),
      { parse_mode: "HTML" }
    ).catch(err => console.log("Second msg error:", err.message));
  }, randomDelay);
}

// ✅ SEND MESSAGE FUNCTION
async function sendMessage(userId, amount, runTime, trackTime, buildFunction) {
  try {
    await bot.sendMessage(
      CHANNEL_ID,
      buildFunction(userId, amount, runTime, trackTime),
      { parse_mode: "HTML" }
    );
    return true;
  } catch (error) {
    console.log("Error:", error.message);
    return false;
  }
}

// 🎯 =============================================
// 🎯 🔥 YAHAN PER MINUTE MESSAGES COUNT CHANGE KARO
// 🎯 =============================================
const MESSAGES_PER_MINUTE = 4;  // 👈 Bot 1
const MESSAGES_PER_MINUTE_2 = 3; // 👈 Bot 2
// 🎯 =============================================

// ✅ BOT 1 - START CONVERSATION (/test)
function startConversation() {
  console.log(`🚀 Bot 1 Started - ${MESSAGES_PER_MINUTE} messages per minute with 10 sec gap`);

  timer = setInterval(async () => {
    if (!running) {
      clearInterval(timer);
      timer = null;
      return;
    }

    const now = new Date();

    for (let i = 0; i < MESSAGES_PER_MINUTE; i++) {
      try {
        let userId = generateRandomUserId(userLastUsed);

        const randomSeconds = Math.floor(Math.random() * 60) + 60;
        let runTimeDate = new Date(now.getTime() - (randomSeconds * 1000));
        let runTime = getIndianTime(runTimeDate);
        let trackTime = getIndianTime(now);

        await sendMessage(userId, "0.1", runTime, trackTime, buildMessage1);
        messageCount++;
        console.log(`✅ Bot1 ₹0.1 message ${i+1}/${MESSAGES_PER_MINUTE} sent for ${userId}`);

        sendSecondMessage(userId, runTime, buildMessage1, 'messageCount', userLastUsed, () => running);

        if (i < MESSAGES_PER_MINUTE - 1) {
          await new Promise(resolve => setTimeout(resolve, 10000));
        }

      } catch (error) {
        console.log("Error:", error.message);
        if (error.response?.body?.description?.includes('429')) {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }
  }, 60000);
}

// ✅ BOT 2 - START CONVERSATION (/test 2)
function startConversation2() {
  console.log(`🚀 Bot 2 Started - ${MESSAGES_PER_MINUTE_2} messages per minute with 10 sec gap`);

  timer2 = setInterval(async () => {
    if (!running2) {
      clearInterval(timer2);
      timer2 = null;
      return;
    }

    const now = new Date();

    for (let i = 0; i < MESSAGES_PER_MINUTE_2; i++) {
      try {
        let userId = generateRandomUserId(userLastUsed2);

        const randomSeconds = Math.floor(Math.random() * 60) + 60;
        let runTimeDate = new Date(now.getTime() - (randomSeconds * 1000));
        let runTime = getIndianTime(runTimeDate);
        let trackTime = getIndianTime(now);

        await sendMessage(userId, "0.1", runTime, trackTime, buildMessage2);
        messageCount2++;
        console.log(`✅ Bot2 ₹0.1 message ${i+1}/${MESSAGES_PER_MINUTE_2} sent for ${userId}`);

        sendSecondMessage(userId, runTime, buildMessage2, 'messageCount2', userLastUsed2, () => running2);

        if (i < MESSAGES_PER_MINUTE_2 - 1) {
          await new Promise(resolve => setTimeout(resolve, 10000));
        }

      } catch (error) {
        console.log("Error:", error.message);
        if (error.response?.body?.description?.includes('429')) {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }
  }, 60000);
}

// ===== COMMANDS =====

// ✅ /test - Bot 1 Start
bot.onText(/\/test$/, async (msg) => {
  const chatId = msg.chat.id;

  if (running) {
    return bot.sendMessage(chatId, "⚠️ Bot 1 already running!");
  }

  try {
    const botInfo = await bot.getMe();
    await bot.getChatMember(CHANNEL_ID, botInfo.id);
  } catch (error) {
    return bot.sendMessage(chatId, "❌ Bot is not admin in channel!");
  }

  running = true;
  messageCount = 0;
  startConversation();
  bot.sendMessage(chatId, `✅ Bot 1 Started! ${MESSAGES_PER_MINUTE} msgs/min`);
});

// ✅ /test 2 - Bot 2 Start
bot.onText(/\/test 2/, async (msg) => {
  const chatId = msg.chat.id;

  if (running2) {
    return bot.sendMessage(chatId, "⚠️ Bot 2 already running!");
  }

  try {
    const botInfo = await bot.getMe();
    await bot.getChatMember(CHANNEL_ID, botInfo.id);
  } catch (error) {
    return bot.sendMessage(chatId, "❌ Bot is not admin in channel!");
  }

  running2 = true;
  messageCount2 = 0;
  startConversation2();
  bot.sendMessage(chatId, `✅ Bot 2 Started! ${MESSAGES_PER_MINUTE_2} msgs/min`);
});

// ✅ /stop - Bot 1 Stop
bot.onText(/\/stop$/, (msg) => {
  const chatId = msg.chat.id;

  running = false;
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  bot.sendMessage(chatId, `🛑 Bot 1 Stopped. Total: ${messageCount}`);
});

// ✅ /stop 2 - Bot 2 Stop
bot.onText(/\/stop 2/, (msg) => {
  const chatId = msg.chat.id;

  running2 = false;
  if (timer2) {
    clearInterval(timer2);
    timer2 = null;
  }
  bot.sendMessage(chatId, `🛑 Bot 2 Stopped. Total: ${messageCount2}`);
});

// ✅ /status - Full Status
bot.onText(/\/status/, (msg) => {
  bot.sendMessage(msg.chat.id, `
📊 Full Status:

🤖 Bot 1:
Running: ${running ? "✅ Yes" : "❌ No"}
Messages: ${messageCount}
Speed: ${MESSAGES_PER_MINUTE} msgs/min

🤖 Bot 2:
Running: ${running2 ? "✅ Yes" : "❌ No"}
Messages: ${messageCount2}
Speed: ${MESSAGES_PER_MINUTE_2} msgs/min

👥 Users Bot1: ${Object.keys(userLastUsed).length}
👥 Users Bot2: ${Object.keys(userLastUsed2).length}
🕐 Time: ${getIndianTime(new Date())}
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
console.log(`✨ Bot1: ${MESSAGES_PER_MINUTE} msgs/min | Bot2: ${MESSAGES_PER_MINUTE_2} msgs/min`);
