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

// ✅ USER ID - 4 digit****4 digit
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

// ✅ INDIAN REAL TIME
function getIndianTime() {
  const now = new Date();
  
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
  const parts = formatter.formatToParts(now);
  
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

// ✅ Format Time Function
function formatTime(date) {
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
  const parts = formatter.formatToParts(date);
  
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

// ✅ SAB BOLD - No Extra Line Gaps
function buildMessage(userId, amount, runTime, trackTime) {
  return (
`* Conversation Count 💝*
*🎁 Offer Name - Test*
*User Id :* ${userId}
*User Amount :* ₹${amount}
*🥳 User Payment :* Success
*Run Time -* ${runTime}
*Track Time -* ${trackTime}
*Powered By - CashFlix*`
  );
}

// ✅ Send Message Function with BOLD
async function sendMessageToChannel(userId, amount, runTime, trackTime) {
  try {
    await bot.sendMessage(
      CHANNEL_ID,
      buildMessage(userId, amount, runTime, trackTime),
      { parse_mode: "Markdown" }
    );
    messageCount++;
    console.log(`✅ ₹${amount} message sent for ${userId} at ${getIndianTime()}`);
    return true;
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    return false;
  }
}

// ✅ Second Message - Random 1-2 Minute
async function sendSecondMessage(userId, runTime) {
  const randomDelay = Math.floor(Math.random() * 60000) + 60000;
  
  console.log(`⏳ Second message for ${userId} will send in ${Math.round(randomDelay/1000)} seconds`);

  setTimeout(async () => {
    if (!running) return;
    
    try {
      const now = new Date();
      const trackTime = formatTime(now);
      await bot.sendMessage(
        CHANNEL_ID,
        buildMessage(userId, "5", runTime, trackTime),
        { parse_mode: "Markdown" }
      );
      messageCount++;
      console.log(`✅ ₹5 message sent for ${userId} at ${getIndianTime()}`);
    } catch (error) {
      console.error(`❌ Second message error:`, error.message);
    }
  }, randomDelay);
}

// 🔥 MAIN FUNCTION - Run Time Random 1-2 Minute
async function startConversation() {
  console.log("🚀 Started - RUN TIME RANDOM 1-2 MIN + SAB BOLD + INDIAN TIME");

  timer = setInterval(async () => {
    if (!running) {
      clearInterval(timer);
      timer = null;
      return;
    }

    const now = new Date();
    console.log(`⏰ Running at ${getIndianTime()}`);

    for (let i = 0; i < 3; i++) {
      try {
        let userId = generateRandomUserId();
        
        // ✅ RUN TIME - Random 1-2 Minute (60-120 seconds) pehle
        const randomMinutes = Math.floor(Math.random() * 60) + 60; // 60 to 120 seconds
        let runTimeDate = new Date(now.getTime() - (randomMinutes * 1000));
        let runTime = formatTime(runTimeDate);
        
        // ✅ Track Time - Current Time
        let trackTime = formatTime(now);

        await sendMessageToChannel(userId, "0.1", runTime, trackTime);
        sendSecondMessage(userId, runTime);
        
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error("❌ Error:", error.message);
      }
    }

    console.log(`✅ 3 messages (₹0.1) sent`);

  }, 60000);
}

// ===== COMMANDS =====

bot.onText(/\/test/, async (msg) => {
  const chatId = msg.chat.id;
  
  if (running) {
    return bot.sendMessage(chatId, "⚠️ Already running!");
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
  bot.sendMessage(chatId, "✅ Started! RUN TIME RANDOM 1-2 MIN + SAB BOLD + USER ID FIXED + INDIAN TIME");
});

bot.onText(/\/stop/, (msg) => {
  const chatId = msg.chat.id;
  
  running = false;
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  
  bot.sendMessage(chatId, `🛑 Stopped. Total: ${messageCount}`);
});

bot.onText(/\/status/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `
📊 Status:
Running: ${running ? "✅ Yes" : "❌ No"}
Total Messages: ${messageCount}
Users: ${Object.keys(userLastUsed).length}
Time: ${getIndianTime()}
  `);
});

// ===== PORT =====
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('🤖 Bot is running!');
});

app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

console.log("🤖 Bot Started...");
console.log(`📢 Channel: ${CHANNEL_ID}`);
console.log(`🕐 INDIAN REAL TIME: ${getIndianTime()}`);
console.log("✨ RUN TIME RANDOM 1-2 MIN + SAB BOLD + USER ID FIXED");
