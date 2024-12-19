import mongoose, { Schema, Document, Model } from "mongoose";

interface ICode extends Document {
    code: string;
    user: mongoose.Types.ObjectId;
}

const codeSchema: Schema<ICode> = new Schema({
    code: {
        type: String,
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
})



const Code: Model<ICode> = mongoose.model<ICode>("Code", codeSchema);

export default Code;