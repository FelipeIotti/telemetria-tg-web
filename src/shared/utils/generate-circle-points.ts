export const basePoint = {
  velocity: 33,
  latitude: -23.599933,
  longitude: -46.67949,
};

export function generateCirclePoints(
  center: typeof basePoint,
  radiusKm = 5,
  points = 36
) {
  const R = 6371; // raio da Terra em km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const { latitude: lat, longitude: lng } = center;

  const result = [];

  for (let i = 0; i < points; i++) {
    const angle = (i * 360) / points;
    const bearing = toRad(angle);

    const newLat = Math.asin(
      Math.sin(toRad(lat)) * Math.cos(radiusKm / R) +
        Math.cos(toRad(lat)) * Math.sin(radiusKm / R) * Math.cos(bearing)
    );

    const newLng =
      toRad(lng) +
      Math.atan2(
        Math.sin(bearing) * Math.sin(radiusKm / R) * Math.cos(toRad(lat)),
        Math.cos(radiusKm / R) - Math.sin(toRad(lat)) * Math.sin(newLat)
      );

    result.push({
      velocity: center.velocity,
      latitude: parseFloat(toDeg(newLat).toFixed(6)),
      longitude: parseFloat(toDeg(newLng).toFixed(6)),
    });
  }

  return result;
}

const points = generateCirclePoints(basePoint, 5, 36);
console.log(points);
