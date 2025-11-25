export interface Comment {
  _id: string;
  postId: string;
  userId: {
    _id: string;
    nombre: string;
    username: string;
    profilePicture?: string;
  };
  content: string;
  editing?:boolean;
  updatedAt?:Date;
  createdAt: string;
}
