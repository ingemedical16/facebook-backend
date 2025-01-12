import mongoose, { Schema, Document, Model, ObjectId } from "mongoose";

interface IMessage {
  sender: mongoose.Types.ObjectId;
  content: string;
  timestamp: Date;
}

interface IChat extends Document {
  type: "private" | "group";
  name?: string; // Optional for groups
  owner: mongoose.Types.ObjectId; // Owner of the chat
  members: mongoose.Types.ObjectId[]; // Members in the chat
  messages: IMessage[];
}

const messageSchema: Schema<IMessage> = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const chatSchema: Schema<IChat> = new Schema(
  {
    type: { type: String, enum: ["private", "group"], default: "private" },
    name: { type: String }, // Group name
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    messages: [messageSchema],
  },
  { timestamps: true }
);

const Chat: Model<IChat> = mongoose.model<IChat>("Chat", chatSchema);
export default Chat;
