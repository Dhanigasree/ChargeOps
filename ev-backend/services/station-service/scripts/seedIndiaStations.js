import mongoose from "mongoose";
import { connectDatabase } from "../config/database.js";
import Station from "../models/Station.js";
import { indiaStations } from "../data/indiaStations.js";

const seedIndiaStations = async () => {
  try {
    await connectDatabase();

    await Station.deleteMany({
      ownerId: { $regex: /^seed-india-/ }
    });

    await Station.insertMany(indiaStations);

    console.log(`Seeded ${indiaStations.length} India station records successfully.`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed India stations", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedIndiaStations();
