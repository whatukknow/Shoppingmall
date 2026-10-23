import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const UPLOADS_ROOT = join(process.cwd(), 'uploads');
const ASSET_CONTENT_TYPES = new Map<string, string>([
  ['illustrations/apple.png', 'image/png'],
  ['illustrations/cherry.png', 'image/png'],
  ['illustrations/strawberry.png', 'image/png'],
  ['illustrations/raspberry.png', 'image/png'],
  ['illustrations/peach.png', 'image/png'],
  ['illustrations/dragon-fruit-whole.png', 'image/png'],
  ['illustrations/dragon-fruit-cut.png', 'image/png'],
  ['illustrations/green-apples.png', 'image/png'],
  ['illustrations/bananas.png', 'image/png'],
  ['illustrations/mandarin.png', 'image/png'],
  ['illustrations/persimmon.png', 'image/png'],
  ['illustrations/plums.png', 'image/png'],
  ['illustrations/mulberries.png', 'image/png'],
  ['illustrations/tomato.png', 'image/png'],
  ['illustrations/red-bell-pepper.png', 'image/png'],
  ['illustrations/red-bell-pepper-variant.png', 'image/png'],
  ['illustrations/beet.png', 'image/png'],
  ['illustrations/radicchio.png', 'image/png'],
  ['illustrations/butterhead-lettuce.png', 'image/png'],
  ['illustrations/lettuce-leaf.png', 'image/png'],
  ['illustrations/cucumbers.png', 'image/png'],
  ['illustrations/napa-cabbage.png', 'image/png'],
  ['illustrations/green-tomatoes-and-beans.png', 'image/png'],
  ['illustrations/corn.png', 'image/png'],
  ['illustrations/garlic.png', 'image/png'],
  ['illustrations/eggplants.png', 'image/png'],
  ['illustrations/enoki-mushrooms.png', 'image/png'],
  ['illustrations/king-oyster-mushrooms.png', 'image/png'],
  ['illustrations/portobello-mushrooms.png', 'image/png'],
  ['illustrations/egg-carton.png', 'image/png'],
  ['illustrations/white-eggs.png', 'image/png'],
  ['illustrations/fried-egg.png', 'image/png'],
  ['illustrations/mackerel-fillets.png', 'image/png'],
  ['illustrations/rice-beige-bag.png', 'image/png'],
  ['illustrations/rice-wooden-box.png', 'image/png'],
  ['illustrations/rice-black-bag.png', 'image/png'],
  ['illustrations/tomatoes-and-pasta.png', 'image/png'],
  ['illustrations/pasta-pan-to-plate.png', 'image/png'],
  ['illustrations/pasta-plating.png', 'image/png'],
  ['illustrations/coffee-and-cake.png', 'image/png'],
  ['illustrations/fruit-and-jars-net-bag.png', 'image/png'],

  ['images/home/products/apple.png', 'image/png'],
  ['images/home/products/brussels-sprouts.png', 'image/png'],
  ['images/home/products/cabbage.png', 'image/png'],
  ['images/home/products/grapes.png', 'image/png'],
  ['images/home/products/honeydew-melon.png', 'image/png'],
  ['images/home/products/illustration-beef-steak.png', 'image/png'],
  ['images/home/products/illustration-blueberries.png', 'image/png'],
  ['images/home/products/illustration-chicken-drumstick.png', 'image/png'],
  ['images/home/products/illustration-dragon-fruit.png', 'image/png'],
  ['images/home/products/illustration-fried-egg.png', 'image/png'],
  ['images/home/products/illustration-peach.png', 'image/png'],
  ['images/home/products/illustration-pork-steak.png', 'image/png'],
  ['images/home/products/korean-melon.png', 'image/png'],
  ['images/home/products/mandarin.png', 'image/png'],
  ['images/home/products/onion.png', 'image/png'],
  ['images/home/products/orange.png', 'image/png'],
  ['images/home/products/peas.png', 'image/png'],
  ['images/home/products/pumpkin.png', 'image/png'],
  ['images/home/products/scallion.png', 'image/png'],
  ['images/home/products/strawberry.png', 'image/png'],
  ['images/home/products/tomatoes.png', 'image/png'],
  ['images/home/products/watermelon.png', 'image/png'],
  ['images/products/illustration-dragon-fruit.png', 'image/png'],
  ['images/products/illustration-fried-egg.png', 'image/png'],
  ['images/products/illustration-peach.png', 'image/png'],
  ['images/products/mandarin.png', 'image/png'],
  ['images/products/strawberry.png', 'image/png'],
  ['images/products/tomatoes.png', 'image/png'],
  ['videos/home-header-poster.jpg', 'image/jpeg'],
  ['videos/home-header.mp4', 'video/mp4'],
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

async function serveAsset(request: Request, context: RouteContext) {
  const { assetPath } = await context.params;
  const relativePath = assetPath.join('/');
  const contentType = ASSET_CONTENT_TYPES.get(relativePath);
  if (!contentType) return new Response('Not found', { status: 404 });

  let file: Buffer;
  try {
    file = await readFile(join(UPLOADS_ROOT, relativePath));
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
