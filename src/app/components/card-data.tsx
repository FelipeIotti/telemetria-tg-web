interface CardDataProps {
  value?: number;
  type: string;
  tireType?: string;
}

export function CardData({ value, type, tireType }: CardDataProps) {
  return (
    <div className="flex w-full h-full items-center justify-center px-6 py-10 border border-gray-200 rounded-lg relative shadow">
      <p className="font-bold text-primary text-4xl">
        {value ? value : "-"}
      </p>
      <div className="flex items-center justify-center border border-gray-300 rounded px-2 py-1 absolute bottom-1 right-1">
        <p className="font-bold text-xs">{type}</p>
      </div>
      {tireType && (
        <div className="flex items-center justify-center border border-gray-300 rounded px-2 py-1 absolute top-1 left-1">
          <p className="font-bold text-xs">{tireType}</p>
        </div>
      )}
    </div>
  );
}
