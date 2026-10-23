import { readFile } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';

const UPLOADS_ROOT = resolve(process.cwd(), 'uploads');
const ASSET_CONTENT_TYPES = new Map<string, string>([
  ['png', 'image/png'],
  ['jpg', 'image/jpeg'],
  ['jpeg', 'image/jpeg'],
  ['webp', 'image/webp'],
  ['gif', 'image/gif'],
  ['svg', 'image/svg+xml'],
  ['mp4', 'video/mp4'],
  ['webm', 'video/webm'],
]);

type RouteContext = {
  params: Promise<{ assetPath: string[] }>;
};

function parseRange(rangeHeader: string, size: number) {
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

function resolveSafeAssetPath(assetPath: string[]): string | null {
  if (assetPath.length === 0) return null;
  for (const segment of assetPath) {
    if (
      segment.length === 0 ||
      segment === '..' ||
      segment === '.' ||
      segment.includes('\\') ||
      segment.includes('\0')
    ) {
      return null;
    }
  }
  const absolutePath = resolve(UPLOADS_ROOT, join(...assetPath));
  if (!absolutePath.startsWith(UPLOADS_ROOT + sep)) return null;
  return absolutePath;
}

async function serveAsset(request: Request, context: RouteContext) {
  const { assetPath } = await context.params;
  const extension = assetPath[assetPath.length - 1]?.split('.').pop()?.toLowerCase();
  const contentType = extension ? ASSET_CONTENT_TYPES.get(extension) : undefined;
  const absolutePath = resolveSafeAssetPath(assetPath);
  if (!contentType || !absolutePath) {
    return new Response('Not found', { status: 404 });
  }

  let file: Buffer;
  try {
    file = await readFile(absolutePath);
  } catch {
    return new Response('Not found', { status: 404 });
  }

  const headers = {
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=86400',
    'Content-Type': contentType,
  };
  const rangeHeader = request.headers.get('range');
  if (!rangeHeader) {
    return new Response(request.method === 'HEAD' ? null : new Uint8Array(file), {
      headers: { ...headers, 'Content-Length': String(file.length) },
    });
  }

  const range = parseRange(rangeHeader, file.length);
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
      ...headers,
      'Content-Length': String(chunk.length),
      'Content-Range': `bytes ${range.start}-${range.end}/${file.length}`,
    },
  });
}

export function GET(request: Request, context: RouteContext) {
  return serveAsset(request, context);
}

export function HEAD(request: Request, context: RouteContext) {
  return serveAsset(request, context);
}
