#!/usr/bin/env python3
"""원본 RGB를 보존하며 검토된 트레이 외곽에 알파만 적용한다.

실행: python3 scripts/create_portion_cutouts.py --masks <JSON> --audit <JSON>
Pillow가 필요하다. 마스크 좌표는 이미지 너비/높이에 대한 비율이다.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def asset_path(relative: str) -> Path:
    path = (ROOT / relative).resolve()
    if not path.is_relative_to(ROOT / 'uploads/catalog/raw-sets'):
        raise ValueError('원물 자산 경로만 허용됩니다')
    return path


def create_alpha(size: tuple[int, int], spec: dict) -> Image.Image:
    width, height = size
    scale = 4
    if 'quad' in spec:
        quad = spec['quad']
    else:
        left, top, right, bottom = spec['box']
        quad = [[left, top], [right, top], [right, bottom], [left, bottom]]
    if len(quad) != 4:
        raise ValueError('외곽 꼭짓점은 시계방향 4개여야 합니다')
    points = [(x * width, y * height) for x, y in quad]
    if any(not math.isfinite(v) or v < -0.15 or v > 1.15 for p in quad for v in p):
        raise ValueError('마스크 좌표 범위를 확인하세요')
    turns = []
    for i in range(4):
        a, b, c = points[i], points[(i+1) % 4], points[(i+2) % 4]
        turns.append((b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]))
    if any(turn <= 0 for turn in turns):
        raise ValueError('외곽은 교차 없는 시계방향 볼록 사각형이어야 합니다')
    radii = spec.get('rounding', [0.065] * 4)
    if isinstance(radii, (int, float)):
        radii = [radii] * 4
    if len(radii) != 4 or any(not 0 <= r <= .3 for r in radii):
        raise ValueError('모서리 반경 범위를 확인하세요')
    outline: list[tuple[float, float]] = []
    for index, point in enumerate(points):
        previous, following = points[(index - 1) % 4], points[(index + 1) % 4]
        before = math.dist(point, previous)
        after = math.dist(point, following)
        radius = min(radii[index] * min(size), before / 3, after / 3)
        start = tuple(point[j] + (previous[j] - point[j]) * radius / before for j in range(2))
        end = tuple(point[j] + (following[j] - point[j]) * radius / after for j in range(2))
        for step in range(33):
            t = step / 32
            outline.append(tuple(((1-t)**2*start[j] + 2*(1-t)*t*point[j] + t*t*end[j]) * scale for j in range(2)))
    alpha = Image.new('L', (width * scale, height * scale), 0)
    ImageDraw.Draw(alpha).polygon(outline, fill=255)
    return alpha.resize(size, Image.Resampling.LANCZOS)


def process(spec: dict, overwrite: bool = False) -> dict:
    source = asset_path(spec['source'])
    output = asset_path(spec['output'])
    if source == output or not source.name == '06-portion-package.webp' or output.name != '06-portion-package-cutout.webp':
        raise ValueError('원본과 컷아웃 파일명을 구분해야 합니다')
    if output.exists() and not overwrite:
        raise FileExistsError('기존 컷아웃은 --overwrite 확인 후에만 다시 생성합니다')
    source_hash = sha256(source)
    if spec.get('sourceSha256') and source_hash != spec['sourceSha256']:
        raise ValueError('원본 해시가 검토 당시와 다릅니다')
    with Image.open(source) as image:
        rgb = image.convert('RGB')
    alpha = create_alpha(rgb.size, spec)
    result = rgb.copy().convert('RGBA')
    result.putalpha(alpha)
    histogram = alpha.histogram()
    if histogram[0] == 0 or histogram[255] == 0:
        raise RuntimeError('실제 투명/불투명 영역이 모두 있어야 합니다')
    # 같은 폴더의 임시 파일을 먼저 검증해 실패 시 기존 정상본을 보존한다.
    with tempfile.NamedTemporaryFile(dir=output.parent, suffix='.webp', delete=False) as temporary:
        candidate = Path(temporary.name)
    try:
        result.save(candidate, format='WEBP', lossless=True, quality=100, method=6, exact=True)
        with Image.open(candidate) as image:
            actual = image.convert('RGBA')
        # RGB 채널 보존 조건에는 투명 픽셀도 포함한다.
        if actual.convert('RGB').tobytes() != rgb.tobytes():
            raise RuntimeError('무손실 출력의 RGB 보존 검사가 실패했습니다')
        if actual.getchannel('A').tobytes() != alpha.tobytes():
            raise RuntimeError('알파 마스크 보존 검사가 실패했습니다')
        if sha256(source) != source_hash:
            raise RuntimeError('원본이 변경됐습니다')
        candidate.replace(output)
    finally:
        candidate.unlink(missing_ok=True)
    return {
        'id': spec['id'], 'source': spec['source'], 'output': spec['output'],
        'sourceSha256': source_hash, 'sha256': sha256(output),
        'bytes': output.stat().st_size, 'width': rgb.width, 'height': rgb.height,
        'alphaMin': 0, 'alphaMax': 255,
        'transparentPixels': histogram[0], 'opaquePixels': histogram[255],
        'softEdgePixels': sum(histogram[1:255]),
        'rgbChangedPixels': 0, 'sourceUnchanged': True,
        'method': 'reviewed-local-outline-alpha-lossless',
        'visualReview': spec.get('visualReview', 'pending'),
    }



def verify_only(spec: dict) -> dict:
    """생성물을 다시 읽어 원본 RGB·마스크·해시를 쓰기 없이 검증한다."""
    source, output = asset_path(spec['source']), asset_path(spec['output'])
    if spec.get('sourceSha256') and sha256(source) != spec['sourceSha256']:
        raise ValueError('원본 해시가 검토 당시와 다릅니다')
    with Image.open(source) as image:
        rgb = image.convert('RGB')
    with Image.open(output) as image:
        actual = image.convert('RGBA')
    if actual.size != rgb.size:
        raise RuntimeError('원본 캔버스 규격이 변경됐습니다')
    if actual.convert('RGB').tobytes() != rgb.tobytes():
        raise RuntimeError('원본 RGB 보존 실패')
    alpha = actual.getchannel('A')
    if alpha.tobytes() != create_alpha(rgb.size, spec).tobytes():
        raise RuntimeError('검토된 마스크와 실제 출력 알파가 다릅니다')
    histogram = alpha.histogram()
    if not histogram[0] or not histogram[255]:
        raise RuntimeError('실제 투명/불투명 영역이 모두 있어야 합니다')
    return {'id': spec['id'], 'source': spec['source'], 'output': spec['output'],
            'sourceSha256': sha256(source), 'sha256': sha256(output),
            'bytes': output.stat().st_size, 'width': rgb.width, 'height': rgb.height,
            'alphaMin': 0, 'alphaMax': 255, 'transparentPixels': histogram[0],
            'opaquePixels': histogram[255], 'softEdgePixels': sum(histogram[1:255]),
            'rgbChangedPixels': 0, 'sourceUnchanged': True,
            'method': 'reviewed-local-outline-alpha-lossless',
            'visualReview': spec.get('visualReview', 'pending')}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--masks', type=Path, required=True)
    parser.add_argument('--audit', type=Path)
    parser.add_argument('--verify-only', action='store_true')
    parser.add_argument('--overwrite', action='store_true')
    options = parser.parse_args()
    data = json.loads(options.masks.read_text())
    entries = data['entries'] if isinstance(data, dict) else data
    if not options.verify_only and not options.audit:
        parser.error('생성 시 --audit 출력 위치를 지정해야 합니다')
    results = [verify_only(spec) if options.verify_only else process(spec, options.overwrite) for spec in entries]
    if options.audit:
        options.audit.parent.mkdir(parents=True, exist_ok=True)
        options.audit.write_text(json.dumps({'schemaVersion': 1, 'method': 'local-outline-alpha-lossless', 'entries': results}, ensure_ascii=False, indent=2)+'\n')
    print(json.dumps({'processed': len(results), 'rgbChangedPixels': 0, 'sourceUnchanged': True}, ensure_ascii=False))


if __name__ == '__main__':
    main()
