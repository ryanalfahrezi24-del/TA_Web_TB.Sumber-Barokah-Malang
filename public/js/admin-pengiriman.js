/**
 * ==============================================================================
 * LOGIKA TAMPILAN HALAMAN ADMIN: PENGIRIMAN BARANG
 * TB. SUMBER BAROKAH MALANG
 * ==============================================================================
 * Mengelola:
 * - Tampilan daftar pesanan pengiriman (Halaman Khusus Admin)
 * - 3 kartu ringkasan status pengantaran (Belum Diantar, Dalam Proses, Sudah Diantar)
 * - Pencarian (berdasarkan nama pelanggan atau alamat) dan urutan tanggal (Terbaru / Terlama)
 * - Modal Detail Pesanan, Modal Ubah Status, dan Modal Tambah Pesanan
 * - Sinkronisasi otomatis antar-tab browser melalui event 'storage'
 * ==============================================================================
 */

let filterKeywordAktif = '';

let modalDetailInstance = null;
let modalUbahStatusInstance = null;
let modalTambahPesananInstance = null;

document.addEventListener('DOMContentLoaded', function () {
    // 1. Inisialisasi data store pengiriman
    if (typeof inisialisasiPengirimanStore === 'function') {
        inisialisasiPengirimanStore();
    }

    // 2. Inisialisasi instance modal Bootstrap
    const elModalDetail = document.getElementById('modalDetailPesanan');
    if (elModalDetail) modalDetailInstance = new bootstrap.Modal(elModalDetail);

    const elModalUbah = document.getElementById('modalUbahStatus');
    if (elModalUbah) modalUbahStatusInstance = new bootstrap.Modal(elModalUbah);

    const elModalTambah = document.getElementById('modalTambahPesanan');
    if (elModalTambah) modalTambahPesananInstance = new bootstrap.Modal(elModalTambah);

    // 3. Hubungkan event pencarian dan submit form modal
    inisialisasiEventPengiriman();

    // 4. Render halaman pengiriman (ringkasan & tabel)
    renderHalamanPengiriman();

    // 5. Sinkronisasi antar-tab melalui event storage
    window.addEventListener('storage', function (e) {
        if (
            e.key === 'sb_pengiriman' ||
            e.key === 'sb_barang'
        ) {
            renderHalamanPengiriman();
        }
    });
});

/**
 * Menghubungkan seluruh event listener pada toolbar dan form modal.
 */
function inisialisasiEventPengiriman() {
    const inputSearch = document.getElementById('searchPengiriman');
    if (inputSearch) {
        inputSearch.addEventListener('input', function (e) {
            filterKeywordAktif = e.target.value.trim().toLowerCase();
            renderTabelPengiriman();
        });
    }

    const formUbahStatus = document.getElementById('formUbahStatus');
    if (formUbahStatus) {
        formUbahStatus.addEventListener('submit', handleSimpanUbahStatus);
    }

    const formTambahPesanan = document.getElementById('formTambahPesanan');
    if (formTambahPesanan) {
        formTambahPesanan.addEventListener('submit', handleSimpanTambahPesanan);
    }
}

/**
 * Merender keseluruhan komponen halaman pengiriman:
 * 3 kartu ringkasan dan tabel pesanan.
 */
function renderHalamanPengiriman() {
    renderKartuRingkasanPengiriman();
    renderTabelPengiriman();
}

/* ==============================================================================
 * 1. KARTU RINGKASAN STATUS
 * ============================================================================== */

/**
 * Memperbarui angka pada 3 kartu ringkasan status pengantaran.
 */
function renderKartuRingkasanPengiriman() {
    const hitungan = hitungPerStatus();

    const elBelum = document.getElementById('statBelumDiantar');
    const elProses = document.getElementById('statDalamProses');
    const elSelesai = document.getElementById('statSudahDiantar');

    if (elBelum) elBelum.textContent = hitungan['Belum Diantar'];
    if (elProses) elProses.textContent = hitungan['Dalam Proses'];
    if (elSelesai) elSelesai.textContent = hitungan['Sudah Diantar'];
}

/**
 * Mereset pencarian kembali ke default.
 */
function resetFilterPengiriman() {
    filterKeywordAktif = '';

    const inputSearch = document.getElementById('searchPengiriman');
    if (inputSearch) inputSearch.value = '';

    renderTabelPengiriman();
}

/* ==============================================================================
 * 2. PENCARIAN & RENDER TABEL PENGIRIMAN
 * ============================================================================== */

/**
 * Mengambil daftar pesanan yang sudah difilter keyword dan diurutkan:
 * - Pesanan yang belum selesai ("Belum Diantar" dan "Dalam Proses") tampil
 *   di atas pesanan "Sudah Diantar" secara default.
 * - Selanjutnya diurutkan berdasarkan tanggal terbaru.
 * @returns {Array}
 */
function getPengirimanTerfilterDanTerurut() {
    const semua = getPengiriman();

    const hasilFilter = semua.filter(pesanan => {
        const keyword = filterKeywordAktif;
        if (!keyword) return true;

        const cocokPelanggan = String(pesanan.pelanggan || '').toLowerCase().includes(keyword);
        const cocokAlamat = String(pesanan.alamat || '').toLowerCase().includes(keyword);
        return cocokPelanggan || cocokAlamat;
    });

    hasilFilter.sort((a, b) => {
        // Prioritas 1: Pesanan yang belum selesai tampil di atas "Sudah Diantar"
        const isSelesaiA = a.status === 'Sudah Diantar' ? 1 : 0;
        const isSelesaiB = b.status === 'Sudah Diantar' ? 1 : 0;
        if (isSelesaiA !== isSelesaiB) {
            return isSelesaiA - isSelesaiB;
        }

        // Prioritas 2: Urutan tanggal terbaru
        const tglA = String(a.tanggal || '');
        const tglB = String(b.tanggal || '');
        if (tglA !== tglB) {
            return tglB.localeCompare(tglA);
        }

        // Prioritas 3: ID pesanan
        return (b.id || 0) - (a.id || 0);
    });

    return hasilFilter;
}

/**
 * Menghasilkan HTML badge status sesuai aturan:
 * 1. "Belum Diantar" (badge merah, ikon bi-clock)
 * 2. "Dalam Proses" (badge kuning, ikon bi-truck)
 * 3. "Sudah Diantar" (badge hijau, ikon bi-check-circle)
 * @param {string} status
 * @returns {string} HTML string
 */
function getBadgeStatusHtml(status) {
    if (status === 'Belum Diantar') {
        return `<span class="badge-pengiriman badge-pengiriman-belum"><i class="bi bi-clock"></i> Belum Diantar</span>`;
    }
    if (status === 'Dalam Proses') {
        return `<span class="badge-pengiriman badge-pengiriman-proses"><i class="bi bi-truck"></i> Dalam Proses</span>`;
    }
    if (status === 'Sudah Diantar') {
        return `<span class="badge-pengiriman badge-pengiriman-selesai"><i class="bi bi-check-circle"></i> Sudah Diantar</span>`;
    }
    return `<span class="badge-pengiriman badge-pengiriman-belum"><i class="bi bi-clock"></i> ${escapeHtml(status)}</span>`;
}

/**
 * Menghasilkan ringkasan daftar barang di kolom tabel:
 * Maksimal 2 barang ditulis "Nama x Jumlah", sisanya "+N lainnya", plus tombol kecil "Detail".
 * @param {Object} pesanan
 * @returns {string} HTML string
 */
function getRingkasanBarangHtml(pesanan) {
    const items = Array.isArray(pesanan.items) ? pesanan.items : [];
    const tampil = items.slice(0, 2);
    const sisaCount = items.length - tampil.length;

    const listHtml = tampil
        .map(it => `<div class="small text-dark text-truncate" style="max-width: 240px;">&bull; ${escapeHtml(it.nama)} <strong class="text-secondary">x ${parseInt(it.jumlah, 10) || 1}</strong></div>`)
        .join('');

    const sisaHtml = sisaCount > 0
        ? `<span class="badge bg-light text-secondary border mt-1 me-1" style="font-size: 0.73rem;">+${sisaCount} lainnya</span>`
        : '';

    return `
        <div>
            ${listHtml}
            <div class="d-flex align-items-center flex-wrap mt-1">
                ${sisaHtml}
                <button type="button" class="btn-detail-barang" onclick="bukaModalDetailPesanan('${pesanan.id}')">
                    <i class="bi bi-eye me-1"></i>Detail
                </button>
            </div>
        </div>
    `;
}

/**
 * Merender baris-baris tabel pesanan pengiriman (6 kolom: No, Tanggal, Pelanggan dan Alamat, Barang yang Diantar, Status, Aksi).
 */
function renderTabelPengiriman() {
    const tbody = document.getElementById('tabelPengirimanBody');
    const infoJumlah = document.getElementById('infoJumlahPesanan');
    const btnResetToolbar = document.getElementById('btnResetFilterToolbar');
    if (!tbody) return;

    const semuaPesanan = getPengiriman();
    const hasil = getPengirimanTerfilterDanTerurut();
    const adaFilterAktif = filterKeywordAktif !== '';

    if (infoJumlah) {
        infoJumlah.textContent = `Menampilkan ${hasil.length} pesanan`;
    }

    if (btnResetToolbar) {
        btnResetToolbar.classList.toggle('d-none', !adaFilterAktif);
    }

    // Keadaan kosong (6 kolom)
    if (hasil.length === 0) {
        if (semuaPesanan.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-5">
                        <div class="text-muted mb-2"><i class="bi bi-truck fs-1"></i></div>
                        <h6 class="fw-bold text-dark mb-1">Belum ada pesanan pengiriman</h6>
                        <p class="small text-muted mb-0">Tambahkan pesanan baru untuk mulai memantau jadwal pengantaran.</p>
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-5">
                        <div class="text-muted mb-2"><i class="bi bi-search fs-2"></i></div>
                        <h6 class="fw-bold text-dark mb-1">Pesanan tidak ditemukan</h6>
                        <p class="small text-muted mb-3">Tidak ada pesanan yang cocok dengan kata kunci pencarian Anda.</p>
                        <button type="button" class="btn btn-sm btn-outline-secondary px-3" onclick="resetFilterPengiriman()">
                            <i class="bi bi-arrow-counterclockwise me-1"></i>Reset pencarian
                        </button>
                    </td>
                </tr>
            `;
        }
        return;
    }

    tbody.innerHTML = '';

    hasil.forEach((pesanan, idx) => {
        const tr = document.createElement('tr');
        if (pesanan.status === 'Sudah Diantar') {
            tr.classList.add('row-sudah-diantar');
        }

        tr.innerHTML = `
            <td class="text-center text-muted fw-semibold">${idx + 1}</td>
            <td class="text-nowrap">
                <span class="small fw-medium text-dark">${escapeHtml(formatTanggal(pesanan.tanggal))}</span>
            </td>
            <td>
                <div class="fw-bold text-dark">${escapeHtml(pesanan.pelanggan)}</div>
                <div class="small text-muted mt-1" style="line-height: 1.35;">${escapeHtml(pesanan.alamat)}</div>
            </td>
            <td>
                ${getRingkasanBarangHtml(pesanan)}
            </td>
            <td class="text-center">
                ${getBadgeStatusHtml(pesanan.status)}
            </td>
            <td class="text-center">
                <button type="button" class="btn-ubah-status" onclick="bukaModalUbahStatus('${pesanan.id}')">
                    <i class="bi bi-pencil-square"></i>
                    <span>Ubah Status</span>
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

/* ==============================================================================
 * 3. MODAL DETAIL PESANAN
 * ============================================================================== */

/**
 * Membuka modal detail pesanan lengkap beserta seluruh daftar barang yang diantar.
 * @param {number|string} id
 */
function bukaModalDetailPesanan(id) {
    const daftar = getPengiriman();
    const pesanan = daftar.find(p => String(p.id) === String(id));
    if (!pesanan) return;

    const elTanggal = document.getElementById('detailTanggalPesanan');
    const elPelanggan = document.getElementById('detailPelangganPesanan');
    const elAlamat = document.getElementById('detailAlamatPesanan');
    const elStatus = document.getElementById('detailStatusBadge');
    const elTotalJenis = document.getElementById('detailTotalJenisBarang');
    const elListBarang = document.getElementById('detailDaftarBarangList');

    if (elTanggal) elTanggal.textContent = formatTanggal(pesanan.tanggal);
    if (elPelanggan) elPelanggan.textContent = pesanan.pelanggan;
    if (elAlamat) elAlamat.textContent = pesanan.alamat;
    if (elStatus) elStatus.innerHTML = getBadgeStatusHtml(pesanan.status);

    const items = Array.isArray(pesanan.items) ? pesanan.items : [];
    if (elTotalJenis) {
        elTotalJenis.textContent = `${items.length} jenis barang`;
    }

    if (elListBarang) {
        elListBarang.innerHTML = items
            .map((it, index) => `
                <li class="list-group-item d-flex align-items-center justify-content-between py-2 px-3 small">
                    <div class="d-flex align-items-center gap-2">
                        <span class="badge rounded-pill bg-light text-secondary border">${index + 1}</span>
                        <span class="fw-semibold text-dark">${escapeHtml(it.nama)}</span>
                    </div>
                    <span class="badge bg-warning-subtle text-dark border border-warning-subtle px-2 py-1">
                        Jumlah: <strong>${parseInt(it.jumlah, 10) || 1}</strong>
                    </span>
                </li>
            `)
            .join('');
    }

    if (modalDetailInstance) {
        modalDetailInstance.show();
    }
}

/* ==============================================================================
 * 4. MODAL UBAH STATUS PENGANTARAN (ADMIN)
 * ============================================================================== */

/**
 * Membuka modal untuk mengubah status pengantaran pesanan.
 * @param {number|string} id
 */
function bukaModalUbahStatus(id) {
    const daftar = getPengiriman();
    const pesanan = daftar.find(p => String(p.id) === String(id));
    if (!pesanan) return;

    const inputId = document.getElementById('ubahStatusIdPesanan');
    const elPelanggan = document.getElementById('ubahStatusPelangganPesanan');

    if (inputId) inputId.value = pesanan.id;
    if (elPelanggan) elPelanggan.textContent = pesanan.pelanggan;

    const radios = document.querySelectorAll('input[name="pilihanStatusBaru"]');
    radios.forEach(radio => {
        radio.checked = (radio.value === pesanan.status);
    });

    if (modalUbahStatusInstance) {
        modalUbahStatusInstance.show();
    }
}

/**
 * Menyimpan perubahan status pengantaran dari Modal Ubah Status.
 * @param {Event} e
 */
function handleSimpanUbahStatus(e) {
    e.preventDefault();

    const idPesanan = document.getElementById('ubahStatusIdPesanan')?.value;
    const radioTerpilih = document.querySelector('input[name="pilihanStatusBaru"]:checked');
    if (!idPesanan || !radioTerpilih) return;

    const statusBaru = radioTerpilih.value;
    const hasilUpdate = ubahStatus(idPesanan, statusBaru);

    if (!hasilUpdate) {
        tampilkanToastPengiriman('Gagal mengubah status pesanan.', 'error');
        return;
    }

    if (modalUbahStatusInstance) {
        modalUbahStatusInstance.hide();
    }

    renderKartuRingkasanPengiriman();
    renderTabelPengiriman();

    tampilkanToastPengiriman(
        `Status pesanan ${hasilUpdate.pelanggan} diubah menjadi ${hasilUpdate.status}`,
        'success'
    );
}

/* ==============================================================================
 * 5. MODAL TAMBAH PESANAN BARU (ADMIN)
 * ============================================================================== */

/**
 * Membuka modal tambah pesanan pengiriman baru.
 */
function bukaModalTambahPesanan() {
    const form = document.getElementById('formTambahPesanan');
    if (form) form.reset();

    resetErrorFormTambahPesanan();

    // Set default tanggal ke hari ini (YYYY-MM-DD)
    const inputTanggal = document.getElementById('inputTanggalPengiriman');
    if (inputTanggal && typeof getTanggalRelatif === 'function') {
        inputTanggal.value = getTanggalRelatif(0);
    }

    // Siapkan 1 baris barang awal
    const container = document.getElementById('containerBarisBarang');
    if (container) {
        container.innerHTML = '';
        tambahBarisInputBarang();
    }

    if (modalTambahPesananInstance) {
        modalTambahPesananInstance.show();
    }
}

/**
 * Mengambil daftar nama barang dari stok-store.js (getBarang()) untuk opsi dropdown.
 * @returns {Array}
 */
function getDaftarPilihanBarangStok() {
    const daftarStok = typeof getBarang === 'function' ? getBarang() : [];
    return daftarStok.map(item => ({
        nama: item.nama,
        satuan: item.satuan || ''
    }));
}

/**
 * Menambahkan satu baris input barang dinamis (dropdown barang + input jumlah + tombol hapus).
 */
function tambahBarisInputBarang() {
    const container = document.getElementById('containerBarisBarang');
    if (!container) return;

    const daftarBarang = getDaftarPilihanBarangStok();
    let optionsHtml = `<option value="">-- Pilih Barang Material --</option>`;
    daftarBarang.forEach(b => {
        const labelSatuan = b.satuan ? ` (${escapeHtml(b.satuan)})` : '';
        optionsHtml += `<option value="${escapeHtml(b.nama)}">${escapeHtml(b.nama)}${labelSatuan}</option>`;
    });

    const rowDiv = document.createElement('div');
    rowDiv.className = 'item-pesanan-row';
    rowDiv.innerHTML = `
        <div class="row g-2 align-items-center">
            <div class="col-12 col-sm-7">
                <select class="form-select form-select-sm select-barang-pengiriman" onchange="perbaruiOpsiDropdownBarang()">
                    ${optionsHtml}
                </select>
            </div>
            <div class="col-8 col-sm-3">
                <div class="input-group input-group-sm">
                    <span class="input-group-text">Qty</span>
                    <input type="number" class="form-control input-jumlah-pengiriman" value="1" min="1" step="1" placeholder="Jumlah">
                </div>
            </div>
            <div class="col-4 col-sm-2 text-end">
                <button type="button" class="btn btn-sm btn-outline-danger btn-hapus-baris-barang" onclick="hapusBarisInputBarang(this)" title="Hapus baris barang">
                    <i class="bi bi-trash3"></i>
                </button>
            </div>
        </div>
    `;

    container.appendChild(rowDiv);
    perbaruiStatusTombolHapusBaris();
    perbaruiOpsiDropdownBarang();
}

/**
 * Menghapus baris input barang tertentu (minimal harus tersisa 1 baris).
 * @param {HTMLElement} btnEl
 */
function hapusBarisInputBarang(btnEl) {
    const container = document.getElementById('containerBarisBarang');
    if (!container) return;

    const semuaBaris = container.querySelectorAll('.item-pesanan-row');
    if (semuaBaris.length <= 1) {
        return;
    }

    const row = btnEl.closest('.item-pesanan-row');
    if (row) row.remove();

    perbaruiStatusTombolHapusBaris();
    perbaruiOpsiDropdownBarang();
}

/**
 * Menonaktifkan tombol hapus baris apabila hanya ada 1 baris barang.
 */
function perbaruiStatusTombolHapusBaris() {
    const container = document.getElementById('containerBarisBarang');
    if (!container) return;

    const semuaBaris = container.querySelectorAll('.item-pesanan-row');
    const semuaBtnHapus = container.querySelectorAll('.btn-hapus-baris-barang');

    semuaBtnHapus.forEach(btn => {
        btn.disabled = (semuaBaris.length <= 1);
    });
}

/**
 * Menonaktifkan opsi barang yang sudah dipilih di baris lain agar barang yang sama
 * tidak dipilih dua kali.
 */
function perbaruiOpsiDropdownBarang() {
    const container = document.getElementById('containerBarisBarang');
    if (!container) return;

    const semuaSelect = Array.from(container.querySelectorAll('.select-barang-pengiriman'));
    const nilaiTerpilih = semuaSelect
        .map(sel => sel.value.trim())
        .filter(val => val !== '');

    semuaSelect.forEach(selectEl => {
        const nilaiSaatIni = selectEl.value.trim();
        Array.from(selectEl.options).forEach(opt => {
            if (!opt.value) return;
            const dipakaiBarisLain = nilaiTerpilih.includes(opt.value) && opt.value !== nilaiSaatIni;
            opt.disabled = dipakaiBarisLain;
        });
    });
}

/**
 * Mereset pesan-pesan error pada form Tambah Pesanan.
 */
function resetErrorFormTambahPesanan() {
    const idsError = [
        'errorPelangganPengiriman',
        'errorTanggalPengiriman',
        'errorAlamatPengiriman',
        'errorBarangPengiriman'
    ];
    idsError.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = '';
            el.classList.add('d-none');
        }
    });

    ['inputPelangganPengiriman', 'inputTanggalPengiriman', 'inputAlamatPengiriman'].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.classList.remove('is-invalid');
    });
}

/**
 * Memvalidasi dan menyimpan pesanan pengiriman baru dari Modal Tambah Pesanan.
 * @param {Event} e
 */
function handleSimpanTambahPesanan(e) {
    e.preventDefault();

    resetErrorFormTambahPesanan();

    const inputPelanggan = document.getElementById('inputPelangganPengiriman');
    const inputTanggal = document.getElementById('inputTanggalPengiriman');
    const inputAlamat = document.getElementById('inputAlamatPengiriman');

    const errPelanggan = document.getElementById('errorPelangganPengiriman');
    const errTanggal = document.getElementById('errorTanggalPengiriman');
    const errAlamat = document.getElementById('errorAlamatPengiriman');
    const errBarang = document.getElementById('errorBarangPengiriman');

    let isValid = true;

    const pelanggan = inputPelanggan ? inputPelanggan.value.trim() : '';
    const tanggal = inputTanggal ? inputTanggal.value.trim() : '';
    const alamat = inputAlamat ? inputAlamat.value.trim() : '';

    if (!pelanggan) {
        if (errPelanggan) {
            errPelanggan.textContent = 'Nama pelanggan wajib diisi.';
            errPelanggan.classList.remove('d-none');
        }
        if (inputPelanggan) inputPelanggan.classList.add('is-invalid');
        isValid = false;
    }

    if (!tanggal) {
        if (errTanggal) {
            errTanggal.textContent = 'Tanggal pengiriman wajib diisi.';
            errTanggal.classList.remove('d-none');
        }
        if (inputTanggal) inputTanggal.classList.add('is-invalid');
        isValid = false;
    }

    if (!alamat) {
        if (errAlamat) {
            errAlamat.textContent = 'Alamat pengantaran wajib diisi.';
            errAlamat.classList.remove('d-none');
        }
        if (inputAlamat) inputAlamat.classList.add('is-invalid');
        isValid = false;
    }

    // Validasi daftar barang dinamis
    const container = document.getElementById('containerBarisBarang');
    const barisList = container ? Array.from(container.querySelectorAll('.item-pesanan-row')) : [];
    const itemsTerpilih = [];
    const namaBarangSet = new Set();
    let pesanErrorBarang = '';

    if (barisList.length === 0) {
        pesanErrorBarang = 'Minimal harus ada 1 barang yang diantar.';
        isValid = false;
    } else {
        for (let i = 0; i < barisList.length; i++) {
            const row = barisList[i];
            const selectEl = row.querySelector('.select-barang-pengiriman');
            const qtyEl = row.querySelector('.input-jumlah-pengiriman');

            const namaBarang = selectEl ? selectEl.value.trim() : '';
            const qtyRaw = qtyEl ? Number(qtyEl.value) : 0;

            if (!namaBarang) {
                pesanErrorBarang = `Pilih nama barang pada baris ke-${i + 1}.`;
                isValid = false;
                break;
            }

            if (!Number.isInteger(qtyRaw) || qtyRaw < 1) {
                pesanErrorBarang = `Jumlah barang pada baris ke-${i + 1} harus berupa angka bulat minimal 1.`;
                isValid = false;
                break;
            }

            if (namaBarangSet.has(namaBarang.toLowerCase())) {
                pesanErrorBarang = `Barang "${namaBarang}" tidak boleh dipilih dua kali dalam satu pesanan.`;
                isValid = false;
                break;
            }

            namaBarangSet.add(namaBarang.toLowerCase());
            itemsTerpilih.push({
                nama: namaBarang,
                jumlah: qtyRaw
            });
        }
    }

    if (pesanErrorBarang && errBarang) {
        errBarang.textContent = pesanErrorBarang;
        errBarang.classList.remove('d-none');
    }

    if (!isValid) return;

    const pesananBaru = tambahPengiriman({
        tanggal: tanggal,
        pelanggan: pelanggan,
        alamat: alamat,
        items: itemsTerpilih
    });

    if (!pesananBaru) {
        tampilkanToastPengiriman('Gagal menambahkan pesanan pengiriman.', 'error');
        return;
    }

    if (modalTambahPesananInstance) {
        modalTambahPesananInstance.hide();
    }

    renderKartuRingkasanPengiriman();
    renderTabelPengiriman();

    tampilkanToastPengiriman(
        `Pesanan untuk ${pesananBaru.pelanggan} berhasil ditambahkan dengan status Belum Diantar.`,
        'success'
    );
}

/* ==============================================================================
 * 6. UTILITAS TOAST & ESCAPE HTML
 * ============================================================================== */

/**
 * Menampilkan Toast Notifikasi di sudut kanan atas.
 * @param {string} pesan
 * @param {"success" | "error" | "info"} tipe
 */
function tampilkanToastPengiriman(pesan, tipe = 'success') {
    const elToast = document.getElementById('adminToast');
    const elPesan = document.getElementById('toastPesan');
    const elIcon = document.getElementById('toastIcon');

    if (elPesan) elPesan.textContent = pesan;
    if (elIcon) {
        if (tipe === 'error') {
            elIcon.className = 'bi bi-exclamation-triangle-fill text-danger me-2 fs-6';
        } else if (tipe === 'info') {
            elIcon.className = 'bi bi-info-circle-fill text-info me-2 fs-6';
        } else {
            elIcon.className = 'bi bi-check-circle-fill text-success me-2 fs-6';
        }
    }

    if (elToast) {
        const toast = bootstrap.Toast.getOrCreateInstance(elToast, { delay: 3500 });
        toast.show();
    }
}

/**
 * Mencegah XSS dengan melakukan escape karakter HTML spesial.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
