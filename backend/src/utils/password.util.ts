import bcrypt from 'bcryptjs';

// Ang saltRounds=12 ay Enterprise Standard para sa security
export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 12);
};

export const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};