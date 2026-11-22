/**
 * ==============================================================================
 * LOGIKA TAMPILAN HALAMAN ADMIN: LAPORAN TRANSAKSI
 * TB. SUMBER BAROKAH MALANG
 * ==============================================================================
 * Mengelola:
 * - Toolbar filter: input tanggal "Dari" - "Sampai", validasi tanggal, dan pencarian.
 * - 3 kartu ringkasan: Jumlah Transaksi, Total Pendapatan, dan Total Barang Terjual.
 * - Tab 1: "Semua Transaksi" (tabel tanpa kode, menampilkan metode Tunai/Transfer,
 *   urutan, pagination 10/halaman, footer total, dan Modal Detail Transaksi).
 * - Tab 2: "Barang Terjual" (tabel rekap per barang dengan penanda peringkat trophy 1-3).
 * - Ekspor PDF & Cetak (window.print() dengan CSS media print bersih).
 * - Tombol Reset Data Contoh (demo) berisi 20 transaksi contoh (Tunai & Transfer).
 * - Sinkronisasi otomatis antar-tab browser melalui event 'storage'.
 * ==============================================================================
 */

// State Filter Global
let filterTanggalDari = '';
let filterTanggalSampai = '';
let filterKataKunci = '';

// State Tab & Urutan
let tabAktif = 'transaksi'; // 'transaksi' | 'barang'
let urutanTransaksi = 'terbaru'; // 'terbaru' | 'terlama' | 'total_terbesar' | 'total_terkecil'
let urutanBarang = 'terlaris'; // 'terlaris' | 'pendapatan' | 'nama_az'

// State Pagination Tab 1
let halamanAktif = 1;
const PER_PAGE = 10;

// Bootstrap Modal Instances
let modalDetailTrxInstance = null;
let modalLihatBuktiInstance = null;

document.addEventListener('DOMContentLoaded', function () {
    // 1. Inisialisasi data store transaksi
    if (typeof inisialisasiTransaksiStore === 'function') {
        inisialisasiTransaksiStore();
    }

    // 2. Default tanggal: 30 hari terakhir sampai hari ini
    aturRentangTanggalDefault();

    // 3. Inisialisasi Modal Bootstrap
    const elModalDetail = document.getElementById('modalDetailTransaksi');
    if (elModalDetail) modalDetailTrxInstance = new bootstrap.Modal(elModalDetail);

    const elModalBukti = document.getElementById('modalLihatBuktiTransfer');
    if (elModalBukti) modalLihatBuktiInstance = new bootstrap.Modal(elModalBukti);

    // 4. Hubungkan seluruh event listener
    inisialisasiEventLaporan();

    // 5. Render seluruh tampilan laporan
    renderHalamanLaporan();

    // 6. Sinkronisasi antar-tab browser via event storage
    window.addEventListener('storage', function (e) {
        if (e.key === 'sb_transaksi' || e.key === 'sb_transaksi_versi') {
            renderHalamanLaporan();
        }
    });
});

/**
 * Mengatur rentang tanggal awal ke 30 hari terakhir sampai hari ini.
 */
function aturRentangTanggalDefault() {
    const hariIni = typeof getTanggalRelatifTrx === 'function' ? getTanggalRelatifTrx(0) : getTodayFormatted();
    filterTanggalDari = typeof getTanggalRelatifTrx === 'function' ? getTanggalRelatifTrx(-29) : hariIni;
    filterTanggalSampai = hariIni;

    const inputDari = document.getElementById('filterTglDari');
    const inputSampai = document.getElementById('filterTglSampai');
    if (inputDari) inputDari.value = filterTanggalDari;
    if (inputSampai) inputSampai.value = filterTanggalSampai;
}

/**
 * Menghubungkan seluruh event listener pada toolbar, form, filter, dan tab.
 */
function inisialisasiEventLaporan() {
    // Input tanggal Dari & Sampai
    const inputDari = document.getElementById('filterTglDari');
    const inputSampai = document.getElementById('filterTglSampai');

    if (inputDari) {
        inputDari.addEventListener('change', function () {
            validasiDanTerapkanTanggal();
        });
    }

    if (inputSampai) {
        inputSampai.addEventListener('change', function () {
            validasiDanTerapkanTanggal();
        });
    }

    // Input Pencarian
    const inputSearch = document.getElementById('searchLaporan');
    if (inputSearch) {
        inputSearch.addEventListener('input', function (e) {
            filterKataKunci = e.target.value.trim().toLowerCase();
            halamanAktif = 1;
            renderHalamanLaporan();
        });
    }

    // Select Urutan Transaksi (Tab 1)
    const selectSortTrx = document.getElementById('sortUrutanTransaksi');
    if (selectSortTrx) {
        selectSortTrx.addEventListener('change', function (e) {
            urutanTransaksi = e.target.value || 'terbaru';
            halamanAktif = 1;
            renderTabSemuaTransaksi();
        });
    }

    // Select Urutan Rekap Barang (Tab 2)
    const selectSortBarang = document.getElementById('sortUrutanBarang');
    if (selectSortBarang) {
        selectSortBarang.addEventListener('change', function (e) {
            urutanBarang = e.target.value || 'terlaris';
            renderTabBarangTerjual();
        });
    }

    // Listener perpindahan Tab Bootstrap
    const tabTrxEl = document.getElementById('tabNavTransaksi');
    const tabBarangEl = document.getElementById('tabNavBarang');

    if (tabTrxEl) {
        tabTrxEl.addEventListener('shown.bs.tab', function () {
            tabAktif = 'transaksi';
        });
    }

    if (tabBarangEl) {
        tabBarangEl.addEventListener('shown.bs.tab', function () {
            tabAktif = 'barang';
        });
    }
}

/**
 * Validasi: Tanggal "Dari" tidak boleh lebih besar dari "Sampai".
 */
function validasiDanTerapkanTanggal() {
    const inputDari = document.getElementById('filterTglDari');
    const inputSampai = document.getElementById('filterTglSampai');
    const elErr = document.getElementById('errorRentangTanggal');

    const valDari = inputDari ? inputDari.value.trim() : '';
    const valSampai = inputSampai ? inputSampai.value.trim() : '';

    if (valDari && valSampai && valDari > valSampai) {
        if (elErr) {
            elErr.textContent = 'Tanggal "Dari" tidak boleh melebihi tanggal "Sampai".';
            elErr.classList.remove('d-none');
        }
        return;
    }

    if (elErr) elErr.classList.add('d-none');

    filterTanggalDari = valDari;
    filterTanggalSampai = valSampai;
    halamanAktif = 1;
    renderHalamanLaporan();
}

/**
 * Mereset seluruh filter (tanggal, pencarian, urutan) kembali ke keadaan default 30 hari.
 */
function resetSemuaFilterLaporan() {
    filterKataKunci = '';
    urutanTransaksi = 'terbaru';
    urutanBarang = 'terlaris';
    halamanAktif = 1;

    const inputSearch = document.getElementById('searchLaporan');
    if (inputSearch) inputSearch.value = '';

    const selectSortTrx = document.getElementById('sortUrutanTransaksi');
    if (selectSortTrx) selectSortTrx.value = 'terbaru';

    const selectSortBarang = document.getElementById('sortUrutanBarang');
    if (selectSortBarang) selectSortBarang.value = 'terlaris';

    aturRentangTanggalDefault();

    const elErr = document.getElementById('errorRentangTanggal');
    if (elErr) elErr.classList.add('d-none');

    renderHalamanLaporan();
}

/**
 * Merender keseluruhan komponen halaman laporan:
 * 3 kartu ringkasan, Tab 1 Semua Transaksi, dan Tab 2 Barang Terjual.
 */
function renderHalamanLaporan() {
    const dataTerfilter = filterTransaksi({
        dari: filterTanggalDari,
        sampai: filterTanggalSampai,
        kataKunci: filterKataKunci
    });

    renderKartuRingkasanLaporan(dataTerfilter);
    renderTabSemuaTransaksi(dataTerfilter);
    renderTabBarangTerjual(dataTerfilter);
    perbaruiTeksHeaderPrint();
}

/**
 * Memperbarui angka pada 3 kartu ringkasan laporan (Jumlah Transaksi, Pendapatan, Barang Terjual).
 * @param {Array} listTrx
 */
function renderKartuRingkasanLaporan(listTrx) {
    const ringkasan = hitungRingkasan(listTrx);

    const elTrx = document.getElementById('statLaporanTotalTrx');
    const elPendapatan = document.getElementById('statLaporanPendapatan');
    const elItem = document.getElementById('statLaporanItemTerjual');

    if (elTrx) elTrx.textContent = ringkasan.jumlahTransaksi.toLocaleString('id-ID');
    if (elPendapatan) elPendapatan.textContent = formatRupiahTrx(ringkasan.totalPendapatan);
    if (elItem) elItem.textContent = ringkasan.totalItemTerjual.toLocaleString('id-ID') + ' item';
}

/* ==============================================================================
 * TAB 1: SEMUA TRANSAKSI (KODE DIHAPUS, METODE PEMBAYARAN TUNAI/TRANSFER)
 * ============================================================================== */

/**
 * Mengambil daftar transaksi yang difilter dan diurutkan.
 * @param {Array} listSumber
 * @returns {Array}
 */
function getTransaksiTerurut(listSumber) {
    const list = Array.isArray(listSumber)
        ? [...listSumber]
        : filterTransaksi({ dari: filterTanggalDari, sampai: filterTanggalSampai, kataKunci: filterKataKunci });

    list.sort((a, b) => {
        if (urutanTransaksi === 'total_terbesar') {
            return (b.total || 0) - (a.total || 0);
        }
        if (urutanTransaksi === 'total_terkecil') {
            return (a.total || 0) - (b.total || 0);
        }
        if (urutanTransaksi === 'terlama') {
            const cmpTgl = String(a.tanggal || '').localeCompare(String(b.tanggal || ''));
            if (cmpTgl !== 0) return cmpTgl;
            return String(a.waktu || '').localeCompare(String(b.waktu || ''));
        }
        // Default: Terbaru di atas (tanggal desc, waktu desc, id desc)
        const cmpTgl = String(b.tanggal || '').localeCompare(String(a.tanggal || ''));
        if (cmpTgl !== 0) return cmpTgl;
        const cmpWaktu = String(b.waktu || '').localeCompare(String(a.waktu || ''));
        if (cmpWaktu !== 0) return cmpWaktu;
        return (b.id || 0) - (a.id || 0);
    });

    return list;
}

/**
 * Menghasilkan HTML badge metode pembayaran (Tunai / Transfer: BCA, BRI, QRIS).
 * Menyertakan tombol pintas lihat bukti jika transaksi berupa transfer dan memiliki lampiran gambar.
 * @param {string} metode
 * @param {string|null} buktiTransfer
 * @param {string|number|null} idTrx
 * @param {string|null} subMetode
 * @returns {string}
 */
function getBadgeMetodeHtml(metode, buktiTransfer = null, idTrx = null, subMetode = null) {
    const m = String(metode || 'Tunai').trim().toLowerCase();
    const sub = String(subMetode || '').trim().toUpperCase();

    if (m === 'transfer' || m.includes('transfer')) {
        let label = 'Transfer';
        let badgeClass = 'bg-primary-subtle text-primary border border-primary-subtle';
        let icon = '<i class="bi bi-bank me-1"></i>';

        if (sub === 'QRIS' || m.includes('qris')) {
            label = 'QRIS';
            badgeClass = 'bg-danger-subtle text-danger border border-danger-subtle';
            icon = '<i class="bi bi-qr-code me-1"></i>';
        } else if (sub === 'BRI' || m.includes('bri')) {
            label = 'Transfer (BRI)';
        } else if (sub === 'BCA' || m.includes('bca')) {
            label = 'Transfer (BCA)';
        }

        if (buktiTransfer && idTrx) {
            return `
                <div class="d-inline-flex flex-column align-items-center gap-1">
                    <span class="badge ${badgeClass} px-2 py-1">${icon}${label}</span>
                    <button type="button" class="btn btn-sm btn-outline-primary py-0 px-2 fw-medium" style="font-size: 0.72rem; border-radius: 50rem;" onclick="bukaModalLihatBukti('${idTrx}')" title="Lihat bukti pembayaran transfer">
                        <i class="bi bi-image me-1"></i>Bukti
                    </button>
                </div>
            `;
        }
        return `<span class="badge ${badgeClass} px-2 py-1">${icon}${label}</span>`;
    }
    return `<span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1"><i class="bi bi-cash me-1"></i>Tunai</span>`;
}

/**
 * Merender tabel semua transaksi dengan pagination 10 baris per halaman.
 * @param {Array} listSumber
 */
function renderTabSemuaTransaksi(listSumber) {
    const tbody = document.getElementById('tabelTransaksiBody');
    const tfoot = document.getElementById('tabelTransaksiFoot');
    const paginationWrapper = document.getElementById('paginationTransaksiWrapper');
    const infoPagination = document.getElementById('infoPaginationTransaksi');
    if (!tbody) return;

    const list = getTransaksiTerurut(listSumber);
    const totalData = list.length;

    // Keadaan Kosong (8 kolom)
    if (totalData === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-5">
                    <div class="text-muted mb-2"><i class="bi bi-inbox fs-1"></i></div>
                    <h6 class="fw-bold text-dark mb-1">Belum ada transaksi pada periode ini</h6>
                    <p class="small text-muted mb-3">Cobalah mengubah rentang tanggal atau kata kunci pencarian Anda.</p>
                    <button type="button" class="btn btn-sm btn-outline-secondary px-3" onclick="resetSemuaFilterLaporan()">
                        <i class="bi bi-arrow-counterclockwise me-1"></i>Reset filter
                    </button>
                </td>
            </tr>
        `;
        if (tfoot) tfoot.classList.add('d-none');
        if (paginationWrapper) paginationWrapper.classList.add('d-none');
        return;
    }

    if (tfoot) tfoot.classList.remove('d-none');
    if (paginationWrapper) paginationWrapper.classList.remove('d-none');

    // Hitung total halaman & slice pagination
    const totalHalaman = Math.max(1, Math.ceil(totalData / PER_PAGE));
    if (halamanAktif > totalHalaman) halamanAktif = totalHalaman;
    if (halamanAktif < 1) halamanAktif = 1;

    const offsetAwal = (halamanAktif - 1) * PER_PAGE;
    const offsetAkhir = Math.min(offsetAwal + PER_PAGE, totalData);
    const halamanItems = list.slice(offsetAwal, offsetAkhir);

    // Hitung total keseluruhan pendapatan dari semua hasil terfilter
    let totalPendapatanSeluruh = 0;
    list.forEach(t => { totalPendapatanSeluruh += (parseInt(t.total, 10) || 0); });

    // Render baris tabel (Kode dihapus, metode pembayaran ditampilkan)
    tbody.innerHTML = '';
    halamanItems.forEach((trx, idx) => {
        const noUrut = offsetAwal + idx + 1;
        const totalItemsCount = Array.isArray(trx.items)
            ? trx.items.reduce((sum, it) => sum + (parseInt(it.jumlah, 10) || 0), 0)
            : 0;
        const variasiCount = Array.isArray(trx.items) ? trx.items.length : 0;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-center text-muted fw-semibold">${noUrut}</td>
            <td class="text-nowrap">
                <span class="small fw-medium text-dark">${escapeHtml(formatTanggal(trx.tanggal))}</span>
            </td>
            <td class="text-nowrap">
                <span class="badge bg-light text-secondary border" style="font-size: 0.76rem;">
                    <i class="bi bi-clock me-1"></i>${escapeHtml(formatWaktu(trx.waktu))}
                </span>
            </td>
            <td>
                <div class="fw-bold text-dark small">${escapeHtml(trx.pelanggan)}</div>
            </td>
            <td class="text-center">
                ${getBadgeMetodeHtml(trx.metode, trx.buktiTransfer, trx.id, trx.subMetode)}
            </td>
            <td>
                <span class="small text-dark fw-semibold">${totalItemsCount} unit</span>
                <span class="text-muted small">(${variasiCount} jenis)</span>
            </td>
            <td class="text-end">
                <strong class="text-primary">${escapeHtml(formatRupiahTrx(trx.total))}</strong>
            </td>
            <td class="text-center col-aksi-laporan">
                <button type="button" class="btn btn-sm btn-outline-secondary px-2 py-1" style="font-size: 0.78rem;" onclick="bukaModalDetailTransaksi('${trx.id}')" title="Lihat rincian belanja">
                    <i class="bi bi-eye me-1"></i>Detail
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Baris footer: total keseluruhan hasil yang tampil (colspan="6")
    if (tfoot) {
        tfoot.innerHTML = `
            <tr class="table-footer-summary fw-bold text-dark">
                <td colspan="6" class="text-end py-3">Total Pendapatan (${totalData} Transaksi Terpilih):</td>
                <td class="text-end py-3 text-primary fs-6">${escapeHtml(formatRupiahTrx(totalPendapatanSeluruh))}</td>
                <td class="col-aksi-laporan"></td>
            </tr>
        `;
    }

    // Teks pagination
    if (infoPagination) {
        infoPagination.textContent = `Menampilkan ${offsetAwal + 1} sampai ${offsetAkhir} dari ${totalData} transaksi`;
    }

    renderTombolPagination(totalHalaman);
}

/**
 * Merender tombol angka dan tombol navigasi pagination Tab 1.
 * @param {number} totalHalaman
 */
function renderTombolPagination(totalHalaman) {
    const ul = document.getElementById('ulPaginationTransaksi');
    if (!ul) return;

    ul.innerHTML = '';

    // Tombol Sebelumnya
    const liPrev = document.createElement('li');
    liPrev.className = `page-item ${halamanAktif === 1 ? 'disabled' : ''}`;
    liPrev.innerHTML = `
        <button class="page-link" onclick="gantiHalamanTransaksi(${halamanAktif - 1})" aria-label="Sebelumnya">
            &laquo;
        </button>
    `;
    ul.appendChild(liPrev);

    // Nomor Halaman (Tampilkan maks 5 nomor)
    let startPage = Math.max(1, halamanAktif - 2);
    let endPage = Math.min(totalHalaman, startPage + 4);
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }

    for (let p = startPage; p <= endPage; p++) {
        const liPage = document.createElement('li');
        liPage.className = `page-item ${p === halamanAktif ? 'active' : ''}`;
        liPage.innerHTML = `
            <button class="page-link" onclick="gantiHalamanTransaksi(${p})">${p}</button>
        `;
        ul.appendChild(liPage);
    }

    // Tombol Selanjutnya
    const liNext = document.createElement('li');
    liNext.className = `page-item ${halamanAktif === totalHalaman ? 'disabled' : ''}`;
    liNext.innerHTML = `
        <button class="page-link" onclick="gantiHalamanTransaksi(${halamanAktif + 1})" aria-label="Selanjutnya">
            &raquo;
        </button>
    `;
    ul.appendChild(liNext);
}

/**
 * Berpindah ke halaman tertentu pada tabel transaksi.
 * @param {number} halamanBaru
 */
function gantiHalamanTransaksi(halamanBaru) {
    halamanAktif = halamanBaru;
    renderTabSemuaTransaksi();
}

/**
 * Membuka Modal Detail Transaksi lengkap beserta rincian item snapshot.
 * @param {number|string} id
 */
function bukaModalDetailTransaksi(id) {
    const semua = getTransaksi();
    const trx = semua.find(t => String(t.id) === String(id));
    if (!trx) return;

    const elWaktu = document.getElementById('detailTrxWaktu');
    const elPelanggan = document.getElementById('detailTrxPelanggan');
    const elMetode = document.getElementById('detailTrxMetode');
    const elTotal = document.getElementById('detailTrxTotal');
    const elBayar = document.getElementById('detailTrxBayar');
    const elKembalian = document.getElementById('detailTrxKembalian');
    const tbodyBarang = document.getElementById('detailTrxTabelBarangBody');

    if (elWaktu) elWaktu.textContent = `${formatTanggal(trx.tanggal)}, ${formatWaktu(trx.waktu)}`;
    if (elPelanggan) elPelanggan.textContent = trx.pelanggan;
    if (elMetode) elMetode.innerHTML = getBadgeMetodeHtml(trx.metode, trx.buktiTransfer, trx.id, trx.subMetode);
    if (elTotal) elTotal.textContent = formatRupiahTrx(trx.total);
    if (elBayar) elBayar.textContent = formatRupiahTrx(trx.bayar || trx.total);
    if (elKembalian) elKembalian.textContent = formatRupiahTrx(trx.kembalian || 0);

    // Tampilkan / sembunyikan lampiran bukti transfer pada modal detail
    const elBuktiWrapper = document.getElementById('detailTrxBuktiWrapper');
    const elBuktiImg = document.getElementById('detailTrxBuktiImg');
    const elBuktiLink = document.getElementById('detailTrxBuktiLink');
    if (elBuktiWrapper && elBuktiImg) {
        if (trx.buktiTransfer) {
            elBuktiImg.src = trx.buktiTransfer;
            if (elBuktiLink) elBuktiLink.href = trx.buktiTransfer;
            elBuktiWrapper.classList.remove('d-none');
        } else {
            elBuktiImg.src = '';
            elBuktiWrapper.classList.add('d-none');
        }
    }

    if (tbodyBarang) {
        tbodyBarang.innerHTML = '';
        const items = Array.isArray(trx.items) ? trx.items : [];
        items.forEach((it, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="text-center text-muted small">${idx + 1}</td>
                <td>
                    <div class="fw-semibold text-dark small">${escapeHtml(it.nama)}</div>
                </td>
                <td>
                    <span class="badge bg-light text-secondary border small">${escapeHtml(it.kategori || 'Umum')}</span>
                </td>
                <td class="text-center small fw-bold">${parseInt(it.jumlah, 10) || 1}</td>
                <td class="text-end small">${escapeHtml(formatRupiahTrx(it.harga))}</td>
                <td class="text-end small fw-bold text-dark">${escapeHtml(formatRupiahTrx(it.subtotal))}</td>
            `;
            tbodyBarang.appendChild(tr);
        });
    }

    if (modalDetailTrxInstance) {
        modalDetailTrxInstance.show();
    }
}

/**
 * Membuka modal khusus untuk melihat foto bukti pembayaran transfer dari transaksi.
 * @param {number|string} id
 */
function bukaModalLihatBukti(id) {
    const semua = getTransaksi();
    const trx = semua.find(t => String(t.id) === String(id));
    if (!trx || !trx.buktiTransfer) return;

    const img = document.getElementById('imgBuktiTransferPenuh');
    const elPelanggan = document.getElementById('lihatBuktiPelanggan');
    const elWaktu = document.getElementById('lihatBuktiWaktu');
    const btnLink = document.getElementById('btnBukaBuktiTabBaru');

    const sub = String(trx.subMetode || '').trim().toUpperCase();
    const saluranText = sub === 'QRIS' ? 'QRIS' : (sub ? `Transfer (${sub})` : 'Transfer');

    if (img) img.src = trx.buktiTransfer;
    if (elPelanggan) elPelanggan.textContent = `Pelanggan: ${trx.pelanggan || 'Pelanggan Umum'} • ${saluranText}`;
    if (elWaktu) elWaktu.textContent = `${formatTanggal(trx.tanggal)} ${formatWaktu(trx.waktu)}`;
    if (btnLink) btnLink.href = trx.buktiTransfer;

    if (modalLihatBuktiInstance) {
        modalLihatBuktiInstance.show();
    }
}

/* ==============================================================================
 * TAB 2: BARANG TERJUAL (TOP 5 DIHAPUS, HANYA TABEL REKAP)
 * ============================================================================== */

/**
 * Mengambil rekap barang terjual yang telah diurutkan sesuai pilihan.
 * @param {Array} listTrxSumber
 * @returns {Array}
 */
function getRekapBarangTerurut(listTrxSumber) {
    const listTrx = Array.isArray(listTrxSumber)
        ? listTrxSumber
        : filterTransaksi({ dari: filterTanggalDari, sampai: filterTanggalSampai, kataKunci: filterKataKunci });

    const rekap = rekapBarangTerjual(listTrx);

    if (urutanBarang === 'pendapatan') {
        rekap.sort((a, b) => (b.totalPendapatan - a.totalPendapatan) || (b.jumlahTerjual - a.jumlahTerjual));
    } else if (urutanBarang === 'nama_az') {
        rekap.sort((a, b) => a.nama.localeCompare(b.nama));
    } else if (urutanBarang === 'terbaru') {
        rekap.sort((a, b) => {
            const timeA = `${a.tanggal || ''} ${a.waktu || ''}`;
            const timeB = `${b.tanggal || ''} ${b.waktu || ''}`;
            return timeB.localeCompare(timeA);
        });
    } else {
        // Default: Terlaris (jumlahTerjual desc)
        rekap.sort((a, b) => (b.jumlahTerjual - a.jumlahTerjual) || (b.totalPendapatan - a.totalPendapatan));
    }

    return rekap;
}

/**
 * Merender isi Tab 2: Tabel Rekap Barang Terjual (dengan kolom Tanggal dan Waktu).
 * @param {Array} listTrxSumber
 */
function renderTabBarangTerjual(listTrxSumber) {
    const tbody = document.getElementById('tabelBarangTerjualBody');
    const tfoot = document.getElementById('tabelBarangTerjualFoot');
    if (!tbody) return;

    const rekap = getRekapBarangTerurut(listTrxSumber);

    // Keadaan kosong
    if (rekap.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-5">
                    <div class="text-muted mb-2"><i class="bi bi-box-seam fs-1"></i></div>
                    <h6 class="fw-bold text-dark mb-1">Belum ada barang terjual pada periode ini</h6>
                    <p class="small text-muted mb-3">Tidak ada transaksi yang cocok dengan filter yang dipilih.</p>
                    <button type="button" class="btn btn-sm btn-outline-secondary px-3" onclick="resetSemuaFilterLaporan()">
                        <i class="bi bi-arrow-counterclockwise me-1"></i>Reset filter
                    </button>
                </td>
            </tr>
        `;
        if (tfoot) tfoot.classList.add('d-none');
        return;
    }

    if (tfoot) tfoot.classList.remove('d-none');

    // Render Tabel Rekap Barang Terjual
    tbody.innerHTML = '';
    let grandTotalItem = 0;
    let grandTotalPendapatan = 0;

    rekap.forEach((item, idx) => {
        grandTotalItem += item.jumlahTerjual;
        grandTotalPendapatan += item.totalPendapatan;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-center text-muted fw-semibold">${idx + 1}</td>
            <td class="text-nowrap">
                <span class="small fw-medium text-dark">${escapeHtml(formatTanggal(item.tanggal))}</span>
            </td>
            <td class="text-nowrap">
                <span class="badge bg-light text-secondary border" style="font-size: 0.76rem;">
                    <i class="bi bi-clock me-1"></i>${escapeHtml(formatWaktu(item.waktu))}
                </span>
            </td>
            <td>
                <span class="fw-bold text-dark small">${escapeHtml(item.nama)}</span>
            </td>
            <td>
                <span class="badge bg-light text-secondary border small">${escapeHtml(item.kategori || 'Umum')}</span>
            </td>
            <td class="text-center">
                <span class="badge bg-warning-subtle text-dark border border-warning-subtle px-2 py-1 fw-bold" style="font-size: 0.85rem;">
                    ${item.jumlahTerjual.toLocaleString('id-ID')} unit
                </span>
            </td>
            <td class="text-center text-muted small">
                ${item.jumlahTransaksi}x transaksi
            </td>
            <td class="text-end">
                <strong class="text-primary">${escapeHtml(formatRupiahTrx(item.totalPendapatan))}</strong>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Baris footer total rekap
    if (tfoot) {
        tfoot.innerHTML = `
            <tr class="table-footer-summary fw-bold text-dark">
                <td colspan="5" class="text-end py-3">Total Rekap (${rekap.length} Variasi Barang):</td>
                <td class="text-center py-3 text-dark fs-6">${grandTotalItem.toLocaleString('id-ID')} unit</td>
                <td></td>
                <td class="text-end py-3 text-primary fs-6">${escapeHtml(formatRupiahTrx(grandTotalPendapatan))}</td>
            </tr>
        `;
    }
}

/* ==============================================================================
 * CETAK LAPORAN (SIMPAN SEBAGAI PDF / CETAK KERTAS)
 * ============================================================================== */

let sedangCetakLaporan = false;
let halamanSebelumCetak = 1;

/**
 * Menyiapkan header cetak, merender seluruh baris transaksi tanpa potongan pagination,
 * lalu membuka dialog cetak browser (window.print()) untuk Cetak Fisik atau Simpan sebagai PDF.
 */
function cetakLaporan() {
    perbaruiTeksHeaderPrint();

    // Jika tab transaksi yang aktif, render seluruh data tanpa dibatasi 10 baris
    // agar hasil cetak / dokumen PDF lengkap memuat seluruh riwayat transaksi.
    if (tabAktif === 'transaksi') {
        halamanSebelumCetak = halamanAktif;
        sedangCetakLaporan = true;
        renderTabelTransaksiPenuhUntukCetak();
    }

    tampilkanToastLaporan('Membuka dialog cetak. Pilih "Simpan sebagai PDF" pada tujuan printer jika ingin file PDF.', 'info');

    setTimeout(() => {
        window.print();
    }, 250);
}

/**
 * Kompatibilitas mundur jika tombol ekspor PDF lama dipanggil.
 */
function eksporPdfLaporan() {
    cetakLaporan();
}

/**
 * Merender seluruh data transaksi aktif ke dalam tabel untuk kebutuhan cetak penuh.
 */
function renderTabelTransaksiPenuhUntukCetak() {
    const tbody = document.getElementById('tabelTransaksiBody');
    const tfoot = document.getElementById('tabelTransaksiFoot');
    if (!tbody) return;

    const listSumber = filterTransaksi({
        dari: filterTanggalDari,
        sampai: filterTanggalSampai,
        kataKunci: filterKataKunci
    });
    const list = getTransaksiTerurut(listSumber);
    const totalData = list.length;
    if (totalData === 0) return;

    let totalPendapatanSeluruh = 0;
    list.forEach(t => { totalPendapatanSeluruh += (parseInt(t.total, 10) || 0); });

    tbody.innerHTML = '';
    list.forEach((trx, idx) => {
        const noUrut = idx + 1;
        const totalItemsCount = Array.isArray(trx.items)
            ? trx.items.reduce((sum, it) => sum + (parseInt(it.jumlah, 10) || 0), 0)
            : 0;
        const variasiCount = Array.isArray(trx.items) ? trx.items.length : 0;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-center text-muted fw-semibold">${noUrut}</td>
            <td class="text-nowrap">
                <span class="small fw-medium text-dark">${escapeHtml(formatTanggal(trx.tanggal))}</span>
            </td>
            <td class="text-nowrap">
                <span class="badge bg-light text-secondary border" style="font-size: 0.76rem;">
                    <i class="bi bi-clock me-1"></i>${escapeHtml(formatWaktu(trx.waktu))}
                </span>
            </td>
            <td>
                <div class="fw-bold text-dark small">${escapeHtml(trx.pelanggan)}</div>
            </td>
            <td class="text-center">
                ${getBadgeMetodeHtml(trx.metode, trx.buktiTransfer, trx.id, trx.subMetode)}
            </td>
            <td>
                <span class="small text-dark fw-semibold">${totalItemsCount} unit</span>
                <span class="text-muted small">(${variasiCount} jenis)</span>
            </td>
            <td class="text-end">
                <strong class="text-primary">${escapeHtml(formatRupiahTrx(trx.total))}</strong>
            </td>
            <td class="text-center col-aksi-laporan">
                <button type="button" class="btn btn-sm btn-outline-secondary px-2 py-1" style="font-size: 0.78rem;" onclick="bukaModalDetailTransaksi('${trx.id}')">
                    <i class="bi bi-eye me-1"></i>Detail
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (tfoot) {
        tfoot.innerHTML = `
            <tr class="table-footer-summary fw-bold text-dark">
                <td colspan="6" class="text-end py-3">Total Pendapatan (${totalData} Transaksi Terpilih):</td>
                <td class="text-end py-3 text-primary fs-6">${escapeHtml(formatRupiahTrx(totalPendapatanSeluruh))}</td>
                <td class="col-aksi-laporan"></td>
            </tr>
        `;
    }
}

// Kembalikan tampilan pagination semula saat dialog cetak ditutup
window.addEventListener('afterprint', function () {
    if (sedangCetakLaporan) {
        sedangCetakLaporan = false;
        halamanAktif = halamanSebelumCetak;
        const listSumber = filterTransaksi({
            dari: filterTanggalDari,
            sampai: filterTanggalSampai,
            kataKunci: filterKataKunci
        });
        renderTabSemuaTransaksi(listSumber);
    }
});

/**
 * Memperbarui teks judul, periode, tanggal cetak, dan ttd khusus untuk pratinjau media print / PDF.
 */
function perbaruiTeksHeaderPrint() {
    const elJudul = document.getElementById('printJudulLaporan');
    const elPeriode = document.getElementById('printPeriodeText');
    const elTanggalSekarang = document.getElementById('printTanggalSekarang');
    const elTanggalTtd = document.getElementById('printTanggalTtd');

    if (elJudul) {
        if (tabAktif === 'barang') {
            elJudul.textContent = 'Laporan Rekapitulasi Barang Terjual';
        } else {
            elJudul.textContent = 'Laporan Riwayat Transaksi Penjualan';
        }
    }

    if (elPeriode) {
        if (!filterTanggalDari && !filterTanggalSampai) {
            elPeriode.textContent = 'Periode: Semua Riwayat Transaksi';
        } else if (filterTanggalDari && filterTanggalSampai) {
            if (filterTanggalDari === filterTanggalSampai) {
                elPeriode.textContent = `Periode: Tanggal ${formatTanggal(filterTanggalDari)}`;
            } else {
                elPeriode.textContent = `Periode: ${formatTanggal(filterTanggalDari)} s/d ${formatTanggal(filterTanggalSampai)}`;
            }
        } else if (filterTanggalDari) {
            elPeriode.textContent = `Periode: Mulai Tanggal ${formatTanggal(filterTanggalDari)}`;
        } else {
            elPeriode.textContent = `Periode: Sampai Tanggal ${formatTanggal(filterTanggalSampai)}`;
        }
    }

    const now = new Date();
    const hariIni = typeof getTodayFormatted === 'function' ? getTodayFormatted() : now.toISOString().slice(0, 10);
    const tglIndo = typeof formatTanggal === 'function' ? formatTanggal(hariIni) : hariIni;
    const jamMenit = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (elTanggalSekarang) {
        elTanggalSekarang.textContent = `Dicetak pada: ${tglIndo}, ${jamMenit} WIB`;
    }

    if (elTanggalTtd) {
        elTanggalTtd.textContent = tglIndo;
    }
}

/* ==============================================================================
 * UTILITAS TOAST & ESCAPE HTML
 * ============================================================================== */

/**
 * Menampilkan notifikasi Toast kecil di kanan atas.
 * @param {string} pesan
 * @param {'success'|'info'|'error'} tipe
 */
function tampilkanToastLaporan(pesan, tipe = 'success') {
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
 * Menghasilkan tanggal format YYYY-MM-DD hari ini jika fungsi store belum tersedia.
 * @returns {string}
 */
function getTodayFormatted() {
    const d = new Date();
    const tahun = d.getFullYear();
    const bulan = String(d.getMonth() + 1).padStart(2, '0');
    const tanggal = String(d.getDate()).padStart(2, '0');
    return `${tahun}-${bulan}-${tanggal}`;
}

/**
 * Mencegah XSS injection.
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
