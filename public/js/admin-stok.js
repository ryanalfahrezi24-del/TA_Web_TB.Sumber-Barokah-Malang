/**
 * ==============================================================================
 * LOGIKA ANTARMUKA HALAMAN ADMIN (KELOLA STOK BARANG)
 * ==============================================================================
 * Mengelola interaksi UI halaman admin:
 * - Render ringkasan kartu statistik (Total, Menipis, Habis)
 * - Bar kategori cepat (pills) & dropdown Pilih Kategori
 * - Ketika memilih kategori tertentu (misal: "Semen"), tabel HANYA menampilkan
 *   barang dari kategori tersebut (contoh: Semen Gresik, Semen Tiga Roda, dll.)
 * - Pada modal Tambah/Edit Barang, saat memilih Kategori (misal: "Semen"),
 *   otomatis menampilkan pilihan/saran nama barang khusus kategori tersebut
 * - Validasi form & Toast notifikasi
 */

// State lokal untuk modal dan filter
let modalFormInstance = null;
let modalHapusInstance = null;
let idBarangHapus = null;
let filterKeywordAktif = '';
let filterKategoriAktif = 'Semua';

// Daftar saran produk & satuan default berdasarkan kategori yang dipilih
const SARAN_PRODUK_KATEGORI = {
    "Semen": {
        satuan: "sak",
        contoh: ["Semen Gresik 50 kg", "Semen Tiga Roda 50 kg", "Semen Dynamix / Holcim 50 kg", "Semen Padang 50 kg", "Semen Instan Mortar Utama"]
    },
    "Pasir & Batu": {
        satuan: "truk",
        contoh: ["Pasir Pasang Lumajang (Per Truk)", "Pasir Cor Kasar (Per Truk)", "Batu Split Cor 1-2 (Per Truk)", "Batu Kali Pondasi (Per Truk)"]
    },
    "Bata & Beton": {
        satuan: "buah",
        contoh: ["Bata Merah Press Malang", "Bata Ringan (Hebel) 10 cm", "Batako Press Semen", "Paving Block Bata"]
    },
    "Cat": {
        satuan: "kaleng",
        contoh: ["Cat Tembok Dulux Catylac 5 kg", "Cat Tembok Eksterior Nippon Paint 5 kg", "Cat Tembok Avitex 5 kg", "Cat Pelapis Anti Bocor No Drop 4 kg"]
    },
    "Keramik": {
        satuan: "dus",
        contoh: ["Keramik Putih Mulia 40x40 (Dus)", "Keramik Lantai Granit 60x60 (Dus)", "Keramik Roman 50x50 (Dus)"]
    },
    "Atap": {
        satuan: "buah",
        contoh: ["Genteng Keramik Kanmuri", "Genteng Beton Gelombang", "Atap Spandek Galvalum", "Seng Gelombang BJLS"]
    },
    "Kayu": {
        satuan: "batang",
        contoh: ["Kayu Kaso 4x6 x 4m (Per Batang)", "Triplek Kayu 9mm 122x244", "Kayu Reng 2x3 x 4m", "Kayu Balok Meranti 6x12"]
    },
    "Besi & Logam": {
        satuan: "batang",
        contoh: ["Besi Beton Polos 10mm SNI", "Besi Beton Ulir 12mm SNI", "Paku Kayu Campur 5-7 cm (Per Kg)", "Kawat Bendrat Hitam (Per Roll)"]
    },
    "Pipa & Plumbing": {
        satuan: "batang",
        contoh: ["Pipa PVC Wavin 3 inci", "Pipa PVC Rucika 1/2 inci", "Kran Air Kuningan 1/2 inci"]
    },
    "Perlengkapan": {
        satuan: "buah",
        contoh: ["Sekop Pasir Gagang Besi", "Cangkul Baja", "Ember Cor Plastik", "Meteran Tukang 5m"]
    },
    "Lainnya": {
        satuan: "pcs",
        contoh: ["Kuas Cat 3 inci", "Lem Pipa PVC Isarplas"]
    }
};

document.addEventListener('DOMContentLoaded', function () {
    // Inisialisasi komponen Modal Bootstrap
    const elModalForm = document.getElementById('modalFormBarang');
    const elModalHapus = document.getElementById('modalKonfirmasiHapus');

    if (elModalForm) {
        modalFormInstance = new bootstrap.Modal(elModalForm);
    }
    if (elModalHapus) {
        modalHapusInstance = new bootstrap.Modal(elModalHapus);
    }

    // Isi dropdown kategori di modal dan toolbar
    inisialisasiPilihanKategori();

    // Render awal halaman admin
    renderHalamanAdmin();

    // Event listener form tambah/edit
    const formBarang = document.getElementById('formBarang');
    if (formBarang) {
        formBarang.addEventListener('submit', handleSimpanBarang);
    }

    // Event listener pemilihan file gambar barang
    const inputGambar = document.getElementById('gambarBarang');
    if (inputGambar) {
        inputGambar.addEventListener('change', handlePilihGambarBarang);
    }

    // Event listener saat kategori di dalam modal berubah -> tampilkan pilihan produk kategori tersebut
    const selectKategoriModal = document.getElementById('kategoriBarang');
    if (selectKategoriModal) {
        selectKategoriModal.addEventListener('change', function (e) {
            updateSaranProdukBerdasarkanKategori(e.target.value, true);
        });
    }

    // Event listener tombol konfirmasi hapus
    const btnKonfirmasiHapus = document.getElementById('btnKonfirmasiHapus');
    if (btnKonfirmasiHapus) {
        btnKonfirmasiHapus.addEventListener('click', handleProsesHapus);
    }

    // Event listener pencarian instan
    const inputSearch = document.getElementById('searchBarang');
    if (inputSearch) {
        inputSearch.addEventListener('input', function (e) {
            filterKeywordAktif = e.target.value.trim().toLowerCase();
            renderRingkasanStatistikStok();
            renderTabelBarang();
        });
    }

    // Event listener filter dropdown kategori di toolbar
    const selectFilterKategori = document.getElementById('filterKategoriAdmin');
    if (selectFilterKategori) {
        selectFilterKategori.addEventListener('change', function (e) {
            setFilterKategoriAdmin(e.target.value);
        });
    }

    // Sinkronisasi otomatis saat ada perubahan kategori atau barang di tab lain
    window.addEventListener('storage', function (e) {
        if (e.key === 'sb_barang' || e.key === 'sb_kategori') {
            inisialisasiPilihanKategori();
            renderHalamanAdmin();
        }
    });
});

/**
 * Mengisi opsi kategori pada dropdown form modal, dropdown filter toolbar, dan pill kategori.
 */
function inisialisasiPilihanKategori() {
    const daftarKategori = typeof getKategori === 'function' ? getKategori() : [];

    // Dropdown Form Modal Tambah / Edit
    const formSelect = document.getElementById('kategoriBarang');
    if (formSelect) {
        formSelect.innerHTML = '<option value="" selected disabled>-- Pilih Kategori --</option>';
        daftarKategori.forEach(kat => {
            const opt = document.createElement('option');
            opt.value = kat.nama;
            opt.textContent = kat.nama;
            formSelect.appendChild(opt);
        });
    }
}

/**
 * Merender bar pill kategori cepat dan memperbarui angka jumlah produk per kategori di dropdown toolbar.
 */
function renderFilterKategoriAdminUI() {
    const daftarKategori = typeof getKategori === 'function' ? getKategori() : [];
    const counts = typeof hitungPerKategori === 'function' ? hitungPerKategori() : {};
    const semuaBarang = getBarang();
    const totalBarang = semuaBarang.length;

    // Update Dropdown Filter Kategori di Toolbar
    const filterSelect = document.getElementById('filterKategoriAdmin');
    if (filterSelect) {
        let optionsHtml = `<option value="Semua">Semua Kategori (${totalBarang})</option>`;
        daftarKategori.forEach(kat => {
            const count = counts[kat.nama] || 0;
            const isSelected = (filterKategoriAktif === kat.nama);
            optionsHtml += `<option value="${escapeHtml(kat.nama)}" ${isSelected ? 'selected' : ''}>${escapeHtml(kat.nama)} (${count})</option>`;
        });
        filterSelect.innerHTML = optionsHtml;
    }
}

/**
 * Mengaktifkan filter kategori tertentu pada halaman Admin.
 * Contoh: saat memilih "Semen", hanya produk semen (Semen Gresik, Semen Tiga Roda, dll.) yang muncul.
 * @param {string} namaKategori 
 */
function setFilterKategoriAdmin(namaKategori) {
    filterKategoriAktif = namaKategori || 'Semua';
    renderFilterKategoriAdminUI();
    renderRingkasanStatistikStok();
    renderTabelBarang();
}

/**
 * Memperbarui saran nama barang (datalist & tombol chip) serta satuan default
 * ketika admin memilih kategori di dalam modal Tambah / Ubah Barang.
 * @param {string} namaKategori 
 * @param {boolean} autoFillSatuan 
 */
function updateSaranProdukBerdasarkanKategori(namaKategori, autoFillSatuan = false) {
    const datalist = document.getElementById('listSaranNamaBarang');
    const chipsContainer = document.getElementById('saranNamaChips');
    const inputNama = document.getElementById('namaBarang');
    const inputSatuan = document.getElementById('satuanBarang');

    if (!datalist || !chipsContainer) return;

    datalist.innerHTML = '';
    chipsContainer.innerHTML = '';

    if (!namaKategori) {
        if (inputNama) inputNama.placeholder = 'Pilih kategori terlebih dahulu atau ketik nama barang...';
        return;
    }

    const infoKat = SARAN_PRODUK_KATEGORI[namaKategori] || { satuan: 'pcs', contoh: [] };

    // Gabungkan contoh produk dengan barang yang sudah ada di kategori tersebut
    const barangKategoriIni = getBarang()
        .filter(b => (b.kategori || tebakKategori(b.nama)) === namaKategori)
        .map(b => b.nama);

    const daftarSaran = Array.from(new Set([...infoKat.contoh, ...barangKategoriIni]));

    // Update placeholder & satuan default
    if (inputNama && daftarSaran.length > 0) {
        inputNama.placeholder = `Contoh: ${daftarSaran.slice(0, 2).join(', ')}`;
    }
    if (autoFillSatuan && inputSatuan && !document.getElementById('barangId').value) {
        inputSatuan.value = infoKat.satuan;
    }

    // Isi <datalist> untuk autocomplete input
    daftarSaran.forEach(namaSaran => {
        const opt = document.createElement('option');
        opt.value = namaSaran;
        datalist.appendChild(opt);
    });

    // Tampilkan chip klik cepat untuk produk dalam kategori tersebut (misal: Semen Gresik, Semen Tiga Roda)
    if (daftarSaran.length > 0) {
        const label = document.createElement('span');
        label.className = 'w-100 text-muted mb-1';
        label.style.fontSize = '0.75rem';
        label.innerHTML = `<i class="bi bi-lightbulb text-warning me-1"></i>Pilihan cepat kategori <strong>${escapeHtml(namaKategori)}</strong> (klik untuk mengisi):`;
        chipsContainer.appendChild(label);

        daftarSaran.forEach(namaSaran => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn btn-sm btn-light border text-dark py-0 px-2';
            btn.style.fontSize = '0.75rem';
            btn.style.borderRadius = '50rem';
            btn.textContent = namaSaran;
            btn.addEventListener('click', function () {
                if (inputNama) {
                    inputNama.value = namaSaran;
                    inputNama.focus();
                }
                if (inputSatuan && !inputSatuan.value) {
                    inputSatuan.value = infoKat.satuan;
                }
            });
            chipsContainer.appendChild(btn);
        });
    }
}

/**
 * Merender seluruh komponen halaman admin: kartu ringkasan, bar kategori, dan tabel data.
 */
function renderHalamanAdmin() {
    renderRingkasanStatistikStok();
    renderFilterKategoriAdminUI();
    renderTabelBarang();
}

/**
 * Mengambil daftar barang yang sesuai dengan filter kategori dan pencarian yang sedang aktif.
 * @returns {Array} Array objek barang hasil filter
 */
function getBarangTerfilter() {
    const semuaBarang = getBarang();
    return semuaBarang.filter(item => {
        const itemKategori = item.kategori || (typeof tebakKategori === 'function' ? tebakKategori(item.nama) : 'Lainnya');
        const cocokKategori = (filterKategoriAktif === 'Semua') || (itemKategori.toLowerCase() === filterKategoriAktif.toLowerCase());
        const cocokKeyword = !filterKeywordAktif || item.nama.toLowerCase().includes(filterKeywordAktif);
        return cocokKategori && cocokKeyword;
    });
}

/**
 * Menghitung dan memperbarui 3 kartu statistik di bagian atas.
 * Nilai otomatis menyesuaikan dengan barang-barang yang sudah ditambahkan serta filter aktif.
 */
function renderRingkasanStatistikStok() {
    const semuaBarang = getBarang();
    const barangAktif = getBarangTerfilter();
    const isFilterAktif = (filterKategoriAktif !== 'Semua') || (filterKeywordAktif !== '');

    let totalBarang = barangAktif.length;
    let stokMenipis = 0;
    let stokHabis = 0;
    let totalKuantitasStok = 0;

    barangAktif.forEach(barang => {
        const status = hitungStatus(barang);
        if (status === 'Menipis') stokMenipis++;
        if (status === 'Habis') stokHabis++;
        totalKuantitasStok += (parseInt(barang.stok, 10) || 0);
    });

    const elTotal = document.getElementById('statTotalBarang');
    const elMenipis = document.getElementById('statStokMenipis');
    const elHabis = document.getElementById('statStokHabis');
    const elTotalLabel = document.getElementById('statTotalBarangLabel');
    const elTotalSub = document.getElementById('statTotalBarangSub');
    const elMenipisSub = document.getElementById('statStokMenipisSub');
    const elHabisSub = document.getElementById('statStokHabisSub');

    if (elTotal) elTotal.textContent = totalBarang;
    if (elMenipis) elMenipis.textContent = stokMenipis;
    if (elHabis) elHabis.textContent = stokHabis;

    if (elTotalLabel) {
        if (filterKategoriAktif !== 'Semua') {
            elTotalLabel.textContent = `Total Barang (${filterKategoriAktif})`;
        } else if (filterKeywordAktif) {
            elTotalLabel.textContent = 'Total Barang (Filter)';
        } else {
            elTotalLabel.textContent = 'Total Barang';
        }
    }

    if (elTotalSub) {
        if (isFilterAktif) {
            elTotalSub.textContent = `${totalBarang} dari ${semuaBarang.length} total barang (${totalKuantitasStok.toLocaleString('id-ID')} unit stok)`;
        } else {
            elTotalSub.textContent = `${totalBarang} jenis material (${totalKuantitasStok.toLocaleString('id-ID')} unit stok)`;
        }
    }

    if (elMenipisSub) {
        elMenipisSub.textContent = stokMenipis > 0 ? `${stokMenipis} barang perlu restok` : 'Semua stok dalam batas aman';
    }

    if (elHabisSub) {
        elHabisSub.textContent = stokHabis > 0 ? `${stokHabis} barang habis total` : 'Tidak ada barang kosong';
    }
}

/**
 * Merender baris-baris tabel barang sesuai data di localStorage, filter kategori, & kata kunci pencarian.
 */
function renderTabelBarang() {
    const tbody = document.getElementById('tabelBarangBody');
    if (!tbody) return;

    // Filter kombinasi: Kategori & Kata Kunci Pencarian
    const hasilFilter = getBarangTerfilter();

    tbody.innerHTML = '';

    // Tampilkan pesan kosong jika tidak ada data
    if (hasilFilter.length === 0) {
        const trKosong = document.createElement('tr');
        trKosong.innerHTML = `
            <td colspan="8" class="text-center py-5 text-muted">
                <i class="bi bi-inbox fs-2 d-block mb-2 text-secondary opacity-50"></i>
                <span>${(filterKeywordAktif || filterKategoriAktif !== 'Semua') ? 'Tidak ada barang yang cocok dengan kategori atau pencarian.' : 'Belum ada data barang.'}</span>
            </td>
        `;
        tbody.appendChild(trKosong);
        return;
    }

    // Render baris data barang
    hasilFilter.forEach((barang, index) => {
        const status = hitungStatus(barang);
        const satuan = escapeHtml(barang.satuan || (typeof getSatuanBarang === 'function' ? getSatuanBarang(barang) : 'unit'));
        const kategoriNama = escapeHtml(barang.kategori || (typeof tebakKategori === 'function' ? tebakKategori(barang.nama) : 'Lainnya'));
        const kategoriIkon = typeof getIkonKategori === 'function' ? getIkonKategori(kategoriNama) : 'bi-tag';

        let badgeHtml = '';
        if (status === 'Habis') {
            badgeHtml = `<span class="badge-status badge-status-habis"><i class="bi bi-x-circle-fill"></i> Habis</span>`;
        } else if (status === 'Menipis') {
            badgeHtml = `<span class="badge-status badge-status-menipis"><i class="bi bi-exclamation-triangle-fill"></i> Menipis</span>`;
        } else {
            badgeHtml = `<span class="badge-status badge-status-aman"><i class="bi bi-check-circle-fill"></i> Aman</span>`;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-center fw-semibold text-secondary" style="width: 50px;">${index + 1}</td>
            <td class="fw-semibold text-dark">${escapeHtml(barang.nama)}</td>
            <td>
                <span class="badge bg-light text-dark border px-2 py-1" style="font-size: 0.8rem; font-weight: 500; cursor: pointer;" onclick="setFilterKategoriAdmin('${kategoriNama}')" title="Filter kategori ${kategoriNama}">
                    ${kategoriNama}
                </span>
            </td>
            <td class="text-end fw-bold">
                <span>${parseInt(barang.stok, 10).toLocaleString('id-ID')}</span>
                <span class="text-secondary small fw-normal ms-1">${satuan}</span>
            </td>
            <td class="text-end text-muted">
                <span>${parseInt(barang.stokMinimum, 10).toLocaleString('id-ID')}</span>
                <small class="text-secondary fw-normal ms-1">${satuan}</small>
            </td>
            <td class="text-center">${badgeHtml}</td>
            <td class="text-end fw-semibold text-dark">
                ${formatRupiah(barang.harga)}
                <small class="text-muted fw-normal d-block" style="font-size: 0.78rem;">/${satuan}</small>
            </td>
            <td class="text-center" style="width: 100px;">
                <div class="d-flex justify-content-center gap-1">
                    <button type="button" class="btn btn-action-icon btn-action-edit" title="Edit Barang" onclick="bukaModalEdit('${barang.id}')">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button type="button" class="btn btn-action-icon btn-action-delete" title="Hapus Barang" onclick="bukaModalHapus('${barang.id}')">
                        <i class="bi bi-trash3"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Mengompres dan membaca file gambar menjadi data URL Base64 ringan (maks 600px).
 * Menghindari risiko kuota penyimpanan localStorage penuh.
 * @param {File} file 
 * @returns {Promise<string>}
 */
function prosesFileGambar(file) {
    return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith('image/')) {
            return reject(new Error('File yang dipilih bukan gambar.'));
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                const canvas = document.createElement('canvas');
                const maxDim = 600;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxDim) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    }
                } else {
                    if (height > maxDim) {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Kompresi JPEG kualitas 0.8 untuk menghemat kapasitas localStorage
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                resolve(dataUrl);
            };
            img.onerror = () => reject(new Error('Gagal memproses gambar.'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
        reader.readAsDataURL(file);
    });
}

/**
 * Menangani pemilihan file foto barang dari input file.
 * @param {Event} e 
 */
async function handlePilihGambarBarang(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
        const base64 = await prosesFileGambar(file);
        setPreviewGambar(base64, file.name);
    } catch (err) {
        console.error('Gagal memproses foto barang:', err);
        tampilkanToast('Gagal memuat gambar. Pastikan format file adalah foto (JPG/PNG/WEBP).');
        hapusFotoBarang();
    }
}

/**
 * Menampilkan preview gambar pada modal form barang.
 * @param {string} src 
 * @param {string} namaFile 
 */
function setPreviewGambar(src, namaFile = 'Foto Barang') {
    const elBase64 = document.getElementById('gambarBarangBase64');
    const wrapper = document.getElementById('wrapperPreviewGambar');
    const img = document.getElementById('previewGambarBarang');
    const namaText = document.getElementById('previewNamaFileGambar');

    if (elBase64) elBase64.value = src || '';
    if (img) img.src = src || '';
    if (namaText) namaText.textContent = namaFile;
    if (wrapper) {
        if (src) {
            wrapper.classList.remove('d-none');
        } else {
            wrapper.classList.add('d-none');
        }
    }
}

/**
 * Menghapus foto barang dari form modal.
 */
function hapusFotoBarang() {
    const input = document.getElementById('gambarBarang');
    if (input) input.value = '';
    setPreviewGambar('', '');
}

/**
 * Membuka modal form dalam mode Tambah Barang Baru.
 */
function bukaModalTambah() {
    document.getElementById('modalFormTitle').textContent = 'Tambah Barang Baru';
    document.getElementById('barangId').value = '';
    document.getElementById('formBarang').reset();
    hapusFotoBarang();

    const elSatuan = document.getElementById('satuanBarang');
    if (elSatuan) elSatuan.value = '';

    const elKategori = document.getElementById('kategoriBarang');
    if (elKategori) {
        // Jika admin sedang memfilter kategori tertentu di tabel (misal "Semen"), otomatis pilih kategori tersebut
        if (filterKategoriAktif && filterKategoriAktif !== 'Semua') {
            elKategori.value = filterKategoriAktif;
            updateSaranProdukBerdasarkanKategori(filterKategoriAktif, true);
        } else {
            elKategori.value = '';
            updateSaranProdukBerdasarkanKategori('', false);
        }
    }

    resetFormErrors();

    if (modalFormInstance) {
        modalFormInstance.show();
    }
}

/**
 * Membuka modal form dalam mode Edit Data Barang.
 * @param {string|number} id 
 */
function bukaModalEdit(id) {
    const semuaBarang = getBarang();
    const barang = semuaBarang.find(b => String(b.id) === String(id));
    if (!barang) return;

    document.getElementById('modalFormTitle').textContent = 'Edit Data Barang';
    document.getElementById('barangId').value = barang.id;
    document.getElementById('namaBarang').value = barang.nama;
    document.getElementById('stokBarang').value = barang.stok;
    document.getElementById('stokMinimumBarang').value = barang.stokMinimum;
    document.getElementById('hargaBarang').value = barang.harga;

    const elSatuan = document.getElementById('satuanBarang');
    if (elSatuan) {
        elSatuan.value = barang.satuan || (typeof getSatuanBarang === 'function' ? getSatuanBarang(barang) : '');
    }

    const daftarKategoriAktif = typeof getKategori === 'function' ? getKategori().map(k => k.nama.toLowerCase()) : [];
    let kategoriBarang = barang.kategori || (typeof tebakKategori === 'function' ? tebakKategori(barang.nama) : 'Lainnya');
    // Jika kategori barang lama sudah dihapus admin, otomatis alihkan ke "Lainnya"
    if (!daftarKategoriAktif.includes(kategoriBarang.toLowerCase())) {
        kategoriBarang = 'Lainnya';
    }

    const elKategori = document.getElementById('kategoriBarang');
    if (elKategori) {
        elKategori.value = kategoriBarang;
    }

    // Tampilkan foto jika sebelumnya barang sudah memiliki foto
    if (barang.gambar) {
        setPreviewGambar(barang.gambar, barang.nama || 'Foto Saat Ini');
    } else {
        hapusFotoBarang();
    }

    updateSaranProdukBerdasarkanKategori(kategoriBarang, false);
    resetFormErrors();

    if (modalFormInstance) {
        modalFormInstance.show();
    }
}

/**
 * Menghandle submit simpan (Tambah atau Ubah) data barang.
 * @param {Event} e 
 */
function handleSimpanBarang(e) {
    e.preventDefault();

    const id = document.getElementById('barangId').value.trim();
    const nama = document.getElementById('namaBarang').value.trim();
    const kategoriEl = document.getElementById('kategoriBarang');
    const kategori = kategoriEl ? kategoriEl.value : '';
    const stokRaw = document.getElementById('stokBarang').value.trim();
    const stokMinRaw = document.getElementById('stokMinimumBarang').value.trim();
    const satuanEl = document.getElementById('satuanBarang');
    const satuan = satuanEl ? satuanEl.value.trim() : '';
    const hargaRaw = document.getElementById('hargaBarang').value.trim();
    const elGambarBase64 = document.getElementById('gambarBarangBase64');
    const gambar = elGambarBase64 ? elGambarBase64.value.trim() : '';

    let isValid = true;
    resetFormErrors();

    // Validasi Kategori Barang
    if (!kategori) {
        setError('kategoriBarang', 'Pilih salah satu kategori barang.');
        isValid = false;
    }

    // Validasi Nama Barang
    if (!nama) {
        setError('namaBarang', 'Nama barang wajib diisi.');
        isValid = false;
    }

    // Validasi Satuan Barang
    if (!satuan) {
        setError('satuanBarang', 'Satuan barang wajib diisi (contoh: sak, truk, batang, dus, kg).');
        isValid = false;
    }

    // Validasi Stok Tersedia
    if (stokRaw === '') {
        setError('stokBarang', 'Stok tersedia wajib diisi.');
        isValid = false;
    } else if (parseInt(stokRaw, 10) < 0 || isNaN(parseInt(stokRaw, 10))) {
        setError('stokBarang', 'Stok tidak boleh angka negatif.');
        isValid = false;
    }

    // Validasi Stok Minimum
    if (stokMinRaw === '') {
        setError('stokMinimumBarang', 'Stok minimum wajib diisi.');
        isValid = false;
    } else if (parseInt(stokMinRaw, 10) < 0 || isNaN(parseInt(stokMinRaw, 10))) {
        setError('stokMinimumBarang', 'Stok minimum tidak boleh angka negatif.');
        isValid = false;
    }

    // Validasi Harga Barang
    if (hargaRaw === '') {
        setError('hargaBarang', 'Harga barang wajib diisi.');
        isValid = false;
    } else if (parseInt(hargaRaw, 10) < 0 || isNaN(parseInt(hargaRaw, 10))) {
        setError('hargaBarang', 'Harga tidak boleh angka negatif.');
        isValid = false;
    }

    if (!isValid) return;

    const dataBarang = {
        nama: nama,
        kategori: kategori,
        stok: parseInt(stokRaw, 10),
        stokMinimum: parseInt(stokMinRaw, 10),
        satuan: satuan,
        harga: parseInt(hargaRaw, 10),
        gambar: gambar
    };

    if (id) {
        ubahBarang(id, dataBarang);
        tampilkanToast('Data barang berhasil diperbarui!');
    } else {
        tambahBarang(dataBarang);
        tampilkanToast('Barang baru berhasil ditambahkan!');
    }

    if (modalFormInstance) {
        modalFormInstance.hide();
    }

    renderHalamanAdmin();
}

/**
 * Membuka modal konfirmasi hapus data.
 * @param {string|number} id 
 */
function bukaModalHapus(id) {
    const semuaBarang = getBarang();
    const barang = semuaBarang.find(b => String(b.id) === String(id));
    if (!barang) return;

    idBarangHapus = id;
    const elNama = document.getElementById('namaBarangHapus');
    if (elNama) {
        elNama.textContent = `"${barang.nama}"`;
    }

    if (modalHapusInstance) {
        modalHapusInstance.show();
    }
}

/**
 * Memproses penghapusan data barang setelah dikonfirmasi pengguna.
 */
function handleProsesHapus() {
    if (!idBarangHapus) return;

    hapusBarang(idBarangHapus);
    idBarangHapus = null;

    if (modalHapusInstance) {
        modalHapusInstance.hide();
    }

    tampilkanToast('Barang berhasil dihapus dari daftar.');
    renderHalamanAdmin();
}

/**
 * Menampilkan pesan error validasi pada form input.
 */
function setError(inputId, message) {
    const input = document.getElementById(inputId);
    const feedback = document.getElementById(inputId + 'Error');
    if (input) input.classList.add('is-invalid');
    if (feedback) {
        feedback.textContent = message;
        feedback.classList.remove('d-none');
    }
}

/**
 * Mereset seluruh status error validasi pada form modal.
 */
function resetFormErrors() {
    ['namaBarang', 'kategoriBarang', 'stokBarang', 'stokMinimumBarang', 'satuanBarang', 'hargaBarang'].forEach(id => {
        const input = document.getElementById(id);
        const feedback = document.getElementById(id + 'Error');
        if (input) input.classList.remove('is-invalid');
        if (feedback) {
            feedback.textContent = '';
            feedback.classList.add('d-none');
        }
    });
}

/**
 * Menampilkan notifikasi Toast Bootstrap pada pojok layar.
 * @param {string} pesan 
 */
function tampilkanToast(pesan) {
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
