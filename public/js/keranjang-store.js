/**
 * ==============================================================================
 * DATA LAYER: KERANJANG BELANJA TB. SUMBER BAROKAH MALANG
 * ==============================================================================
 * File ini menangani penyimpanan data keranjang belanja menggunakan browser localStorage
 * dengan key 'sb_keranjang'.
 * 
 * Format data setiap item di dalam array:
 * {
 *   idBarang: number|string,
 *   nama: string,
 *   harga: number,
 *   jumlah: number
 * }
 */

const STORAGE_KEY_KERANJANG = 'sb_keranjang';

/**
 * Mengambil seluruh daftar item di keranjang belanja.
 * @returns {Array} Array objek item keranjang
 */
function getKeranjang() {
    try {
        const data = localStorage.getItem(STORAGE_KEY_KERANJANG);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Gagal membaca keranjang dari localStorage:", e);
        return [];
    }
}

/**
 * Menyimpan seluruh array item ke localStorage.
 * @param {Array} daftarKeranjang 
 */
function simpanKeranjang(daftarKeranjang) {
    try {
        localStorage.setItem(STORAGE_KEY_KERANJANG, JSON.stringify(daftarKeranjang));
    } catch (e) {
        console.error("Gagal menyimpan keranjang ke localStorage:", e);
    }
}

/**
 * Menambahkan item ke dalam keranjang.
 * Jika barang dengan idBarang yang sama sudah ada, maka jumlahnya ditambahkan.
 * Jika belum ada, masukkan sebagai item baru.
 * @param {Object} item { idBarang, nama, harga, jumlah }
 * @returns {Array} Array keranjang terbaru
 */
function tambahKeKeranjang(item) {
    const keranjang = getKeranjang();
    const index = keranjang.findIndex(k => String(k.idBarang) === String(item.idBarang));

    const jumlahTambah = parseInt(item.jumlah, 10) || 1;
    const hargaItem = parseInt(item.harga, 10) || 0;

    if (index !== -1) {
        // Barang sudah ada: tambahkan jumlahnya
        keranjang[index].jumlah += jumlahTambah;
        // Perbarui harga jika ada perubahan
        keranjang[index].harga = hargaItem;
        if (item.satuan) keranjang[index].satuan = String(item.satuan).trim();
    } else {
        // Barang baru
        keranjang.push({
            idBarang: item.idBarang,
            idMasterBarang: item.idMasterBarang || String(item.idBarang).split('_')[0],
            nama: String(item.nama).trim(),
            warna: item.warna ? String(item.warna).trim() : '',
            harga: hargaItem,
            satuan: item.satuan ? String(item.satuan).trim() : '',
            jumlah: jumlahTambah
        });
    }

    simpanKeranjang(keranjang);
    return keranjang;
}

/**
 * Mengubah jumlah kuantitas barang tertentu di keranjang.
 * @param {number|string} idBarang 
 * @param {number} jumlahBaru 
 * @returns {Array}
 */
function ubahJumlahKeranjang(idBarang, jumlahBaru) {
    const keranjang = getKeranjang();
    const index = keranjang.findIndex(k => String(k.idBarang) === String(idBarang));
    if (index === -1) return keranjang;

    const qty = parseInt(jumlahBaru, 10);
    if (qty <= 0) {
        return hapusDariKeranjang(idBarang);
    }

    keranjang[index].jumlah = qty;
    simpanKeranjang(keranjang);
    return keranjang;
}

/**
 * Menghapus satu item dari keranjang belanja berdasarkan idBarang.
 * @param {number|string} idBarang 
 * @returns {Array} Array keranjang setelah penghapusan
 */
function hapusDariKeranjang(idBarang) {
    const keranjang = getKeranjang();
    const sisa = keranjang.filter(k => String(k.idBarang) !== String(idBarang));
    simpanKeranjang(sisa);
    return sisa;
}

/**
 * Menghitung total jenis barang di dalam keranjang belanja
 * untuk ditampilkan pada badge ikon keranjang di navbar.
 * @returns {number}
 */
function hitungJumlahItem() {
    const keranjang = getKeranjang();
    return keranjang.length;
}

/**
 * Menghitung total keseluruhan kuantitas barang di keranjang.
 * @returns {number}
 */
function hitungTotalKuantitas() {
    const keranjang = getKeranjang();
    return keranjang.reduce((total, item) => total + (parseInt(item.jumlah, 10) || 0), 0);
}

/**
 * Menghitung grand total harga seluruh barang di keranjang belanja.
 * @returns {number}
 */
function hitungTotalHargaKeranjang() {
    const keranjang = getKeranjang();
    return keranjang.reduce((total, item) => {
        const sub = (parseInt(item.harga, 10) || 0) * (parseInt(item.jumlah, 10) || 0);
        return total + sub;
    }, 0);
}

/**
 * Mengosongkan seluruh isi keranjang belanja.
 */
function kosongkanKeranjang() {
    localStorage.removeItem(STORAGE_KEY_KERANJANG);
}
