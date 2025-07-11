import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CommentItem from '../components/CommentItem';
import CommentForm from '../components/CommentForm';
import NotificationList from '../components/NotificationList';
import type { CommentType } from '../types';
const baseURL = import.meta.env.VITE_API_URL;

export default function CommentPage() {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const navigate = useNavigate();

  type RawComment = {
    id: number;
    content: string;
    userId: number;
    parentId: number | null;
    createdAt: string;
    updatedAt?: string;
    deletedAt?: string | null;
    isDeleted: boolean;
    username: string;
    replies?: RawComment[];
  };

  const mapComment = useCallback((comment: RawComment): CommentType => ({
    id: comment.id,
    content: comment.content,
    userId: comment.userId,
    parentId: comment.parentId,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt, // optional
    deletedAt: comment.deletedAt ?? null, // optional but must be included
    isDeleted: comment.isDeleted, 
    username: comment.username,
    children: comment.replies ? comment.replies.map(mapComment) : [],
  }), []);

  const fetchComments = useCallback(async () => {
    try {
      const res = await axios.get(`${baseURL}/api/comments`);
      const mapped = res.data.map(mapComment);
      setComments(mapped);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  }, [mapComment]);

  useEffect(() => {
    fetchComments();

    // Decode token to get currentUserId
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.userId); // ✅ Access userId
      } catch (err) {
        console.error('Failed to decode JWT:', err);
      }
    }
  }, [fetchComments]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold mb-4">Comments</h2>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
       <NotificationList />
      <CommentForm parentId={null} onCommentAdded={fetchComments} />

      <div className="mt-4 space-y-4">
        {comments.map((c) => (
          <CommentItem
            key={c.id}
            comment={c}
            onReplyAdded={fetchComments}
            currentUserId={currentUserId ?? -1} // fallback to -1 if null
          />
        ))}
      </div>
    </div>
  );
}
