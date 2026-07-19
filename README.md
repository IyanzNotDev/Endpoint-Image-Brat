# BRAT Image Generator API

Simple REST API untuk menghasilkan gambar teks bergaya **BRAT** menggunakan **Node.js** tanpa browser ataupun Puppeteer.

## Features

- Generate BRAT Image
- Custom Text
- PNG Output
- UTF-8 Support
- Emoji Support 😹😂❤️🔥🗿
- Auto Text Wrap
- Fast Rendering
- Low Memory Usage
- REST API
- Express.js
- Native Canvas Rendering
- Production Ready

---

## Preview

```
GET /generate?text=ini apa kok ganteng
```

Output:

```
ini      apa

kok

ganteng
```

---

## Requirements

- Node.js 20+
- npm

---

## Installation

Clone repository

```bash
git clone https://github.com/USERNAME/brat-image-api.git
```

Masuk ke folder project

```bash
cd brat-image-api
```

Install dependency

```bash
npm install
```

Jalankan server

```bash
npm start
```

atau saat development

```bash
npm run dev
```

---

## API Endpoint

### Generate Image

```
GET /generate
```

### Query

| Parameter | Required | Description |
|----------|----------|-------------|
| text | Yes | Text yang akan dibuat menjadi gambar |
| width | No | Lebar canvas |
| fontSize | No | Ukuran font |
| padding | No | Padding canvas |
| color | No | Warna text |
| background | No | Warna background |

---

## Example Request

```
GET /generate?text=Halo Dunia 😹
```

```
GET /generate?text=Iyan%20Alfarez%20😎&width=600
```

---

## Response

Content-Type

```
image/png
```

---

## Error Response

```json
{
    "success": false,
    "message": "Text is required"
}
```

---

## Project Structure

```
project/
│
├── fonts/
├── utils/
├── routes/
├── index.js
├── package.json
└── README.md
```

---

## Performance

- Native Canvas Rendering
- No Puppeteer
- No Chromium
- Low RAM Usage
- Fast PNG Rendering
- Suitable for VPS 512MB+

---

## Tech Stack

- Node.js
- Express.js
- @napi-rs/canvas
- Twemoji
- Noto Emoji

---

## License

MIT License

---

## Author

**Iyan Alfarez**

GitHub:
https://github.com/IyanzNotDev

---

Jika project ini membantu, jangan lupa berikan ⭐ pada repository.
