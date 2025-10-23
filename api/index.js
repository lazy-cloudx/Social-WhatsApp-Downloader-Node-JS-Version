// api/index.js
/* eslint-disable no-console */
const {
  API_BASE,                 // unified downloader for ALL platforms
  PINTEREST_API_BASE,       // optional fallback (legacy)
  WHATSAPP_INSTANCE_ID,
  WHATSAPP_ACCESS_TOKEN,
  DEBUG_LOG                 // "true"/"false" in .env (optional)
} = require('../config');

// tiny debug helper (stdout)
function debugLog(...parts) {
  if (String(DEBUG_LOG).toLowerCase() === 'true') {
    const ts = new Date().toISOString();
    console.log(`[DEBUG ${ts}]`, ...parts);
  }
}

// robust fetch → JSON (with timeout)
async function getJSON(url, init = {}, timeoutMs = 40000) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { ...init, signal: ctrl.signal, redirect: 'follow' });
    const text = await r.text();
    debugLog('HTTP', r.status, url, text.slice(0, 500));
    if (!r.ok) throw new Error(`HTTP ${r.status} :: ${text}`);
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Invalid JSON :: ${text.slice(0, 200)}`);
    }
  } finally {
    clearTimeout(to);
  }
}

// extract message text (same fallbacks you used)
function extractMessageText(bodyMsg = {}) {
  if (bodyMsg?.messages?.conversation) return bodyMsg.messages.conversation;
  if (bodyMsg?.content) return bodyMsg.content;
  if (bodyMsg?.messages?.extendedTextMessage?.text) return bodyMsg.messages.extendedTextMessage.text;
  return '';
}

// multi-platform URL detector (same set as your PHP)
function detectSupportedUrl(text = '') {
  const videoRegexes = [
    // Pinterest
    /(https:\/\/pin\.it\/[a-zA-Z0-9]+|https:\/\/(?:[a-z]+\.)?pinterest\.[a-z]+\/pin\/\d+\/?)/,
    // Facebook
    /https:\/\/(?:www\.)?facebook\.[a-z]+\/[^\s]+/i,
    // Instagram
    /https:\/\/(?:www\.)?instagram\.[a-z]+\/[^\s]+/i,
    // YouTube Shorts
    /https:\/\/(?:www\.)?youtube\.com\/shorts\/[\w-]+/i
    // If you also want full YouTube: add
    // /(https:\/\/(?:www\.)?youtube\.com\/watch\?v=[\w-]{11}[^\s]*|https:\/\/youtu\.be\/[\w-]{11}[^\s]*)/i,
  ];
  for (const rx of videoRegexes) {
    const m = text.match(rx);
    if (m && m[0]) return m[0];
  }
  return '';
}

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    debugLog('Script started');
    const data = req.body;

    if (!data || !data.data || !data.data.message) {
      debugLog('Invalid JSON format');
      return res.status(400).send('❌ Invalid webhook format.');
    }

    const bodyMsg = data.data.message.body_message || {};
    const remoteJid = data.data.message.message_key?.remoteJid || '';

    // ignore groups/broadcast/newsletter/status (PHP parity)
    const ignorePatterns = [
      '@g.us', '@broadcast', '@newsletter', 'status@broadcast',
      '@lid', '-@g.us', 'g.us', 'broadcast', 'newsletter', 'status'
    ];
    if (ignorePatterns.some(p => remoteJid.toLowerCase().includes(p))) {
      debugLog(`Ignored remoteJid: ${remoteJid}`);
      return res.status(400).send(`❌ Ignored remoteJid: ${remoteJid}`);
    }

    // extract message & number
    const messageText = extractMessageText(bodyMsg);
    debugLog(`messageText: ${messageText}, remoteJid: ${remoteJid}`);

    if (!messageText || !remoteJid) {
      return res.status(400).send('❌ Missing messageText or remoteJid');
    }

    const numberMatch = remoteJid.match(/^(\d+)@/);
    if (!numberMatch) {
      return res.status(400).send('❌ Invalid remoteJid format.');
    }
    const number = numberMatch[1];

    // detect ANY supported link (not just Pinterest)
    const linkFound = detectSupportedUrl(messageText);
    if (!linkFound) {
      debugLog('No supported video link found in message.');
      return res.status(400).send('❌ No supported video link found in message.');
    }
    debugLog(`Detected URL: ${linkFound}`);

    // unified downloader API (fallback to PINTEREST_API_BASE for backward compat if needed)
    const base = API_BASE || PINTEREST_API_BASE;
    if (!base) {
      return res.status(500).send('❌ Missing API_BASE (or PINTEREST_API_BASE) in config.');
    }

    const apiUrl = `${base}?url=${encodeURIComponent(linkFound)}`;
    const downloaderData = await getJSON(apiUrl);

    if (!downloaderData || downloaderData.status !== 'success' || !downloaderData.media_url) {
      return res
        .status(500)
        .send(`❌ Failed to fetch video. Raw: ${JSON.stringify(downloaderData)}`);
    }

    const mediaUrl = downloaderData.media_url;
    const title = downloaderData.title || 'Video';

    const whatsappPayload = {
      number,
      type: 'media',
      message: title,
      media_url: mediaUrl,
      instance_id: WHATSAPP_INSTANCE_ID,
      access_token: WHATSAPP_ACCESS_TOKEN
    };

    const waRes = await fetch('https://textsnap.in/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(whatsappPayload)
    });

    const waText = await waRes.text();
    debugLog('WA status:', waRes.status, 'Body:', waText.slice(0, 500));

    if (!waRes.ok) {
      return res.status(500).send(`❌ WhatsApp API error: ${waRes.status} ${waText}`);
    }

    return res.status(200).send('✅ Video sent successfully!');
  } catch (e) {
    debugLog('Unhandled error:', e?.message);
    return res.status(500).send(`❌ Server error: ${e?.message || String(e)}`);
  }
};
