import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose"

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
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.index({conversationId: 1, createdAt: 1});

