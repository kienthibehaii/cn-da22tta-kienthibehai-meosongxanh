// server/models/Challenge.js
const ChallengeSchema = new mongoose.Schema({
  title: String,
  description: String,
  pointsReward: Number, // Điểm thưởng khi hoàn thành
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});