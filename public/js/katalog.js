/**
 * ==============================================================================
 * LOGIKA TAMPILAN KATALOG TB. SUMBER BAROKAH MALANG
 * ==============================================================================
 * File ini menangani seluruh interaksi antarmuka pengguna pada halaman katalog:
 * - Dropdown pilihan kategori di toolbar ("Pilih Kategori")
 * - Mengambil data langsung dari data layer (stok-store.js lewat getBarang)
 * - Ketika memilih "Semua": seluruh barang ditampilkan campur dalam satu grid kartu rapi
 * - Ketika memilih kategori tertentu (misal: "Semen"): HANYA produk pada kategori
 *   tersebut yang ditampilkan (contoh: Semen Gresik, Semen Tiga Roda, dll.)
 * - Sinkronisasi URL query string (?kategori=...) tanpa reload via history.replaceState
 * - Pengurutan harga dan nama barang
 * - Sinkronisasi otomatis antar-tab menggunakan event listener 'storage'
 */

// State filter, kategori, & pencarian aktif
let filterAktif = {
    kategori: 'Semua', // 'Semua' atau nama kategori spesifik (contoh: 'Semen')
    keyword: '',
    sort: 'nama-asc'   // 'nama-asc' | 'harga-asc' | 'harga-desc'
};

// State modal pilih jumlah pembelian & modal detail barang
let modalPilihJumlahInstance = null;
let barangAktifModal = null;
let modalDetailBarangInstance = null;
let barangAktifDetail = null;

document.addEventListener('DOMContentLoaded', function () {
    // 1. Baca parameter kategori dari URL jika ada (?kategori=...)
    inisialisasiKategoriDariUrl();

    // 2. Inisialisasi event listener elemen toolbar (pilih kategori, pencarian, & urutan)
    inisialisasiToolbar();

    // 3. Inisialisasi modal pilih jumlah barang yang dibeli
    inisialisasiModalPilihJumlah();

    // 4. Inisialisasi modal lihat detail barang
    inisialisasiModalDetailBarang();

    // 5. Inisialisasi navigasi browser (tombol back/forward)
    inisialisasiNavigasiUrl();

    // 6. Inisialisasi sinkronisasi otomatis antar-tab via localStorage
    inisialisasiSinkronisasiStorage();

    // 7. Render opsi dropdown kategori dan daftar barang
    renderDropdownKategori();
    jalankanFilterDanRender();
});

/**
 * Membaca query parameter ?kategori= dari URL saat halaman pertama kali dimuat.
 */
function inisialisasiKategoriDariUrl() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const paramKategori = urlParams.get('kategori');
        if (paramKategori && paramKategori.trim()) {
            const daftarKategoriAktif = typeof getKategori === 'function' ? getKategori().map(k => k.nama.toLowerCase()) : [];
            if (daftarKategoriAktif.includes(paramKategori.trim().toLowerCase())) {
                filterAktif.kategori = paramKategori.trim();
            } else {
                // Jika kategori dari URL sudah tidak ada lagi (dihapus admin), reset ke Semua
                filterAktif.kategori = 'Semua';
                const url = new URL(window.location);
                url.searchParams.delete('kategori');
                window.history.replaceState(null, '', url.pathname + url.search);
            }
        }
    } catch (e) {
        console.warn("Gagal membaca query parameter:", e);
    }
}

/**
 * Mendengarkan perubahan history browser (Back / Forward) agar filter kategori sinkron.
 */
function inisialisasiNavigasiUrl() {
    window.addEventListener('popstate', function () {
        const urlParams = new URLSearchParams(window.location.search);
        filterAktif.kategori = urlParams.get('kategori') || 'Semua';
        renderDropdownKategori();
        jalankanFilterDanRender();
    });
}

/**
 * Memasang event listener pada input pencarian, dropdown pilih kategori, dan select urutan.
 */
function inisialisasiToolbar() {
    // 1. Input Pencarian
    const searchInput = document.getElementById('searchKatalog');
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            filterAktif.keyword = e.target.value.trim().toLowerCase();
            jalankanFilterDanRender();
        });
    }

    // 2. Dropdown Pilih Kategori
    const kategoriSelect = document.getElementById('filterKategoriKatalog');
    if (kategoriSelect) {
        kategoriSelect.addEventListener('change', function (e) {
            setKategoriAktif(e.target.value);
        });
    }

    // 3. Dropdown Pengurutan
    const sortSelect = document.getElementById('sortKatalog');
    if (sortSelect) {
        sortSelect.addEventListener('change', function (e) {
            filterAktif.sort = e.target.value;
            jalankanFilterDanRender();
        });
    }
}

/**
 * Sinkronisasi Otomatis Antar Tab:
 * Ketika admin melakukan Tambah, Ubah, atau Hapus barang di halaman /admin pada tab lain,
 * event 'storage' akan terpanggil dan halaman katalog otomatis merender ulang data terbaru.
 */
function inisialisasiSinkronisasiStorage() {
    window.addEventListener('storage', function (e) {
        if (e.key === 'sb_barang' || e.key === 'sb_kategori' || e.key === 'sb_keranjang') {
            // Periksa apakah kategori aktif masih ada
            const daftarKategoriAktif = typeof getKategori === 'function' ? getKategori().map(k => k.nama.toLowerCase()) : [];
            if (filterAktif.kategori !== 'Semua' && !daftarKategoriAktif.includes(filterAktif.kategori.toLowerCase())) {
                filterAktif.kategori = 'Semua';
                try {
                    const url = new URL(window.location);
                    url.searchParams.delete('kategori');
                    window.history.replaceState(null, '', url.pathname + url.search);
                } catch (err) {}
            }
            renderDropdownKategori();
            jalankanFilterDanRender();
        }
    });
}

/**
 * Mengisi opsi pada elemen dropdown "Pilih Kategori" di toolbar
 * beserta badge jumlah produk per kategori.
 */
function renderDropdownKategori() {
    const selectKat = document.getElementById('filterKategoriKatalog');
    if (!selectKat) return;

    const daftarKategori = typeof getKategori === 'function' ? getKategori() : [];
    const counts = typeof hitungPerKategori === 'function' ? hitungPerKategori() : {};
    const semuaBarang = typeof getBarang === 'function' ? getBarang() : [];
    const totalBarang = semuaBarang.length;

    let optionsHtml = `<option value="Semua">Semua Kategori (${totalBarang})</option>`;

    daftarKategori.forEach(kat => {
        const count = counts[kat.nama] || 0;
        const isSelected = (filterAktif.kategori.toLowerCase() === kat.nama.toLowerCase());

        // Hanya tampilkan kategori yang memiliki barang (> 0) atau sedang dipilih
        if (count > 0 || isSelected) {
            optionsHtml += `
                <option value="${escapeHtml(kat.nama)}" ${isSelected ? 'selected' : ''}>
                    ${escapeHtml(kat.nama)} (${count})
                </option>
            `;
        }
    });

    selectKat.innerHTML = optionsHtml;
}

/**
 * Mengubah filter kategori aktif dan memperbarui query parameter URL tanpa refresh halaman.
 * @param {string} namaKategori 
 */
function setKategoriAktif(namaKategori) {
    filterAktif.kategori = namaKategori || 'Semua';

    // Sinkronisasi query parameter URL (/katalog?kategori=Semen)
    try {
        const url = new URL(window.location);
        if (filterAktif.kategori === 'Semua') {
            url.searchParams.delete('kategori');
        } else {
            url.searchParams.set('kategori', filterAktif.kategori);
        }
        window.history.replaceState(null, '', url.pathname + url.search);
    } catch (e) {
        console.warn("Gagal memperbarui URL state:", e);
    }

    renderDropdownKategori();
    jalankanFilterDanRender();
}

/**
 * Memproses filter kategori, pencarian, dan pengurutan data barang.
 * - Jika pill "Semua" dipilih: semua barang ditampilkan campur dalam satu grid rapi.
 * - Jika kategori tertentu dipilih (misal: "Semen"): HANYA menampilkan barang
 *   dengan kategori tersebut (contoh: Semen Gresik, Semen Tiga Roda, dll.)
 */
function jalankanFilterDanRender() {
    const container = document.getElementById('katalogContainer');
    const countEl = document.getElementById('katalogCount');
    if (!container) return;

    const semuaBarang = typeof getBarang === 'function' ? getBarang() : [];

    // Jika katalog toko benar-benar kosong
    if (semuaBarang.length === 0) {
        if (countEl) countEl.textContent = 'Menampilkan 0 barang';
        container.innerHTML = `
            <div class="katalog-empty-state">
                <i class="bi bi-shop-window katalog-empty-icon"></i>
                <h3 class="katalog-empty-title">Katalog Belum Tersedia</h3>
                <p class="katalog-empty-desc">
                    Katalog barang belum tersedia. Silakan kembali lagi nanti saat stok sudah ditambahkan.
                </p>
            </div>
        `;
        return;
    }

    // Filter barang berdasarkan kategori yang dipilih dan kata kunci pencarian
    let hasil = semuaBarang.filter(item => {
        const itemKategori = item.kategori || (typeof tebakKategori === 'function' ? tebakKategori(item.nama) : 'Lainnya');
        const cocokKategori = (filterAktif.kategori === 'Semua') || (itemKategori.toLowerCase() === filterAktif.kategori.toLowerCase());
        const cocokKeyword = !filterAktif.keyword || item.nama.toLowerCase().includes(filterAktif.keyword);
        return cocokKategori && cocokKeyword;
    });

    // Urutkan hasil pencarian / filter kategori
    urutkanDaftarBarang(hasil);

    // Update teks jumlah hasil di toolbar
    if (countEl) {
        if (filterAktif.kategori !== 'Semua') {
            countEl.textContent = `Kategori "${filterAktif.kategori}": Menampilkan ${hasil.length} barang`;
        } else if (filterAktif.keyword) {
            countEl.textContent = `Menampilkan ${hasil.length} barang hasil pencarian`;
        } else {
            countEl.textContent = `Menampilkan seluruh ${hasil.length} barang`;
        }
    }

    // Tampilkan pesan jika tidak ada barang yang sesuai
    if (hasil.length === 0) {
        container.innerHTML = `
            <div class="katalog-empty-state">
                <i class="bi bi-search katalog-empty-icon"></i>
                <h3 class="katalog-empty-title">Barang Tidak Ditemukan</h3>
                <p class="katalog-empty-desc">
                    Tidak ada material pada kategori <strong>${escapeHtml(filterAktif.kategori)}</strong> yang sesuai dengan pencarian Anda.
                </p>
                <button type="button" class="btn btn-sm btn-primary-custom" onclick="resetFilterKatalog()">
                    <i class="bi bi-arrow-counterclockwise me-1"></i>
                    Tampilkan Semua Kategori
                </button>
            </div>
        `;
        return;
    }

    // Header khusus hanya jika pengguna sedang memilih satu kategori tertentu (misal: "Semen")
    let headerKategoriTerpilih = '';
    if (filterAktif.kategori !== 'Semua') {
        headerKategoriTerpilih = `
            <div class="katalog-category-heading mb-4">
                <h2 class="katalog-category-title">
                    <span>Kategori: ${escapeHtml(filterAktif.kategori)}</span>
                </h2>
                <div class="d-flex align-items-center gap-2">
                    <span class="katalog-category-total">${hasil.length} Barang</span>
                    <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1" style="font-size: 0.8rem;" onclick="setKategoriAktif('Semua')">
                        <i class="bi bi-grid me-1"></i> Tampilkan Semua Barang
                    </button>
                </div>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="katalog-category-group">
            ${headerKategoriTerpilih}
            <div class="row g-4">
                ${hasil.map(b => generateKartuHtml(b)).join('')}
            </div>
        </div>
    `;
}

/**
 * Mengurutkan array barang sesuai konfigurasi sorting.
 * @param {Array} daftar 
 */
function urutkanDaftarBarang(daftar) {
    daftar.sort((a, b) => {
        if (filterAktif.sort === 'nama-asc') {
            return a.nama.localeCompare(b.nama, 'id');
        }
        if (filterAktif.sort === 'harga-asc') {
            return (parseInt(a.harga, 10) || 0) - (parseInt(b.harga, 10) || 0);
        }
        if (filterAktif.sort === 'harga-desc') {
            return (parseInt(b.harga, 10) || 0) - (parseInt(a.harga, 10) || 0);
        }
        return 0;
    });
}

/**
 * Menghasilkan HTML kartu produk untuk satu barang.
 * Dilengkapi ikon kategori, label kategori kecil di atas judul, dan satuan barang.
 * @param {Object} barang 
 * @returns {string} HTML string
 */
function generateKartuHtml(barang) {
    const statusHitung = hitungStatus(barang);
    let badgeHtml = '';
    let isHabis = false;

    if (statusHitung === 'Habis') {
        isHabis = true;
        badgeHtml = `<span class="katalog-badge katalog-badge-habis"><i class="bi bi-x-circle-fill"></i> Habis</span>`;
    } else if (statusHitung === 'Menipis') {
        badgeHtml = `<span class="katalog-badge katalog-badge-menipis"><i class="bi bi-exclamation-triangle-fill"></i> Menipis</span>`;
    } else {
        badgeHtml = `<span class="katalog-badge katalog-badge-tersedia"><i class="bi bi-check-circle-fill"></i> Tersedia</span>`;
    }

    const satuan = escapeHtml(barang.satuan || (typeof getSatuanBarang === 'function' ? getSatuanBarang(barang) : 'unit'));
    const kategoriNama = escapeHtml(barang.kategori || (typeof tebakKategori === 'function' ? tebakKategori(barang.nama) : 'Lainnya'));

    const hasVarianWarna = String(barang.kategori || '').toLowerCase() === 'cat' || (Array.isArray(barang.pilihanWarna) && barang.pilihanWarna.length > 0);
    const badgeWarnaHtml = hasVarianWarna
        ? `<span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1" style="font-size: 0.68rem; font-weight: 600;"><i class="bi bi-palette me-1"></i>Pilih Warna</span>`
        : '';

    // Kotak frame gambar produk:
    // Jika properti 'gambar' diisi path/URL gambar (contoh: "/images/semen.jpg"), otomatis menampilkan <img>.
    // Jika belum diisi, menampilkan kotak frame kosong yang rapi.
    const gambarHtml = barang.gambar
        ? `<img src="${escapeHtml(barang.gambar)}" alt="${escapeHtml(barang.nama)}" class="katalog-item-img">`
        : `<span class="katalog-image-placeholder">Foto Barang</span>`;

    return `
        <div class="col-12 col-sm-6 col-lg-3">
            <div class="katalog-card ${isHabis ? 'is-habis' : ''}">
                <div>
                    <!-- Kotak Frame Gambar Barang (Bisa Diklik Untuk Melihat Detail) -->
                    <div class="katalog-image-frame clickable ${barang.gambar ? 'has-image' : ''}" onclick="handleBukaDetailBarang('${barang.id}')" title="Klik untuk melihat detail ${escapeHtml(barang.nama)}">
                        ${gambarHtml}
                    </div>

                    <!-- Label Kategori Kecil di Atas Nama Barang & Badge Varian Warna -->
                    <div class="d-flex align-items-center justify-content-between gap-1 mb-1">
                        <div class="katalog-item-category mb-0" role="button" onclick="setKategoriAktif('${kategoriNama}')" title="Pilih kategori ${kategoriNama}">
                            <span>${kategoriNama}</span>
                        </div>
                        ${badgeWarnaHtml}
                    </div>

                    <!-- Nama Barang (Bisa Diklik Untuk Melihat Detail) -->
                    <h3 class="katalog-item-title clickable" onclick="handleBukaDetailBarang('${barang.id}')" title="Klik untuk melihat detail ${escapeHtml(barang.nama)}">
                        ${escapeHtml(barang.nama)}
                    </h3>

                    <!-- Harga Barang & Satuan -->
                    <div class="katalog-item-price">
                        ${formatRupiah(barang.harga)}
                        <small class="text-muted fw-normal" style="font-size: 0.82rem;">/${satuan}</small>
                    </div>
                </div>

                <!-- Footer Kartu: Stok Tersedia, Badge Status & Tombol Aksi -->
                <div class="mt-auto">
                    <div class="katalog-card-footer">
                        <span class="katalog-item-stock">
                            Stok: <strong>${parseInt(barang.stok, 10).toLocaleString('id-ID')} ${satuan}</strong>
                        </span>
                        <div>
                            ${badgeHtml}
                        </div>
                    </div>

                    ${getInfoJumlahDiKeranjangHtml(barang.id, satuan)}

                    <div class="d-flex gap-2 mt-2 w-100">
                        <button type="button" class="btn-detail-katalog" onclick="handleBukaDetailBarang('${barang.id}')" title="Lihat detail spesifikasi ${escapeHtml(barang.nama)}">
                            <i class="bi bi-eye me-1"></i>Detail
                        </button>
                        <button type="button" class="btn-tambah-keranjang-katalog flex-grow-1" onclick="handleTambahKeKeranjangKatalog('${barang.id}')" ${isHabis ? 'disabled' : ''}>
                            <i class="bi bi-cart-plus me-1"></i>${isHabis ? 'Stok Habis' : 'Beli'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Menampilkan informasi jika barang tersebut sudah ada di dalam keranjang belanja.
 * @param {string|number} idBarang 
 * @param {string} satuan 
 * @returns {string} HTML badge info jumlah di keranjang
 */
function getInfoJumlahDiKeranjangHtml(idBarang, satuan) {
    const keranjang = typeof getKeranjang === 'function' ? getKeranjang() : [];
    const itemKeranjang = keranjang.find(k => String(k.idBarang) === String(idBarang));
    if (!itemKeranjang || !itemKeranjang.jumlah || itemKeranjang.jumlah <= 0) {
        return '';
    }
    return `
        <div class="katalog-in-cart-info">
            <i class="bi bi-bag-check-fill me-1"></i>
            Sudah dipilih: <strong>${parseInt(itemKeranjang.jumlah, 10).toLocaleString('id-ID')} ${satuan}</strong>
        </div>
    `;
}

/**
 * Inisialisasi komponen Modal Pilih Jumlah Pembelian beserta event listener tombol +/- dan konfirmasi.
 */
function inisialisasiModalPilihJumlah() {
    const elModal = document.getElementById('modalPilihJumlahKatalog');
    if (elModal) {
        modalPilihJumlahInstance = new bootstrap.Modal(elModal);
    }

    const btnKurang = document.getElementById('btnModalKurangQty');
    const btnTambah = document.getElementById('btnModalTambahQty');
    const inputQty = document.getElementById('inputModalJumlahBeli');
    const btnKonfirmasi = document.getElementById('btnKonfirmasiTambahKeranjang');

    if (btnKurang) {
        btnKurang.addEventListener('click', function () {
            ubahQtyModalKatalog(-1);
        });
    }

    if (btnTambah) {
        btnTambah.addEventListener('click', function () {
            ubahQtyModalKatalog(1);
        });
    }

    if (inputQty) {
        inputQty.addEventListener('input', function () {
            updateSubtotalModalKatalog();
        });
    }

    if (btnKonfirmasi) {
        btnKonfirmasi.addEventListener('click', function () {
            konfirmasiSimpanKeKeranjangKatalog();
        });
    }
}

/**
 * Membuka modal untuk mengatur jumlah barang yang ingin dibeli ketika tombol "Tambahkan ke Keranjang" diklik.
 * @param {string|number} idBarang 
 */
function handleTambahKeKeranjangKatalog(idBarang) {
    // Validasi status login: Pengguna tanpa akun dialihkan untuk login terlebih dahulu
    if (typeof isUserLoggedIn === 'function' && !isUserLoggedIn()) {
        window.location.href = '/login?redirect=katalog&pesan=login_tambah_keranjang';
        return;
    }

    const semuaBarang = typeof getBarang === 'function' ? getBarang() : [];
    const barang = semuaBarang.find(b => String(b.id) === String(idBarang));
    if (!barang) return;

    const stokTersedia = parseInt(barang.stok, 10) || 0;
    if (stokTersedia <= 0) {
        tampilkanToastKatalog(`Maaf, stok "${barang.nama}" sedang habis.`);
        return;
    }

    barangAktifModal = barang;
    const satuan = barang.satuan || (typeof getSatuanBarang === 'function' ? getSatuanBarang(barang) : 'unit');
    const kategoriNama = barang.kategori || (typeof tebakKategori === 'function' ? tebakKategori(barang.nama) : 'Material');

    const elId = document.getElementById('modalJumlahIdBarang');
    const elKategori = document.getElementById('modalJumlahKategori');
    const elNama = document.getElementById('modalJumlahNamaBarang');
    const elHarga = document.getElementById('modalJumlahHargaSatuan');
    const elStok = document.getElementById('modalJumlahStokTersedia');
    const elSatuan = document.getElementById('modalJumlahSatuanLabel');
    const inputQty = document.getElementById('inputModalJumlahBeli');
    const errorEl = document.getElementById('modalJumlahError');

    if (elId) elId.value = barang.id;
    if (elKategori) elKategori.textContent = kategoriNama;
    if (elNama) elNama.textContent = barang.nama;
    if (elHarga) elHarga.innerHTML = `${formatRupiah(barang.harga)} <small class="text-muted fw-normal">/${escapeHtml(satuan)}</small>`;
    if (elStok) elStok.innerHTML = `Stok tersedia: <strong>${stokTersedia.toLocaleString('id-ID')} ${escapeHtml(satuan)}</strong>`;
    if (elSatuan) elSatuan.textContent = satuan;
    if (errorEl) errorEl.classList.add('d-none');

    // Tampilkan foto produk di dalam modal jika tersedia
    const elModalImg = document.getElementById('modalJumlahImg');
    const elModalIcon = document.getElementById('modalJumlahIconFallback');
    if (elModalImg && elModalIcon) {
        if (barang.gambar) {
            elModalImg.src = barang.gambar;
            elModalImg.classList.remove('d-none');
            elModalIcon.classList.add('d-none');
        } else {
            elModalImg.src = '';
            elModalImg.classList.add('d-none');
            elModalIcon.classList.remove('d-none');
        }
    }

    if (inputQty) {
        inputQty.value = 1;
        inputQty.min = 1;
        inputQty.max = stokTersedia;
    }

    // Tampilkan / sembunyikan pemilihan variasi warna (khusus kategori Cat atau barang dengan opsi warna)
    const wrapperWarna = document.getElementById('wrapperModalPilihanWarna');
    const selectWarna = document.getElementById('selectModalWarnaBarang');
    const badgeWarna = document.getElementById('badgeWarnaTerpilih');

    const listWarna = (Array.isArray(barang.pilihanWarna) && barang.pilihanWarna.length > 0)
        ? barang.pilihanWarna
        : (String(barang.kategori || '').toLowerCase() === 'cat' ? ['Putih Salju', 'Putih Tulang', 'Krem Lembut', 'Abu-abu Modern', 'Biru Cerah', 'Hijau Muda', 'Hitam Kilap'] : []);

    if (wrapperWarna && selectWarna) {
        if (listWarna.length > 0) {
            selectWarna.innerHTML = listWarna.map(w => `<option value="${escapeHtml(w)}">${escapeHtml(w)}</option>`).join('');
            if (badgeWarna) badgeWarna.textContent = listWarna[0];
            wrapperWarna.classList.remove('d-none');

            selectWarna.onchange = function () {
                if (badgeWarna) badgeWarna.textContent = selectWarna.value;
            };
        } else {
            selectWarna.innerHTML = '';
            wrapperWarna.classList.add('d-none');
        }
    }

    updateSubtotalModalKatalog();

    if (modalPilihJumlahInstance) {
        modalPilihJumlahInstance.show();
    }
}

/**
 * Mengubah angka pada input jumlah di modal dengan tombol - atau +.
 * @param {number} delta 
 */
function ubahQtyModalKatalog(delta) {
    if (!barangAktifModal) return;
    const inputQty = document.getElementById('inputModalJumlahBeli');
    if (!inputQty) return;

    const stokMaks = parseInt(barangAktifModal.stok, 10) || 1;
    let nilai = (parseInt(inputQty.value, 10) || 1) + delta;

    if (nilai < 1) nilai = 1;
    if (nilai > stokMaks) nilai = stokMaks;

    inputQty.value = nilai;
    updateSubtotalModalKatalog();
}

/**
 * Menghitung dan memperbarui tampilan subtotal harga secara langsung saat jumlah berubah.
 */
function updateSubtotalModalKatalog() {
    if (!barangAktifModal) return;
    const inputQty = document.getElementById('inputModalJumlahBeli');
    const elSubtotal = document.getElementById('modalJumlahSubtotal');
    const errorEl = document.getElementById('modalJumlahError');
    if (!inputQty || !elSubtotal) return;

    const stokMaks = parseInt(barangAktifModal.stok, 10) || 0;
    const satuan = barangAktifModal.satuan || (typeof getSatuanBarang === 'function' ? getSatuanBarang(barangAktifModal) : 'unit');
    let qty = parseInt(inputQty.value, 10);

    if (isNaN(qty) || qty < 1) {
        if (errorEl) {
            errorEl.textContent = 'Jumlah pembelian minimal 1.';
            errorEl.classList.remove('d-none');
        }
        elSubtotal.textContent = formatRupiah(0);
        return;
    }

    if (qty > stokMaks) {
        if (errorEl) {
            errorEl.textContent = `Jumlah melebihi stok tersedia (maksimal ${stokMaks} ${satuan}).`;
            errorEl.classList.remove('d-none');
        }
    } else {
        if (errorEl) errorEl.classList.add('d-none');
    }

    const subtotal = qty * (parseInt(barangAktifModal.harga, 10) || 0);
    elSubtotal.textContent = formatRupiah(subtotal);
}

/**
 * Menyimpan barang beserta jumlah yang telah dipilih di modal ke dalam keranjang belanja.
 */
function konfirmasiSimpanKeKeranjangKatalog() {
    if (!barangAktifModal) return;

    const inputQty = document.getElementById('inputModalJumlahBeli');
    const errorEl = document.getElementById('modalJumlahError');
    const stokMaks = parseInt(barangAktifModal.stok, 10) || 0;
    const satuan = barangAktifModal.satuan || (typeof getSatuanBarang === 'function' ? getSatuanBarang(barangAktifModal) : 'unit');
    const qty = inputQty ? parseInt(inputQty.value, 10) : 1;

    if (isNaN(qty) || qty < 1) {
        if (errorEl) {
            errorEl.textContent = 'Masukkan jumlah barang minimal 1.';
            errorEl.classList.remove('d-none');
        }
        return;
    }

    if (qty > stokMaks) {
        if (errorEl) {
            errorEl.textContent = `Stok tidak mencukupi. Maksimal pembelian adalah ${stokMaks} ${satuan}.`;
            errorEl.classList.remove('d-none');
        }
        return;
    }

    // Ambil warna jika produk memiliki varian warna
    const wrapperWarna = document.getElementById('wrapperModalPilihanWarna');
    const selectWarna = document.getElementById('selectModalWarnaBarang');
    const warnaTerpilih = (wrapperWarna && !wrapperWarna.classList.contains('d-none') && selectWarna)
        ? selectWarna.value.trim()
        : '';

    const idSimpan = warnaTerpilih
        ? `${barangAktifModal.id}_${warnaTerpilih.replace(/\s+/g, '_').toLowerCase()}`
        : barangAktifModal.id;

    const namaSimpan = warnaTerpilih
        ? `${barangAktifModal.nama} (${warnaTerpilih})`
        : barangAktifModal.nama;

    // Periksa total bila barang sudah ada di keranjang sebelumnya
    const keranjang = typeof getKeranjang === 'function' ? getKeranjang() : [];
    const itemDiKeranjang = keranjang.find(k => String(k.idBarang) === String(idSimpan));
    const qtySaatIniDiKeranjang = itemDiKeranjang ? (parseInt(itemDiKeranjang.jumlah, 10) || 0) : 0;
    if ((qty + qtySaatIniDiKeranjang) > stokMaks) {
        if (errorEl) {
            errorEl.textContent = `Total di keranjang (${qtySaatIniDiKeranjang}) + pilihan (${qty}) melebihi stok yang tersedia (${stokMaks} ${satuan}).`;
            errorEl.classList.remove('d-none');
        }
        return;
    }

    if (typeof tambahKeKeranjang === 'function') {
        tambahKeKeranjang({
            idBarang: idSimpan,
            idMasterBarang: barangAktifModal.id,
            nama: namaSimpan,
            warna: warnaTerpilih,
            harga: barangAktifModal.harga,
            satuan: satuan,
            jumlah: qty
        });
    }

    if (modalPilihJumlahInstance) {
        modalPilihJumlahInstance.hide();
    }

    if (typeof updateNavbarBadgeKeranjang === 'function') {
        updateNavbarBadgeKeranjang();
    }

    // Perbarui kartu agar menampilkan indikator jumlah barang yang sudah dipilih
    jalankanFilterDanRender();

    tampilkanToastKatalog(`${qty} ${satuan} "${namaSimpan}" berhasil ditambahkan ke keranjang!`);
}

/**
 * Menampilkan toast notifikasi ketika barang ditambahkan ke keranjang.
 * @param {string} pesan 
 */
function tampilkanToastKatalog(pesan) {
    const toastEl = document.getElementById('katalogToast');
    const pesanEl = document.getElementById('toastKatalogPesan');
    if (toastEl && pesanEl) {
        pesanEl.textContent = pesan;
        const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 2500 });
        toast.show();
    }
}

/**
 * Mereset filter kategori, form pencarian, dan dropdown urutan ke posisi default.
 */
function resetFilterKatalog() {
    filterAktif = {
        kategori: 'Semua',
        keyword: '',
        sort: 'nama-asc'
    };

    try {
        const url = new URL(window.location);
        url.searchParams.delete('kategori');
        window.history.replaceState(null, '', url.pathname + url.search);
    } catch (e) {
        console.warn("Gagal mereset URL:", e);
    }

    const searchInput = document.getElementById('searchKatalog');
    if (searchInput) searchInput.value = '';

    const sortSelect = document.getElementById('sortKatalog');
    if (sortSelect) sortSelect.value = 'nama-asc';

    renderDropdownKategori();
    jalankanFilterDanRender();
}

/**
 * Mencegah XSS pada teks yang dimasukkan pengguna.
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

/**
 * ==============================================================================
 * MODUL MODAL DETAIL BARANG (INFORMASI LENGKAP & PEMBELIAN)
 * ==============================================================================
 */

/**
 * Inisialisasi komponen Modal Detail Barang dan event listener tombol kuantitas & keranjang.
 */
function inisialisasiModalDetailBarang() {
    const elModal = document.getElementById('modalDetailBarang');
    if (elModal) {
        modalDetailBarangInstance = new bootstrap.Modal(elModal);
    }

    const btnKurang = document.getElementById('btnDetailKurangQty');
    const btnTambah = document.getElementById('btnDetailTambahQty');
    const inputQty = document.getElementById('detailInputQty');
    const btnBeli = document.getElementById('btnDetailTambahKeranjang');

    if (btnKurang) {
        btnKurang.addEventListener('click', function () {
            ubahQtyDetailModal(-1);
        });
    }

    if (btnTambah) {
        btnTambah.addEventListener('click', function () {
            ubahQtyDetailModal(1);
        });
    }

    if (inputQty) {
        inputQty.addEventListener('input', function () {
            updateSubtotalDetailModal();
        });
    }

    if (btnBeli) {
        btnBeli.addEventListener('click', function () {
            konfirmasiSimpanKeKeranjangDariDetail();
        });
    }
}

/**
 * Membuka modal detail barang dengan informasi lengkap: gambar, spesifikasi, deskripsi, stok, dan pembelian.
 * @param {string|number} idBarang 
 */
function handleBukaDetailBarang(idBarang) {
    const semuaBarang = typeof getBarang === 'function' ? getBarang() : [];
    const barang = semuaBarang.find(b => String(b.id) === String(idBarang));
    if (!barang) return;

    barangAktifDetail = barang;
    const satuan = escapeHtml(barang.satuan || (typeof getSatuanBarang === 'function' ? getSatuanBarang(barang) : 'unit'));
    const kategoriNama = escapeHtml(barang.kategori || (typeof tebakKategori === 'function' ? tebakKategori(barang.nama) : 'Material'));
    const stokTersedia = parseInt(barang.stok, 10) || 0;
    const statusHitung = hitungStatus(barang);

    // 1. Gambar Produk
    const imgEl = document.getElementById('detailImgProduk');
    const placeholderEl = document.getElementById('detailImgPlaceholder');
    if (imgEl && placeholderEl) {
        if (barang.gambar && String(barang.gambar).trim()) {
            imgEl.src = barang.gambar;
            imgEl.alt = barang.nama;
            imgEl.classList.remove('d-none');
            placeholderEl.classList.add('d-none');
        } else {
            imgEl.src = '';
            imgEl.classList.add('d-none');
            placeholderEl.classList.remove('d-none');
        }
    }

    // 2. Kategori, Judul, dan Harga
    const badgeKat = document.getElementById('detailKategoriBadge');
    if (badgeKat) {
        badgeKat.innerHTML = `<i class="bi bi-tag-fill me-1"></i>${kategoriNama}`;
        badgeKat.style.cursor = 'pointer';
        badgeKat.onclick = function () {
            if (modalDetailBarangInstance) modalDetailBarangInstance.hide();
            setKategoriAktif(kategoriNama);
        };
    }

    const namaEl = document.getElementById('detailNamaBarang');
    if (namaEl) namaEl.textContent = barang.nama;

    const hargaEl = document.getElementById('detailHargaBarang');
    if (hargaEl) hargaEl.textContent = formatRupiah(barang.harga);

    const satuanHargaEl = document.getElementById('detailSatuanHarga');
    if (satuanHargaEl) satuanHargaEl.textContent = `/${satuan}`;

    // 3. Status dan Stok
    const badgeStatus = document.getElementById('detailBadgeStatus');
    if (badgeStatus) {
        if (statusHitung === 'Habis') {
            badgeStatus.className = 'katalog-badge katalog-badge-habis';
            badgeStatus.innerHTML = '<i class="bi bi-x-circle-fill"></i> Habis';
        } else if (statusHitung === 'Menipis') {
            badgeStatus.className = 'katalog-badge katalog-badge-menipis';
            badgeStatus.innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i> Menipis';
        } else {
            badgeStatus.className = 'katalog-badge katalog-badge-tersedia';
            badgeStatus.innerHTML = '<i class="bi bi-check-circle-fill"></i> Tersedia';
        }
    }

    const stokEl = document.getElementById('detailStokTersedia');
    if (stokEl) {
        stokEl.textContent = `${stokTersedia.toLocaleString('id-ID')} ${satuan}`;
    }

    // 4. Deskripsi & Spesifikasi
    const deskripsiEl = document.getElementById('detailDeskripsiBarang');
    if (deskripsiEl) {
        deskripsiEl.textContent = getDeskripsiBarang(barang);
    }

    const specKat = document.getElementById('detailSpecKategori');
    if (specKat) specKat.textContent = kategoriNama;

    const specSat = document.getElementById('detailSpecSatuan');
    if (specSat) specSat.textContent = `${satuan} (Eceran & Grosir)`;

    // 5. Pilihan Warna (Khusus produk Cat / Barang dengan varian warna)
    const wrapperWarna = document.getElementById('detailWrapperWarna');
    const selectWarna = document.getElementById('detailSelectWarna');
    const badgeWarna = document.getElementById('detailBadgeWarnaTerpilih');
    const daftarWarna = Array.isArray(barang.pilihanWarna) && barang.pilihanWarna.length > 0
        ? barang.pilihanWarna
        : (String(barang.kategori || '').toLowerCase() === 'cat' ? ['Putih Salju', 'Putih Tulang', 'Krem Muda', 'Abu-abu Minimalis', 'Biru Cerah', 'Hijau Daun'] : []);

    if (wrapperWarna && selectWarna) {
        if (daftarWarna.length > 0) {
            selectWarna.innerHTML = daftarWarna.map(w => `<option value="${escapeHtml(w)}">${escapeHtml(w)}</option>`).join('');
            if (badgeWarna) badgeWarna.textContent = daftarWarna[0];
            wrapperWarna.classList.remove('d-none');
            selectWarna.onchange = function () {
                if (badgeWarna) badgeWarna.textContent = this.value;
            };
        } else {
            wrapperWarna.classList.add('d-none');
            selectWarna.innerHTML = '';
        }
    }

    // 6. Kontrol Kuantitas & Subtotal
    const inputQty = document.getElementById('detailInputQty');
    const satuanQty = document.getElementById('detailSatuanQty');
    const errorQty = document.getElementById('detailErrorQty');
    const btnBeli = document.getElementById('btnDetailTambahKeranjang');

    if (satuanQty) satuanQty.textContent = satuan;
    if (errorQty) errorQty.classList.add('d-none');

    if (inputQty) {
        inputQty.value = 1;
        inputQty.max = stokTersedia;
    }

    if (btnBeli) {
        btnBeli.disabled = (stokTersedia <= 0);
        btnBeli.innerHTML = stokTersedia <= 0
            ? '<i class="bi bi-x-circle me-1"></i> Stok Habis'
            : '<i class="bi bi-cart-plus me-1"></i> Masukkan ke Keranjang';
    }

    updateSubtotalDetailModal();

    if (modalDetailBarangInstance) {
        modalDetailBarangInstance.show();
    }
}

/**
 * Mengubah jumlah kuantitas beli pada modal detail (+ / -).
 * @param {number} delta 
 */
function ubahQtyDetailModal(delta) {
    if (!barangAktifDetail) return;
    const inputQty = document.getElementById('detailInputQty');
    if (!inputQty) return;

    const stokMaks = parseInt(barangAktifDetail.stok, 10) || 0;
    let current = parseInt(inputQty.value, 10) || 1;
    let next = current + delta;

    if (next < 1) next = 1;
    if (stokMaks > 0 && next > stokMaks) next = stokMaks;

    inputQty.value = next;
    updateSubtotalDetailModal();
}

/**
 * Memperbarui angka subtotal harga pada modal detail.
 */
function updateSubtotalDetailModal() {
    if (!barangAktifDetail) return;

    const inputQty = document.getElementById('detailInputQty');
    const elSubtotal = document.getElementById('detailSubtotalHarga');
    const errorEl = document.getElementById('detailErrorQty');
    const stokMaks = parseInt(barangAktifDetail.stok, 10) || 0;
    const satuan = barangAktifDetail.satuan || (typeof getSatuanBarang === 'function' ? getSatuanBarang(barangAktifDetail) : 'unit');

    if (!inputQty || !elSubtotal) return;

    let qty = parseInt(inputQty.value, 10);
    if (isNaN(qty) || qty < 1) {
        qty = 0;
    }

    if (stokMaks > 0 && qty > stokMaks) {
        if (errorEl) {
            errorEl.textContent = `Jumlah melebihi stok tersedia (maksimal ${stokMaks} ${satuan}).`;
            errorEl.classList.remove('d-none');
        }
    } else {
        if (errorEl) errorEl.classList.add('d-none');
    }

    const subtotal = qty * (parseInt(barangAktifDetail.harga, 10) || 0);
    elSubtotal.textContent = formatRupiah(subtotal);
}

/**
 * Menyimpan barang yang dipilih dari modal detail ke dalam keranjang belanja.
 */
function konfirmasiSimpanKeKeranjangDariDetail() {
    if (!barangAktifDetail) return;

    // Validasi login
    if (typeof isUserLoggedIn === 'function' && !isUserLoggedIn()) {
        window.location.href = '/login?redirect=katalog&pesan=login_tambah_keranjang';
        return;
    }

    const inputQty = document.getElementById('detailInputQty');
    const errorEl = document.getElementById('detailErrorQty');
    const stokMaks = parseInt(barangAktifDetail.stok, 10) || 0;
    const satuan = barangAktifDetail.satuan || (typeof getSatuanBarang === 'function' ? getSatuanBarang(barangAktifDetail) : 'unit');
    const qty = inputQty ? parseInt(inputQty.value, 10) : 1;

    if (isNaN(qty) || qty < 1) {
        if (errorEl) {
            errorEl.textContent = 'Masukkan jumlah barang minimal 1.';
            errorEl.classList.remove('d-none');
        }
        return;
    }

    if (qty > stokMaks) {
        if (errorEl) {
            errorEl.textContent = `Stok tidak mencukupi. Maksimal pembelian adalah ${stokMaks} ${satuan}.`;
            errorEl.classList.remove('d-none');
        }
        return;
    }

    // Ambil warna jika ada
    const wrapperWarna = document.getElementById('detailWrapperWarna');
    const selectWarna = document.getElementById('detailSelectWarna');
    const warnaTerpilih = (wrapperWarna && !wrapperWarna.classList.contains('d-none') && selectWarna)
        ? selectWarna.value.trim()
        : '';

    const idSimpan = warnaTerpilih
        ? `${barangAktifDetail.id}_${warnaTerpilih.replace(/\s+/g, '_').toLowerCase()}`
        : barangAktifDetail.id;

    const namaSimpan = warnaTerpilih
        ? `${barangAktifDetail.nama} (${warnaTerpilih})`
        : barangAktifDetail.nama;

    // Periksa bila barang sudah ada di keranjang
    const keranjang = typeof getKeranjang === 'function' ? getKeranjang() : [];
    const itemDiKeranjang = keranjang.find(k => String(k.idBarang) === String(idSimpan));
    const qtySaatIniDiKeranjang = itemDiKeranjang ? (parseInt(itemDiKeranjang.jumlah, 10) || 0) : 0;
    if ((qty + qtySaatIniDiKeranjang) > stokMaks) {
        if (errorEl) {
            errorEl.textContent = `Total di keranjang (${qtySaatIniDiKeranjang}) + pilihan (${qty}) melebihi stok tersedia (${stokMaks} ${satuan}).`;
            errorEl.classList.remove('d-none');
        }
        return;
    }

    if (typeof tambahKeKeranjang === 'function') {
        tambahKeKeranjang({
            idBarang: idSimpan,
            idMasterBarang: barangAktifDetail.id,
            nama: namaSimpan,
            warna: warnaTerpilih,
            harga: barangAktifDetail.harga,
            satuan: satuan,
            jumlah: qty
        });
    }

    if (modalDetailBarangInstance) {
        modalDetailBarangInstance.hide();
    }

    if (typeof updateNavbarBadgeKeranjang === 'function') {
        updateNavbarBadgeKeranjang();
    }

    jalankanFilterDanRender();
    tampilkanToastKatalog(`${namaSimpan} (${qty} ${satuan}) berhasil dimasukkan ke keranjang.`);
}

/**
 * Menghasilkan deskripsi informatif realistis untuk material bangunan TB. Sumber Barokah.
 * @param {Object} barang 
 * @returns {string}
 */
function getDeskripsiBarang(barang) {
    if (barang && barang.deskripsi && String(barang.deskripsi).trim()) {
        return String(barang.deskripsi).trim();
    }

    const nama = (barang && barang.nama ? String(barang.nama).toLowerCase() : '');
    const kat = (barang && barang.kategori ? String(barang.kategori).toLowerCase() : '');

    if (kat.includes('semen') || nama.includes('semen')) {
        if (nama.includes('perekat') || nama.includes('hebel')) {
            return 'Semen mortar perekat instan khusus bata ringan (hebel). Memiliki daya rekat tinggi, hemat penggunaan spesi tipis (thin bed), dan cepat mengering kuat.';
        }
        if (nama.includes('acian')) {
            return 'Semen acian instan siap pakai untuk dinding plesteran interior maupun eksterior. Menghasilkan permukaan tembok halus tanpa retak rambut, siap dicat.';
        }
        if (nama.includes('putih')) {
            return 'Semen putih murni berkualitas prima untuk pekerjaan dekoratif, plesteran artistik, pemasangan profilan lis, dan pengisi sela keramik.';
        }
        if (nama.includes('cornice')) {
            return 'Compound perekat cornice & gypsum adhesive berkualitas tinggi untuk menyambung sela papan gypsum dan lis plafon dengan kuat dan rata.';
        }
        return 'Semen Portland Composite berkualitas tinggi berstandar SNI. Cocok untuk pasangan bata, plesteran, acian, dan adukan pengecoran struktur beton yang kokoh tahan lama.';
    }

    if (kat.includes('bata') || nama.includes('bata') || nama.includes('batako')) {
        if (nama.includes('ringan') || nama.includes('hebel')) {
            return 'Bata ringan Autoclaved Aerated Concrete (AAC) berbobot ringan, berukuran presisi, kedap suara, tahan api, dan mempercepat proses pemasangan dinding bangunan modern.';
        }
        if (nama.includes('batako')) {
            return 'Batako press semen bermutu tinggi dengan kepadatan optimal. Sangat kokoh untuk dinding pagar, gudang, maupun pembatas ruangan yang ekonomis.';
        }
        return 'Bata merah bakar asli kualitas super, padat, berukuran presisi, dan tidak mudah pecah. Memberikan kekuatan struktural dan kesejukan alami pada dinding rumah.';
    }

    if (kat.includes('cat') || nama.includes('cat')) {
        if (nama.includes('no drop')) {
            return 'Cat pelapis anti bocor serbaguna berbahan dasar elastomerik kedap air. Menutup retak rambut, sangat elastis, serta tahan terhadap terpaan hujan deras dan sinar UV.';
        }
        if (nama.includes('mowilex')) {
            return 'Cat tembok premium berbahan dasar air dengan daya sebar luas, hasil akhir matt halus mewah, ramah lingkungan, dan warna tahan lama tidak mudah pudar.';
        }
        if (nama.includes('avian')) {
            return 'Cat kayu dan besi berdaya kilap tinggi dengan formula anti karat dan anti rayap. Melindungi pagar besi, pintu, dan kusen kayu dari cuaca ekstrem.';
        }
        return 'Cat tembok interior bermutu tinggi dengan daya tutup rapat, aroma minim, dan pilihan warna cerah yang membuat suasana hunian tampak bersih dan elegan.';
    }

    if (kat.includes('keramik') || nama.includes('keramik')) {
        if (nama.includes('nat')) {
            return 'Semen pengisi rongga celah keramik (grout) formula anti jamur dan tahan rembesan air. Menjaga kerapian nat lantai dan dinding kamar mandi maupun ruang tamu.';
        }
        return 'Keramik lantai ukuran 40x40 cm berkualitas KW1 dengan permukaan mengkilap tahan gores dan mudah dibersihkan. Memberikan sentuhan elegan dan nyaman pada lantai rumah Anda.';
    }

    if (kat.includes('pasir') || nama.includes('pasir') || nama.includes('split')) {
        if (nama.includes('cor') || nama.includes('split')) {
            return 'Material cor beton berkualitas tinggi berbutir tajam, bebas kandungan lumpur organik, dan lolos uji ayak standar untuk menghasilkan adukan beton struktur K-225 ke atas.';
        }
        return 'Pasir pasang ayak murni pilihan dari Lumajang, Jawa Timur. Memiliki daya lekat semen prima untuk adukan spesi bata dan plesteran dinding halus tanpa retak.';
    }

    if (kat.includes('genteng') || nama.includes('genteng')) {
        return 'Genteng atap press berdaya tahan tinggi terhadap beban dan rembesan air hujan. Memberikan perlindungan maksimal dan tampilan atap rumah yang rapi serta estetis.';
    }

    if (kat.includes('galvalum') || nama.includes('kanal c') || nama.includes('reng') || nama.includes('hollow')) {
        return 'Baja ringan galvalum profil presisi anti karat dan anti rayap dengan ketebalan standar SNI. Ringan, kokoh, dan tahan gempa untuk konstruksi rangka atap maupun partisi plafon.';
    }

    if (kat.includes('besi') || nama.includes('besi')) {
        return 'Besi beton tulangan bersertifikasi SNI dengan toleransi presisi dan daya regang optimal untuk struktur penulangan sloof pondasi, balok, kolom, dan plat dak lantai.';
    }

    if (kat.includes('pipa') || nama.includes('pipa')) {
        return 'Pipa PVC berkualitas standar industri tahan tekanan air tinggi, tidak mudah pecah, dan bebas korosi untuk jaringan instalasi air bersih, drainase, dan talang.';
    }

    if (kat.includes('kayu') || nama.includes('kayu')) {
        return 'Kayu konstruksi pilihan bertekstur padat dan lurus, siap digunakan untuk bekisting cor, kaso plafon, usuk atap, maupun rangka penyangga pekerjaan bangunan.';
    }

    if (kat.includes('asbes') || nama.includes('gipsum') || nama.includes('kalsiboard')) {
        return 'Lembaran papan plafon dan partisi tahan lembab, mudah dipotong, dan berpermukaan rata untuk kerapian langit-langit interior maupun eksterior rumah.';
    }

    return 'Material bahan bangunan pilihan dari TB. Sumber Barokah Malang dengan standar mutu terbaik, harga bersaing, dan ketersediaan stok terjamin.';
}
