import type { PositionDTO } from "./position-DTO";

export interface EventMapOnDTO {
  features: {
    properties?: {
      meta: string;
      radius: number;
      center: [number, number];
    };
    geometry: { coordinates: PositionDTO[][] };
  }[];
}
