const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../server');

let server;
let baseUrl;

before(async () => {
  server = createApp().listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test('root reports that the API is running', async () => {
  const response = await fetch(`${baseUrl}/`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).status, 'success');
  assert.equal(response.headers.get('x-powered-by'), null);
});

test('health reports browser-local persistence', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    status: 'healthy',
    application: 'MhruPath',
    persistence: 'browser-local',
  });
});

test('unknown routes return a JSON 404', async () => {
  const response = await fetch(`${baseUrl}/api/unknown`);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { status: 'error', message: 'Route not found.' });
});

test('development frontend origin is allowed and unknown origins are rejected', async () => {
  const allowed = await fetch(`${baseUrl}/api/health`, { headers: { Origin: 'http://localhost:5173' } });
  assert.equal(allowed.status, 200);
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:5173');

  const denied = await fetch(`${baseUrl}/api/health`, { headers: { Origin: 'https://example.invalid' } });
  assert.equal(denied.status, 403);
  assert.deepEqual(await denied.json(), { status: 'error', message: 'Origin is not allowed.' });
});

test('malformed JSON gets a safe client error response', async () => {
  const response = await fetch(`${baseUrl}/api/unknown`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{',
  });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { status: 'error', message: 'Invalid request.' });
});

test('oversized JSON payloads are rejected', async () => {
  const response = await fetch(`${baseUrl}/api/unknown`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ data: 'x'.repeat(110_000) }),
  });
  assert.equal(response.status, 413);
  assert.deepEqual(await response.json(), { status: 'error', message: 'Request body is too large.' });
});
