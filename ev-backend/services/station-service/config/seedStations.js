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
        $set: station
      },
      upsert: true
    }
  }));

  const result = await Station.bulkWrite(bulkOperations, {
    ordered: false
  });

  const insertedCount = (result.upsertedCount || 0) + (result.insertedCount || 0);
  const updatedCount = result.modifiedCount || 0;

  if (insertedCount > 0 || updatedCount > 0) {
    return {
      insertedCount,
      updatedCount,
      totalDefaultStations: indiaStations.length
    };
  }

  return null;
};
