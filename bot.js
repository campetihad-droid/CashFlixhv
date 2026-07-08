require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = "-1003924350648";

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

let running = false;
let timer = null;
let userLastUsed = {};
let messageCount = 0;

// Generate Random User ID
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
    if (!userLastUsed[uid]) {
      userLastUsed[uid] = now;
      return uid;
    }
  }
}

// Build Message - Aapka Format
function buildMessage(userId, amount, runTime, trackTime) {
  return (
`Test Conversation Count 💝

🎁 Offer Name - Test

User Id : ${userId}
User Amount : ₹${amount}
🥳 User Payment : Success

Run Time - ${runTime}
Track Time - ${trackTime}

Powered By - CashFlix`
  );
}

// Second Message - 1 minute baad
function sendSecondMessage(userId, runTime) {
  setTimeout(() => {
    bot.sendMessage(
      CHANNEL_ID,
      buildMessage(userId, "5", runTime, new Date().toLocaleString())
    ).catch(err => console.log("Second msg error:", err.message));
  }, 60000);
}

// Main Scheduler
function startConversation() {
  timer = setInterval(async () => {
    if (!running) {
      clearInterval(timer);
      timer = null;
      return;
    }

    for (let i = 0; i < 2; i++) {
      try {
        let now = new Date();
        let userId = generateRandomUserId();
        let runTime = new Date(now.getTime() - 60000).toLocaleString();
        let trackTime = now.toLocaleString();

        await bot.sendMessage(
          CHANNEL_ID,
          buildMessage(userId, "0.1", runTime, trackTime)
        );
        messageCount++;
        console.log(`✅ Message ${messageCount} sent`);

        sendSecondMessage(userId, runTime);
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.log("Error:", error.message);
        if (error.response?.body?.description?.includes('429')) {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }
  }, 3000);
}

// Commands
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
  bot.sendMessage(msg.chat.id, "✅ Test Started.");
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
Running: ${running ? "Yes" : "No"}
Messages: ${messageCount}
Users: ${Object.keys(userLastUsed).length}
  `);
});

console.log("🤖 Bot Started...");
