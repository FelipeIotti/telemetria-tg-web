import { CardData } from "@/components/card-data";

export function BaseData() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Dados base</h1>

      <div className="w-full flex flex-wrap gap-3">
        <CardData value={123.12} type="km/h" />
        <CardData value={123.12} type="rpm" />
        <CardData value={123.12} type="ºC" />
        <CardData value={123.12} type="/4" />
      </div>
    </div>
  );
}
