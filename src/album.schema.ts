import { Schema } from 'mongoose';

export const AlbumSchemam = new Schema({
    name: String,
    images: [String],
});