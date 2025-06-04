// src/controllers/orderController.js
const { PrismaClient } = require('../generated/prisma/client');
const prisma = new PrismaClient();

// Membuat pesanan baru
exports.createOrder = async (req, res) => {
    const { customerName, tableNumber, items } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ status: "fail", message: "Pesanan harus memiliki setidaknya satu item." });
    }

    try {
        const newOrder = await prisma.$transaction(async (tx) => {
            // 1. Dapatkan semua ID menu dari request DAN UBAH MENJADI INTEGER
            const menuIds = items.map(item => parseInt(item.menuId, 10)); // <-- PERUBAHAN DI SINI

            // Pastikan tidak ada NaN setelah parsing (jika ada menuId yang tidak valid)
            if (menuIds.some(id => isNaN(id))) {
                throw new Error("Satu atau lebih menuId tidak valid (bukan angka).");
            }

            // 2. Ambil data menu dari database untuk mendapatkan harga yang valid
            const menuItemsInDb = await tx.menu.findMany({
                where: { id: { in: menuIds } }, // Sekarang menuIds berisi angka
            });

            // Pastikan semua menuId valid
            if (menuItemsInDb.length !== menuIds.length) {
                throw new Error("Satu atau lebih menu item tidak ditemukan di database.");
            }

            // 3. Hitung total harga berdasarkan harga dari database
            let totalPrice = 0;
            const orderItemsData = items.map(item => {
                const menuItem = menuItemsInDb.find(dbItem => dbItem.id === parseInt(item.menuId, 10)); // <-- Tambahkan parseInt di sini juga untuk mencocokkan
                if (!menuItem) { // Tambahan: pastikan menuItem ditemukan
                    throw new Error(`Menu item dengan ID ${item.menuId} tidak ditemukan setelah validasi.`);
                }
                totalPrice += menuItem.harga * parseInt(item.quantity, 10); // <-- parseInt untuk quantity
                return {
                    menuId: parseInt(item.menuId, 10), // <-- parseInt
                    quantity: parseInt(item.quantity, 10), // <-- parseInt
                    priceAtOrder: menuItem.harga,
                };
            });

            // 4. Buat entri Order utama
            const createdOrder = await tx.order.create({
                data: {
                    customerName,
                    tableNumber: tableNumber ? parseInt(tableNumber, 10) : null, // Parse tableNumber jika ada
                    totalPrice,
                    status: 'PENDING',
                    items: {
                        create: orderItemsData,
                    },
                },
                include: {
                    items: true,
                },
            });

            return createdOrder;
        });

        res.status(201).json({
            status: "success",
            data: {
                order: newOrder,
            },
        });

    } catch (error) {
        console.error("Error di createOrder:", error);
        res.status(500).json({
            status: "error",
            message: error.message || "Gagal membuat pesanan", // Tampilkan pesan error yang lebih spesifik jika ada
            // error: error.message // Anda bisa uncomment ini untuk debugging lebih detail di development
        });
    }
};

// Mendapatkan semua pesanan
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                items: { // Sertakan detail item
                    include: {
                        menu: true, // Sertakan detail menu dari setiap item
                    },
                },
            },
            orderBy: {
                createdAt: 'desc', // Tampilkan yang terbaru dulu
            },
        });
        res.status(200).json({ status: "success", data: { orders } });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Gagal mengambil data pesanan" });
    }
};

// Mendapatkan satu pesanan berdasarkan ID
exports.getOrderById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        menu: true,
                    },
                },
            },
        });

        if (order) {
            res.status(200).json({ status: "success", data: { order } });
        } else {
            res.status(404).json({ status: "fail", message: "Pesanan tidak ditemukan" });
        }
    } catch (error) {
        res.status(500).json({ status: "error", message: "Gagal mengambil data pesanan" });
    }
};

// Memperbarui status pesanan
exports.updateOrderStatus = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { status } = req.body; // Frontend mengirim status baru: "COMPLETED" atau "CANCELLED"

        if (!status) {
            return res.status(400).json({ status: "fail", message: "Status harus diisi." });
        }

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { status },
        });
        res.status(200).json({ status: "success", data: { order: updatedOrder } });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Gagal memperbarui status pesanan" });
    }
};