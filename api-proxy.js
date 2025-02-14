const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

const apiMapping = {
    '/discord': 'https://discord.com/api',
    '/telegram': 'https://api.telegram.org',
    '/openai': 'https://api.openai.com',
    '/claude': 'https://api.anthropic.com',
    '/gemini': 'https://generativelanguage.googleapis.com',
    '/meta': 'https://www.meta.ai/api',
    '/groq': 'https://api.groq.com/openai',
    '/xai': 'https://api.x.ai',
    '/cohere': 'https://api.cohere.ai',
    '/huggingface': 'https://api-inference.huggingface.co',
    '/together': 'https://api.together.xyz',
    '/novita': 'https://api.novita.ai',
    '/portkey': 'https://api.portkey.ai',
    '/fireworks': 'https://api.fireworks.ai',
    '/openrouter': 'https://openrouter.ai/api',
    '/cerebras': 'https://api.cerebras.ai',
};

const deniedHeaders = ["host", "referer", "cf-", "forward", "cdn"];

function isAllowedHeader(key) {
    for (const deniedHeader of deniedHeaders) {
        if (key.toLowerCase().includes(deniedHeader)) {
            return false;
        }
    }
    return true;
}

function targetURL(pathname) {
    const splitIndex = pathname.indexOf('/', 1);
    const prefix = pathname.substring(0, splitIndex);
    if (apiMapping.hasOwnProperty(prefix)) {
        return apiMapping[prefix] + pathname.substring(prefix.length);
    }
    return "";
}

// 定义代理中间件
const proxy = createProxyMiddleware({
    target: (req) => {
        const pathname = req.url;
        const targetUrl = targetURL(pathname);
        return targetUrl;
    },
    changeOrigin: true,
    onProxyReq: (proxyReq, req, headers) => {
        const allowedHeaders = {};
        for (const [key, value] of Object.entries(headers)) {
            if (isAllowedHeader(key)) {
                allowedHeaders[key] = value;
            }
        }
        proxyReq.headers = allowedHeaders;
    }
});

// 处理根路径
app.get('/', (req, res) => {
    res.status(200).send('Service is running!');
});

// 处理robots.txt
app.get('/robots.txt', (req, res) => {
    res.status(200).type('text/plain').send('User-agent: *\nDisallow: /');
});

// 应用代理中间件
app.use('*', (req, res, next) => {
    if (req.url === '/' || req.url === '/index.html') {
        return res.status(200).send('Service is running!');
    }
    if (req.url === '/robots.txt') {
        return res.status(200).type('text/plain').send('User-agent: *\nDisallow: /');
    }
    const targetUrl = targetURL(req.url);
    if (!targetUrl) {
        return res.status(404).send(`Not Found: ${req.url}`);
    }
    proxy(req, res, next);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
