// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
    let token;
    // 1. Cek jika header Authorization ada dan dimulai dengan 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Tidak terautentikasi, silakan login.' });
    }

    try {
        // 2. Verifikasi token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Simpan data pengguna dari token ke object request
        // Ini akan berguna untuk autorisasi berdasarkan peran
        req.user = { id: decoded.userId, role: decoded.role };

        next(); // Lanjutkan ke controller/middleware berikutnya
    } catch (error) {
        return res.status(401).json({ message: 'Token tidak valid atau sudah kedaluwarsa.' });
    }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // Cek jika peran pengguna (dari middleware protect) ada di dalam daftar peran yang diizinkan
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Anda tidak memiliki izin untuk melakukan aksi ini.' });
        }
        next();
    };
};