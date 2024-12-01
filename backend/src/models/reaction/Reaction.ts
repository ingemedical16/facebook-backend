import mongoose, { Schema, Document, Model } from "mongoose";

const { ObjectId } = mongoose.Schema;

// Define the interface for a reaction
export interface ReactionDocument extends Document {
  react: "like" | "love" | "haha" | "sad" | "angry" | "wow";
  postRef?: mongoose.Types.ObjectId;
  reactBy?: mongoose.Types.ObjectId;
}

// Create the reaction schema
const reactionSchema = new Schema<ReactionDocument>({
  react: {
    type: String,
    enum: ["like", "love", "haha", "sad", "angry", "wow"],
    required: true,
  },
  postRef: {
    type: ObjectId,
    ref: "Post",
  },
  reactBy: {
    type: ObjectId,
    ref: "User",
  },
});

// Export the model
export const Reaction: Model<ReactionDocument> =
  mongoose.model<ReactionDocument>("Reaction", reactionSchema);