/**
 * ==============================================================================
 * DATA LAYER: TRANSAKSI TB. SUMBER BAROKAH MALANG
 * ==============================================================================
 * File ini mengelola penyimpanan riwayat transaksi pembelian menggunakan
 * browser localStorage dengan kunci 'sb_transaksi'.
 *
 * Catatan Arsitektur Penting (Snapshot Data):
 * Setiap transaksi menyimpan SALINAN LENGKAP (snapshot) dari nama barang,
 * kategori, dan harga satuan pada saat transaksi dilakukan. Hal ini memastikan
 * integritas data historis: laporan keuangan dan riwayat pembelian tidak akan
 * pernah berubah meskipun data master barang di halaman admin diedit atau dihapus.
 *
 * Persiapan Halaman Kasir (Future Cashier Feature):
 * Fungsi `tambahTransaksi(data)` dirancang modular dan siap diintegrasikan
 * langsung saat modul kasir / Point of Sale (POS) dibuat di masa mendatang.
 * ==============================================================================
 */

const STORAGE_KEY_TRANSAKSI = 'sb_transaksi';
const STORAGE_KEY_VERSI_TRX = 'sb_transaksi_versi';
const CURRENT_TRX_VERSION = 'v2_transfer_support';

/**
 * Daftar nama bulan dalam Bahasa Indonesia untuk pemformatan tanggal.
 */
const NAMA_BULAN_INDONESIA_TRX = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Menghasilkan string tanggal format YYYY-MM-DD relatif terhadap hari ini.
 * @param {number} selisihHari 0 = hari ini, -1 = kemarin, dst.
 * @returns {string} Format YYYY-MM-DD
 */
function getTanggalRelatifTrx(selisihHari = 0) {
    const d = new Date();
    d.setDate(d.getDate() + selisihHari);
    const tahun = d.getFullYear();
    const bulan = String(d.getMonth() + 1).padStart(2, '0');
    const tanggal = String(d.getDate()).padStart(2, '0');
    return `${tahun}-${bulan}-${tanggal}`;
}

/**
 * Mengubah string tanggal YYYY-MM-DD menjadi format kode YYYYMMDD.
 * @param {string} tanggalStr
 * @returns {string}
 */
function formatTanggalKeKodeTrx(tanggalStr) {
    const bersih = String(tanggalStr || getTanggalRelatifTrx(0)).replace(/[^0-9]/g, '');
    return bersih.length === 8 ? bersih : getTanggalRelatifTrx(0).replace(/[^0-9]/g, '');
}

/**
 * Membuat kode transaksi otomatis berurutan per tanggal: TRX-YYYYMMDD-NNN.
 * Contoh: "TRX-20261120-001"
 * @param {string} tanggal Format YYYY-MM-DD
 * @param {Array} daftarTrx
 * @returns {string}
 */
function buatKodeTransaksiOtomatis(tanggal, daftarTrx) {
    const ymd = formatTanggalKeKodeTrx(tanggal);
    const prefix = `TRX-${ymd}-`;
    let urutanMaks = 0;

    (daftarTrx || []).forEach(item => {
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
 * Menghitung pembulatan bayar uang tunai (ke atas ke pecahan terdekat).
 * @param {number} total
 * @returns {number}
 */
function hitungBayarTunaiWajar(total) {
    if (total <= 0) return 0;
    if (total <= 50000) {
        return Math.ceil(total / 10000) * 10000;
    } else if (total <= 200000) {
        return Math.ceil(total / 50000) * 50000;
    } else {
        return Math.ceil(total / 100000) * 100000;
    }
}

/**
 * 20 Data Transaksi Contoh Awal (Seed) dalam rentang 14 hari terakhir.
 * Jam bervariasi antara 08:00 sampai 17:00, barang dan harga sesuai stok master,
 * serta sebagian pelanggan bernama dan sebagian "Pelanggan Umum".
 * @returns {Array}
 */
function buatSeedTransaksiAwal() {
    return [];
}

/**
 * Inisialisasi data transaksi di localStorage jika masih kosong atau dipaksa reset.
 * @param {boolean} forceReset
 */
function inisialisasiTransaksiStore(forceReset = false) {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_TRANSAKSI);
        if (forceReset || !raw) {
            const seed = [];
            localStorage.setItem(STORAGE_KEY_TRANSAKSI, JSON.stringify(seed));
            return seed;
        } else {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        }
    } catch (e) {
        console.error('Gagal inisialisasi data transaksi di localStorage:', e);
        return [];
    }
}

/**
 * Mengambil seluruh daftar transaksi dari localStorage ('sb_transaksi').
 * @returns {Array}
 */
function getTransaksi() {
    inisialisasiTransaksiStore();
    try {
        const raw = localStorage.getItem(STORAGE_KEY_TRANSAKSI);
        const daftar = raw ? JSON.parse(raw) : [];
        return Array.isArray(daftar) ? daftar : [];
    } catch (e) {
        console.error('Gagal membaca transaksi:', e);
        return [];
    }
}

/**
 * Menyimpan seluruh array transaksi ke localStorage.
 * @param {Array} daftarTrx
 */
function simpanSemuaTransaksi(daftarTrx) {
    try {
        localStorage.setItem(STORAGE_KEY_TRANSAKSI, JSON.stringify(daftarTrx));
    } catch (e) {
        console.error('Gagal menyimpan transaksi ke localStorage:', e);
    }
}

/**
 * Menambahkan transaksi baru ke dalam sistem.
 *
 * CATATAN PENGEMBANGAN:
 * Fungsi ini disiapkan khusus untuk digunakan oleh modul Kasir / POS di masa depan.
 * Saat halaman kasir nanti dibuat, kasir cukup memanggil fungsi ini dengan membawa data:
 * { tanggal, waktu, pelanggan, items: [{ nama, kategori, jumlah, harga }], bayar, metode }
 *
 * Fungsi ini otomatis:
 * 1. Membuat ID unik berbasis timestamp
 * 2. Membuat Kode TRX-YYYYMMDD-NNN berurutan per tanggal
 * 3. Menghitung subtotal tiap item
 * 4. Menghitung total belanja dan kembalian
 * 5. Menyimpan snapshot barang ke localStorage
 *
 * @param {Object} data
 * @returns {Object|null}
 */
function tambahTransaksi(data) {
    if (!data || !Array.isArray(data.items) || data.items.length === 0) {
        return null;
    }

    const daftar = getTransaksi();
    const tanggalBersih = String(data.tanggal || getTanggalRelatifTrx(0)).trim();

    // Dapatkan waktu saat ini jika tidak dispesifikasikan (HH:MM)
    let waktuBersih = String(data.waktu || '').trim();
    if (!waktuBersih) {
        const now = new Date();
        const jam = String(now.getHours()).padStart(2, '0');
        const menit = String(now.getMinutes()).padStart(2, '0');
        waktuBersih = `${jam}:${menit}`;
    }

    const kodeBaru = buatKodeTransaksiOtomatis(tanggalBersih, daftar);

    // Hitung subtotal dan total
    let total = 0;
    const itemsBersih = data.items
        .map(it => {
            const qty = Math.max(1, parseInt(it.jumlah, 10) || 1);
            const harga = Math.max(0, parseInt(it.harga, 10) || 0);
            const subtotal = qty * harga;
            total += subtotal;
            return {
                nama: String(it.nama || '').trim(),
                kategori: String(it.kategori || 'Umum').trim(),
                jumlah: qty,
                harga: harga,
                subtotal: subtotal
            };
        })
        .filter(it => it.nama !== '');

    if (itemsBersih.length === 0) return null;

    const bayar = data.bayar ? Math.max(total, parseInt(data.bayar, 10) || total) : total;
    const kembalian = Math.max(0, bayar - total);

    const maxId = daftar.reduce((max, item) => Math.max(max, parseInt(item.id, 10) || 0), 2000);
    const idBaru = Math.max(Date.now(), maxId + 1);

    const transaksiBaru = {
        id: idBaru,
        kode: kodeBaru,
        tanggal: tanggalBersih,
        waktu: waktuBersih,
        pelanggan: String(data.pelanggan || 'Pelanggan Umum').trim() || 'Pelanggan Umum',
        items: itemsBersih,
        total: total,
        bayar: bayar,
        kembalian: kembalian,
        metode: String(data.metode || 'Tunai').trim() || 'Tunai',
        subMetode: String(data.subMetode || '').trim(),
        buktiTransfer: data.buktiTransfer ? String(data.buktiTransfer).trim() : ''
    };

    daftar.push(transaksiBaru);
    simpanSemuaTransaksi(daftar);
    return transaksiBaru;
}

/**
 * Memfilter transaksi berdasarkan rentang tanggal inklusif dan kata kunci pencarian.
 * Kata kunci mencari kecocokan pada kode transaksi, nama pelanggan, atau nama barang di dalamnya.
 *
 * @param {Object} param0 { dari, sampai, kataKunci }
 * @returns {Array}
 */
function filterTransaksi({ dari, sampai, kataKunci } = {}) {
    const semua = getTransaksi();
    const keyword = String(kataKunci || '').trim().toLowerCase();

    return semua.filter(trx => {
        const tgl = String(trx.tanggal || '');

        // Filter rentang tanggal inklusif
        if (dari && tgl < dari) return false;
        if (sampai && tgl > sampai) return false;

        // Filter kata kunci
        if (keyword) {
            const cocokKode = String(trx.kode || '').toLowerCase().includes(keyword);
            const cocokPelanggan = String(trx.pelanggan || '').toLowerCase().includes(keyword);
            const cocokBarang = Array.isArray(trx.items) && trx.items.some(it =>
                String(it.nama || '').toLowerCase().includes(keyword)
            );

            if (!cocokKode && !cocokPelanggan && !cocokBarang) {
                return false;
            }
        }

        return true;
    });
}

/**
 * Merekap barang-barang yang sudah terjual dari kumpulan transaksi.
 * Menggabungkan per nama barang dan menghitung total jumlah terjual,
 * frekuensi transaksi, dan total pendapatan yang dihasilkan.
 *
 * @param {Array} daftarTransaksi
 * @returns {Array} Array objek { nama, kategori, jumlahTerjual, jumlahTransaksi, totalPendapatan }
 */
function rekapBarangTerjual(daftarTransaksi) {
    const listTrx = Array.isArray(daftarTransaksi) ? daftarTransaksi : getTransaksi();
    const petaBarang = new Map();

    listTrx.forEach(trx => {
        const items = Array.isArray(trx.items) ? trx.items : [];
        const tglTrx = String(trx.tanggal || '').trim();
        const wktTrx = String(trx.waktu || '').trim();

        items.forEach(it => {
            const nama = String(it.nama || '').trim();
            if (!nama) return;

            const kategori = String(it.kategori || 'Umum').trim();
            const jumlah = Math.max(1, parseInt(it.jumlah, 10) || 1);
            const subtotal = parseInt(it.subtotal, 10) || (jumlah * (parseInt(it.harga, 10) || 0));

            if (!petaBarang.has(nama)) {
                petaBarang.set(nama, {
                    nama: nama,
                    kategori: kategori,
                    jumlahTerjual: 0,
                    jumlahTransaksi: 0,
                    totalPendapatan: 0,
                    tanggal: tglTrx,
                    waktu: wktTrx,
                    riwayat: []
                });
            }

            const dataItem = petaBarang.get(nama);
            dataItem.jumlahTerjual += jumlah;
            dataItem.jumlahTransaksi += 1;
            dataItem.totalPendapatan += subtotal;

            dataItem.riwayat.push({
                tanggal: tglTrx,
                waktu: wktTrx,
                jumlah: jumlah,
                subtotal: subtotal,
                pelanggan: trx.pelanggan || 'Pelanggan Umum'
            });

            // Perbarui ke tanggal & waktu terbaru jika ada transaksi yang lebih baru
            const timestampSaatIni = `${tglTrx} ${wktTrx || '00:00'}`;
            const timestampTersimpan = `${dataItem.tanggal} ${dataItem.waktu || '00:00'}`;
            if (timestampSaatIni >= timestampTersimpan) {
                dataItem.tanggal = tglTrx;
                dataItem.waktu = wktTrx;
            }
        });
    });

    // Ubah ke array dan urutkan secara default dari jumlah terjual terbesar
    const hasil = Array.from(petaBarang.values());
    hasil.sort((a, b) => b.jumlahTerjual - a.jumlahTerjual || b.totalPendapatan - a.totalPendapatan);
    return hasil;
}

/**
 * Menghitung 4 nilai ringkasan utama dari kumpulan transaksi yang difilter:
 * 1. Jumlah Transaksi
 * 2. Total Pendapatan
 * 3. Total Item Barang Terjual
 * 4. Rata-rata per Transaksi
 *
 * @param {Array} daftarTransaksi
 * @returns {Object} { jumlahTransaksi, totalPendapatan, totalItemTerjual, rataRataPerTransaksi }
 */
function hitungRingkasan(daftarTransaksi) {
    const listTrx = Array.isArray(daftarTransaksi) ? daftarTransaksi : getTransaksi();

    let totalPendapatan = 0;
    let totalItemTerjual = 0;

    listTrx.forEach(trx => {
        totalPendapatan += parseInt(trx.total, 10) || 0;
        const items = Array.isArray(trx.items) ? trx.items : [];
        items.forEach(it => {
            totalItemTerjual += parseInt(it.jumlah, 10) || 0;
        });
    });

    const jumlahTransaksi = listTrx.length;
    const rataRataPerTransaksi = jumlahTransaksi > 0 ? Math.round(totalPendapatan / jumlahTransaksi) : 0;

    return {
        jumlahTransaksi: jumlahTransaksi,
        totalPendapatan: totalPendapatan,
        totalItemTerjual: totalItemTerjual,
        rataRataPerTransaksi: rataRataPerTransaksi
    };
}

/**
 * Memformat tanggal YYYY-MM-DD ke format bahasa Indonesia.
 * Contoh: "2026-11-20" -> "20 November 2026"
 * @param {string} tanggal
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

    return `${hari} ${NAMA_BULAN_INDONESIA_TRX[indexBulan]} ${tahun}`;
}

/**
 * Memformat waktu HH:MM menjadi format waktu Indonesia dengan zona WIB.
 * Contoh: "14:35" -> "14:35 WIB"
 * @param {string} waktu
 * @returns {string}
 */
function formatWaktu(waktu) {
    if (!waktu || typeof waktu !== 'string') return '-';
    const bersih = waktu.trim();
    if (bersih.includes('WIB')) return bersih;
    return `${bersih} WIB`;
}

/**
 * Fallback format rupiah jika stok-store.js belum termuat.
 * @param {number} angka
 * @returns {string}
 */
function formatRupiahTrx(angka) {
    if (typeof formatRupiah === 'function') {
        return formatRupiah(angka);
    }
    const n = Math.round(Number(angka) || 0);
    return 'Rp ' + n.toLocaleString('id-ID');
}
