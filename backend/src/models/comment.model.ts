import { db } from '../config/db';

export interface Comment {
  id: number;
  userId: number;
  parentId?: number | null;
  content: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  replies?: Comment[];  
  username: string; // Added for username
}

// Create a new comment
// If parentId is provided, it creates a reply to that comment
export const createComment = async (
  userId: number,
  content: string,
  parentId?: number
): Promise<Comment> => {
  const result = await db.query(
    `INSERT INTO comments (user_id, content, parent_id)
     VALUES ($1, $2, $3)
     RETURNING 
       id, 
       user_id AS "userId", 
       parent_id AS "parentId", 
       content, 
       is_deleted AS "isDeleted", 
       created_at AS "createdAt", 
       updated_at AS "updatedAt", 
       deleted_at AS "deletedAt"`,
    [userId, content, parentId === undefined ? null : parentId]
  );
  return result.rows[0];
};


export const getAllComments = async (): Promise<Comment[]> => {
  const result = await db.query(`
  SELECT 
    c.id,
    c.user_id AS "userId",
    u.username AS "username",
    c.parent_id AS "parentId",
    c.content,
    c.is_deleted AS "isDeleted",
    c.created_at AS "createdAt",
    c.updated_at AS "updatedAt",
    c.deleted_at AS "deletedAt"
  FROM comments c
  JOIN users u ON c.user_id = u.id
  ORDER BY c.created_at ASC
`);
console.log(result.rows[0]); // check one comment


  const comments: Comment[] = result.rows;

  // Step 1: Group by parentId
  const map = new Map<number | null, Comment[]>();
  for (const comment of comments) {
    const parentId = comment.parentId ?? null;

    if (!map.has(parentId)) {
      map.set(parentId, []);
    }

    map.get(parentId)!.push(comment);
    
  }

  // Step 2: Recursive nesting
  const buildTree = (parentId: number | null): Comment[] => {
    const children = map.get(parentId) || [];
    return children.map(child => ({
      ...child,
      replies: buildTree(child.id),
    }));
  };
   console.log(JSON.stringify(buildTree(null), null, 2));

  return buildTree(null); // top-level comments
};

// Get single comment by ID
export const getCommentById = async (id: number): Promise<Comment | null> => {
  const result = await db.query(
    `SELECT 
      id, 
      user_id AS "userId", 
      parent_id AS "parentId", 
      content, 
      is_deleted AS "isDeleted", 
      created_at AS "createdAt", 
      updated_at AS "updatedAt", 
      deleted_at AS "deletedAt"
     FROM comments WHERE id = $1`, 
    [id]
  );
  return result.rows[0] || null;
};

// Update comment content
export const updateComment = async (id: number, content: string): Promise<Comment> => {
  const result = await db.query(
    `UPDATE comments 
     SET content = $1, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $2 
     RETURNING 
       id, 
       user_id AS "userId", 
       parent_id AS "parentId", 
       content, 
       is_deleted AS "isDeleted", 
       created_at AS "createdAt", 
       updated_at AS "updatedAt", 
       deleted_at AS "deletedAt"`,
    [content, id]
  );
  return result.rows[0];
};

// Soft delete a comment
export const softDeleteComment = async (id: number): Promise<Comment> => {
  const result = await db.query(
    `UPDATE comments 
     SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP 
     WHERE id = $1 
     RETURNING 
       id, 
       user_id AS "userId", 
       parent_id AS "parentId", 
       content, 
       is_deleted AS "isDeleted", 
       created_at AS "createdAt", 
       updated_at AS "updatedAt", 
       deleted_at AS "deletedAt"`,
    [id]
  );
  return result.rows[0];
};

// Restore soft-deleted comment (within grace period)
export const restoreComment = async (id: number): Promise<Comment> => {
  const result = await db.query(
    `UPDATE comments 
     SET is_deleted = FALSE, deleted_at = NULL 
     WHERE id = $1 
     RETURNING 
       id, 
       user_id AS "userId", 
       parent_id AS "parentId", 
       content, 
       is_deleted AS "isDeleted", 
       created_at AS "createdAt", 
       updated_at AS "updatedAt", 
       deleted_at AS "deletedAt"`,
    [id]
  );
  return result.rows[0];
};
