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
  const query = {};

  if (req.query.address) {
    query["location.address"] = { $regex: req.query.address, $options: "i" };
  }

  if (req.query.state) {
    query["location.state"] = { $regex: `^${req.query.state}$`, $options: "i" };
  }

  if (req.query.district) {
    query["location.district"] = { $regex: `^${req.query.district}$`, $options: "i" };
  }

  if (req.query.chargerType) {
    query.chargerType = { $regex: `^${req.query.chargerType}$`, $options: "i" };
  }

  if (typeof req.query.minPrice === "number" || typeof req.query.maxPrice === "number") {
    query.pricePerUnit = {};

    if (typeof req.query.minPrice === "number") {
      query.pricePerUnit.$gte = req.query.minPrice;
    }

    if (typeof req.query.maxPrice === "number") {
      query.pricePerUnit.$lte = req.query.maxPrice;
    }
  }

  if (typeof req.query.isApproved === "boolean") {
    query.isApproved = req.query.isApproved;
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
