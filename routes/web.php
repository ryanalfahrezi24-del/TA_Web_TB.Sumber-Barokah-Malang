<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes - TB. Sumber Barokah Malang
|--------------------------------------------------------------------------
| 1. Halaman Utama (Landing Page)
| 2. Halaman Login (Simulasi Masuk Sistem)
| 3. Halaman Admin (Informasi & Pengelolaan Stok Barang)
| 4. Halaman Katalog (Katalog Publik Barang & Ketersediaan Stok)
| 5. Halaman Kalkulator (Kalkulator Kebutuhan Material Pekerjaan)
| 6. Halaman Keranjang (Keranjang Belanja Material Pelanggan)
*/

// Halaman Utama
Route::get('/', function () {
    return view('home');
})->name('home');

// Halaman Login
Route::get('/login', function () {
    return view('login');
})->name('login');

// Halaman Admin - Informasi Stok Barang
Route::get('/admin', function () {
    return view('admin.stok');
})->name('admin.stok');

// Halaman Admin - Kelola Kategori Barang
Route::get('/admin/kategori', function () {
    return view('admin.kategori');
})->name('admin.kategori');

// Halaman Admin - Pengiriman Barang (Pantau Pesanan Kurir)
Route::get('/admin/pengiriman', function () {
    return view('admin.pengiriman');
})->name('admin.pengiriman');

// Halaman Admin - Laporan Transaksi (Riwayat Pembelian & Barang Terjual)
Route::get('/admin/laporan', function () {
    return view('admin.laporan');
})->name('admin.laporan');

// Halaman Admin - Pengaturan Informasi Toko (Jam Kerja, Kontak, Alamat)
Route::get('/admin/pengaturan', function () {
    return view('admin.pengaturan');
})->name('admin.pengaturan');

// Halaman Katalog Publik
Route::get('/katalog', function () {
    return view('katalog');
})->name('katalog');

// Halaman Kalkulator Kebutuhan Material
Route::get('/kalkulator', function () {
    return view('kalkulator');
})->name('kalkulator');

// Halaman Keranjang Belanja
Route::get('/keranjang', function () {
    return view('keranjang');
})->name('keranjang');
