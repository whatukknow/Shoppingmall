'use client';

import { useState } from 'react';
import Script from 'next/script';
import { Button } from '@/shared/components/ui/button';

// 검색 결과 중 사용할 값
type AddressResult = {
  zonecode: string;
  address: string;
};

// 카카오 - 외부 스크립트가 제공하는 기능의 타입
type PostcodeConstructor = new (option: {
  oncomplete: (data: AddressResult) => void;
}) => { open: () => void };

type PostcodeWindow = Window & {
  kakao?: {
    Postcode?: PostcodeConstructor;
  };
};

type AddressSearchButtonProps = {
  onSelect: (postalCode: string, address: string) => void;
};

export default function AddressSearchButton({
  onSelect,
}: AddressSearchButtonProps) {
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  function handleSearch() {
    const Postcode = (window as PostcodeWindow).kakao?.Postcode;

    if (!Postcode) {
      setLoadError(true);
      return;
    }

    new Postcode({
      oncomplete: (data) => {
        onSelect(data.zonecode, data.address);
      },
    }).open();
  }

  return (
    <div>
      <Script
        src="https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="afterInteractive"
        onReady={() => {
          setReady(true);
          setLoadError(false);
        }}
        onError={() => setLoadError(true)}
      />

      <Button
        type="button"
        size="touch"
        variant="actionOutline"
        disabled={!ready || loadError}
        onClick={handleSearch}
      >
        {loadError
          ? '주소 검색 사용 불가'
          : ready
            ? '주소 검색'
            : '주소 검색 준비 중'}
      </Button>

      {loadError && (
        <p role="alert" className="text-destructive mt-2 text-sm">
          주소 검색을 불러오지 못했습니다. 네트워크를 확인하고 페이지를
          새로고침해 주세요.
        </p>
      )}
    </div>
  );
}
