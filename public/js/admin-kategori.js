/**
 * ==============================================================================
 * LOGIKA ANTARMUKA HALAMAN ADMIN: KELOLA KATEGORI
 * ==============================================================================
 * Mengelola interaksi UI halaman kelola kategori:
 * - Menampilkan daftar kategori, ikon, dan jumlah barang di tiap kategori
 * - Kartu ringkasan: Total Kategori & Kategori Kosong (0 barang)
 * - Tambah & Edit kategori menggunakan 1 modal Bootstrap dengan pemilih 16 ikon & pratinjau live
 * - Validasi nama kategori (2-30 karakter, unik tidak peka huruf besar/kecil)
 * - Proteksi kategori bawaan "Lainnya" (tidak bisa diubah namanya & tidak bisa dihapus)
 * - Konfirmasi hapus kategori (otomatis mengalihkan barang ke "Lainnya" jika ada)
 * - Sinkronisasi otomatis antar-tab via localStorage ('sb_kategori' dan 'sb_barang')
 */

let modalFormKategoriInstance = null;
let modalHapusKategoriInstance = null;
let idKategoriHapus = null;
let searchKeywordKategori = '';
let kategoriDibukaDariFormBarang = false;

document.addEventListener('DOMContentLoaded', function () {
    // 1. Inisialisasi Modal Bootstrap
    const elModalForm = document.getElementById('modalFormKategori');
    const elModalHapus = document.getElementById('modalKonfirmasiHapusKategori');

    if (elModalForm) {
        modalFormKategoriInstance = new bootstrap.Modal(elModalForm);
        elModalForm.addEventListener('hidden.bs.modal', function () {
            if (kategoriDibukaDariFormBarang) {
                kategoriDibukaDariFormBarang = false;
                if (typeof modalFormInstance !== 'undefined' && modalFormInstance) {
                    modalFormInstance.show();
                }
            }
        });
    }
    if (elModalHapus) {
        modalHapusKategoriInstance = new bootstrap.Modal(elModalHapus);
    }

    // 2. Pasang listener form submit
    const formKategori = document.getElementById('formKategori');
    if (formKategori) {
        formKategori.addEventListener('submit', handleSimpanKategori);
    }

    // 3. Pasang listener tombol konfirmasi hapus
    const btnKonfirmasiHapus = document.getElementById('btnKonfirmasiHapusKategori');
    if (btnKonfirmasiHapus) {
        btnKonfirmasiHapus.addEventListener('click', handleProsesHapusKategori);
    }

    // 3b. Pasang listener tombol hapus dari dalam modal edit
    const btnHapusDariModal = document.getElementById('btnHapusDariModalKategori');
    if (btnHapusDariModal) {
        btnHapusDariModal.addEventListener('click', function () {
            const id = document.getElementById('kategoriId').value.trim();
            if (id && modalFormKategoriInstance) {
                modalFormKategoriInstance.hide();
                setTimeout(() => {
                    bukaModalHapusKategori(id);
                }, 300);
            }
        });
    }

    // 4. Pasang listener input pencarian kategori
    const inputSearch = document.getElementById('searchKategori');
    if (inputSearch) {
        inputSearch.addEventListener('input', function (e) {
            searchKeywordKategori = e.target.value.trim().toLowerCase();
            renderTabelKategori();
        });
    }

    // 5. Render awal seluruh data
    renderHalamanKategori();

    // 6. Sinkronisasi antar-tab via localStorage
    inisialisasiSinkronisasiStorage();
});

/**
 * Mendengarkan perubahan localStorage pada kunci 'sb_kategori' dan 'sb_barang' antar-tab.
 */
function inisialisasiSinkronisasiStorage() {
    window.addEventListener('storage', function (e) {
        if (e.key === 'sb_kategori' || e.key === 'sb_barang') {
            renderHalamanKategori();
        }
    });
}

/**
 * Merender seluruh komponen halaman kategori: ringkasan statistik dan tabel.
 */
function renderHalamanKategori() {
    renderRingkasanStatistikKategori();
    renderTabelKategori();
}

/**
 * Menghitung dan merender 2 kartu statistik di bagian atas halaman kelola kategori.
 */
function renderRingkasanStatistikKategori() {
    const elTotal = document.getElementById('statTotalKategori');
    const elKosong = document.getElementById('statKategoriKosong');
    if (!elTotal) return;

    const semuaKategori = typeof getKategori === 'function' ? getKategori() : [];
    let kategoriKosong = 0;

    semuaKategori.forEach(kat => {
        const jumlahBarang = typeof hitungBarangDiKategori === 'function' ? hitungBarangDiKategori(kat.nama) : 0;
        if (jumlahBarang === 0) {
            kategoriKosong++;
        }
    });

    if (elTotal) elTotal.textContent = semuaKategori.length;
    if (elKosong) elKosong.textContent = kategoriKosong;
}

/**
 * Merender baris-baris tabel kategori sesuai data di localStorage.
 */
function renderTabelKategori() {
    const tbody = document.getElementById('tabelKategoriBody');
    if (!tbody) return;

    const semuaKategori = typeof getKategori === 'function' ? getKategori() : [];

    // Filter berdasarkan kata kunci pencarian
    const hasilFilter = semuaKategori.filter(kat => {
        return !searchKeywordKategori || kat.nama.toLowerCase().includes(searchKeywordKategori);
    });

    tbody.innerHTML = '';

    // Keadaan kosong
    if (hasilFilter.length === 0) {
        const trKosong = document.createElement('tr');
        trKosong.innerHTML = `
            <td colspan="4" class="text-center py-5 text-muted">
                <i class="bi bi-tags fs-2 d-block mb-2 text-secondary opacity-50"></i>
                <span>${searchKeywordKategori ? 'Tidak ada kategori yang cocok dengan pencarian.' : 'Belum ada kategori.'}</span>
            </td>
        `;
        tbody.appendChild(trKosong);
        return;
    }

    // Render baris data
    hasilFilter.forEach((kat, index) => {
        const jumlahBarang = typeof hitungBarangDiKategori === 'function' ? hitungBarangDiKategori(kat.nama) : 0;

        let badgeBarangHtml = '';
        if (jumlahBarang > 0) {
            badgeBarangHtml = `<span class="badge rounded-pill px-3 py-1" style="background-color: var(--primary-light); color: var(--primary-color); font-weight: 600; font-size: 0.82rem;">${jumlahBarang} Barang</span>`;
        } else {
            badgeBarangHtml = `<span class="badge rounded-pill px-3 py-1 bg-light text-secondary border" style="font-weight: 500; font-size: 0.82rem;">0 Barang</span>`;
        }

        const aksiHtml = `
            <div class="d-flex justify-content-center gap-1">
                <button type="button" class="btn btn-action-icon btn-action-edit" title="Edit Kategori" onclick="bukaModalEditKategori('${kat.id}')">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button type="button" class="btn btn-action-icon btn-action-delete" title="Hapus Kategori" onclick="bukaModalHapusKategori('${kat.id}')">
                    <i class="bi bi-trash3"></i>
                </button>
            </div>
        `;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-center fw-semibold text-secondary" style="width: 60px;">${index + 1}</td>
            <td>
                <span class="fw-bold text-dark fs-6">${escapeHtml(kat.nama)}</span>
            </td>
            <td class="text-center" style="width: 180px;">
                ${badgeBarangHtml}
            </td>
            <td class="text-center" style="width: 120px;">
                ${aksiHtml}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Membuka modal form dalam mode Tambah Kategori Baru.
 */
function bukaModalTambahKategori() {
    document.getElementById('modalFormKategoriTitle').textContent = 'Tambah Kategori Baru';
    document.getElementById('kategoriId').value = '';
    document.getElementById('namaKategoriInput').value = '';

    const btnHapus = document.getElementById('btnHapusDariModalKategori');
    if (btnHapus) btnHapus.classList.add('d-none');

    resetFormKategoriErrors();

    if (modalFormKategoriInstance) {
        modalFormKategoriInstance.show();
    }
}

/**
 * Membuka modal tambah kategori cepat langsung dari dalam modal Tambah/Edit Barang.
 */
function bukaModalTambahKategoriDariBarang() {
    kategoriDibukaDariFormBarang = true;
    if (typeof modalFormInstance !== 'undefined' && modalFormInstance) {
        modalFormInstance.hide();
    }
    bukaModalTambahKategori();
}

/**
 * Membuka modal form dalam mode Edit Kategori.
 * @param {string|number} id 
 */
function bukaModalEditKategori(id) {
    const semuaKategori = typeof getKategori === 'function' ? getKategori() : [];
    const kat = semuaKategori.find(k => String(k.id) === String(id));
    if (!kat) return;

    document.getElementById('modalFormKategoriTitle').textContent = 'Edit Kategori';
    document.getElementById('kategoriId').value = kat.id;
    document.getElementById('namaKategoriInput').value = kat.nama;

    const btnHapus = document.getElementById('btnHapusDariModalKategori');
    if (btnHapus) btnHapus.classList.remove('d-none');

    resetFormKategoriErrors();

    if (modalFormKategoriInstance) {
        modalFormKategoriInstance.show();
    }
}

/**
 * Menghandle submit simpan (Tambah atau Ubah) kategori.
 * @param {Event} e 
 */
function handleSimpanKategori(e) {
    e.preventDefault();

    const id = document.getElementById('kategoriId').value.trim();
    const nama = document.getElementById('namaKategoriInput').value.trim();

    resetFormKategoriErrors();

    // Validasi frontend
    if (!nama) {
        setKategoriError('Nama kategori wajib diisi.');
        return;
    }
    if (nama.length < 2 || nama.length > 30) {
        setKategoriError('Nama kategori harus antara 2 sampai 30 karakter.');
        return;
    }

    let hasil = null;
    if (id) {
        // Mode Ubah
        hasil = ubahKategori(id, { nama: nama, ikon: '' });
    } else {
        // Mode Tambah
        hasil = tambahKategori({ nama: nama, ikon: '' });
    }

    if (!hasil || !hasil.success) {
        setKategoriError(hasil ? hasil.message : 'Terjadi kesalahan saat menyimpan kategori.');
        return;
    }

    // Sukses simpan
    if (modalFormKategoriInstance) {
        modalFormKategoriInstance.hide();
    }

    tampilkanToast(id ? 'Kategori berhasil diperbarui!' : 'Kategori baru berhasil ditambahkan!');

    // Jika ada halaman kelola kategori, perbarui tabel dan kartu
    renderHalamanKategori();

    // Jika berada di halaman admin stok, perbarui dropdown kategori dan tabel barang
    if (typeof inisialisasiPilihanKategori === 'function') {
        inisialisasiPilihanKategori();
    }
    if (typeof renderFilterKategoriAdminUI === 'function') {
        renderFilterKategoriAdminUI();
    }
    if (typeof renderHalamanAdmin === 'function') {
        renderHalamanAdmin();
    }

    // Jika dibuka dari form barang, otomatis pilih kategori yang baru dibuat
    if (kategoriDibukaDariFormBarang && !id && hasil.data) {
        setTimeout(() => {
            const selectKat = document.getElementById('kategoriBarang');
            if (selectKat) {
                selectKat.value = hasil.data.nama;
                if (typeof updateSaranProdukBerdasarkanKategori === 'function') {
                    updateSaranProdukBerdasarkanKategori(hasil.data.nama, true);
                }
            }
        }, 350);
    }
}

/**
 * Membuka modal konfirmasi hapus kategori.
 * Memeriksa apakah kategori berisi barang; jika ya, tampilkan pemberitahuan barang dipindah ke "Lainnya".
 * @param {string|number} id 
 */
function bukaModalHapusKategori(id) {
    const semuaKategori = typeof getKategori === 'function' ? getKategori() : [];
    const kat = semuaKategori.find(k => String(k.id) === String(id));
    if (!kat) return;

    idKategoriHapus = id;
    const elNama = document.getElementById('namaKategoriHapus');
    if (elNama) {
        elNama.textContent = `"${kat.nama}"`;
    }

    const jumlahBarang = typeof hitungBarangDiKategori === 'function' ? hitungBarangDiKategori(kat.nama) : 0;
    const alertBox = document.getElementById('alertPindahBarang');
    const pesanBox = document.getElementById('pesanPindahBarang');

    if (jumlahBarang > 0) {
        if (pesanBox) {
            pesanBox.innerHTML = `Kategori ini berisi <strong>${jumlahBarang} barang</strong>. Semua barang tersebut akan otomatis dialihkan ke kategori lain yang masih ada.`;
        }
        if (alertBox) alertBox.classList.remove('d-none');
    } else {
        if (alertBox) alertBox.classList.add('d-none');
    }

    if (modalHapusKategoriInstance) {
        modalHapusKategoriInstance.show();
    }
}

/**
 * Menghandle eksekusi hapus kategori setelah konfirmasi.
 */
function handleProsesHapusKategori() {
    if (!idKategoriHapus) return;

    const hasil = hapusKategori(idKategoriHapus);
    idKategoriHapus = null;

    if (modalHapusKategoriInstance) {
        modalHapusKategoriInstance.hide();
    }

    if (hasil && hasil.success) {
        if (hasil.totalDipindahkan > 0) {
            tampilkanToast(`Kategori berhasil dihapus. ${hasil.totalDipindahkan} barang dialihkan ke '${hasil.kategoriTujuan || 'kategori lain'}'.`);
        } else {
            tampilkanToast('Kategori berhasil dihapus.');
        }
        renderHalamanKategori();

        // Jika berada di halaman admin stok, perbarui dropdown kategori dan tabel barang
        if (typeof inisialisasiPilihanKategori === 'function') {
            inisialisasiPilihanKategori();
        }
        if (typeof renderFilterKategoriAdminUI === 'function') {
            renderFilterKategoriAdminUI();
        }
        if (typeof renderHalamanAdmin === 'function') {
            renderHalamanAdmin();
        }
    } else {
        tampilkanToast(hasil ? hasil.message : 'Gagal menghapus kategori.', true);
    }
}

/**
 * Menampilkan pesan error validasi pada form modal kategori.
 * @param {string} message 
 */
function setKategoriError(message) {
    const input = document.getElementById('namaKategoriInput');
    const errorEl = document.getElementById('namaKategoriError');
    if (input) input.classList.add('is-invalid');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove('d-none');
    }
}

/**
 * Mereset status error form modal kategori.
 */
function resetFormKategoriErrors() {
    const input = document.getElementById('namaKategoriInput');
    const errorEl = document.getElementById('namaKategoriError');
    if (input) input.classList.remove('is-invalid');
    if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.add('d-none');
    }
}

/**
 * Menampilkan notifikasi Toast Bootstrap pada pojok layar.
 * @param {string} pesan 
 * @param {boolean} isWarning 
 */
function tampilkanToast(pesan, isWarning = false) {
    const elPesan = document.getElementById('toastPesan');
    const elToast = document.getElementById('adminToast');
    if (elPesan) elPesan.textContent = pesan;
    if (elToast) {
        const toast = new bootstrap.Toast(elToast, { delay: 3500 });
        toast.show();
    }
}

/**
 * Sanitasi string sederhana untuk mencegah XSS saat render nama.
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
