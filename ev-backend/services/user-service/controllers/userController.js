import User from "../models/User.js";

const ensureProfile = async (authUser) => {
  let profile = await User.findOne({ authUserId: authUser.id });

  if (!profile) {
    profile = await User.create({
      authUserId: authUser.id,
      name: authUser.name || authUser.email.split("@")[0],
      email: authUser.email,
      role: authUser.role
    });
  }

  let changed = false;

  if (profile.email !== authUser.email) {
    profile.email = authUser.email;
    changed = true;
  }

  if (profile.role !== authUser.role) {
    profile.role = authUser.role;
    changed = true;
  }

  if (changed) {
    await profile.save();
  }

  return profile;
};

export const getCurrentUserProfile = async (req, res) => {
  const profile = await ensureProfile(req.user);

  return res.status(200).json({
    success: true,
    data: profile.toSanitizedJSON()
  });
};

export const updateCurrentUserProfile = async (req, res) => {
  const profile = await ensureProfile(req.user);

  if (typeof req.body.name === "string") {
    profile.name = req.body.name;
  }

  if (typeof req.body.phone === "string") {
    profile.phone = req.body.phone;
  }

  await profile.save();

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: profile.toSanitizedJSON()
  });
};

export const getAllUsers = async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    data: users.map((user) => user.toSanitizedJSON())
  });
};
