export interface Post {
  id: string;
  userId: string;   // autor
  title: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  likes: number;
  likedBy?: string[]; // usuarios que han dado like
}
