import { serve } from "https://deno.land/std/http/server.ts";

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

serve(async (request) => {
  const url = new URL(request.url);
  const pathname = url.pathname + url.search;

  if (pathname === '/' || pathname === '/index.html') {
    return new Response('Service is running!', {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
  }

  if (pathname === '/robots.txt') {
    return new Response('User-agent: *\nDisallow: /', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  const targetUrl = targetURL(pathname);
  if (!targetUrl) {
    return new Response('Not Found: ' + pathname, { status: 404 });
  }

  try {
    const headers = new Headers();
    for (const [key, value] of request.headers.entries()) {
      if (isAllowedHeader(key)) {
        headers.set(key, value);
      }
    }
    
    return fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: request.body
    });
  } catch (error) {
    console.error('Failed to fetch:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
});
