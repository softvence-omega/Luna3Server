import { Schema, model } from 'mongoose';
import { TTipArticle } from './article.interface';

const TipSchema = new Schema<TTipArticle>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    tag: [{ type: String }],
    favCount: { type: Number, required: false, default: 0 },
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

export const TipArticleModel = model<TTipArticle>('TipArticle', TipSchema);