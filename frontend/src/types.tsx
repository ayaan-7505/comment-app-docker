
export interface CommentType {
  id: number;
  content: string;
  userId: number;
  parentId: number | null;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  isDeleted: boolean;
  username: string;
  children?: CommentType[];
}



export type NotificationType = {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
};

