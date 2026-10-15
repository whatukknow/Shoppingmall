import Image from 'next/image';

export interface CartPopupProps {
  name: string;
  imageURL: string;
  id: string;
  price: string;
  onGoToCart: () => void;
  onAddToCart: (id: string) => void;
  onClose: () => void;
}

export default function CartPopup({
  id,
  imageURL,
  name,
  price,
  onGoToCart,
  onAddToCart,
  onClose,
}: CartPopupProps): React.JSX.Element {
  return (
    <div className="flex w-full max-w-140 flex-col gap-4 rounded-3xl bg-[#F8EFCB96] p-6">
      <div className="flex justify-between">
        <h1 className="font-heading text-xs">YOUR CART</h1>
        <button
          className="h-12 w-10 items-center justify-center rounded-3xl bg-[#FFF2B2] text-sm"
          onClick={() => onClose()}
        >
          X
        </button>
      </div>
      <div className="text-center text-[2rem] font-bold">장바구니</div>
      <div className="flex flex-row gap-5">
        <Image
          src={imageURL}
          alt="상품 이미지"
          className="h-35 w-35 shrink-0 border-2"
        />
        <div className="flex w-full flex-col items-center gap-4">
          <p className="text-lg">{name}</p>
          <p className="text-sm">{price}</p>
        </div>
      </div>
      <button
        className="h-12 w-full rounded-3xl bg-[#650F20] font-bold text-[#FAF6EC]"
        onClick={() => onAddToCart(id)}
      >
        담기
      </button>
      <button
        className="h-12 w-full rounded-3xl bg-[#FFF2B2] font-bold text-[#48131B]"
        onClick={() => onGoToCart()}
      >
        장바구니 보기
      </button>
    </div>
  );
}
