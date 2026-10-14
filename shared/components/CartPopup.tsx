import Image from 'next/image';

export default function CartPopup(): React.JSX.Element {
  return (
    <div className="flex w-full max-w-140 flex-col gap-4 rounded-3xl bg-[#F8EFCB96] p-6">
      <div className="flex justify-between">
        <h1 className="font-heading text-xs">YOUR CART</h1>
        <button className="h-12 w-10 items-center justify-center rounded-3xl bg-[#FFF2B2] text-sm">
          X
        </button>
      </div>
      <div className="text-center text-[2rem] font-bold">장바구니</div>
      <div className="flex flex-row gap-5">
        <div className="h-35 w-35 shrink-0 border-2"></div>
        <div className="flex w-full flex-col items-center gap-4">
          <p className="text-lg">브리오슈 프렌치토스트 키트</p>
          <p className="text-sm">8,900원</p>
          <p className="text-sm">삭제</p>
        </div>
      </div>
      <button className="h-12 w-full rounded-3xl bg-[#650F20] font-bold text-[#FAF6EC]">
        담기
      </button>
      <button className="h-12 w-full rounded-3xl bg-[#FFF2B2] font-bold text-[#48131B]">
        장바구니 보기
      </button>
    </div>
  );
}
