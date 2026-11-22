/**
 * ==============================================================================
 * LOGIKA TAMPILAN & PERHITUNGAN KALKULATOR MATERIAL TB. SUMBER BAROKAH MALANG
 * ==============================================================================
 * File ini menangani:
 * - Validasi form kalkulator (jenis pekerjaan, luas area, cadangan material)
 * - Perhitungan kebutuhan material sesuai rumus dan koefisien
 * - Pencocokan material dengan stok dan harga katalog (stok-store.js)
 * - Pembaruan total estimasi biaya
 * - Penambahan material terpilih ke keranjang belanja (keranjang-store.js)
 */

// Menyimpan data material hasil perhitungan terakhir
let hasilKalkulasiTerkini = [];

document.addEventListener('DOMContentLoaded', function () {
    const formKalkulator = document.getElementById('formKalkulator');
    const btnReset = document.getElementById('btnResetKalkulator');
    const btnKeranjang = document.getElementById('btnTambahKeranjang');

    if (formKalkulator) {
        formKalkulator.addEventListener('submit', handleHitungKebutuhan);
    }

    if (btnReset) {
        btnReset.addEventListener('click', handleResetKalkulator);
    }

    if (btnKeranjang) {
        btnKeranjang.addEventListener('click', handleSimpanKeKeranjang);
    }
});

/**
 * Menghandle proses submit form dan perhitungan kebutuhan material.
 * @param {Event} e 
 */
function handleHitungKebutuhan(e) {
    e.preventDefault();

    // 1. Ambil nilai input
    const jenisPekerjaanEl = document.querySelector('input[name="jenisPekerjaan"]:checked');
    const luasEl = document.getElementById('inputLuas');
    const cadanganEl = document.getElementById('inputCadangan');

    const jenisPekerjaan = jenisPekerjaanEl ? jenisPekerjaanEl.value : '';
    const luas = parseFloat(luasEl.value);
    const cadangan = parseFloat(cadanganEl.value);

    // 2. Validasi input
    let isValid = true;
    resetFormErrors();

    if (!jenisPekerjaan) {
        setError('jenisPekerjaan', 'Pilih salah satu jenis pekerjaan.');
        isValid = false;
    }

    if (isNaN(luas) || luas <= 0) {
        setError('inputLuas', 'Luas area harus berupa angka lebih dari 0.');
        isValid = false;
    } else if (luas > 10000) {
        setError('inputLuas', 'Luas area maksimal 10.000 m².');
        isValid = false;
    }

    if (isNaN(cadangan) || cadangan < 0 || cadangan > 30) {
        setError('inputCadangan', 'Cadangan material harus antara 0% sampai 30%.');
        isValid = false;
    }

    if (!isValid) return;

    // 3. Ambil data koefisien & stok barang
    const daftarKoefisien = typeof getKoefisien === 'function' ? getKoefisien() : {};
    const koefisienPekerjaan = daftarKoefisien[jenisPekerjaan] || [];
    const daftarBarangKatalog = typeof getBarang === 'function' ? getBarang() : [];

    // 4. Hitung kebutuhan tiap material sesuai rumus:
    //    - kebutuhanAwal = luas * koefisien
    //    - kebutuhanAkhir = Math.ceil(kebutuhanAwal * (1 + cadangan / 100))
    //    - subtotal = kebutuhanAkhir * hargaSatuan
    hasilKalkulasiTerkini = koefisienPekerjaan.map((mat, index) => {
        const kebutuhanAwal = luas * mat.koefisien;
        const kebutuhanAkhir = Math.ceil(kebutuhanAwal * (1 + cadangan / 100));

        // Ambil seluruh produk di katalog yang cocok dengan kategori/kataKunci material ini
        const daftarPilihanBarang = daftarBarangKatalog.filter(b => {
            // Filter kategori jika ditentukan pada koefisien
            if (mat.kategori && b.kategori && b.kategori.toLowerCase() !== mat.kategori.toLowerCase()) {
                return false;
            }
            // Filter kata kunci pada nama barang jika ditentukan
            if (mat.kataKunci && !b.nama.toLowerCase().includes(mat.kataKunci.toLowerCase())) {
                return false;
            }
            return true;
        });

        // Utamakan barang pilihan utama yang stoknya > 0, lalu barang yang stoknya > 0, lalu default
        let matchBarang = null;
        if (mat.pilihanUtama) {
            matchBarang = daftarPilihanBarang.find(b =>
                b.nama.toLowerCase().includes(mat.pilihanUtama.toLowerCase()) && (parseInt(b.stok, 10) || 0) > 0
            );
        }
        if (!matchBarang) {
            matchBarang = daftarPilihanBarang.find(b => (parseInt(b.stok, 10) || 0) > 0) || daftarPilihanBarang[0] || null;
        }

        return buatObjekBarisKalkulasi(index, mat, kebutuhanAkhir, matchBarang, daftarPilihanBarang);
    });

    // 5. Render hasil ke tabel
    tampilkanHasilKalkulator(hasilKalkulasiTerkini);
}

/**
 * Membentuk objek data baris kalkulasi berdasarkan produk katalog yang dipilih.
 */
function buatObjekBarisKalkulasi(index, mat, kebutuhanAkhir, matchBarang, daftarPilihanBarang) {
    let status = 'tidak-ada';
    let statusLabel = 'Belum ada di katalog';
    let badgeClass = 'badge-kalkulator-tidak-ada';
    let hargaSatuan = 0;
    let subtotal = 0;
    let stokTersedia = 0;
    let idBarang = null;
    let namaKatalog = mat.label;
    let satuanKatalog = mat.satuan;
    let canCheck = false;
    let defaultChecked = false;

    if (matchBarang) {
        idBarang = matchBarang.id;
        namaKatalog = matchBarang.nama;
        satuanKatalog = matchBarang.satuan || mat.satuan;
        stokTersedia = parseInt(matchBarang.stok, 10) || 0;
        hargaSatuan = parseInt(matchBarang.harga, 10) || 0;
        subtotal = kebutuhanAkhir * hargaSatuan;

        if (stokTersedia === 0) {
            status = 'habis';
            statusLabel = 'Habis';
            badgeClass = 'badge-kalkulator-habis';
            canCheck = false;
            defaultChecked = false;
        } else if (stokTersedia < kebutuhanAkhir) {
            status = 'kurang';
            statusLabel = `Stok kurang (${stokTersedia} ${satuanKatalog})`;
            badgeClass = 'badge-kalkulator-kurang';
            canCheck = true;
            defaultChecked = true;
        } else {
            status = 'tersedia';
            statusLabel = 'Tersedia';
            badgeClass = 'badge-kalkulator-tersedia';
            canCheck = true;
            defaultChecked = true;
        }
    }

    return {
        index: index,
        matConfig: mat,
        pilihanBarang: daftarPilihanBarang || [],
        idBarang: idBarang,
        namaKatalog: namaKatalog,
        labelMaterial: mat.label,
        satuan: satuanKatalog,
        kebutuhanAkhir: kebutuhanAkhir,
        hargaSatuan: hargaSatuan,
        subtotal: subtotal,
        status: status,
        statusLabel: statusLabel,
        badgeClass: badgeClass,
        canCheck: canCheck,
        isChecked: defaultChecked
    };
}

/**
 * Merender tabel hasil perhitungan material dan memperbarui total estimasi.
 * @param {Array} hasil 
 */
function tampilkanHasilKalkulator(hasil) {
    const emptyState = document.getElementById('hasilEmptyState');
    const contentState = document.getElementById('hasilContentState');
    const tbody = document.getElementById('tabelHasilBody');

    if (emptyState) emptyState.classList.add('d-none');
    if (contentState) contentState.classList.remove('d-none');
    if (!tbody) return;

    tbody.innerHTML = '';

    hasil.forEach(item => {
        const tr = document.createElement('tr');
        
        const hargaText = item.status === 'tidak-ada' ? '-' : (typeof formatRupiah === 'function' ? formatRupiah(item.hargaSatuan) : `Rp ${item.hargaSatuan}`);
        const subtotalText = item.status === 'tidak-ada' ? '-' : (typeof formatRupiah === 'function' ? formatRupiah(item.subtotal) : `Rp ${item.subtotal}`);

        // Jika terdapat beberapa pilihan merek dalam kategori tersebut (misal: Bata Merah vs Bata Ringan, Semen Gresik vs Tiga Roda)
        let pilihanProdukHtml = '';
        const infoKeterangan = item.matConfig && item.matConfig.keterangan ? `
            <div class="text-muted mt-1" style="font-size: 0.76rem;">
                <i class="bi bi-info-circle me-1 text-primary"></i>${escapeHtml(item.matConfig.keterangan)}
            </div>
        ` : '';

        if (item.pilihanBarang && item.pilihanBarang.length > 1) {
            const optionsHtml = item.pilihanBarang.map(b => {
                const isSelected = String(b.id) === String(item.idBarang);
                const infoStok = (parseInt(b.stok, 10) || 0) > 0 ? `Stok: ${b.stok} ${b.satuan || ''}` : 'Habis';
                const hargaFormatted = typeof formatRupiah === 'function' ? formatRupiah(b.harga) : `Rp ${b.harga}`;
                return `<option value="${b.id}" ${isSelected ? 'selected' : ''}>${escapeHtml(b.nama)} - ${hargaFormatted} (${infoStok})</option>`;
            }).join('');

            pilihanProdukHtml = `
                <div class="small text-muted mb-1">Kategori: <strong>${escapeHtml(item.labelMaterial)}</strong> (${item.pilihanBarang.length} pilihan produk)</div>
                <select class="form-select form-select-sm select-produk-kalkulator" data-index="${item.index}" style="font-size: 0.85rem; font-weight: 600;">
                    ${optionsHtml}
                </select>
                ${infoKeterangan}
            `;
        } else {
            pilihanProdukHtml = `
                <div class="fw-semibold text-dark">${escapeHtml(item.namaKatalog)}</div>
                ${item.namaKatalog !== item.labelMaterial ? `<small class="text-muted d-block">Kategori: ${escapeHtml(item.labelMaterial)}</small>` : ''}
                ${infoKeterangan}
            `;
        }

        tr.innerHTML = `
            <td class="text-center" style="width: 40px;">
                <input class="form-check-input form-check-input-kalkulator" type="checkbox" 
                    data-index="${item.index}" 
                    ${item.isChecked ? 'checked' : ''} 
                    ${!item.canCheck ? 'disabled' : ''}>
            </td>
            <td>
                ${pilihanProdukHtml}
            </td>
            <td class="text-center fw-bold">
                ${item.kebutuhanAkhir.toLocaleString('id-ID')} <span class="fw-normal text-muted small">${item.satuan}</span>
            </td>
            <td class="text-end text-muted small">
                ${hargaText}
            </td>
            <td class="text-end fw-bold text-dark">
                ${subtotalText}
            </td>
            <td class="text-center">
                <span class="badge-kalkulator ${item.badgeClass}">
                    ${item.status === 'tersedia' ? '<i class="bi bi-check-circle-fill"></i>' : ''}
                    ${item.status === 'kurang' ? '<i class="bi bi-exclamation-triangle-fill"></i>' : ''}
                    ${item.status === 'habis' ? '<i class="bi bi-x-circle-fill"></i>' : ''}
                    ${item.statusLabel}
                </span>
            </td>
        `;

        tbody.appendChild(tr);
    });

    // Pasang listener pada checkbox setiap baris
    const checkboxes = tbody.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.addEventListener('change', function () {
            const idx = parseInt(this.getAttribute('data-index'), 10);
            if (hasilKalkulasiTerkini[idx]) {
                hasilKalkulasiTerkini[idx].isChecked = this.checked;
            }
            hitungDanPerbaruiTotal();
        });
    });

    // Pasang listener pada dropdown pilihan produk per kategori (misal ganti Semen Gresik -> Semen Tiga Roda)
    const selectsProduk = tbody.querySelectorAll('.select-produk-kalkulator');
    selectsProduk.forEach(sel => {
        sel.addEventListener('change', function () {
            const idx = parseInt(this.getAttribute('data-index'), 10);
            const selectedId = this.value;
            const barisLama = hasilKalkulasiTerkini[idx];
            if (!barisLama) return;

            const barangBaru = barisLama.pilihanBarang.find(b => String(b.id) === String(selectedId));
            if (barangBaru) {
                hasilKalkulasiTerkini[idx] = buatObjekBarisKalkulasi(
                    idx,
                    barisLama.matConfig,
                    barisLama.kebutuhanAkhir,
                    barangBaru,
                    barisLama.pilihanBarang
                );
                tampilkanHasilKalkulator(hasilKalkulasiTerkini);
            }
        });
    });

    // Hitung total estimasi awal
    hitungDanPerbaruiTotal();
}

/**
 * Menghitung ulang total estimasi biaya dari baris material yang dicentang.
 */
function hitungDanPerbaruiTotal() {
    let grandTotal = 0;
    let jumlahChecked = 0;

    hasilKalkulasiTerkini.forEach(item => {
        if (item.canCheck && item.isChecked) {
            grandTotal += item.subtotal;
            jumlahChecked++;
        }
    });

    const elTotal = document.getElementById('totalEstimasiNominal');
    if (elTotal) {
        elTotal.textContent = typeof formatRupiah === 'function' ? formatRupiah(grandTotal) : `Rp ${grandTotal.toLocaleString('id-ID')}`;
    }

    const btnKeranjang = document.getElementById('btnTambahKeranjang');
    if (btnKeranjang) {
        btnKeranjang.disabled = (jumlahChecked === 0);
    }
}

/**
 * Menyimpan barang-barang yang dicentang ke dalam localStorage keranjang belanja.
 */
function handleSimpanKeKeranjang() {
    // Validasi status login: Pengguna tanpa akun dialihkan untuk login terlebih dahulu
    if (typeof isUserLoggedIn === 'function' && !isUserLoggedIn()) {
        window.location.href = '/login?redirect=kalkulator&pesan=login_tambah_keranjang';
        return;
    }

    const barangDicentang = hasilKalkulasiTerkini.filter(item => item.canCheck && item.isChecked);
    if (barangDicentang.length === 0) return;

    barangDicentang.forEach(item => {
        if (typeof tambahKeKeranjang === 'function') {
            tambahKeKeranjang({
                idBarang: item.idBarang,
                idMasterBarang: item.idBarang,
                nama: item.namaKatalog,
                harga: item.hargaSatuan,
                satuan: item.satuan,
                jumlah: item.kebutuhanAkhir
            });
        }
    });

    // Perbarui badge keranjang di navbar
    if (typeof updateNavbarBadgeKeranjang === 'function') {
        updateNavbarBadgeKeranjang();
    }

    // Tampilkan Toast Notifikasi
    tampilkanToastKeranjang(`${barangDicentang.length} material berhasil dimasukkan ke keranjang.`);
}

/**
 * Mereset form input dan mengembalikan kartu hasil ke tampilan ilustrasi awal.
 */
function handleResetKalkulator() {
    const form = document.getElementById('formKalkulator');
    if (form) form.reset();

    // Reset radio button (pilih Dinding secara default jika diinginkan, atau kosongkan)
    const radios = document.querySelectorAll('input[name="jenisPekerjaan"]');
    radios.forEach(r => r.checked = false);

    // Kembalikan input cadangan ke default 10%
    const cadanganEl = document.getElementById('inputCadangan');
    if (cadanganEl) cadanganEl.value = '10';

    resetFormErrors();
    hasilKalkulasiTerkini = [];

    // Tampilkan kembali empty state
    const emptyState = document.getElementById('hasilEmptyState');
    const contentState = document.getElementById('hasilContentState');
    if (emptyState) emptyState.classList.remove('d-none');
    if (contentState) contentState.classList.add('d-none');
}

/**
 * Menampilkan pesan error validasi input.
 */
function setError(elementId, message) {
    let input = document.getElementById(elementId);
    let errorFeedback = document.getElementById(elementId + 'Error');

    if (!input && elementId === 'jenisPekerjaan') {
        errorFeedback = document.getElementById('jenisPekerjaanError');
    }

    if (input) input.classList.add('is-invalid');
    if (errorFeedback) {
        errorFeedback.textContent = message;
        errorFeedback.classList.remove('d-none');
    }
}

/**
 * Mereset seluruh status error validasi pada form.
 */
function resetFormErrors() {
    ['inputLuas', 'inputCadangan'].forEach(id => {
        const input = document.getElementById(id);
        const feedback = document.getElementById(id + 'Error');
        if (input) input.classList.remove('is-invalid');
        if (feedback) {
            feedback.textContent = '';
            feedback.classList.add('d-none');
        }
    });

    const jobFeedback = document.getElementById('jenisPekerjaanError');
    if (jobFeedback) {
        jobFeedback.textContent = '';
        jobFeedback.classList.add('d-none');
    }
}

/**
 * Menampilkan notifikasi Toast saat material berhasil dimasukkan ke keranjang.
 * @param {string} pesan 
 */
function tampilkanToastKeranjang(pesan) {
    const elPesan = document.getElementById('toastKalkulatorPesan');
    const elToast = document.getElementById('kalkulatorToast');
    if (elPesan) elPesan.textContent = pesan;
    if (elToast) {
        const toast = new bootstrap.Toast(elToast, { delay: 3500 });
        toast.show();
    }
}

/**
 * Sanitasi string sederhana untuk keamanan XSS.
 */
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
