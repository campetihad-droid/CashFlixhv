require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = "-1003974352666";
const PORT = process.env.PORT || 3000;

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// ============================================================
// 🎯 AMOUNT SETTINGS - YAHAN CHANGE KARO 🎯
// ============================================================

// 🔥 BOT 1 SETTINGS (JO /test SE CHALTA HAI)
const BOT1 = {
  running: false,
  timer: null,
  userLastUsed: {},
  messageCount: 0,
  messageCount2: 0,
  firstMsg: true,
  secondMsg: true,
  messagesPerMinute: 2,

  // 👇 YAHAN AMOUNT CHANGE KARO
  firstAmount: "0.1",   // First Message (₹0.1) - Jo chahe daalo
  secondAmount: "5"     // Second Message (₹5) - Jo chahe daalo
};

// 🔥 BOT 2 SETTINGS (JO /test 2 SE CHALTA HAI)
const BOT2 = {
  running: false,
  timer: null,
  userLastUsed: {},
  messageCount: 0,
  messageCount2: 0,
  firstMsg: true,
  secondMsg: true,
  messagesPerMinute: 3,

  // 👇 YAHAN AMOUNT CHANGE KARO
  firstAmount: "0.1",   // First Message (₹0.1) - Jo chahe daalo
  secondAmount: "5"     // Second Message (₹5) - Jo chahe daalo
};

// ============================================================

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

function generateRandomUserId(userMap) {
  const now = Date.now();
  const map = userMap;

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
`<b>Conversation Count 💝</b>

<b>🎁 Offer Name - PolicyBazar</b>

<b>User Id : ${userId}</b>
<b>User Amount : ₹${amount}</b>
<b>🥳 User Payment : Success</b>

<b>Run Time - ${runTime}</b>
<b>Track Time - ${trackTime}</b>

<b>Powered By - CashFlix</b>`
  );
}

// ✅ MESSAGE FORMAT 2 - Bot 2
function buildMessage2(userId, amount, runTime, trackTime) {
  return (
`<b>🔥 New Offer 💝</b>

<b>🎁 Offer Name - Test</b>

<b>User Id :</b> ${userId}
<b>User Amount :</b> 💰 <b>₹${amount}</b>
<b>🥳 User Payment :</b> Success ✅

<b>Run Time -</b> ${runTime}
<b>Track Time -</b> ${trackTime}

<b>Powered By - CashFlix</b>`
  );
}

// ✅ SECOND MESSAGE
function sendSecondMessage(userId, runTime, buildFunction, settings, botName) {
  const randomDelay = Math.floor(Math.random() * 30000) + 60000;

  setTimeout(() => {
    if (!settings.running || !settings.secondMsg) {
      console.log(`⏸️ ${botName} second message blocked`);
      return;
    }
    const trackTime = getIndianTime(new Date());
    bot.sendMessage(
      CHANNEL_ID,
      buildFunction(userId, settings.secondAmount, runTime, trackTime), // ✅ SECOND AMOUNT
      { parse_mode: "HTML" }
    ).catch(err => console.log("Second msg error:", err.message));
  }, randomDelay);
}

// ✅ SEND FIRST MESSAGE
async function sendFirstMessage(userId, amount, runTime, trackTime, buildFunction, settings, botName) {
  try {
    if (!settings.firstMsg) {
      console.log(`⏸️ ${botName} first message blocked`);
      return false;
    }

    await bot.sendMessage(
      CHANNEL_ID,
      buildFunction(userId, amount, runTime, trackTime),
      { parse_mode: "HTML" }
    );
    settings.messageCount++;
    console.log(`✅ ${botName} ₹${amount} message sent for ${userId}`);
    return true;
  } catch (error) {
    console.log("Error:", error.message);
    return false;
  }
}

// ✅ BOT 1 - START
function startConversation1() {
  console.log(`🚀 Bot 1 Started - ${BOT1.messagesPerMinute} msgs/min`);
  console.log(`   First Amount: ₹${BOT1.firstAmount} | Second Amount: ₹${BOT1.secondAmount}`);

  BOT1.timer = setInterval(async () => {
    if (!BOT1.running) {
      clearInterval(BOT1.timer);
      BOT1.timer = null;
      return;
    }

    const now = new Date();

    for (let i = 0; i < BOT1.messagesPerMinute; i++) {
      try {
        let userId = generateRandomUserId(BOT1.userLastUsed);

        const randomSeconds = Math.floor(Math.random() * 60) + 60;
        let runTimeDate = new Date(now.getTime() - (randomSeconds * 1000));
        let runTime = getIndianTime(runTimeDate);
        let trackTime = getIndianTime(now);

        // ✅ FIRST AMOUNT USE HO RAHA HAI
        await sendFirstMessage(userId, BOT1.firstAmount, runTime, trackTime, buildMessage1, BOT1, "Bot1");

        if (BOT1.secondMsg) {
          sendSecondMessage(userId, runTime, buildMessage1, BOT1, "Bot1");
        }

        if (i < BOT1.messagesPerMinute - 1) {
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

// ✅ BOT 2 - START
function startConversation2() {
  console.log(`🚀 Bot 2 Started - ${BOT2.messagesPerMinute} msgs/min`);
  console.log(`   First Amount: ₹${BOT2.firstAmount} | Second Amount: ₹${BOT2.secondAmount}`);

  BOT2.timer = setInterval(async () => {
    if (!BOT2.running) {
      clearInterval(BOT2.timer);
      BOT2.timer = null;
      return;
    }

    const now = new Date();

    for (let i = 0; i < BOT2.messagesPerMinute; i++) {
      try {
        let userId = generateRandomUserId(BOT2.userLastUsed);

        const randomSeconds = Math.floor(Math.random() * 60) + 60;
        let runTimeDate = new Date(now.getTime() - (randomSeconds * 1000));
        let runTime = getIndianTime(runTimeDate);
        let trackTime = getIndianTime(now);

        // ✅ FIRST AMOUNT USE HO RAHA HAI
        await sendFirstMessage(userId, BOT2.firstAmount, runTime, trackTime, buildMessage2, BOT2, "Bot2");

        if (BOT2.secondMsg) {
          sendSecondMessage(userId, runTime, buildMessage2, BOT2, "Bot2");
        }

        if (i < BOT2.messagesPerMinute - 1) {
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
bot.onText(/\/test$/, async (msg) => {
  const chatId = msg.chat.id;
  if (BOT1.running) return bot.sendMessage(chatId, "⚠️ Bot 1 already running!");

  try {
    const botInfo = await bot.getMe();
    await bot.getChatMember(CHANNEL_ID, botInfo.id);
  } catch (error) {
    return bot.sendMessage(chatId, "❌ Bot is not admin in channel!");
  }

  BOT1.running = true;
  BOT1.messageCount = 0;
  startConversation1();
  bot.sendMessage(chatId, `✅ Bot 1 Started!
📌 First Amount: ₹${BOT1.firstAmount}
📌 Second Amount: ₹${BOT1.secondAmount}
📌 Speed: ${BOT1.messagesPerMinute} msgs/min`);
});

bot.onText(/\/test 2/, async (msg) => {
  const chatId = msg.chat.id;
  if (BOT2.running) return bot.sendMessage(chatId, "⚠️ Bot 2 already running!");

  try {
    const botInfo = await bot.getMe();
    await bot.getChatMember(CHANNEL_ID, botInfo.id);
  } catch (error) {
    return bot.sendMessage(chatId, "❌ Bot is not admin in channel!");
  }

  BOT2.running = true;
  BOT2.messageCount = 0;
  startConversation2();
  bot.sendMessage(chatId, `✅ Bot 2 Started!
📌 First Amount: ₹${BOT2.firstAmount}
📌 Second Amount: ₹${BOT2.secondAmount}
📌 Speed: ${BOT2.messagesPerMinute} msgs/min`);
});

bot.onText(/\/stop$/, (msg) => {
  const chatId = msg.chat.id;
  BOT1.running = false;
  if (BOT1.timer) { clearInterval(BOT1.timer); BOT1.timer = null; }
  bot.sendMessage(chatId, `🛑 Bot 1 Stopped. Total: ${BOT1.messageCount}`);
});

bot.onText(/\/stop 2/, (msg) => {
  const chatId = msg.chat.id;
  BOT2.running = false;
  if (BOT2.timer) { clearInterval(BOT2.timer); BOT2.timer = null; }
  bot.sendMessage(chatId, `🛑 Bot 2 Stopped. Total: ${BOT2.messageCount}`);
});

bot.onText(/\/status/, (msg) => {
  bot.sendMessage(msg.chat.id, `
📊 FULL STATUS:

🤖 Bot 1:
Running: ${BOT1.running ? "✅ Yes" : "❌ No"}
First Amount: ₹${BOT1.firstAmount}
Second Amount: ₹${BOT1.secondAmount}
Total Messages: ${BOT1.messageCount}
Speed: ${BOT1.messagesPerMinute} msgs/min

🤖 Bot 2:
Running: ${BOT2.running ? "✅ Yes" : "❌ No"}
First Amount: ₹${BOT2.firstAmount}
Second Amount: ₹${BOT2.secondAmount}
Total Messages: ${BOT2.messageCount}
Speed: ${BOT2.messagesPerMinute} msgs/min

👥 Users Bot1: ${Object.keys(BOT1.userLastUsed).length}
👥 Users Bot2: ${Object.keys(BOT2.userLastUsed).length}
🕐 Time: ${getIndianTime(new Date())}
  `);
});

const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('🤖 Bot is running!'));
app.listen(PORT, () => console.log(`🌐 Web server running on port ${PORT}`));

console.log("🤖 Bot Started...");
console.log(`📢 Channel: ${CHANNEL_ID}`);
console.log(`🕐 Indian Time: ${getIndianTime(new Date())}`);
console.log(`
📌 AMOUNT SETTINGS:
  Bot 1: First=₹${BOT1.firstAmount} | Second=₹${BOT1.secondAmount}
  Bot 2: First=₹${BOT2.firstAmount} | Second=₹${BOT2.secondAmount}
`);
