const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

const bot = new TelegramBot(token, { polling: false });

let lastLeakDetected = null;
let lastNotificationTime = 0;
const cooldownPeriod = 5 * 60 * 1000; // 5 menit

async function sendTelegramNotification(leakDetected, leakLocation) {
  const now = Date.now();

  const statusChanged = leakDetected !== lastLeakDetected;
  const cooldownExpired = now - lastNotificationTime > cooldownPeriod;

  if (!statusChanged && !cooldownExpired) {
    console.log('⏳ Skip notifikasi (status sama & dalam cooldown)');
    return;
  }

  const message =
    leakDetected === 1
      ? `⚠️ *Kebocoran Terdeteksi!*\nLokasi kemungkinan: *${leakLocation || 'Tidak diketahui'}*`
      : `✅ Sistem normal, tidak ada kebocoran terdeteksi.`;

  try {
    const res = await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    console.log('✅ Notifikasi Telegram terkirim. ID:', res.message_id);

    // Update memory status
    lastLeakDetected = leakDetected;
    lastNotificationTime = now;
  } catch (error) {
    console.error('❌ Gagal kirim Telegram:', error.response?.body || error.message);
  }
}

module.exports = { sendTelegramNotification };
