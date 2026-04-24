import { indiaStations } from "../data/indiaStations.js";
import Station from "../models/Station.js";

export const ensureDefaultStations = async () => {
  const bulkOperations = indiaStations.map((station) => ({
    updateOne: {
      filter: {
        ownerId: station.ownerId,
        name: station.name
      },
      update: {
        $setOnInsert: station
      },
      upsert: true
    }
  }));

  const result = await Station.bulkWrite(bulkOperations, {
    ordered: false
  });

  const insertedCount = (result.upsertedCount || 0) + (result.insertedCount || 0);

  if (insertedCount > 0) {
    return {
      insertedCount,
      totalDefaultStations: indiaStations.length
    };
  }

  return null;
};
