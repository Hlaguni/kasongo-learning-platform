import Grade from "../models/Grade.js";

// @desc Create grade
// @route POST /api/grades
// @access Admin
export const createGrade = async (req, res) => {
  try {
    const { name, value } = req.body;

    if (!name || !value) {
      return res.status(400).json({ message: "Name and value are required" });
    }

    const existing = await Grade.findOne({ value });

    if (existing) {
      return res.status(400).json({ message: "Grade already exists" });
    }

    const grade = await Grade.create({ name, value });

    res.status(201).json(grade);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating grade" });
  }
};

// @desc Get all grades
// @route GET /api/grades
// @access Public (or protected later)
export const getGrades = async (req, res) => {
  try {
    const grades = await Grade.find().sort({ value: 1 });
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: "Error fetching grades" });
  }
};

// @desc Update grade
// @route PUT /api/grades/:id
// @access Admin
export const updateGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);

    if (!grade) {
      return res.status(404).json({ message: "Grade not found" });
    }

    grade.name = req.body.name || grade.name;
    grade.value = req.body.value || grade.value;

    const updated = await grade.save();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating grade" });
  }
};

// @desc Delete grade
// @route DELETE /api/grades/:id
// @access Admin
export const deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);

    if (!grade) {
      return res.status(404).json({ message: "Grade not found" });
    }

    await grade.deleteOne();

    res.json({ message: "Grade removed" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting grade" });
  
  }
};