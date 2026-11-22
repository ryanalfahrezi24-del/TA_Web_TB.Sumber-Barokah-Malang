/**
 * Entry point JavaScript utama aplikasi frontend TB. Sumber Barokah Malang.
 * Memuat modul penyimpanan data barang (localStorage), logika admin stok,
 * dan logika halaman katalog produk.
 */

import * as barangStore from './barang-store.js';
import { initAdminStok } from './admin-stok.js';
import { initKatalog } from './katalog.js';

// Ekspos modul penyimpanan barang ke window agar mudah diakses lintas fungsi
window.barangStore = barangStore;

function initAplikasi() {
    initAdminStok();
    initKatalog();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAplikasi);
} else {
    initAplikasi();
}
