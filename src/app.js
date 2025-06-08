// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors'); // <--- AKTIFKAN
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const { $Enums } = require('./generated/prisma');

const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server berjalan di port ${PORT}`);
});

//Middleware Global
app.use(cors({
    origin: ['http://localhost:3000','http://localhost:3001',
    'https://cafe-kita-frontend.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json()); // <--- AKTIFKAN
app.use(express.urlencoded({ extended: true })); // <--- AKTIFKAN

app.get('/', (req, res) => {
    res.send('Server Express minimal berjalan!');
});

// Root Route (opsional, untuk tes)
app.get('/api', (req, res) => { // <--- AKTIFKAN
    res.status(200).json({ message: 'Selamat datang di API Admin Cafe Kita v1!' });
});

app.use('/api/v1/auth', authRoutes);

app.use('/api/v1/users', userRoutes);

// Gunakan Routes untuk Menu
app.use('/api/v1/menu', menuRoutes);

// Gunakan Routes untuk Order
app.use('/api/v1/orders', orderRoutes);

// Middleware Global Error Handler (Contoh Sederhana)
app.use((err, req, res, next) => {
    console.error("ERROR 💥", err);
    res.status(500).json({
        status: 'error',
        message: 'Terjadi kesalahan di server!',
        // error: err // Jangan kirim detail error ke client di produksi
    });
});

// Middleware untuk menangani route yang tidak ditemukan (404)
// Harus diletakkan SETELAH semua definisi route Anda
app.use((req, res, next) => {
    res.status(404).json({
        status: 'fail',
        message: `Tidak dapat menemukan ${req.originalUrl} di server ini! (handled by app.use)`
    });
});

// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server backend minimal berjalan di http://localhost:${PORT}`);
    console.log(`API Menu tersedia di http://localhost:${PORT}/api/v1/menu`);
});