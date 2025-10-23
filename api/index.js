/*===============================================*\
|| ############################################# ||
|| # WWW.AMITDAS.SITE / Version 1.0.0          # ||
|| # ----------------------------------------- # ||
|| # Copyright 2025 AMITDAS All Rights Reserved # ||
|| ############################################# ||
\*===============================================*/

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

  // Ignore groups, broadcasts, newsletters, etc.
  const ignorePatterns = [
    '@g.us', '@broadcast', '@newsletter', 'status@broadcast',
    '@lid', '-@g.us', 'g.us', 'broadcast', 'newsletter', 'status'
  ];
  if (ignorePatterns.some(pattern => remoteJid.includes(pattern))) {
    debugLog(`Ignored remoteJid: ${remoteJid}`);
    return res.status(400).send(`❌ Ignored remoteJid: ${remoteJid}`);
  }

  // Extract message text
  let messageText = '';
  if (bodyMsg?.messages?.conversation) messageText = bodyMsg.messages.conversation;
  else if (bodyMsg?.content) messageText = bodyMsg.content;
  else if (bodyMsg?.messages?.extendedTextMessage?.text)
    messageText = bodyMsg.messages.extendedTextMessage.text;

  debugLog(`messageText: ${messageText}, remoteJid: ${remoteJid}`);

  if (!messageText || !remoteJid) {
    return res.status(400).send("❌ Missing messageText or remoteJid");
  }

  const numberMatch = remoteJid.match(/^(\d+)@/);
  if (!numberMatch) return res.status(400).send("❌ Invalid remoteJid format.");
  const number = numberMatch[1];

  // Detect supported URLs (Pinterest, Facebook, Instagram, YouTube Shorts)
  const videoRegexes = [
    // Pinterest
    /(https:\/\/pin\.it\/[a-zA-Z0-9]+|https:\/\/(?:[a-z]+\.)?pinterest\.[a-z]+\/pin\/\d+\/?)/,
    // Facebook
    /https:\/\/(?:www\.)?facebook\.[a-z]+\/[^\s]+/i,
    // Instagram
    /https:\/\/(?:www\.)?instagram\.[a-z]+\/[^\s]+/i,
    // YouTube Shorts
    /https:\/\/(?:www\.)?youtube\.com\/shorts\/[\w\-]+/i
  ];

  let linkFound = '';
  for (const regex of videoRegexes) {
    const match = messageText.match(regex);
    if (match) {
      linkFound = match[0];
      break;
    }
  }

  if (!linkFound) {
    debugLog("No supported video link found in message.");
    return res.status(400).send("❌ No supported video link found in message.");
  }

  debugLog(`Detected video URL: ${linkFound}`);

  // Downloader API with 40-second timeout
  const downloaderUrl = `${PINTEREST_API_BASE}?url=${encodeURIComponent(linkFound)}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 40000); // 40 seconds timeout

  let downloaderRes;
  try {
    downloaderRes = await fetch(downloaderUrl, { signal: controller.signal });
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).send('❌ Downloader API request timed out (40s).');
    }
    return res.status(500).send(`❌ Downloader API fetch error: ${err.message}`);
  } finally {
    clearTimeout(timeout);
  }

  if (!downloaderRes.ok) {
    return res.status(500).send(`❌ Downloader API HTTP error: ${downloaderRes.status}`);
  }

  const downloaderData = await downloaderRes.json();
  if (!downloaderData || downloaderData.status !== 'success' || !downloaderData.media_url) {
    return res
      .status(500)
      .send(`❌ Failed to fetch video. Raw: ${JSON.stringify(downloaderData)}`);
  }

  const mediaUrl = downloaderData.media_url;
  const title = downloaderData.title || 'Video';

  debugLog(`Video URL: ${mediaUrl}, Title: ${title}`);

  // Send to WhatsApp API
  const whatsappPayload = {
    number,
    type: 'media',
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

  const waText = await waRes.text();
  debugLog(`WhatsApp API HTTP ${waRes.status}: ${waText}`);

  if (!waRes.ok) {
    return res.status(500).send(`❌ WhatsApp API error: ${waRes.status} ${waText}`);
  }

  return res.status(200).send("✅ Video sent successfully!");
};
