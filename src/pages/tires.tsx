import { CardData } from "@/components/card-data";
import { TireTypeSelector } from "@/components/tire-type-selector";
import type { TiresTypeDTO } from "@/dtos/tires-type-DTO";
import { useState } from "react";

export function Tires() {
  const [tiresType, setTiresType] = useState<TiresTypeDTO>("Psi");

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Pneus</h1>

      <TireTypeSelector tiresType={tiresType} setTiresType={setTiresType} />
      <div className="w-full flex flex-wrap gap-3">
        <CardData value={123.12} type={tiresType} />
        <CardData value={123.12} type={tiresType} />
        <CardData value={123.12} type={tiresType} />
        <CardData value={123.12} type={tiresType} />
      </div>
    </div>
  );
}
