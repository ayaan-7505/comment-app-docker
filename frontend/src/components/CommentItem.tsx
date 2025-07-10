import { useState, useEffect } from 'react';
import axios from 'axios';
import CommentForm from './CommentForm';
import type { CommentType } from '../types';

interface Props {
  comment: CommentType;
  onReplyAdded: () => void;
  currentUserId: number;
}

export default function CommentItem({
  comment,
  onReplyAdded,
  currentUserId,
}: Props) {
  const [showReply, setShowReply] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localDeleted, setLocalDeleted] = useState(comment.isDeleted);
  const [localDeletedAt, setLocalDeletedAt] = useState(comment.deletedAt);



  useEffect(() => {
    setEditedContent(comment.content);
  }, [comment.content]);

  // Handle malformed or missing createdAt values
  const createdAtTime = new Date(comment.createdAt).getTime();
  const nowTime = Date.now();
  const timeDiffMinutes = (nowTime - createdAtTime) / (1000 * 60);

  const isWithinEditWindow =
    comment.userId === currentUserId &&
    !isNaN(createdAtTime) &&
    timeDiffMinutes <= 15;

  console.log({
    commentUserId: comment.userId,
    currentUserId,
    createdAt: comment.createdAt,
    now: new Date().toISOString(),
    diffInMinutes: timeDiffMinutes,
    isWithinEditWindow,
  });

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/comments/${comment.id}`,
        { content: editedContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Edit response:", res.data);
      setIsEditing(false);
      onReplyAdded();
    } catch (err) {
      console.error('Edit failed:', err);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    try {
      setIsDeleting(true);
      await axios.delete(`http://localhost:5000/api/comments/${comment.id}`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLocalDeleted(true);
      setLocalDeletedAt(new Date().toISOString()); // set current timestamp
      onReplyAdded();
    } catch (err) {
      console.error('Delete failed:', err);
    }finally {
      setIsDeleting(false);
    }
  };

  const handleRestore = async () => {
  const token = localStorage.getItem('token');
  try {
    await axios.post(`http://localhost:5000/api/comments/${comment.id}/restore`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setLocalDeleted(false);
    setLocalDeletedAt(null); // Clear deletedAt timestamp
    console.log('Comment restored successfully');
    onReplyAdded();
  } catch (err) {
    console.error('Restore failed:', err);
  }
};

const isWithinRestoreWindow = (): boolean => {
  if (!localDeletedAt) return false; // If not deleted, no restore window
  const deletedTime = new Date(localDeletedAt).getTime();
  const nowTime = Date.now();
  const diffMinutes = (nowTime - deletedTime) / (1000 * 60);
  return diffMinutes <= 15;
};

  

  return (
    <div className="border-l pl-4">
      <div className="mb-1">
        <span className="font-semibold">{comment.username}</span>

        {isEditing ? (
          <>
            <textarea
              className="w-full border rounded p-2 mt-1"
              rows={3}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(comment.content);
                }}
                className="text-gray-500 hover:underline"
              >
                Cancel
              </button>
            </div>
          </>
        ) : localDeleted ? (
          <p className="italic text-gray-400">This comment was deleted. </p>
        ) : (
          <p>{comment.content}</p>
        )}

        <div className="text-sm text-gray-500">
          {new Date(comment.createdAt).toLocaleString()}
        </div>
      </div>

      <div className="flex items-center space-x-3 text-sm mb-2">
        <button
          onClick={() => setShowReply(!showReply)}
          className="text-blue-600 hover:underline"
        >
          {showReply ? 'Cancel' : 'Reply'}
        </button>

        {isWithinEditWindow && !isEditing && !localDeleted &&(
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="text-yellow-600 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:underline"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </>
        )}
         {localDeleted && comment.userId === currentUserId && isWithinRestoreWindow() && (
          <button
            onClick={handleRestore}
           className="text-green-600 hover:underline"
          >
           Restore
        </button>
      )}  
      </div>

      {showReply && (
        <div className="ml-4 mb-2">
          <CommentForm
            parentId={comment.id}
            onCommentAdded={() => {
              onReplyAdded();
              setShowReply(false);
            }}
          />
        </div>
      )}

      {(comment.children?.length ?? 0) > 0 && (
        <div className="ml-4">
          {(comment.children ?? []).map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              onReplyAdded={onReplyAdded}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
