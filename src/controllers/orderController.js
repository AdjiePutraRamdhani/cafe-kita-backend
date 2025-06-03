// src/controllers/orderController.js
const { PrismaClient } = require('../generated/prisma/client');
const prisma = new PrismaClient();

// Membuat pesanan baru
exports.createOrder = async (req, res) => {
    // Frontend akan mengirim data seperti ini:
    // { customerName: "Budi", tableNumber: 5, items: [{ menuId: 1, quantity: 2 }, { menuId: 4, quantity: 1 }] }
    const { customerName, tableNumber, items } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ status: "fail", message: "Pesanan harus memiliki setidaknya satu item." });
    }

    try {
        // Gunakan Prisma Transaction untuk memastikan semua query berhasil atau gagal bersamaan
        const newOrder = await prisma.$transaction(async (tx) => {
            // 1. Dapatkan semua ID menu dari request
            const menuIds = items.map(item => item.menuId);

            // 2. Ambil data menu dari database untuk mendapatkan harga yang valid
            const menuItemsInDb = await tx.menu.findMany({
                where: { id: { in: menuIds } },
            });

            // Pastikan semua menuId valid
            if (menuItemsInDb.length !== menuIds.length) {
                throw new Error("Satu atau lebih menu item tidak ditemukan di database.");
            }

            // 3. Hitung total harga berdasarkan harga dari database
            let totalPrice = 0;
            const orderItemsData = items.map(item => {
                const menuItem = menuItemsInDb.find(dbItem => dbItem.id === item.menuId);
                totalPrice += menuItem.harga * item.quantity;
                return {
                    menuId: item.menuId,
                    quantity: item.quantity,
                    priceAtOrder: menuItem.harga, // Simpan harga saat ini
                };
            });

            // 4. Buat entri Order utama
            const createdOrder = await tx.order.create({
                data: {
                    customerName,
                    tableNumber,
                    totalPrice,
                    status: 'PENDING',
                    // Buat OrderItem secara bersamaan (nested write)
                    items: {
                        create: orderItemsData,
                    },
                },
                // Sertakan item yang baru dibuat dalam respons
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
            message: "Gagal membuat pesanan",
            error: error.message
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