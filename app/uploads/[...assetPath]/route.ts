import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const UPLOADS_ROOT = join(process.cwd(), 'uploads');

const ASSET_CONTENT_TYPES = new Map<string, string>([
  ['images/home/products/brussels-sprouts.png', 'image/png'],
  ['images/home/products/cabbage.png', 'image/png'],
  ['images/home/products/grapes.png', 'image/png'],
  ['images/home/products/honeydew-melon.png', 'image/png'],
  ['images/home/products/illustration-beef-steak.png', 'image/png'],
  ['images/home/products/illustration-blueberries.png', 'image/png'],
  ['images/home/products/illustration-chicken-drumstick.png', 'image/png'],
  ['images/home/products/illustration-pork-steak.png', 'image/png'],
  ['images/home/products/korean-melon.png', 'image/png'],
  ['images/home/products/onion.png', 'image/png'],
  ['images/home/products/orange.png', 'image/png'],
  ['images/home/products/peas.png', 'image/png'],
  ['images/home/products/pumpkin.png', 'image/png'],
  ['images/home/products/scallion.png', 'image/png'],
  ['images/home/products/watermelon.png', 'image/png'],
  ['images/products/apple.png', 'image/png'],
  ['images/products/apple-square.png', 'image/png'],
  ['images/products/cherry-tomato-square.png', 'image/png'],
  ['images/products/illustration-dragon-fruit.png', 'image/png'],
  ['images/products/illustration-fried-egg.png', 'image/png'],
  ['images/products/illustration-peach.png', 'image/png'],
  ['images/products/mandarin.png', 'image/png'],
  ['images/products/persimmon-square.png', 'image/png'],
  ['images/products/strawberry.png', 'image/png'],
  ['images/products/tomatoes.png', 'image/png'],
  ['videos/home-header-poster.jpg', 'image/jpeg'],
  ['videos/home-header.mp4', 'video/mp4'],
]);

type RouteContext = {
  params: Promise<{ assetPath: string[] }>;
};

function byteRange(rangeHeader: string, size: number) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
  if (!match || (!match[1] && !match[2])) return null;

  const start = match[1]
    ? Number(match[1])
    : Math.max(0, size - Number(match[2]));
  const end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;

  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(end) ||
    start < 0 ||
    start >= size ||
    end < start
  ) {
    return null;
  }

  return { start, end };
}

async function serveUpload(request: Request, context: RouteContext) {
  const { assetPath } = await context.params;
  const relativePath = assetPath.join('/');
  const contentType = ASSET_CONTENT_TYPES.get(relativePath);

  if (!contentType) return new Response('Not found', { status: 404 });

  const file = await readFile(join(UPLOADS_ROOT, relativePath));
  const rangeHeader = request.headers.get('range');
  const commonHeaders = {
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=86400',
    'Content-Type': contentType,
  };

  if (!rangeHeader) {
    return new Response(request.method === 'HEAD' ? null : new Uint8Array(file), {
      headers: { ...commonHeaders, 'Content-Length': String(file.length) },
    });
  }

  const range = byteRange(rangeHeader, file.length);
  if (!range) {
    return new Response(null, {
      status: 416,
      headers: { 'Content-Range': `bytes */${file.length}` },
    });
  }

  const chunk = file.subarray(range.start, range.end + 1);
  return new Response(request.method === 'HEAD' ? null : new Uint8Array(chunk), {
    status: 206,
    headers: {
      ...commonHeaders,
      'Content-Length': String(chunk.length),
      'Content-Range': `bytes ${range.start}-${range.end}/${file.length}`,
    },
  });
}

export function GET(request: Request, context: RouteContext) {
  return serveUpload(request, context);
}

export function HEAD(request: Request, context: RouteContext) {
  return serveUpload(request, context);
}
