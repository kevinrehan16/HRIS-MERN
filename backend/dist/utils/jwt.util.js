import jwt from 'jsonwebtoken';
const SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only';
export const generateToken = (payload) => {
    return jwt.sign(payload, SECRET, {
        expiresIn: (process.env.JWT_EXPIRES_IN || '1d'),
    });
};
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, SECRET);
    }
    catch (error) {
        return null;
    }
};
//# sourceMappingURL=jwt.util.js.map