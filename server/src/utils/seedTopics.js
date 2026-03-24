import Topic from "../models/Topic.js";

const topics = [
  "Algebraic Expressions",
  "Equations and Inequalities",
  "Functions",
  "Number Patterns",
  "Finance, Growth & Decay",
  "Trigonometry",
  "Analytical Geometry",
  "Euclidean Geometry",
  "Measurement",
  "Statistics",
  "Probability",
];

const seedTopics = async () => {
  try {
    await Topic.deleteMany(); // optional (clears old ones)

    const topicDocs = topics.map((name) => ({
      name,
      grade: 10,
    }));

    await Topic.insertMany(topicDocs);

    console.log("✅ Topics seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding topics:", error);
  }
};

export default seedTopics;