import { Document } from "mongoose";

export interface Album extends Document {
    images: string[];
    name: string;
}

export interface Link {
    link: string;
    instagram: boolean;
}