import type { BaseDataDTO } from "@/dtos/base-data-DTO";
import type { GpsDTO } from "@/dtos/gps-DTO";
import type { TiresDataDTO } from "@/dtos/tires-data-DTO";
import { api } from "./api";

export const telemetryService = {
  async getBaseData(): Promise<BaseDataDTO[]> {
    const { data } = await api.get<BaseDataDTO[]>("/base-data");
    return data;
  },

  async getBaseDataLast(): Promise<BaseDataDTO> {
    const { data } = await api.get<BaseDataDTO>("/base-data/last");
    return data;
  },

  async getTiresData(): Promise<TiresDataDTO[]> {
    const { data } = await api.get<TiresDataDTO[]>("/tires");
    return data;
  },

  async getTiresDataLast(): Promise<TiresDataDTO> {
    const { data } = await api.get<TiresDataDTO>("/tires/last");
    return data;
  },

  async getGpsData(): Promise<GpsDTO[]> {
    const { data } = await api.get<GpsDTO[]>("/gps");
    return data;
  },

  async getGpsDataLast(): Promise<GpsDTO> {
    const { data } = await api.get<GpsDTO>("/gps/last");
    return data;
  },

  async clearBaseData(): Promise<void> {
    await api.delete("/base-data");
  },

  async clearTiresData(): Promise<void> {
    await api.delete("/tires");
  },

  async clearGpsData(): Promise<void> {
    await api.delete("/gps");

  },

  async clearAllData(): Promise<void> {
    await api.delete("/clear-all");
  },

  async mockData({ erase }: { erase: boolean }): Promise<void> {
    await api.post("/mock", { erase });

  },
};
