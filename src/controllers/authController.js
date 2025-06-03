// src/controllers/authController.js
const { PrismaClient } = require('../generated/prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username dan password harus diisi." });
    }

    try {
        // Hash password sebelum disimpan
        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role: role || 'KASIR', // Jika role tidak diberikan, default ke KASIR
            },
        });

        // Jangan kirim password kembali di respons
        const userForResponse = { ...newUser };
        delete userForResponse.password;

        res.status(201).json({
            status: "success",
            data: {
                user: userForResponse,
            },
        });
    } catch (error) {
        // Handle error jika username sudah ada
        if (error.code === 'P2002') {
            return res.status(409).json({ message: "Username sudah digunakan." });
        }
        res.status(500).json({ message: "Gagal mendaftarkan pengguna.", error: error.message });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username dan password harus diisi." });
    }

    try {
        // 1. Cari pengguna berdasarkan username
        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user) {
            return res.status(401).json({ message: "Username atau password salah." });
        }

        // 2. Bandingkan password yang dimasukkan dengan hash di database
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Username atau password salah." });
        }

        // 3. Jika password benar, buat JWT
        const token = jwt.sign(
            { userId: user.id, role: user.role }, // Payload token
            process.env.JWT_SECRET, // Kunci rahasia dari file .env
            { expiresIn: '24h' } // Token berlaku selama 24 jam
        );

        res.status(200).json({
            status: "success",
            token,
        });
    } catch (error) {
        res.status(500).json({ message: "Terjadi kesalahan saat login.", error: error.message });
    }
};