// src/controllers/userController.js
const { PrismaClient } = require('../generated/prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

// Helper function untuk menghilangkan password dari objek user
const excludePassword = (user) => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

// Mendapatkan semua pengguna
exports.getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            // Pilih field yang ingin ditampilkan, jangan sertakan password
            select: {
                id: true,
                username: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });
        res.status(200).json({ status: "success", data: { users } });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Gagal mengambil data pengguna." });
    }
};

// Mendapatkan satu pengguna berdasarkan ID
exports.getUserById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (user) {
            res.status(200).json({ status: "success", data: { user } });
        } else {
            res.status(404).json({ status: "fail", message: "Pengguna tidak ditemukan." });
        }
    } catch (error) {
        res.status(500).json({ status: "error", message: "Gagal mengambil data pengguna." });
    }
};

// Membuat pengguna baru (mirip register, tapi untuk admin)
exports.createUser = async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ status: "fail", message: "Username, password, dan role harus diisi." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role
            }
        });
        res.status(201).json({ status: "success", data: { user: excludePassword(newUser) } });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ status: "fail", message: "Username sudah digunakan." });
        }
        res.status(500).json({ status: "error", message: "Gagal membuat pengguna." });
    }
};

// Memperbarui pengguna
exports.updateUser = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { username, role, password } = req.body;

        const dataToUpdate = {
            ...(username && { username }),
            ...(role && { role }),
        };

        // Jika ada password baru, hash terlebih dahulu
        if (password) {
            dataToUpdate.password = await bcrypt.hash(password, 12);
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: dataToUpdate,
        });

        res.status(200).json({ status: "success", data: { user: excludePassword(updatedUser) } });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Gagal memperbarui pengguna." });
    }
};

// Menghapus pengguna
exports.deleteUser = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        // Pencegahan agar admin tidak bisa menghapus akunnya sendiri lewat API ini
        if (req.user.id === id) {
            return res.status(403).json({ status: "fail", message: "Anda tidak bisa menghapus akun Anda sendiri." });
        }

        await prisma.user.delete({ where: { id } });
        res.status(204).json({ status: "success", data: null });
    } catch (error) {
        if (error.code === 'P2025') { // Error jika record yang akan dihapus tidak ada
             return res.status(404).json({ status: "fail", message: "Pengguna tidak ditemukan." });
        }
        res.status(500).json({ status: "error", message: "Gagal menghapus pengguna." });
    }
};