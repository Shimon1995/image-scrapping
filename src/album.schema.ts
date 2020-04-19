import { Schema } from 'mongoose';

export const AlbumSchema = new Schema({
    name: { type: String, required: true, unique: true },
    images: { type: [String], required: true },
});