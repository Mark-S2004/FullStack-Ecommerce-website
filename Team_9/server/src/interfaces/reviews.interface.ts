export interface Review {
  _id?: string;
  user: string; // userId
  rating: number;
  comment: string;
  createdAt?: Date;
}
