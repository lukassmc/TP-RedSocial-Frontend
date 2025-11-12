export interface Post {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
  userId: {
    _id: string;
    username: string;
    email: string;
    profilePicture?: string;
  };
  likes: string[];
  comments: number;
  isPublished: boolean;
  music?: {
    trackId: string;
    previewUrl: string;
    trackName: string;
    artistName: string;
    albumName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePost {
  title: string;
  content: string;
  imageUrl?: string;
  music?: {
    trackId: string;
    previewUrl: string;
    trackName: string;
    artistName: string;
    albumName: string;
  };
}

export interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
}