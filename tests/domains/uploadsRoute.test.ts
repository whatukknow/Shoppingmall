import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import { GET, HEAD } from '../../app/uploads/[...assetPath]/route';

type RouteContext = { params: Promise<{ assetPath: string[] }> };

function ctx(...segments: string[]): RouteContext {
  return { params: Promise.resolve({ assetPath: segments }) };
}

describe('uploads asset route', () => {
  it('serves uploads/illustrations/apple.png with image/png', async () => {
    const res = await GET(
      new Request('http://localhost/uploads/illustrations/apple.png'),
      ctx('illustrations', 'apple.png'),
    );

    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'image/png');
  });

  it('serves uploads/images/home/products/apple.png with 200', async () => {
    const res = await GET(
      new Request('http://localhost/uploads/images/home/products/apple.png'),
      ctx('images', 'home', 'products', 'apple.png'),
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
      ctx('illustrations', 'apple.png'),
    );

    assert.equal(res.status, 206);
    const { size } = await stat(
      join(process.cwd(), 'uploads/illustrations/apple.png'),
    );
    assert.equal(res.headers.get('content-range'), `bytes 0-9/${size}`);
  });

  it('returns HEAD without body', async () => {
    const res = await HEAD(
      new Request('http://localhost/uploads/illustrations/apple.png', {
        method: 'HEAD',
      }),
      ctx('illustrations', 'apple.png'),
    );

    assert.equal(res.status, 200);
    const body = await res.arrayBuffer();
    assert.equal(body.byteLength, 0);
  });
});
