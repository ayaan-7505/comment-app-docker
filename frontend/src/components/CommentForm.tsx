import { useState } from 'react';
import axios from 'axios';
const baseURL = import.meta.env.VITE_API_URL;

interface Props {
  parentId: number | null;
  onCommentAdded: () => void;
}

export default function CommentForm({ parentId, onCommentAdded }: Props) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to comment');
      return;
    }

    try {
      const response = await axios.post(
        `${baseURL}/api/comments`,
        {
          content,
          parentId: parentId ?? null, // Always include explicitly
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Comment submitted:", response.data);

      setContent('');
      onCommentAdded?.(); // Optional chaining: call if defined
    } catch (err) {
      console.error("Failed to post comment:", err);
      setError('Failed to post comment');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {error && <p className="text-sm text-red-500">{error}</p>}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full border rounded p-2"
        rows={3}
        placeholder={parentId ? 'Write a reply...' : 'Write a comment...'}
        required
      />
      <div className="text-right">
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          {parentId ? 'Reply' : 'Comment'}
        </button>
      </div>
    </form>
  );
}
