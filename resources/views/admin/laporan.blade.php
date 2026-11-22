@extends('layouts.admin')

@section('title', 'Laporan Transaksi - Admin TB. Sumber Barokah Malang')

@section('content')
<div class="container">

    {{-- ======================================================================
         KOP SURAT KHUSUS CETAK (HANYA MUNCUL DI CETAK / SIMPAN SEBAGAI PDF)
         ====================================================================== --}}
    <div class="print-header-report">
        <div class="d-flex align-items-center justify-content-between pb-2 border-bottom-double">
            <div>
                <h2 class="fw-bold mb-0 text-dark" style="letter-spacing: -0.5px;">TB. SUMBER BAROKAH MALANG</h2>
                <div class="text-secondary small mt-1">Toko Bahan Bangunan & Material Konstruksi Terlengkap di Malang</div>
                <div class="text-muted small" style="font-size: 8pt;">Jl. Bandulan No.140, Kec. Sukun, Kota Malang, Jawa Timur 65146 | Telp/WA: 0812-3456-7890</div>
            </div>
            <div class="text-end small text-muted" style="font-size: 8.5pt;">
                <div class="fw-bold text-dark">DOKUMEN RESMI TOKO</div>
                <div id="printTanggalSekarang">Dicetak pada: {{ date('d/m/Y H:i') }} WIB</div>
                <div>Status: Terverifikasi Sistem</div>
            </div>
        </div>
        <div class="d-flex align-items-center justify-content-between pt-2 mt-1">
            <div>
                <h5 class="fw-bold text-dark mb-0 text-uppercase" id="printJudulLaporan">Laporan Riwayat Transaksi Penjualan</h5>
                <span class="small text-muted" id="printPeriodeText">Periode: Semua Data</span>
            </div>
            <div class="text-end small text-muted">
                Unit Bisnis: TB. Sumber Barokah
            </div>
        </div>
    </div>

    {{-- ======================================================================
         HEADER HALAMAN ADMIN LAPORAN
         ====================================================================== --}}
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
            <h1 class="admin-header-title">Laporan Transaksi</h1>
            <p class="admin-header-subtitle mb-0">Riwayat pembelian dan barang yang sudah terjual</p>
        </div>

        {{-- Tombol Aksi Kanan Atas: Cetak Laporan (Simpan sebagai PDF / Cetak Kertas) --}}
        <div class="d-flex flex-wrap align-items-center gap-2">
            <button type="button" id="btnCetakLaporan" class="btn btn-laporan-aksi btn-laporan-print-primary" onclick="cetakLaporan()" title="Cetak laporan atau Simpan sebagai PDF">
                <i class="bi bi-printer-fill me-1"></i>
                Cetak Laporan
            </button>
        </div>
    </div>

    {{-- ======================================================================
         TOOLBAR FILTER GLOBAL (BERLAKU UNTUK SELURUH ISI LAPORAN)
         ====================================================================== --}}
    <div class="admin-toolbar-card mb-4">
        <div class="row g-3 align-items-center justify-content-between">
            
            {{-- Input Rentang Tanggal "Dari" & "Sampai" --}}
            <div class="col-12 col-md-auto">
                <div class="d-flex flex-wrap align-items-center gap-2">
                    <div class="d-flex align-items-center gap-1">
                        <label for="filterTglDari" class="small text-muted fw-semibold text-nowrap mb-0">Dari:</label>
                        <input type="date" id="filterTglDari" class="form-control form-control-sm" style="border-radius: 8px; width: 155px;">
                    </div>
                    <div class="d-flex align-items-center gap-1">
                        <label for="filterTglSampai" class="small text-muted fw-semibold text-nowrap mb-0">Sampai:</label>
                        <input type="date" id="filterTglSampai" class="form-control form-control-sm" style="border-radius: 8px; width: 155px;">
                    </div>
                </div>
            </div>

            {{-- Kolom Pencarian & Tombol Reset --}}
            <div class="col-12 col-md-auto">
                <div class="d-flex align-items-center gap-2">
                    <div class="input-group search-input-group" style="min-width: 260px;">
                        <span class="input-group-text"><i class="bi bi-search"></i></span>
                        <input type="text" id="searchLaporan" class="form-control form-control-sm" placeholder="Cari..." autocomplete="off">
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-secondary text-nowrap px-2" style="border-radius: 8px;" onclick="resetSemuaFilterLaporan()" title="Reset semua filter">
                        <i class="bi bi-arrow-counterclockwise"></i>
                    </button>
                </div>
            </div>

        </div>

        {{-- Pesan Validasi Rentang Tanggal --}}
        <div id="errorRentangTanggal" class="alert alert-danger py-2 px-3 small mt-3 mb-0 d-none">
            Tanggal "Dari" tidak boleh melebihi tanggal "Sampai".
        </div>
    </div>

    {{-- ======================================================================
         3 KARTU RINGKASAN LAPORAN (MENGIKUTI FILTER YANG AKTIF)
         ====================================================================== --}}
    <div class="row g-3 mb-4 row-stat-laporan">
        {{-- Card 1: Jumlah Transaksi --}}
        <div class="col-12 col-md-4">
            <div class="stat-card">
                <div>
                    <div class="stat-label">Jumlah Transaksi</div>
                    <h2 class="stat-value text-dark" id="statLaporanTotalTrx">0</h2>
                    <div class="stat-subtext">Transaksi pembelian</div>
                </div>
                <div class="stat-icon-wrapper stat-icon-primary">
                    <i class="bi bi-receipt"></i>
                </div>
            </div>
        </div>

        {{-- Card 2: Total Pendapatan --}}
        <div class="col-12 col-md-4">
            <div class="stat-card">
                <div>
                    <div class="stat-label">Total Pendapatan</div>
                    <h2 class="stat-value text-success" id="statLaporanPendapatan">Rp 0</h2>
                    <div class="stat-subtext">Hasil penjualan material</div>
                </div>
                <div class="stat-icon-wrapper stat-icon-success">
                    <i class="bi bi-cash-stack"></i>
                </div>
            </div>
        </div>

        {{-- Card 3: Total Barang Terjual --}}
        <div class="col-12 col-md-4">
            <div class="stat-card">
                <div>
                    <div class="stat-label">Total Barang Terjual</div>
                    <h2 class="stat-value text-warning" id="statLaporanItemTerjual">0 item</h2>
                    <div class="stat-subtext">Kuantitas fisik material</div>
                </div>
                <div class="stat-icon-wrapper stat-icon-warning">
                    <i class="bi bi-box-seam"></i>
                </div>
            </div>
        </div>
    </div>

    {{-- ======================================================================
         NAVIGASI TAB KONTEN LAPORAN (BOOTSTRAP TABS)
         Tab 1: Semua Transaksi | Tab 2: Barang Terjual
         ====================================================================== --}}
    <ul class="nav nav-tabs laporan-nav-tabs" id="laporanTab" role="tablist">
        <li class="nav-item" role="presentation">
            <button class="nav-link active" id="tabNavTransaksi" data-bs-toggle="tab" data-bs-target="#tabContentTransaksi" type="button" role="tab" aria-controls="tabContentTransaksi" aria-selected="true">
                <i class="bi bi-list-check me-2"></i>Semua Transaksi
            </button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link" id="tabNavBarang" data-bs-toggle="tab" data-bs-target="#tabContentBarang" type="button" role="tab" aria-controls="tabContentBarang" aria-selected="false">
                <i class="bi bi-boxes me-2"></i>Barang Terjual
            </button>
        </li>
    </ul>

    {{-- ======================================================================
         ISI KONTEN MASING-MASING TAB
         ====================================================================== --}}
    <div class="tab-content" id="laporanTabContent">

        {{-- ==================================================================
             TAB 1: SEMUA TRANSAKSI
             ================================================================== --}}
        <div class="tab-pane fade show active" id="tabContentTransaksi" role="tabpanel" aria-labelledby="tabNavTransaksi">
            
            {{-- Toolbar Urutan Transaksi --}}
            <div class="d-flex flex-wrap align-items-center justify-content-between mb-3 gap-2">
                <div class="small text-muted fw-semibold">
                    Daftar seluruh riwayat pembayaran pelanggan
                </div>
                <div class="d-flex align-items-center gap-2 ms-auto">
                    <label for="sortUrutanTransaksi" class="small text-muted text-nowrap fw-semibold mb-0">
                        <i class="bi bi-sort-down text-warning me-1"></i>Urutkan:
                    </label>
                    <select id="sortUrutanTransaksi" class="form-select form-select-sm w-auto" style="border-radius: 8px;">
                        <option value="terbaru">Terbaru</option>
                        <option value="terlama">Terlama</option>
                        <option value="total_terbesar">Total Terbesar</option>
                        <option value="total_terkecil">Total Terkecil</option>
                    </select>
                </div>
            </div>

            {{-- Tabel Riwayat Transaksi (Kode Dihapus, Menampilkan Metode Pembayaran) --}}
            <div class="table-card mb-3">
                <div class="table-responsive">
                    <table class="table table-custom align-middle mb-0">
                        <thead>
                            <tr>
                                <th class="text-center" style="width: 50px;">No</th>
                                <th style="width: 160px;">Tanggal</th>
                                <th style="width: 110px;">Waktu</th>
                                <th>Pelanggan</th>
                                <th class="text-center" style="width: 130px;">Metode</th>
                                <th style="width: 160px;">Jumlah Barang</th>
                                <th class="text-end" style="width: 170px;">Total</th>
                                <th class="text-center col-aksi-laporan" style="width: 100px;">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="tabelTransaksiBody">
                            {{-- Diisi secara dinamis oleh public/js/admin-laporan.js --}}
                        </tbody>
                        <tfoot id="tabelTransaksiFoot">
                            {{-- Diisi total keseluruhan oleh JS --}}
                        </tfoot>
                    </table>
                </div>
            </div>

            {{-- Navigasi Pagination Sederhana (10 baris per halaman) --}}
            <div class="laporan-pagination-wrapper d-flex flex-wrap align-items-center justify-content-between pt-2 gap-2" id="paginationTransaksiWrapper">
                <span class="small text-muted fw-medium" id="infoPaginationTransaksi">Menampilkan 0 transaksi</span>
                <nav aria-label="Navigasi halaman transaksi">
                    <ul class="pagination pagination-sm laporan-pagination mb-0" id="ulPaginationTransaksi">
                        {{-- Tombol pagination dinamis --}}
                    </ul>
                </nav>
            </div>

        </div>

        {{-- ==================================================================
             TAB 2: BARANG TERJUAL (Top 5 Dihapus)
             ================================================================== --}}
        <div class="tab-pane fade" id="tabContentBarang" role="tabpanel" aria-labelledby="tabNavBarang">
            
            {{-- Toolbar Urutan Rekap Barang --}}
            <div class="d-flex flex-wrap align-items-center justify-content-between mb-3 gap-2">
                <div class="small text-muted fw-semibold">
                    Rekapitulasi total penjualan per variasi material
                </div>
                <div class="d-flex align-items-center gap-2 ms-auto">
                    <label for="sortUrutanBarang" class="small text-muted text-nowrap fw-semibold mb-0">
                        <i class="bi bi-sort-down text-warning me-1"></i>Urutkan:
                    </label>
                    <select id="sortUrutanBarang" class="form-select form-select-sm w-auto" style="border-radius: 8px;">
                        <option value="terlaris">Terlaris (Kuantitas)</option>
                        <option value="terbaru">Terbaru (Tanggal & Waktu)</option>
                        <option value="pendapatan">Pendapatan Terbesar</option>
                        <option value="nama_az">Nama A - Z</option>
                    </select>
                </div>
            </div>

            {{-- Tabel Rekap Barang Terjual --}}
            <div class="table-card mb-4">
                <div class="table-responsive">
                    <table class="table table-custom align-middle mb-0">
                        <thead>
                            <tr>
                                <th class="text-center" style="width: 50px;">No</th>
                                <th style="width: 150px;">Tanggal</th>
                                <th style="width: 110px;">Waktu</th>
                                <th>Nama Barang</th>
                                <th style="width: 140px;">Kategori</th>
                                <th class="text-center" style="width: 140px;">Jumlah Terjual</th>
                                <th class="text-center" style="width: 140px;">Jumlah Transaksi</th>
                                <th class="text-end" style="width: 180px;">Total Pendapatan</th>
                            </tr>
                        </thead>
                        <tbody id="tabelBarangTerjualBody">
                            {{-- Diisi rekap barang oleh JS --}}
                        </tbody>
                        <tfoot id="tabelBarangTerjualFoot">
                            {{-- Diisi total keseluruhan oleh JS --}}
                        </tfoot>
                    </table>
                </div>
            </div>

        </div>

    </div>

    {{-- ======================================================================
         AREA TANDA TANGAN RESMI CETAK (HANYA MUNCUL DI PRATINJAU CETAK / PDF)
         ====================================================================== --}}
    <div class="print-signature-section">
        <div class="d-flex justify-content-between align-items-end mt-4 pt-3">
            <div class="small text-muted" style="font-size: 8.5pt; line-height: 1.45;">
                <em>* Laporan dicetak otomatis melalui Aplikasi Pengelolaan Toko TB. Sumber Barokah Malang.</em><br>
                <em>* Harap simpan dokumen ini sebagai arsip pembukuan dan laporan resmi toko.</em>
            </div>
            <div class="text-center" style="width: 240px; font-size: 9pt;">
                <div>Malang, <span id="printTanggalTtd">{{ date('d F Y') }}</span></div>
                <div class="mt-1 fw-semibold text-dark">Penanggung Jawab Toko,</div>
                <div style="height: 65px;"></div>
                <div class="fw-bold text-dark text-decoration-underline">( TB. SUMBER BAROKAH )</div>
            </div>
        </div>
    </div>

</div>

{{-- ======================================================================
     MODAL DETAIL TRANSAKSI
     ====================================================================== --}}
<div class="modal fade" id="modalDetailTransaksi" tabindex="-1" aria-labelledby="modalDetailTransaksiLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content modal-content-custom">
            
            <div class="modal-header modal-header-custom">
                <div class="d-flex align-items-center gap-2">
                    <div class="stat-icon-wrapper stat-icon-primary" style="width: 36px; height: 36px; font-size: 1.1rem;">
                        <i class="bi bi-receipt-cutoff"></i>
                    </div>
                    <div>
                        <h5 class="modal-title fw-bold text-dark fs-6 mb-0" id="modalDetailTransaksiLabel">
                            Rincian Transaksi Pembelian
                        </h5>
                    </div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
            </div>

            <div class="modal-body p-4">
                
                {{-- Header Rincian Transaksi --}}
                <div class="row g-3 p-3 rounded-3 bg-light border mb-4">
                    <div class="col-sm-6 col-md-4">
                        <div class="small text-muted">Tanggal & Waktu:</div>
                        <div class="fw-semibold text-dark small mt-1" id="detailTrxWaktu">-</div>
                    </div>
                    <div class="col-sm-6 col-md-4">
                        <div class="small text-muted">Nama Pelanggan:</div>
                        <div class="fw-bold text-dark small mt-1" id="detailTrxPelanggan">Pelanggan Umum</div>
                    </div>
                    <div class="col-sm-6 col-md-4">
                        <div class="small text-muted">Metode Pembayaran:</div>
                        <div class="mt-1 small" id="detailTrxMetode">
                            <span class="badge bg-success-subtle text-success border border-success-subtle">
                                <i class="bi bi-cash me-1"></i>Tunai
                            </span>
                        </div>
                    </div>
                </div>

                {{-- Tabel Rincian Material yang Dibeli --}}
                <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="small fw-bold text-dark text-uppercase" style="letter-spacing: 0.4px;">
                        <i class="bi bi-box-seam text-warning me-1"></i>Daftar Material Belanja
                    </span>
                </div>

                <div class="table-responsive border rounded-3 overflow-hidden mb-3">
                    <table class="table table-sm align-middle mb-0">
                        <thead class="bg-light">
                            <tr>
                                <th class="text-center" style="width: 40px;">No</th>
                                <th>Material</th>
                                <th style="width: 140px;">Kategori</th>
                                <th class="text-center" style="width: 80px;">Qty</th>
                                <th class="text-end" style="width: 130px;">Harga Satuan</th>
                                <th class="text-end" style="width: 140px;">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody id="detailTrxTabelBarangBody">
                            {{-- Diisi secara dinamis --}}
                        </tbody>
                    </table>
                </div>

                {{-- Ringkasan Pembayaran & Kembalian --}}
                <div class="p-3 rounded-3 bg-light border">
                    <div class="row g-2 justify-content-end text-end">
                        <div class="col-sm-7 col-md-6">
                            <div class="d-flex justify-content-between py-1 small">
                                <span class="text-muted">Total Belanja:</span>
                                <strong class="text-primary fs-6" id="detailTrxTotal">Rp 0</strong>
                            </div>
                            <div class="d-flex justify-content-between py-1 small border-top">
                                <span class="text-muted">Uang Diterima / Dibayar:</span>
                                <span class="fw-semibold text-dark" id="detailTrxBayar">Rp 0</span>
                            </div>
                            <div class="d-flex justify-content-between py-1 small border-top">
                                <span class="text-muted">Kembalian:</span>
                                <span class="fw-bold text-success" id="detailTrxKembalian">Rp 0</span>
                            </div>
                        </div>
                    </div>
                </div>

                {{-- Bukti Pembayaran Transfer (Muncul jika Metode Transfer & Memiliki Lampiran) --}}
                <div id="detailTrxBuktiWrapper" class="p-3 rounded-3 bg-light border mt-3 d-none">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="small fw-bold text-dark text-uppercase">
                            <i class="bi bi-receipt text-primary me-1"></i>Bukti Pembayaran Transfer
                        </span>
                        <a id="detailTrxBuktiLink" href="#" target="_blank" class="small text-decoration-none fw-semibold">
                            <i class="bi bi-box-arrow-up-right me-1"></i>Buka Ukuran Asli
                        </a>
                    </div>
                    <div class="text-center p-2 bg-white rounded-3 border">
                        <img id="detailTrxBuktiImg" src="" alt="Bukti Transfer" class="img-fluid rounded" style="max-height: 240px; object-fit: contain;">
                    </div>
                </div>

            </div>

            <div class="modal-footer modal-footer-custom">
                <button type="button" class="btn btn-sm btn-secondary px-4" data-bs-dismiss="modal">Tutup</button>
            </div>

        </div>
    </div>
</div>

{{-- ======================================================================
     MODAL KHUSUS LIHAT BUKTI TRANSFER PEMBAYARAN
     ====================================================================== --}}
<div class="modal fade" id="modalLihatBuktiTransfer" tabindex="-1" aria-labelledby="modalLihatBuktiLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content modal-content-custom">
            <div class="modal-header modal-header-custom py-2">
                <h6 class="modal-title fw-bold text-dark fs-6" id="modalLihatBuktiLabel">
                    <i class="bi bi-receipt text-primary me-2"></i>Bukti Pembayaran Transfer Pelanggan
                </h6>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
            </div>
            <div class="modal-body p-3 text-center bg-light">
                <div class="small text-muted mb-2 text-start d-flex justify-content-between">
                    <span id="lihatBuktiPelanggan">Pelanggan</span>
                    <span id="lihatBuktiWaktu">Waktu</span>
                </div>
                <div class="p-2 bg-white rounded border d-inline-block w-100">
                    <img id="imgBuktiTransferPenuh" src="" alt="Bukti Transfer" class="img-fluid rounded" style="max-height: 480px; object-fit: contain;">
                </div>
            </div>
            <div class="modal-footer modal-footer-custom py-2">
                <a id="btnBukaBuktiTabBaru" href="#" target="_blank" class="btn btn-sm btn-outline-primary">
                    <i class="bi bi-box-arrow-up-right me-1"></i>Buka Gambar Penuh
                </a>
                <button type="button" class="btn btn-sm btn-secondary px-3" data-bs-dismiss="modal">Tutup</button>
            </div>
        </div>
    </div>
</div>

{{-- ======================================================================
     TOAST NOTIFIKASI
     ====================================================================== --}}
<div class="admin-toast-container">
    <div id="adminToast" class="toast align-items-center text-white bg-dark border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
            <div class="toast-body d-flex align-items-center py-2 px-3 small">
                <i id="toastIcon" class="bi bi-check-circle-fill text-success me-2 fs-6"></i>
                <span id="toastPesan">Operasi berhasil dilakukan.</span>
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Tutup"></button>
        </div>
    </div>
</div>

@endsection

@push('scripts')
    {{-- Urutan script: stok-store.js, transaksi-store.js, baru admin-laporan.js --}}
    <script src="{{ asset('js/stok-store.js') }}?v=2.5"></script>
    <script src="{{ asset('js/transaksi-store.js') }}?v=1.0"></script>
    <script src="{{ asset('js/admin-laporan.js') }}?v=1.0"></script>
@endpush
