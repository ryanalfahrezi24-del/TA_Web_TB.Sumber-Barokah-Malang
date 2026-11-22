@extends('layouts.app')

@section('title', 'Katalog Barang - TB. Sumber Barokah Malang')

@push('css')
    {{-- CSS Khusus Halaman Katalog --}}
    <link rel="stylesheet" href="{{ asset('css/katalog.css') }}?v=3.1">
@endpush

@section('content')

    {{-- ======================================================================
         1. HEADER HALAMAN KATALOG
         ====================================================================== --}}
    <section class="katalog-header">
        <div class="container">
            <span class="badge rounded-pill mb-2 px-3 py-2" style="background-color: var(--primary-light); color: var(--primary-color); font-weight: 600; font-size: 0.82rem;">
                <i class="bi bi-shop me-1"></i> Produk Bangunan & Material
            </span>
            <h1 class="katalog-header-title">Katalog Barang</h1>
            <p class="katalog-header-subtitle">
                Cek harga dan ketersediaan barang di TB. Sumber Barokah Malang secara langsung dan terkini.
            </p>
        </div>
    </section>

    {{-- ======================================================================
         2. SECTION UTAMA: TOOLBAR (FILTER KATEGORI, PENCARIAN & URUTAN) & GRID DAFTAR BARANG
         ====================================================================== --}}
    <section class="katalog-section">
        <div class="container">
            
            {{-- Toolbar: Pencarian, Dropdown Pilih Kategori & Urutan --}}
            <div class="katalog-toolbar">
                <div class="row g-3 align-items-center">
                    
                    {{-- Input Pencarian --}}
                    <div class="col-12 col-md-5 col-lg-5">
                        <div class="input-group katalog-search-group">
                            <span class="input-group-text"><i class="bi bi-search"></i></span>
                            <input type="text" id="searchKatalog" class="form-control" placeholder="Cari material atau barang..." autocomplete="off">
                        </div>
                    </div>

                    {{-- Dropdown Pilih Kategori --}}
                    <div class="col-12 col-sm-6 col-md-4 col-lg-4">
                        <div class="d-flex align-items-center gap-2">
                            <label for="filterKategoriKatalog" class="small text-muted text-nowrap fw-semibold">
                                <i class="bi bi-tags text-warning me-1"></i>Kategori:
                            </label>
                            <select class="form-select select-sort-katalog flex-grow-1" id="filterKategoriKatalog" aria-label="Pilih Kategori">
                                <option value="Semua">Semua Kategori</option>
                            </select>
                        </div>
                    </div>

                    {{-- Dropdown Pengurutan (Sort) --}}
                    <div class="col-12 col-sm-6 col-md-3 col-lg-3">
                        <div class="d-flex align-items-center gap-2">
                            <label for="sortKatalog" class="small text-muted text-nowrap fw-semibold">
                                <i class="bi bi-arrow-down-up text-secondary me-1"></i>Urut:
                            </label>
                            <select class="form-select select-sort-katalog flex-grow-1" id="sortKatalog" aria-label="Urutkan Katalog">
                                <option value="nama-asc" selected>Nama: A - Z</option>
                                <option value="harga-asc">Harga: Termurah</option>
                                <option value="harga-desc">Harga: Termahal</option>
                            </select>
                        </div>
                    </div>

                </div>

                {{-- Teks Jumlah Hasil --}}
                <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                    <span class="katalog-count-text" id="katalogCount">Memuat barang...</span>
                    <span class="small text-muted d-none d-sm-inline">
                        <i class="bi bi-clock-history me-1"></i> Data diperbarui otomatis
                    </span>
                </div>
            </div>

            {{-- Kontainer Daftar Barang (Mendukung Grouped Category View & Flat Grid) --}}
            <div id="katalogContainer">
                {{-- Diisi secara dinamis oleh public/js/katalog.js --}}
            </div>

        </div>
    </section>

    {{-- ======================================================================
         MODAL LIHAT DETAIL BARANG
         ====================================================================== --}}
    <div class="modal fade" id="modalDetailBarang" tabindex="-1" aria-labelledby="modalDetailBarangLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content katalog-modal-content border-0 shadow-lg">
                <div class="modal-header katalog-modal-header bg-light">
                    <div class="d-flex align-items-center gap-2">
                        <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1" id="detailKategoriBadge">
                            <i class="bi bi-tag-fill me-1"></i>Kategori
                        </span>
                        <h5 class="modal-title fw-bold text-dark fs-6 mb-0" id="modalDetailBarangLabel">
                            Detail Produk Material
                        </h5>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
                </div>

                <div class="modal-body p-4">
                    <input type="hidden" id="detailIdBarang">

                    <div class="row g-4 align-items-start">
                        {{-- Kolom Kiri: Gambar Produk & Status Stok --}}
                        <div class="col-md-5">
                            <div class="modal-detail-img-box mb-3 shadow-sm" id="detailImgBox">
                                <img id="detailImgProduk" src="" alt="" class="d-none">
                                <div id="detailImgPlaceholder" class="text-center p-3">
                                    <i class="bi bi-box-seam text-secondary" style="font-size: 3.5rem;"></i>
                                    <div class="text-muted small mt-2 fw-semibold">TB. Sumber Barokah Malang</div>
                                </div>
                            </div>

                            <div class="p-3 rounded-3 bg-light border">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span class="text-muted small">Status Ketersediaan:</span>
                                    <span id="detailBadgeStatus" class="katalog-badge katalog-badge-tersedia">
                                        <i class="bi bi-check-circle-fill"></i> Tersedia
                                    </span>
                                </div>
                                <div class="d-flex justify-content-between align-items-center">
                                    <span class="text-muted small">Stok di Toko:</span>
                                    <span class="fw-bold text-dark" id="detailStokTersedia">0 unit</span>
                                </div>
                            </div>
                        </div>

                        {{-- Kolom Kanan: Nama, Harga, Deskripsi, Spesifikasi & Pembelian --}}
                        <div class="col-md-7">
                            <h3 class="fw-bold text-dark fs-5 mb-1" id="detailNamaBarang">Nama Barang</h3>
                            <div class="d-flex align-items-baseline gap-2 mb-3">
                                <div class="fw-extrabold fs-3" style="color: var(--primary-color);" id="detailHargaBarang">Rp 0</div>
                                <span class="text-muted fw-normal" id="detailSatuanHarga">/unit</span>
                            </div>

                            {{-- Deskripsi Produk --}}
                            <div class="mb-3">
                                <label class="small fw-bold text-secondary text-uppercase tracking-wider mb-1 d-block">
                                    <i class="bi bi-info-circle text-primary me-1"></i>Deskripsi Produk
                                </label>
                                <p class="small text-muted mb-0" id="detailDeskripsiBarang" style="line-height: 1.6;">
                                    Memuat deskripsi produk...
                                </p>
                            </div>

                            {{-- Tabel Spesifikasi Singkat --}}
                            <div class="mb-3">
                                <label class="small fw-bold text-secondary text-uppercase tracking-wider mb-1 d-block">
                                    <i class="bi bi-list-check text-primary me-1"></i>Spesifikasi Material
                                </label>
                                <table class="table table-sm modal-detail-spec-table mb-0">
                                    <tbody>
                                        <tr>
                                            <th>Kategori</th>
                                            <td id="detailSpecKategori">-</td>
                                        </tr>
                                        <tr>
                                            <th>Satuan Jual</th>
                                            <td id="detailSpecSatuan">-</td>
                                        </tr>
                                        <tr>
                                            <th>Pengambilan</th>
                                            <td>Diambil di Toko / Dikirim ke Lokasi</td>
                                        </tr>
                                        <tr>
                                            <th>Jaminan Mutu</th>
                                            <td><span class="text-success"><i class="bi bi-shield-check me-1"></i>Asli & Berkualitas</span></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {{-- Pilihan Warna (Khusus Produk Cat / Barang dengan Varian Warna) --}}
                            <div id="detailWrapperWarna" class="mb-3 p-3 rounded-3 bg-light border d-none">
                                <label for="detailSelectWarna" class="form-label small fw-semibold text-secondary mb-1 d-flex align-items-center justify-content-between">
                                    <span><i class="bi bi-palette-fill text-primary me-1"></i>Pilih Varian Warna <span class="text-danger">*</span></span>
                                    <span class="badge bg-primary text-white" id="detailBadgeWarnaTerpilih" style="font-size: 0.75rem;">Putih</span>
                                </label>
                                <select class="form-select form-select-sm" id="detailSelectWarna">
                                    {{-- Diisi secara dinamis oleh JS --}}
                                </select>
                            </div>

                            {{-- Kontrol Kuantitas Pembelian di Detail Modal --}}
                            <div class="pt-2 border-top">
                                <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                                    <div>
                                        <label for="detailInputQty" class="form-label small fw-semibold text-secondary mb-1 d-block">
                                            Jumlah Beli
                                        </label>
                                        <div class="d-flex align-items-center gap-2">
                                            <div class="katalog-qty-stepper">
                                                <button type="button" class="btn-katalog-qty" id="btnDetailKurangQty" title="Kurangi jumlah">
                                                    <i class="bi bi-dash-lg"></i>
                                                </button>
                                                <input type="number" id="detailInputQty" class="input-katalog-qty" value="1" min="1">
                                                <button type="button" class="btn-katalog-qty" id="btnDetailTambahQty" title="Tambah jumlah">
                                                    <i class="bi bi-plus-lg"></i>
                                                </button>
                                            </div>
                                            <span class="fw-semibold text-secondary small" id="detailSatuanQty">unit</span>
                                        </div>
                                    </div>

                                    <div class="text-end">
                                        <span class="small text-muted d-block">Subtotal Estimasi:</span>
                                        <span class="fw-bold fs-5" style="color: var(--primary-color);" id="detailSubtotalHarga">Rp 0</span>
                                    </div>
                                </div>
                                <div id="detailErrorQty" class="text-danger small mb-1 d-none"></div>
                            </div>

                        </div>
                    </div>
                </div>

                <div class="modal-footer katalog-modal-footer bg-light">
                    <button type="button" class="btn btn-sm btn-outline-secondary px-3" data-bs-dismiss="modal">Tutup</button>
                    <button type="button" class="btn btn-sm btn-konfirmasi-keranjang px-4" id="btnDetailTambahKeranjang">
                        <i class="bi bi-cart-plus me-1"></i> Masukkan ke Keranjang
                    </button>
                </div>
            </div>
        </div>
    </div>

    {{-- ======================================================================
         MODAL ATUR JUMLAH BARANG YANG DIBELI
         ====================================================================== --}}
    <div class="modal fade" id="modalPilihJumlahKatalog" tabindex="-1" aria-labelledby="modalPilihJumlahLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content katalog-modal-content">
                <div class="modal-header katalog-modal-header">
                    <h5 class="modal-title fw-bold text-dark fs-6" id="modalPilihJumlahLabel">
                        <i class="bi bi-cart-plus text-warning me-2"></i>Atur Jumlah Pembelian
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
                </div>

                <div class="modal-body p-4">
                    <input type="hidden" id="modalJumlahIdBarang">

                    {{-- Informasi Barang yang Dipilih --}}
                    <div class="katalog-modal-product-info mb-3 d-flex align-items-center gap-3">
                        <div id="modalJumlahImgWrapper" class="rounded border bg-light d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0" style="width: 58px; height: 58px;">
                            <img id="modalJumlahImg" src="" alt="" class="w-100 h-100 d-none" style="object-fit: cover;">
                            <i id="modalJumlahIconFallback" class="bi bi-box-seam text-secondary fs-4"></i>
                        </div>
                        <div class="flex-grow-1 overflow-hidden">
                            <span class="badge bg-light text-secondary border mb-1" id="modalJumlahKategori">Kategori</span>
                            <h6 class="fw-bold text-dark mb-1 text-truncate" id="modalJumlahNamaBarang">Nama Barang</h6>
                            <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-1">
                                <div class="fw-bold" style="color: var(--primary-color); font-size: 1.05rem;" id="modalJumlahHargaSatuan">
                                    Rp 0 /unit
                                </div>
                                <span class="small text-muted" id="modalJumlahStokTersedia">
                                    Stok tersedia: <strong>0</strong>
                                </span>
                            </div>
                        </div>
                    </div>

                    {{-- Pilihan Warna (Khusus Produk Cat / Barang dengan Varian Warna) --}}
                    <div id="wrapperModalPilihanWarna" class="mb-3 p-3 rounded-3 bg-light border d-none">
                        <label for="selectModalWarnaBarang" class="form-label small fw-semibold text-secondary mb-1 d-flex align-items-center justify-content-between">
                            <span><i class="bi bi-palette-fill text-primary me-1"></i>Pilih Varian Warna <span class="text-danger">*</span></span>
                            <span class="badge bg-primary text-white" id="badgeWarnaTerpilih" style="font-size: 0.75rem;">Putih</span>
                        </label>
                        <select class="form-select form-select-sm" id="selectModalWarnaBarang">
                            {{-- Diisi secara dinamis oleh JS --}}
                        </select>
                        <div class="form-text text-muted mt-1" style="font-size: 0.72rem;">
                            Pilih warna cat yang diinginkan sebelum menambahkan ke keranjang belanja.
                        </div>
                    </div>

                    {{-- Kontrol Input Jumlah Barang yang Dibeli --}}
                    <div class="mb-3">
                        <label for="inputModalJumlahBeli" class="form-label small fw-semibold text-secondary mb-2">
                            Jumlah Barang yang Dibeli
                        </label>
                        <div class="d-flex align-items-center gap-2">
                            <div class="katalog-qty-stepper">
                                <button type="button" class="btn-katalog-qty" id="btnModalKurangQty" title="Kurangi jumlah">
                                    <i class="bi bi-dash-lg"></i>
                                </button>
                                <input type="number" id="inputModalJumlahBeli" class="input-katalog-qty" value="1" min="1">
                                <button type="button" class="btn-katalog-qty" id="btnModalTambahQty" title="Tambah jumlah">
                                    <i class="bi bi-plus-lg"></i>
                                </button>
                            </div>
                            <span class="fw-semibold text-secondary" id="modalJumlahSatuanLabel">unit</span>
                        </div>
                        <div id="modalJumlahError" class="text-danger small mt-1 d-none"></div>
                    </div>

                    {{-- Ringkasan Subtotal Harga --}}
                    <div class="katalog-modal-subtotal-box">
                        <span class="small fw-semibold text-secondary">Subtotal Harga</span>
                        <span class="fw-bold fs-5" style="color: var(--primary-color);" id="modalJumlahSubtotal">Rp 0</span>
                    </div>
                </div>

                <div class="modal-footer katalog-modal-footer">
                    <button type="button" class="btn btn-sm btn-outline-secondary px-3" data-bs-dismiss="modal">Batal</button>
                    <button type="button" class="btn btn-sm btn-konfirmasi-keranjang px-4" id="btnKonfirmasiTambahKeranjang">
                        <i class="bi bi-cart-check me-1"></i>
                        Masukkan ke Keranjang
                    </button>
                </div>
            </div>
        </div>
    </div>

    {{-- ======================================================================
         TOAST NOTIFIKASI KERANJANG KATALOG
         ====================================================================== --}}
    <div class="position-fixed top-0 end-0 p-3" style="z-index: 1090;">
        <div id="katalogToast" class="toast align-items-center text-white bg-dark border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body d-flex align-items-center py-2 px-3 small">
                    <i class="bi bi-check-circle-fill text-success me-2 fs-6"></i>
                    <span id="toastKatalogPesan">Barang berhasil ditambahkan ke keranjang.</span>
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Tutup"></button>
            </div>
        </div>
    </div>

@endsection

@push('scripts')
    {{-- PERHATIKAN URUTAN: Data Layer (stok-store.js) dimuat terlebih dahulu, kemudian script tampilan (katalog.js) --}}
    <script src="{{ asset('js/stok-store.js') }}?v=2.9"></script>
    <script src="{{ asset('js/katalog.js') }}?v=3.1"></script>
@endpush
