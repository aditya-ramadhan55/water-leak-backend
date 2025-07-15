const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

// Inisialisasi bot (tidak pakai polling, hanya untuk kirim pesan)
const bot = new TelegramBot(token, { polling: false });

async function sendTelegramNotification(leakDetected, leakLocation) {
  const message = leakDetected === 1
    ? `⚠️ *Kebocoran Terdeteksi!*\nLokasi kemungkinan: *${leakLocation || 'Tidak diketahui'}*`
    : `✅ Sistem normal, tidak ada kebocoran terdeteksi.`;

  try {
    const res = await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    console.log('✅ Notifikasi Telegram berhasil dikirim. ID Pesan:', res.message_id);
  } catch (error) {
    console.error('❌ Gagal mengirim notifikasi Telegram:', error.response?.body || error.message);
  }
}

module.exports = { sendTelegramNotification };
