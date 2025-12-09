import User from "../models/user.model.js";

//Get all users except the logged-in user
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select("-password");

    // Always return array, even if empty
    res.json(users || []);
  } catch (err) {
    console.error("🔥 Error fetching users:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get current user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("🔥 Error fetching user profile:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

//Update preferred language
export const updateLanguage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { preferredLanguage } = req.body;

    if (!preferredLanguage) {
      return res.status(400).json({ message: "Preferred language required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { preferredLanguage },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("🔥 Error updating language:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
