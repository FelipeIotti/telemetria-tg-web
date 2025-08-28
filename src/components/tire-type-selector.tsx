import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { TiresTypeDTO } from "@/dtos/tires-type-DTO";
import type { Dispatch, SetStateAction } from "react";

interface TireTypeSelectorProps {
  tiresType: TiresTypeDTO;
  setTiresType: Dispatch<SetStateAction<TiresTypeDTO>>;
}

export function TireTypeSelector({
  tiresType,
  setTiresType,
}: TireTypeSelectorProps) {
  return (
    <RadioGroup
      value={tiresType} // controla o estado
      onValueChange={(val) => setTiresType(val as TiresTypeDTO)} // atualiza o estado
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="Psi" id="Psi" />
        <Label htmlFor="Psi">Pressão</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="ºC" id="ºC" />
        <Label htmlFor="ºC">Temperatura</Label>
      </div>
    </RadioGroup>
  );
}
