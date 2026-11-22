/**
 * ==============================================================================
 * DATA LAYER: PENGATURAN TOKO TB. SUMBER BAROKAH MALANG
 * ==============================================================================
 * File ini menangani penyimpanan informasi profil toko di browser localStorage
 * dengan key 'sb_pengaturan_toko'.
 * 
 * Pengaturan yang dikelola:
 * 1. Jam Kerja / Operasional Toko
 * 2. Contact Person (Nama Penanggung Jawab, No. Telepon / WhatsApp, Email)
 * 3. Alamat Toko (Alamat Lengkap & Kota)
 * ==============================================================================
 */

const STORAGE_KEY_PENGATURAN = 'sb_pengaturan_toko';

const DEFAULT_PENGATURAN_TOKO = {
    jamKerja: 'Senin - Sabtu: 07.30 - 16.30 WIB (Minggu Libur)',
    namaKontak: 'Bpk. Ahmad (Admin Toko)',
    telepon: '0812-3456-7890',
    email: 'sumberbarokah.malang@gmail.com',
    alamat: 'Jl. Raya Gadang No. 128, Gadang, Kec. Sukun, Kota Malang, Jawa Timur 65149',
    kota: 'Malang, Jawa Timur'
};

/**
 * Mengambil data pengaturan toko dari localStorage.
 * Jika belum ada data, mengembalikan data bawaan (DEFAULT_PENGATURAN_TOKO).
 * @returns {Object}
 */
function getPengaturanToko() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_PENGATURAN);
        if (!raw) {
            return { ...DEFAULT_PENGATURAN_TOKO };
        }
        const parsed = JSON.parse(raw);
        return {
            ...DEFAULT_PENGATURAN_TOKO,
            ...parsed
        };
    } catch (e) {
        console.error("Gagal membaca pengaturan toko dari localStorage:", e);
        return { ...DEFAULT_PENGATURAN_TOKO };
    }
}

/**
 * Menyimpan data pengaturan toko ke dalam localStorage.
 * @param {Object} data 
 * @returns {Object} Data terbaru yang berhasil disimpan
 */
function simpanPengaturanToko(data) {
    try {
        const current = getPengaturanToko();
        const updated = {
            ...current,
            jamKerja: String(data.jamKerja || DEFAULT_PENGATURAN_TOKO.jamKerja).trim(),
            namaKontak: String(data.namaKontak || DEFAULT_PENGATURAN_TOKO.namaKontak).trim(),
            telepon: String(data.telepon || DEFAULT_PENGATURAN_TOKO.telepon).trim(),
            email: String(data.email || DEFAULT_PENGATURAN_TOKO.email).trim(),
            alamat: String(data.alamat || DEFAULT_PENGATURAN_TOKO.alamat).trim(),
            kota: String(data.kota || DEFAULT_PENGATURAN_TOKO.kota).trim(),
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem(STORAGE_KEY_PENGATURAN, JSON.stringify(updated));
        renderFooterPengaturan();
        return updated;
    } catch (e) {
        console.error("Gagal menyimpan pengaturan toko ke localStorage:", e);
        return null;
    }
}

/**
 * Mengembalikan pengaturan toko ke nilai default awal.
 * @returns {Object}
 */
function resetPengaturanToko() {
    try {
        localStorage.setItem(STORAGE_KEY_PENGATURAN, JSON.stringify(DEFAULT_PENGATURAN_TOKO));
        renderFooterPengaturan();
        return { ...DEFAULT_PENGATURAN_TOKO };
    } catch (e) {
        console.error("Gagal mereset pengaturan toko:", e);
        return { ...DEFAULT_PENGATURAN_TOKO };
    }
}

/**
 * Memperbarui tampilan informasi toko pada Footer di seluruh halaman publik.
 */
function renderFooterPengaturan() {
    const data = getPengaturanToko();

    // 1. Alamat Toko & Peta Google Maps
    const elAlamat = document.getElementById('footerAlamatText');
    if (elAlamat) {
        elAlamat.textContent = data.alamat;
    }

    const elKota = document.getElementById('footerKotaText');
    if (elKota) {
        elKota.textContent = data.kota;
    }

    // Perbarui URL Google Maps dinamis berdasarkan alamat toko yang baru
    const queryMaps = encodeURIComponent(String(data.alamat || data.kota || 'Malang, Jawa Timur').trim());
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${queryMaps}`;

    const linkPeta = document.getElementById('footerMapLink');
    if (linkPeta) {
        linkPeta.href = googleMapsUrl;
    }

    const linkAlamatText = document.getElementById('footerAlamatLink');
    if (linkAlamatText) {
        linkAlamatText.href = googleMapsUrl;
    }

    // 2. Jam Kerja Toko
    const elJamKerja = document.getElementById('footerJamKerjaText');
    if (elJamKerja) {
        // Mendukung ganti baris bila ada koma atau baris baru
        elJamKerja.textContent = data.jamKerja;
    }

    // 3. Contact Person Toko
    const elNamaKontak = document.getElementById('footerNamaKontakText');
    if (elNamaKontak) {
        elNamaKontak.textContent = data.namaKontak;
    }

    const elTelepon = document.getElementById('footerTeleponText');
    const linkTelepon = document.getElementById('footerTeleponLink');
    if (elTelepon) {
        elTelepon.textContent = data.telepon;
    }
    if (linkTelepon) {
        const noBersih = data.telepon.replace(/[^0-9]/g, '');
        // Jika nomor diawali 08, buat link WhatsApp otomatis
        if (noBersih.startsWith('08')) {
            linkTelepon.href = `https://wa.me/62${noBersih.substring(1)}`;
            linkTelepon.target = '_blank';
            linkTelepon.rel = 'noopener noreferrer';
        } else {
            linkTelepon.href = `tel:${noBersih}`;
        }
    }

    const elEmail = document.getElementById('footerEmailText');
    if (elEmail) {
        elEmail.textContent = data.email;
    }
}

// Inisialisasi render pada saat DOM siap
document.addEventListener('DOMContentLoaded', renderFooterPengaturan);

// Sinkronisasi otomatis antar tab browser ketika admin menyimpan perubahan
window.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY_PENGATURAN) {
        renderFooterPengaturan();
    }
});
