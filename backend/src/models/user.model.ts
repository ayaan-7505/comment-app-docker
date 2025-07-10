import { db } from '../config/db';

export const createUser = async (username: string, email: string, passwordHash: string) => {
  const result = await db.query(
    'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
    [username, email, passwordHash]
  );
  return result.rows[0];
};

export const findUserByEmail = async (email: string) => {
  const result = await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
};
