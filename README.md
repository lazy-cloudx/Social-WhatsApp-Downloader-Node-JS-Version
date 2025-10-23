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
  <b>Download videos and images from Pinterest, Instagram, Facebook, and YouTube directly to WhatsApp using a lightweight Node.js API</b>
</p>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-features">Features</a> •
  <a href="#-configuration">Configuration</a> •
  <a href="#-set-webhook">Set Webhook</a> •
  <a href="#-usage">Usage</a> •
  <a href="#-file-structure">File Structure</a> •
  <a href="#-example">Example</a> •
  <a href="#-to-do">To Do</a> •
  <a href="#-author">Author</a> •
  <a href="#-license">License</a>
</p>

---

## 📌 Overview

**Social WhatsApp Downloader** (Node.js Version) allows you to send links from multiple social media platforms — **Pinterest, Instagram, Facebook, and YouTube** — to your WhatsApp number and instantly receive the media file back (videos or images).  
The system automatically detects valid URLs, downloads the media, and sends it back via WhatsApp using a simple webhook-based setup.

> **Built with Node.js** — lightweight, fast, and deployable on any platform such as **Vercel**, **Render**, or your **VPS server**.

---

## 🚀 Features

* ⚡️ Download from **Pinterest**, **Instagram**, **Facebook**, and **YouTube**
* 📱 Supports **Reels**, **Shorts**, and regular videos
* 🔗 Instant WhatsApp automation via webhook (no polling)
* 🪶 Zero database dependency
* 🧩 Regex-based URL detection for multiple platforms
* 📝 Debug logging system included

---

## 🛠️ Configuration

1. **Create a `config.js` file:**

   ```js
   // config.js
   module.exports = {
     PINTEREST_API_BASE: 'https://api.amitdas.site/Pinterest/api/',
     WHATSAPP_INSTANCE_ID: 'YOUR_INSTANCE_ID',
     WHATSAPP_ACCESS_TOKEN: 'YOUR_ACCESS_TOKEN'
   };
````

> Get your WhatsApp API credentials from [textsnap.in](https://textsnap.in/)

---

## 🔗 Set Webhook

After deploying your Node.js project to a hosting platform (for example, **Vercel**), set the webhook using the following API endpoint:

```
https://textsnap.in/api/set_webhook?webhook_url=https://your-vercel-project.vercel.app&enable=true&instance_id=YOUR_INSTANCE_ID&access_token=YOUR_ACCESS_TOKEN
```

---

## 📝 Usage

1. **Deploy** the code to any Node.js-supported platform (e.g., Vercel).
2. **Configure** your `config.js` file with API details.
3. **Set** the webhook URL using the endpoint above.
4. **Send** any supported link (Pinterest, Instagram, Facebook, or YouTube) to your WhatsApp number.
5. **Receive** the media directly in your WhatsApp chat! 🎬✅

---

## 📂 File Structure

```text
📁 project-root
├── api/
│   └── index.js          # Main Node.js webhook logic
├── config.js             # Configuration file (API Base + WhatsApp credentials)
├── package.json          # Node.js project setup
└── vercel.json           # Deployment configuration for Vercel
```

---

## 📸 Example

**Send a message on WhatsApp:**

```
https://youtube.com/shorts/c_07yu5BekI?si=4ukjWk8rtJmwXmpJ
```

**Or:**

```
https://in.pinterest.com/pin/996632592567664852/
https://www.instagram.com/reel/XXXXXXXX/
https://www.facebook.com/watch/?v=XXXXXXXX
```

**And receive the downloadable video automatically within seconds!**

---

## ⚙️ Deploy on Vercel

### 1. Create `package.json`

```json
{
  "name": "social-whatsapp-downloader-node",
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

### 2. Create `vercel.json`

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

### 3. Deploy Steps

Run the following commands:

```bash
npm install -g vercel
vercel login
vercel --prod
```

Once deployed, you’ll get a live link like:

```
https://your-vercel-project.vercel.app/
```

Use that as your webhook URL when setting it in **TextSnap**.

---

## 🧠 How It Works

1. User sends a supported link (Pinterest, Instagram, Facebook, or YouTube) to your WhatsApp number.
2. The TextSnap API forwards that message to your webhook (`index.js`).
3. The webhook detects the platform using **Regex patterns**.
4. It calls your **downloader API** (`https://api.amitdas.site/Pinterest/api/?url=...`) to get the media file.
5. The video or image is instantly sent back to the user via **WhatsApp**.

---

## 📌 To Do

* [ ] Add custom caption formatting for WhatsApp replies
* [ ] Add Telegram bot integration
* [ ] Add web-based preview interface
* [ ] Add multi-quality video support (SD/HD)

---

## 👨‍💻 Author

| [<img src="https://avatars.githubusercontent.com/u/112541611?v=4" width="60" alt="Amit Das"/>](https://amitdas.site) |
| :------------------------------------------------------------------------------------------------------------------: |
|                                           [Amit Das](https://amitdas.site)                                           |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
