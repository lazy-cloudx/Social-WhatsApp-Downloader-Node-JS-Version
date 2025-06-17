# Pinterest WhatsApp Downloader

Download Pinterest videos by sending links via WhatsApp. The bot fetches media and responds with the video file directly using the WhatsApp API.

## Features
- Pinterest URL detection
- Media download via public API
- Sends media to WhatsApp using API

## Deploy on Vercel
1. Clone this repo
2. Add `.env` or modify `config.js` with:
   - `WHATSAPP_INSTANCE_ID`
   - `WHATSAPP_ACCESS_TOKEN`
3. Deploy to [Vercel](https://vercel.com)

## Tech Stack
- Node.js (Expressless via Vercel Functions)
- REST APIs for WhatsApp and Pinterest

## License
MIT
