import Zone from "../models/Zone.js";


// CREATE ZONE
export const createZone = async (req, res) => {
  try {
    const {
      name,
      code,
      areas
    } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Zone name and code are required"
      });
    }

    const existingZone = await Zone.findOne({
      code: code.toUpperCase()
    });

    if (existingZone) {
      return res.status(409).json({
        success: false,
        message: "Zone code already exists"
      });
    }

    const zone = await Zone.create({
      name,
      code: code.toUpperCase(),
      areas: areas || []
    });

    res.status(201).json({
      success: true,
      message: "Zone created successfully",
      zone
    });

  } catch (error) {
    console.error("Create zone error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create zone"
    });
  }
};


// GET ALL ZONES
export const getZones = async (req, res) => {
  try {
    const zones = await Zone.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: zones.length,
      zones
    });

  } catch (error) {
    console.error("Get zones error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch zones"
    });
  }
};


// GET SINGLE ZONE
export const getZoneById = async (req, res) => {
  try {
    const zone = await Zone.findById(req.params.id);

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: "Zone not found"
      });
    }

    res.status(200).json({
      success: true,
      zone
    });

  } catch (error) {
    console.error("Get zone error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch zone"
    });
  }
};


// UPDATE ZONE
export const updateZone = async (req, res) => {
  try {
    const {
      name,
      code,
      areas,
      isActive
    } = req.body;

    const zone = await Zone.findById(req.params.id);

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: "Zone not found"
      });
    }

    if (name !== undefined) {
      zone.name = name;
    }

    if (code !== undefined) {
      zone.code = code.toUpperCase();
    }

    if (areas !== undefined) {
      zone.areas = areas;
    }

    if (isActive !== undefined) {
      zone.isActive = isActive;
    }

    await zone.save();

    res.status(200).json({
      success: true,
      message: "Zone updated successfully",
      zone
    });

  } catch (error) {
    console.error("Update zone error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update zone"
    });
  }
};


// DELETE ZONE
export const deleteZone = async (req, res) => {
  try {
    const zone = await Zone.findById(req.params.id);

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: "Zone not found"
      });
    }

    await zone.deleteOne();

    res.status(200).json({
      success: true,
      message: "Zone deleted successfully"
    });

  } catch (error) {
    console.error("Delete zone error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete zone"
    });
  }
};
export const detectZone = async (req, res) => {
  try {
    const { pincode } = req.params;

    if (!pincode) {
      return res.status(400).json({
        success: false,
        message: "Pincode is required"
      });
    }

    const zone = await Zone.findOne({
      isActive: true,
      "areas.pincode": pincode
    });

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: "No zone found for this pincode"
      });
    }

    const matchedArea = zone.areas.find(
      (area) => area.pincode === pincode
    );

    res.status(200).json({
      success: true,
      zone: {
        id: zone._id,
        name: zone.name,
        code: zone.code
      },
      area: matchedArea
    });

  } catch (error) {
    console.error("Detect zone error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to detect zone"
    });
  }
};