const axios = require('axios');

async function sendTelegramNotification(leakDetected, leakLocation) {
  const token = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  const message = leakDetected === 1 
    ? `⚠️ *Kebocoran Terdeteksi!*\nLokasi kemungkinan: *${leakLocation || 'Tidak diketahui'}*`
    : `✅ Sistem normal, tidak ada kebocoran terdeteksi.`;

  const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    await axios.post(telegramUrl, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    });
    console.log('✅ Notifikasi Telegram berhasil dikirim.');
  } catch (error) {
    console.error('❌ Gagal mengirim notifikasi Telegram:', error.message);
  }
}

module.exports = { sendTelegramNotification };
