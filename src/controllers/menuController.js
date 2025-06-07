// src/controllers/menuController.js
const { PrismaClient } = require('../generated/prisma/client');
const prisma = new PrismaClient();

// Mendapatkan semua item menu
exports.getAllMenuItems = async (req, res) => {
    try {
        const menuItems = await prisma.menu.findMany();
        res.status(200).json({
            status: "success",
            data: {
                menuItems,
            },
        });
    } catch (error) {
        console.error("Error di getAllMenuItems:", error);
        res.status(500).json({
            status: "error",
            message: "Gagal mengambil data menu",
            error: error.message // Di produksi, mungkin lebih baik tidak mengirim detail error
        });
    }
};

// Mendapatkan satu item menu berdasarkan ID
exports.getMenuItemById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const menuItem = await prisma.menu.findUnique({
            where: { id: id },
        });

        if (menuItem) {
            res.status(200).json({
                status: "success",
                data: {
                    menuItem,
                },
            });
        } else {
            res.status(404).json({
                status: "fail",
                message: "Menu item tidak ditemukan",
            });
        }
    } catch (error) {
        console.error("Error di getMenuItemById:", error);
        res.status(500).json({
            status: "error",
            message: "Gagal mengambil data menu item",
            error: error.message
        });
    }
};

// Membuat item menu baru
exports.createMenuItem = async (req, res) => {
    try {
        const { nama, harga, kategori, imageUrl } = req.body;

        if (!nama || harga === undefined || !kategori) { // harga bisa 0, jadi cek undefined
            return res.status(400).json({
                status: "fail",
                message: "Nama, harga, dan kategori harus diisi",
            });
        }

        const newMenuItem = await prisma.menu.create({
            data: {
                nama,
                harga: parseFloat(harga),
                kategori,
            },
        });

        res.status(201).json({
            status: "success",
            data: {
                menuItem: newMenuItem,
            },
        });
    } catch (error) {
        console.error("Error di createMenuItem:", error);
        res.status(500).json({
            status: "error",
            message: "Gagal membuat menu item",
            error: error.message
        });
    }
};

// Memperbarui item menu berdasarkan ID
exports.updateMenuItem = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nama, harga, kategori, imageUrl } = req.body;

        // Cek apakah menu item ada
        const existingMenu = await prisma.menu.findUnique({ where: { id } });
        if (!existingMenu) {
            return res.status(404).json({
                status: "fail",
                message: "Menu item tidak ditemukan untuk diperbarui",
            });
        }

        const updatedMenuItem = await prisma.menu.update({
            where: { id: id },
            data: {
                ...(nama && { nama }),
                ...(harga !== undefined && { harga: parseFloat(harga) }),
                ...(kategori && { kategori }),
                ...(imageUrl && { imageUrl }),
            },
        });

        res.status(200).json({
            status: "success",
            data: {
                menuItem: updatedMenuItem,
            },
        });
    } catch (error) {
        console.error("Error di updateMenuItem:", error);
        res.status(500).json({
            status: "error",
            message: "Gagal memperbarui menu item",
            error: error.message
        });
    }
};

// Menghapus item menu berdasarkan ID
exports.deleteMenuItem = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        // Cek apakah menu item ada sebelum menghapus
        const existingMenu = await prisma.menu.findUnique({ where: { id } });
        if (!existingMenu) {
            return res.status(404).json({
                status: "fail",
                message: "Menu item tidak ditemukan untuk dihapus",
            });
        }

        await prisma.menu.delete({
            where: { id: id },
        });
        res.status(204).json({ // 204 No Content
            status: "success",
            data: null,
        });
    } catch (error) {
        console.error("Error di deleteMenuItem:", error);
        res.status(500).json({
            status: "error",
            message: "Gagal menghapus menu item",
            error: error.message
        });
    }
};