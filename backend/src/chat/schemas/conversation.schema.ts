import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Types } from "mongoose"

export type ConversationDocument = Document & Conversation;

@Schema({timestamps: true})
export class Conversation {
    @Prop({required: true})
    user1Id: string;

    @Prop({required: true})
    user2Id: string;

    @Prop()
    lastMessageAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

ConversationSchema.index({user1Id: 1, user2Id: 1}, {unique: true});