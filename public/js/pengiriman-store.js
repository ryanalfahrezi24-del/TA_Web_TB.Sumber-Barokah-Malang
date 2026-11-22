/**
 * ==============================================================================
 * DATA LAYER: PENGIRIMAN BARANG TB. SUMBER BAROKAH MALANG
 * ==============================================================================
 * Mengelola penyimpanan data pengiriman pesanan di browser menggunakan
 * localStorage dengan kunci 'sb_pengiriman' serta simulasi peran aktif
 * dengan kunci 'sb_peran_pengiriman'.
 *
 * Catatan Penting:
 * - Pengiriman TIDAK mengurangi stok barang (simulasi antarmuka kurir & admin).
 * - Pemilih peran ("Admin" | "Kurir") di halaman ini HANYA SIMULASI frontend
 *   dan nantinya akan digantikan oleh sistem autentikasi login & role-based
 *   access control (RBAC) sungguhan di sisi backend.
 * ==============================================================================
 */

const STORAGE_KEY_PENGIRIMAN = 'sb_pengiriman';
const STORAGE_KEY_PERAN_PENGIRIMAN = 'sb_peran_pengiriman';

/**
 * Daftar status pengantaran yang sah (hanya 3 nilai).
 */
const STATUS_PENGIRIMAN_VALID = [
    'Belum Diantar',
    'Dalam Proses',
    'Sudah Diantar'
];

/**
 * Daftar nama bulan dalam Bahasa Indonesia untuk fungsi formatTanggal().
 */
const NAMA_BULAN_INDONESIA = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Menghasilkan string tanggal format YYYY-MM-DD relatif terhadap hari ini.
 * @param {number} selisihHari 0 = hari ini, -1 = kemarin, -2 = 2 hari lalu
 * @returns {string} Tanggal dalam format YYYY-MM-DD
 */
function getTanggalRelatif(selisihHari = 0) {
    const d = new Date();
    d.setDate(d.getDate() + selisihHari);
    const tahun = d.getFullYear();
    const bulan = String(d.getMonth() + 1).padStart(2, '0');
    const tanggal = String(d.getDate()).padStart(2, '0');
    return `${tahun}-${bulan}-${tanggal}`;
}

/**
 * Mengubah string tanggal YYYY-MM-DD menjadi bagian kode YYYYMMDD.
 * @param {string} tanggalStr Format YYYY-MM-DD
 * @returns {string} Format YYYYMMDD
 */
function formatTanggalKeKode(tanggalStr) {
    const bersih = String(tanggalStr || getTanggalRelatif(0)).replace(/[^0-9]/g, '');
    return bersih.length === 8 ? bersih : getTanggalRelatif(0).replace(/[^0-9]/g, '');
}

/**
 * Membuat kode pesanan otomatis berurutan per tanggal: PSN-YYYYMMDD-NNN.
 * Contoh: "PSN-20261120-001"
 * @param {string} tanggal Format YYYY-MM-DD
 * @param {Array} daftarPesanan Daftar pesanan yang sudah ada
 * @returns {string}
 */
function buatKodePesananOtomatis(tanggal, daftarPesanan) {
    const ymd = formatTanggalKeKode(tanggal);
    const prefix = `PSN-${ymd}-`;
    let urutanMaks = 0;

    (daftarPesanan || []).forEach(item => {
        if (item && typeof item.kode === 'string' && item.kode.startsWith(prefix)) {
            const bagianNomor = parseInt(item.kode.slice(prefix.length), 10);
            if (!isNaN(bagianNomor) && bagianNomor > urutanMaks) {
                urutanMaks = bagianNomor;
            }
        }
    });

    const nomorBerikutnya = String(urutanMaks + 1).padStart(3, '0');
    return `${prefix}${nomorBerikutnya}`;
}

/**
 * Data awal pengiriman dikosongkan agar pengguna dapat menambahkan pesanan sendiri.
 * @returns {Array}
 */
function buatSeedPengirimanAwal() {
    return [];
}

/**
 * Inisialisasi penyimpanan pengiriman di localStorage bila belum pernah ada.
 */
function inisialisasiPengirimanStore() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_PENGIRIMAN);
        if (!raw) {
            localStorage.setItem(STORAGE_KEY_PENGIRIMAN, JSON.stringify([]));
        }
    } catch (e) {
        console.error('Gagal menginisialisasi data pengiriman di localStorage:', e);
    }
}

/**
 * Mengambil peran aktif simulasi dari localStorage ('Admin' atau 'Kurir').
 * Catatan: Ini HANYA SIMULASI hak akses di sisi frontend. Nantinya akan diganti
 * dengan sistem login dan pemeriksaan peran (role) pengguna sungguhan.
 * @returns {"Admin" | "Kurir"}
 */
function getPeranPengiriman() {
    try {
        const peran = localStorage.getItem(STORAGE_KEY_PERAN_PENGIRIMAN);
        return peran === 'Kurir' ? 'Kurir' : 'Admin';
    } catch (e) {
        return 'Admin';
    }
}

/**
 * Menyimpan pilihan peran simulasi ('Admin' atau 'Kurir') ke localStorage.
 * @param {"Admin" | "Kurir"} peranBaru
 * @returns {"Admin" | "Kurir"}
 */
function setPeranPengiriman(peranBaru) {
    const peranValid = peranBaru === 'Kurir' ? 'Kurir' : 'Admin';
    try {
        localStorage.setItem(STORAGE_KEY_PERAN_PENGIRIMAN, peranValid);
    } catch (e) {
        console.error('Gagal menyimpan peran pengiriman:', e);
    }
    return peranValid;
}

/**
 * Memeriksa apakah peran aktif saat ini adalah Admin.
 * @returns {boolean}
 */
function isPeranAdmin() {
    return true;
}

/**
 * Mengambil seluruh daftar pesanan pengiriman dari localStorage.
 * @returns {Array} Array objek pesanan pengiriman
 */
function getPengiriman() {
    inisialisasiPengirimanStore();
    try {
        const raw = localStorage.getItem(STORAGE_KEY_PENGIRIMAN);
        const daftar = raw ? JSON.parse(raw) : [];
        return Array.isArray(daftar) ? daftar : [];
    } catch (e) {
        console.error('Gagal membaca data pengiriman dari localStorage:', e);
        return [];
    }
}

/**
 * Menyimpan seluruh array pesanan pengiriman ke localStorage.
 * @param {Array} daftarPesanan
 */
function simpanSemuaPengiriman(daftarPesanan) {
    try {
        localStorage.setItem(STORAGE_KEY_PENGIRIMAN, JSON.stringify(daftarPesanan));
    } catch (e) {
        console.error('Gagal menyimpan data pengiriman ke localStorage:', e);
    }
}

/**
 * Menambahkan pesanan pengiriman baru.
 * - Otomatis membuat id unik dan kode berurutan per tanggal (PSN-YYYYMMDD-NNN)
 * - Status awal selalu diatur menjadi "Belum Diantar"
 * - HANYA dapat dijalankan jika peran aktif adalah "Admin"
 *
 * @param {Object} data { tanggal, pelanggan, alamat, items: [{ nama, jumlah }] }
 * @returns {Object|null} Objek pesanan baru atau null jika ditolak
 */
function tambahPengiriman(data) {
    // Penegakan aturan hak akses di level logika data store
    if (!isPeranAdmin()) {
        console.warn('Akses ditolak: Hanya Admin yang dapat menambah pesanan pengiriman.');
        return null;
    }

    if (!data || !data.pelanggan || !data.alamat || !Array.isArray(data.items) || data.items.length === 0) {
        return null;
    }

    const daftar = getPengiriman();
    const tanggalBersih = String(data.tanggal || getTanggalRelatif(0)).trim();
    const kodeBaru = buatKodePesananOtomatis(tanggalBersih, daftar);

    // Pastikan ID unik
    const maxId = daftar.reduce((max, item) => Math.max(max, parseInt(item.id, 10) || 0), 100);
    const idBaru = Math.max(Date.now(), maxId + 1);

    const itemsBersih = data.items
        .map(it => ({
            nama: String(it.nama || '').trim(),
            jumlah: Math.max(1, parseInt(it.jumlah, 10) || 1)
        }))
        .filter(it => it.nama !== '');

    if (itemsBersih.length === 0) return null;

    const pesananBaru = {
        id: idBaru,
        kode: kodeBaru,
        tanggal: tanggalBersih,
        pelanggan: String(data.pelanggan).trim(),
        alamat: String(data.alamat).trim(),
        items: itemsBersih,
        status: 'Belum Diantar'
    };

    daftar.push(pesananBaru);
    simpanSemuaPengiriman(daftar);
    return pesananBaru;
}

/**
 * Mengubah status pengantaran untuk pesanan tertentu berdasarkan ID.
 * - HANYA mengubah field 'status'
 * - HANYA menerima 1 dari 3 nilai status valid ("Belum Diantar", "Dalam Proses", "Sudah Diantar")
 * - HANYA dapat dijalankan apabila peran aktif adalah "Admin"
 *
 * @param {number|string} id ID pesanan
 * @param {string} statusBaru Status baru yang dipilih
 * @returns {Object|null} Objek pesanan yang telah diperbarui, atau null jika gagal/ditolak
 */
function ubahStatus(id, statusBaru) {
    // Penegakan aturan hak akses di level logika data store: Kurir tidak boleh mengubah status
    if (!isPeranAdmin()) {
        console.warn('Akses ditolak: Hanya Admin yang dapat mengubah status pengiriman.');
        return null;
    }

    if (!STATUS_PENGIRIMAN_VALID.includes(statusBaru)) {
        console.warn('Status pengiriman tidak valid:', statusBaru);
        return null;
    }

    const daftar = getPengiriman();
    const index = daftar.findIndex(item => String(item.id) === String(id));
    if (index === -1) return null;

    // Hanya mengubah field status
    daftar[index].status = statusBaru;
    simpanSemuaPengiriman(daftar);
    return daftar[index];
}

/**
 * Menghitung jumlah pesanan untuk masing-masing status pengantaran.
 * @returns {Object} { 'Belum Diantar': number, 'Dalam Proses': number, 'Sudah Diantar': number, belumDiantar: number, dalamProses: number, sudahDiantar: number, total: number }
 */
function hitungPerStatus() {
    const daftar = getPengiriman();
    const hasil = {
        'Belum Diantar': 0,
        'Dalam Proses': 0,
        'Sudah Diantar': 0,
        belumDiantar: 0,
        dalamProses: 0,
        sudahDiantar: 0,
        total: daftar.length
    };

    daftar.forEach(item => {
        if (item.status === 'Belum Diantar') {
            hasil['Belum Diantar']++;
            hasil.belumDiantar++;
        } else if (item.status === 'Dalam Proses') {
            hasil['Dalam Proses']++;
            hasil.dalamProses++;
        } else if (item.status === 'Sudah Diantar') {
            hasil['Sudah Diantar']++;
            hasil.sudahDiantar++;
        }
    });

    return hasil;
}

/**
 * Memformat tanggal YYYY-MM-DD menjadi format Bahasa Indonesia yang mudah dibaca.
 * Contoh: "2026-11-20" -> "20 November 2026"
 * @param {string} tanggal Format YYYY-MM-DD
 * @returns {string}
 */
function formatTanggal(tanggal) {
    if (!tanggal || typeof tanggal !== 'string') return '-';
    const bagian = tanggal.trim().split('-');
    if (bagian.length !== 3) return tanggal;

    const tahun = parseInt(bagian[0], 10);
    const indexBulan = parseInt(bagian[1], 10) - 1;
    const hari = parseInt(bagian[2], 10);

    if (isNaN(tahun) || isNaN(hari) || indexBulan < 0 || indexBulan > 11) {
        return tanggal;
    }

    return `${hari} ${NAMA_BULAN_INDONESIA[indexBulan]} ${tahun}`;
}
