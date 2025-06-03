-- CreateTable
CREATE TABLE `Menu` (
    `id` VARCHAR(4) NOT NULL,
    `nama` VARCHAR(255) NOT NULL,
    `harga` DOUBLE NOT NULL,
    `kategori` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
