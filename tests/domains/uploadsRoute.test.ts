import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { mkdir, mkdtemp, rm, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { GET, HEAD } from '../../app/uploads/[...assetPath]/route';

type RouteContext = { params: Promise<{ assetPath: string[] }> };

function ctx(...segments: string[]): RouteContext {
  return { params: Promise.resolve({ assetPath: segments }) };
}

describe('uploads asset route', () => {
  let fixtureDir: string;
  let fixtureKey: string;
  before(async () => {
    await mkdir('uploads', { recursive: true });
    fixtureDir = await mkdtemp(join(process.cwd(), 'uploads', 'route-test-'));
    fixtureKey = basename(fixtureDir);
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a4bkAAAAASUVORK5CYII=',
      'base64',
    );
    await mkdir(join(fixtureDir, 'images', 'home', 'products'), {
      recursive: true,
    });
    await writeFile(join(fixtureDir, 'apple.png'), png);
    await writeFile(
      join(fixtureDir, 'images', 'home', 'products', 'apple.png'),
      png,
    );
  });
  after(async () => {
    if (fixtureDir) await rm(fixtureDir, { recursive: true });
  });
  it('serves a PNG fixture with image/png', async () => {
    const res = await GET(
      new Request('http://localhost/uploads/illustrations/apple.png'),
      ctx(fixtureKey, 'apple.png'),
    );

    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'image/png');
  });

  it('serves a nested image fixture with 200', async () => {
    const res = await GET(
      new Request('http://localhost/uploads/images/home/products/apple.png'),
      ctx(fixtureKey, 'images', 'home', 'products', 'apple.png'),
    );

    assert.equal(res.status, 200);
  });

  it('returns 404 for path traversal segments', async () => {
    const res = await GET(
      new Request('http://localhost/uploads/../package.json'),
      ctx('..', 'package.json'),
    );

    assert.equal(res.status, 404);
  });

  it('returns 404 for disallowed extension', async () => {
    const res = await GET(
      new Request('http://localhost/uploads/illustrations/not-real.txt'),
      ctx('illustrations', 'not-real.txt'),
    );

    assert.equal(res.status, 404);
  });

  it('returns 404 for missing file', async () => {
    const res = await GET(
      new Request('http://localhost/uploads/illustrations/nope.png'),
      ctx('illustrations', 'nope.png'),
    );

    assert.equal(res.status, 404);
  });

  it('returns 206 with Content-Range for a Range request', async () => {
    const res = await GET(
      new Request('http://localhost/uploads/illustrations/apple.png', {
        headers: { range: 'bytes=0-9' },
      }),
      ctx(fixtureKey, 'apple.png'),
    );

    assert.equal(res.status, 206);
    const { size } = await stat(join(fixtureDir, 'apple.png'));
    assert.equal(res.headers.get('content-range'), `bytes 0-9/${size}`);
  });

  it('returns HEAD without body', async () => {
    const res = await HEAD(
      new Request('http://localhost/uploads/illustrations/apple.png', {
        method: 'HEAD',
      }),
      ctx(fixtureKey, 'apple.png'),
    );

    assert.equal(res.status, 200);
    const body = await res.arrayBuffer();
    assert.equal(body.byteLength, 0);
  });
});
