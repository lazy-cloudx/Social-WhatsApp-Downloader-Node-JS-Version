![Social WhatsApp Downloader Hero Image](https://repository-images.githubusercontent.com/1003179956/57f78d24-6705-4b84-a278-33006ec459ff)

<h1 align="center">Social WhatsApp Downloader (Node.js)</h1>

<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Pinterest_Logo.svg/1024px-Pinterest_Logo.svg.png" width="80" alt="Pinterest Logo"/>
  &nbsp;&nbsp;
  <img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" width="80" alt="Instagram Logo"/>
  &nbsp;&nbsp;
  <img src="https://upload.wikimedia.org/wikipedia/commons/1/1b/Facebook_icon.svg" width="80" alt="Facebook Logo"/>
  &nbsp;&nbsp;
  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg" width="120" alt="YouTube Logo"/>
</p>

<p align="center">
  <b>Download videos and images from Pinterest, Instagram, Facebook, and YouTube directly to WhatsApp using a simple Node.js webhook API.</b>
</p>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-features">Features</a> •
  <a href="#-configuration">Configuration</a> •
  <a href="#-deploy-on-vercel">Deploy on Vercel</a> •
  <a href="#-usage">Usage</a> •
  <a href="#-file-structure">File Structure</a> •
  <a href="#-example">Example</a> •
  <a href="#-to-do">To Do</a> •
  <a href="#-author">Author</a> •
  <a href="#-license">License</a>
</p>

---

## 📌 Overview

**Social WhatsApp Downloader (Node.js)** lets you send media links from **Pinterest**, **Instagram**, **Facebook**, or **YouTube** to your WhatsApp number — and automatically receive the downloadable file (video or image) back within seconds.

This Node.js version replicates the exact logic of the original PHP version, but is **optimized for modern serverless platforms** like **Vercel**.

> ⚙️ **Built with Node.js 20+** — lightweight, serverless-ready, and blazing fast.

---

## 🚀 Features

* ⚡️ Supports **Pinterest**, **Instagram**, **Facebook**, and **YouTube Shorts**
* 📱 Auto-detects valid video or image URLs via Regex
* 💬 Instant media replies via WhatsApp Webhook
* 🧩 Zero database or dependencies
* 🪶 Deploys easily on **Vercel** or any Node.js server
* 📝 Optional debug logging for developers

---

## ⚙️ Configuration

1. Create a file named **`config.js`** in the project root:

   ```js
   // config.js
   module.exports = {
     PINTEREST_API_BASE: 'https://api.amitdas.site/Pinterest/api/',
     WHATSAPP_INSTANCE_ID: 'YOUR_INSTANCE_ID',
     WHATSAPP_ACCESS_TOKEN: 'YOUR_ACCESS_TOKEN'
   };
````

2. Replace `YOUR_INSTANCE_ID` and `YOUR_ACCESS_TOKEN` with your credentials from [textsnap.in](https://textsnap.in/).

---

## 🌐 Deploy on Vercel

### 1. Project structure

```
📁 project-root
├── api/
│   └── index.js
├── config.js
├── package.json
└── vercel.json
```

### 2. `package.json`

```json
{
  "name": "social-whatsapp-downloader",
  "version": "1.0.0",
  "private": true,
  "type": "commonjs",
  "main": "api/index.js",
  "engines": { "node": ">=18" },
  "dependencies": {},
  "scripts": {
    "start": "node api/index.js"
  }
}
```

### 3. `vercel.json`

```json
{
  "version": 2,
  "functions": {
    "api/index.js": {
      "runtime": "nodejs20.x"
    }
  },
  "routes": [
    { "src": "/.*", "dest": "/api/index.js" }
  ]
}
```

### 4. Deploy

Run these commands in your terminal:

```bash
npm install -g vercel
vercel login
vercel --prod
```

Vercel will automatically deploy your project and give you a live URL like:

```
https://your-project-name.vercel.app/
```

Use that as your webhook URL.

---

## 🔗 Set Webhook

After deploying, set your webhook using the following API call:

```
https://textsnap.in/api/set_webhook?webhook_url=https://your-vercel-app.vercel.app&enable=true&instance_id=YOUR_INSTANCE_ID&access_token=YOUR_ACCESS_TOKEN
```

---

## 🧠 How It Works

1. When a user sends any supported social media link to your WhatsApp number,
   TextSnap forwards that message to your deployed webhook.
2. The webhook detects the platform (Pinterest, Instagram, Facebook, or YouTube).
3. It calls the downloader API (`https://api.amitdas.site/Pinterest/api/`) to get a media file.
4. The media is automatically sent back to the user via the WhatsApp API.

---

## 📂 File Structure

```text
📁 project-root
├── api/
│   └── index.js         # Main Node.js webhook logic
├── config.js            # Configuration file (API base & WhatsApp credentials)
├── package.json         # Project setup for Node.js
└── vercel.json          # Deployment configuration for Vercel
```

---

## 💬 Example

**Send on WhatsApp:**

```
https://youtube.com/shorts/c_07yu5BekI?si=4ukjWk8rtJmwXmpJ
```

**Or:**

```
https://in.pinterest.com/pin/996632592567664852/
https://www.instagram.com/reel/XXXXXXXX/
https://www.facebook.com/watch/?v=XXXXXXXX
```

**Bot replies automatically with the downloadable video!** 🎬✅

---

## 📌 To Do

* [ ] Add custom captions for WhatsApp replies
* [ ] Add Telegram bot integration
* [ ] Add multiple quality support (HD/SD)
* [ ] Add preview thumbnails before sending

---

## 👨‍💻 Author

| [<img src="https://avatars.githubusercontent.com/u/112541611?v=4" width="60" alt="Amit Das"/>](https://amitdas.site) |
| :------------------------------------------------------------------------------------------------------------------: |
|                                           [Amit Das](https://amitdas.site)                                           |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
