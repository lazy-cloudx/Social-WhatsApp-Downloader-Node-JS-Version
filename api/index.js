// api/index.js
const { PINTEREST_API_BASE, WHATSAPP_INSTANCE_ID, WHATSAPP_ACCESS_TOKEN } = require('../config');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const DEBUG_LOG = false;
  function debugLog(msg) {
    if (DEBUG_LOG) console.log(`[DEBUG] ${msg}`);
  }

  debugLog("Script started");
  const data = req.body;

  if (!data || !data.data || !data.data.message) {
    debugLog("Invalid JSON format");
    return res.status(400).send("❌ Invalid webhook format.");
  }

  const bodyMsg = data.data.message.body_message || {};
  const remoteJid = data.data.message.message_key?.remoteJid || '';

  const ignorePatterns = ['@g.us', '@broadcast', '@newsletter', 'status@broadcast', '@lid', '-@g.us', 'g.us', 'broadcast', 'newsletter', 'status'];
  if (ignorePatterns.some(pattern => remoteJid.includes(pattern))) {
    debugLog(`Ignored remoteJid: ${remoteJid}`);
    return res.status(400).send(`❌ Ignored remoteJid: ${remoteJid}`);
  }

  let messageText = '';
  if (bodyMsg?.messages?.conversation) messageText = bodyMsg.messages.conversation;
  else if (bodyMsg?.content) messageText = bodyMsg.content;
  else if (bodyMsg?.messages?.extendedTextMessage?.text) messageText = bodyMsg.messages.extendedTextMessage.text;

  debugLog(`messageText: ${messageText}, remoteJid: ${remoteJid}`);

  if (!messageText || !remoteJid) {
    return res.status(400).send("❌ Missing messageText or remoteJid");
  }

  const numberMatch = remoteJid.match(/^(\d+)@/);
  if (!numberMatch) return res.status(400).send("❌ Invalid remoteJid format.");
  const number = numberMatch[1];

  const pinRegex = /(https:\/\/pin\.it\/[a-zA-Z0-9]+|https:\/\/(?:[a-z]+\.)?pinterest\.[a-z]+\/pin\/\d+\/?)/;
  const pinMatch = messageText.match(pinRegex);
  if (!pinMatch) return res.status(400).send("❌ No Pinterest link found in message.");
  const pinterestUrl = pinMatch[0];

  debugLog(`Pinterest URL: ${pinterestUrl}`);

  const downloaderRes = await fetch(`${PINTEREST_API_BASE}?url=${encodeURIComponent(pinterestUrl)}`);
  if (!downloaderRes.ok) {
    return res.status(500).send(`❌ Downloader API HTTP error: ${downloaderRes.status}`);
  }

  const downloaderData = await downloaderRes.json();
  if (
    !downloaderData || 
    downloaderData.status !== 'success' || 
    !downloaderData.media_url
  ) {
    return res.status(500).send(`❌ Failed to fetch Pinterest video. Raw: ${JSON.stringify(downloaderData)}`);
  }

  const mediaUrl = downloaderData.media_url;
  const title = downloaderData.title || 'Pinterest Video';

  const whatsappPayload = {
    number,
    type: "media",
    message: title,
    media_url: mediaUrl,
    instance_id: WHATSAPP_INSTANCE_ID,
    access_token: WHATSAPP_ACCESS_TOKEN
  };

  const waRes = await fetch("https://textsnap.in/api/send", {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(whatsappPayload)
  });

  if (!waRes.ok) {
    const errBody = await waRes.text();
    return res.status(500).send(`❌ WhatsApp API error: ${waRes.status} ${errBody}`);
  }

  return res.status(200).send("✅ Video sent successfully!");
};
