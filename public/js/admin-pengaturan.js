/**
 * ==============================================================================
 * LOGIKA HALAMAN ADMIN: PENGATURAN TOKO
 * TB. SUMBER BAROKAH MALANG
 * ==============================================================================
 * Menangani interaksi admin untuk memperbarui profil toko:
 * 1. Jam Kerja
 * 2. Contact Person (Narahubung & Telepon/WA)
 * 3. Alamat Toko
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', function () {
    // 1. Muat data pengaturan saat ini ke dalam form
    muatDataPengaturanKeForm();

    // 2. Hubungkan event submit form pengaturan
    const form = document.getElementById('formPengaturanToko');
    if (form) {
        form.addEventListener('submit', handleSimpanPengaturan);
    }

    // 3. Hubungkan event tombol reset bawaan
    const btnReset = document.getElementById('btnResetPengaturan');
    if (btnReset) {
        btnReset.addEventListener('click', handleResetPengaturan);
    }

    // 4. Sinkronisasi multi-tab
    window.addEventListener('storage', function (e) {
        if (e.key === 'sb_pengaturan_toko') {
            muatDataPengaturanKeForm();
        }
    });
});

/**
 * Membaca data dari localStorage (via pengaturan-store.js) dan mengisi input form.
 */
function muatDataPengaturanKeForm() {
    if (typeof getPengaturanToko !== 'function') return;
    const data = getPengaturanToko();

    const inputJamKerja = document.getElementById('inputJamKerja');
    const inputNamaKontak = document.getElementById('inputNamaKontak');
    const inputTelepon = document.getElementById('inputTeleponKontak');
    const inputEmail = document.getElementById('inputEmailKontak');
    const inputAlamat = document.getElementById('inputAlamatToko');
    const inputKota = document.getElementById('inputKotaToko');

    if (inputJamKerja) inputJamKerja.value = data.jamKerja || '';
    if (inputNamaKontak) inputNamaKontak.value = data.namaKontak || '';
    if (inputTelepon) inputTelepon.value = data.telepon || '';
    if (inputEmail) inputEmail.value = data.email || '';
    if (inputAlamat) inputAlamat.value = data.alamat || '';
    if (inputKota) inputKota.value = data.kota || '';

    // Perbarui kartu ringkasan di bagian atas
    perbaruiKartuRingkasan(data);
}

/**
 * Memperbarui 3 kartu ringkasan status di bagian atas halaman admin.
 * @param {Object} data 
 */
function perbaruiKartuRingkasan(data) {
    const statJam = document.getElementById('statJamKerja');
    const statKontak = document.getElementById('statKontak');
    const statAlamat = document.getElementById('statAlamat');
    const statAlamatLink = document.getElementById('statAlamatLink');

    if (statJam) {
        statJam.textContent = data.jamKerja || '-';
        statJam.title = data.jamKerja || '';
    }
    if (statKontak) {
        statKontak.textContent = data.telepon ? `${data.telepon} (${data.namaKontak || 'Kontak'})` : '-';
        statKontak.title = data.telepon || '';
    }
    if (statAlamat) {
        statAlamat.textContent = data.alamat || data.kota || '-';
        statAlamat.title = data.alamat || '';
    }
    if (statAlamatLink) {
        const queryMaps = encodeURIComponent(String(data.alamat || data.kota || 'Malang').trim());
        statAlamatLink.href = `https://www.google.com/maps/search/?api=1&query=${queryMaps}`;
    }
}

/**
 * Menangani penyimpanan formulir pengaturan toko.
 * @param {Event} e 
 */
function handleSimpanPengaturan(e) {
    e.preventDefault();

    const jamKerja = document.getElementById('inputJamKerja')?.value.trim();
    const telepon = document.getElementById('inputTeleponKontak')?.value.trim();
    const namaKontak = document.getElementById('inputNamaKontak')?.value.trim();
    const email = document.getElementById('inputEmailKontak')?.value.trim();
    const alamat = document.getElementById('inputAlamatToko')?.value.trim();
    const kota = document.getElementById('inputKotaToko')?.value.trim();

    // Validasi input wajib
    if (!jamKerja) {
        alert('Mohon isi jam kerja / operasional toko.');
        document.getElementById('inputJamKerja')?.focus();
        return;
    }
    if (!telepon) {
        alert('Mohon isi nomor telepon / WhatsApp contact person.');
        document.getElementById('inputTeleponKontak')?.focus();
        return;
    }
    if (!alamat) {
        alert('Mohon isi alamat lengkap toko.');
        document.getElementById('inputAlamatToko')?.focus();
        return;
    }

    const payload = {
        jamKerja: jamKerja,
        telepon: telepon,
        namaKontak: namaKontak || 'Admin Toko',
        email: email || '',
        alamat: alamat,
        kota: kota || 'Malang, Jawa Timur'
    };

    let result = payload;
    if (typeof simpanPengaturanToko === 'function') {
        result = simpanPengaturanToko(payload);
    }

    perbaruiKartuRingkasan(result || payload);
    tampilkanToastAdmin('Pengaturan informasi toko berhasil disimpan! Alamat dan link Google Maps telah diperbarui.');
}

/**
 * Mereset formulir dan localStorage ke setelan default awal toko.
 */
function handleResetPengaturan() {
    if (!confirm('Kembalikan pengaturan jam kerja, contact person, dan alamat ke nilai bawaan (default)?')) {
        return;
    }

    if (typeof resetPengaturanToko === 'function') {
        const defaultData = resetPengaturanToko();
        muatDataPengaturanKeForm();
        perbaruiKartuRingkasan(defaultData);
    }

    tampilkanToastAdmin('Pengaturan toko berhasil dikembalikan ke nilai default.');
}

/**
 * Menampilkan Toast Notifikasi pada antarmuka Admin.
 * @param {string} pesan 
 */
function tampilkanToastAdmin(pesan) {
    const elPesan = document.getElementById('toastPesan');
    const elToast = document.getElementById('adminToast');
    if (elPesan) elPesan.textContent = pesan;
    if (elToast) {
        const toast = bootstrap.Toast.getOrCreateInstance(elToast, { delay: 3500 });
        toast.show();
    }
}
