import bcrypt from 'bcryptjs';
// Ang saltRounds=12 ay Enterprise Standard para sa security
export const hashPassword = async (password) => {
    return await bcrypt.hash(password, 12);
};
export const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};
//# sourceMappingURL=password.util.js.map