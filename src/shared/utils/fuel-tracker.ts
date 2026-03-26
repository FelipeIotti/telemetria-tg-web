const COOKIE_KEY = "fuel_data";
const FUEL_INTERVAL_MS = 15 * 60 * 1000;

interface FuelData {
  fuelLevel: number;
  lastUpdate: number;
}

function getInitialFuel(): FuelData {
  const saved = localStorage.getItem(COOKIE_KEY);
  if (saved) {
    try {
      const data: FuelData = JSON.parse(saved);
      const elapsed = Date.now() - data.lastUpdate;
      const intervals = Math.floor(elapsed / FUEL_INTERVAL_MS);
      const newFuelLevel = Math.max(0, data.fuelLevel - intervals);
      return {
        fuelLevel: newFuelLevel,
        lastUpdate: data.lastUpdate,
      };
    } catch {
      return { fuelLevel: 4, lastUpdate: Date.now() };
    }
  }
  return { fuelLevel: 4, lastUpdate: Date.now() };
}

function saveFuel(data: FuelData): void {
  localStorage.setItem(COOKIE_KEY, JSON.stringify(data));
}

export function getFuelLevel(): number {
  const data = getInitialFuel();
  const elapsed = Date.now() - data.lastUpdate;
  const intervals = Math.floor(elapsed / FUEL_INTERVAL_MS);
  return Math.max(0, data.fuelLevel - intervals);
}

export function resetFuel(): void {
  const data: FuelData = { fuelLevel: 4, lastUpdate: Date.now() };
  saveFuel(data);
}

export function initFuelTracking(): void {
  const data = getInitialFuel();
  const elapsed = Date.now() - data.lastUpdate;
  const intervals = Math.floor(elapsed / FUEL_INTERVAL_MS);
  const newFuelLevel = Math.max(0, data.fuelLevel - intervals);
  
  const updatedData: FuelData = {
    fuelLevel: newFuelLevel,
    lastUpdate: data.lastUpdate,
  };
  saveFuel(updatedData);
}
