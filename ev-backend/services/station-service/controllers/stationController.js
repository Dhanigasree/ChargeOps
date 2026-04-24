import Station from "../models/Station.js";

const canMutateStation = (station, user) => user.role === "admin" || station.ownerId === user.id;

export const createStation = async (req, res) => {
  const station = await Station.create({
    ...req.body,
    ownerId: req.user.id,
    isApproved: req.user.role === "admin" ? Boolean(req.body.isApproved) : false
  });

  return res.status(201).json({
    success: true,
    message: "Station created successfully",
    data: station.toSanitizedJSON()
  });
};

export const updateStation = async (req, res) => {
  const station = await Station.findById(req.params.stationId);

  if (!station) {
    return res.status(404).json({
      success: false,
      message: "Station not found"
    });
  }

  if (!canMutateStation(station, req.user)) {
    return res.status(403).json({
      success: false,
      message: "You are not allowed to update this station"
    });
  }

  if (typeof req.body.name === "string") {
    station.name = req.body.name;
  }

  if (req.body.location) {
    station.location = {
      ...station.location.toObject(),
      ...req.body.location
    };
  }

  if (typeof req.body.chargerType === "string") {
    station.chargerType = req.body.chargerType;
  }

  if (typeof req.body.pricePerUnit === "number") {
    station.pricePerUnit = req.body.pricePerUnit;
  }

  if (req.body.availability && typeof req.body.availability.slots === "number") {
    station.availability.slots = req.body.availability.slots;
  }

  if (typeof req.body.isApproved === "boolean" && req.user.role === "admin") {
    station.isApproved = req.body.isApproved;
  }

  await station.save();

  return res.status(200).json({
    success: true,
    message: "Station updated successfully",
    data: station.toSanitizedJSON()
  });
};

export const deleteStation = async (req, res) => {
  const station = await Station.findById(req.params.stationId);

  if (!station) {
    return res.status(404).json({
      success: false,
      message: "Station not found"
    });
  }

  if (!canMutateStation(station, req.user)) {
    return res.status(403).json({
      success: false,
      message: "You are not allowed to delete this station"
    });
  }

  await station.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Station deleted successfully"
  });
};

export const getAllStations = async (req, res) => {
  const filters = req.validated?.query || req.query;
  const query = {};

  if (filters.q) {
    query.$or = [
      { name: { $regex: filters.q, $options: "i" } },
      { "location.address": { $regex: filters.q, $options: "i" } },
      { "location.locality": { $regex: filters.q, $options: "i" } },
      { "location.district": { $regex: filters.q, $options: "i" } },
      { "location.state": { $regex: filters.q, $options: "i" } }
    ];
  }

  if (filters.address) {
    query["location.address"] = { $regex: filters.address, $options: "i" };
  }

  if (filters.state) {
    query["location.state"] = { $regex: `^${filters.state}$`, $options: "i" };
  }

  if (filters.district) {
    query["location.district"] = { $regex: `^${filters.district}$`, $options: "i" };
  }

  if (filters.chargerType) {
    query.chargerType = { $regex: `^${filters.chargerType}$`, $options: "i" };
  }

  if (typeof filters.minPrice === "number" || typeof filters.maxPrice === "number") {
    query.pricePerUnit = {};

    if (typeof filters.minPrice === "number") {
      query.pricePerUnit.$gte = filters.minPrice;
    }

    if (typeof filters.maxPrice === "number") {
      query.pricePerUnit.$lte = filters.maxPrice;
    }
  }

  if (typeof filters.isApproved === "boolean") {
    query.isApproved = filters.isApproved;
  }

  const stations = await Station.find(query).sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    data: stations.map((station) => station.toSanitizedJSON())
  });
};

export const getStationById = async (req, res) => {
  const station = await Station.findById(req.params.stationId);

  if (!station) {
    return res.status(404).json({
      success: false,
      message: "Station not found"
    });
  }

  return res.status(200).json({
    success: true,
    data: station.toSanitizedJSON()
  });
};
