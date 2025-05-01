import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose"

export type MessageDocument = Message & Document;

@Schema({timestamps: true})
export class Message {
    @Prop({ required: true})
    conversationId: string;

    @Prop({required: true})
    senderId: string;

    @Prop({required: true})
    text: string;

    @Prop({default: false})
    read: boolean;

    @Prop()
    readAt: Date;

    // TS does not know about createdAt and updatedAt
    // So we need to add them manually
    _id?: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.index({conversationId: 1, createdAt: 1});

