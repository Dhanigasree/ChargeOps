import { indiaStations } from "../data/indiaStations.js";
import Station from "../models/Station.js";

export const seedStationsIfEmpty = async () => {
  const stationCount = await Station.countDocuments();

  if (stationCount > 0) {
    return false;
  }

  await Station.insertMany(indiaStations);
  return true;
};
