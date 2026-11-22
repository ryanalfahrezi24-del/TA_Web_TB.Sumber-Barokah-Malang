@extends('layouts.admin')

@section('title', 'Informasi Stok Barang - Admin TB. Sumber Barokah Malang')

@section('content')
<div class="container">
    
    {{-- Header Halaman Admin --}}
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
            <h1 class="admin-header-title">Informasi Stok Barang</h1>
            <p class="admin-header-subtitle mb-0">Kelola ketersediaan material bangunan, batas minimum, dan harga jual toko.</p>
        </div>
    </div>

    {{-- 3 Kartu Ringkasan (Summary Cards) --}}
    <div class="row g-3 mb-4">
        {{-- Card 1: Total Barang --}}
        <div class="col-sm-6 col-lg-4">
            <div class="stat-card">
                <div>
                    <div class="stat-label" id="statTotalBarangLabel">Total Barang</div>
                    <h2 class="stat-value" id="statTotalBarang">0</h2>
                    <div class="stat-subtext" id="statTotalBarangSub">0 jenis material</div>
                </div>
                <div class="stat-icon-wrapper stat-icon-total">
                    <i class="bi bi-box-seam"></i>
                </div>
            </div>
        </div>

        {{-- Card 2: Stok Menipis --}}
        <div class="col-sm-6 col-lg-4">
            <div class="stat-card">
                <div>
                    <div class="stat-label" id="statStokMenipisLabel">Stok Menipis</div>
                    <h2 class="stat-value text-warning" id="statStokMenipis">0</h2>
                    <div class="stat-subtext" id="statStokMenipisSub">Perlu restok segera</div>
                </div>
                <div class="stat-icon-wrapper stat-icon-warning">
                    <i class="bi bi-exclamation-triangle"></i>
                </div>
            </div>
        </div>

        {{-- Card 3: Stok Habis --}}
        <div class="col-sm-12 col-lg-4">
            <div class="stat-card">
                <div>
                    <div class="stat-label" id="statStokHabisLabel">Stok Habis</div>
                    <h2 class="stat-value text-danger" id="statStokHabis">0</h2>
                    <div class="stat-subtext" id="statStokHabisSub">Stok barang kosong</div>
                </div>
                <div class="stat-icon-wrapper stat-icon-danger">
                    <i class="bi bi-x-octagon"></i>
                </div>
            </div>
        </div>
    </div>

    {{-- Toolbar Aksi: Tambah Barang & Filter Pencarian --}}
    <div class="admin-toolbar-card">
        <div class="row g-3 align-items-center justify-content-between">
            {{-- Tombol Tambah Barang --}}
            <div class="col-12 col-md-auto">
                <button type="button" class="btn btn-tambah-barang w-100 w-md-auto" onclick="bukaModalTambah()">
                    <i class="bi bi-plus-lg me-1"></i>
                    Tambah Barang
                </button>
            </div>

            {{-- Filter Kategori & Kolom Pencarian --}}
            <div class="col-12 col-md-auto d-flex flex-wrap align-items-center gap-2">
                <div class="d-flex align-items-center gap-2">
                    <label for="filterKategoriAdmin" class="small text-muted text-nowrap fw-semibold">
                        <i class="bi bi-tags text-warning me-1"></i>Kategori:
                    </label>
                    <select id="filterKategoriAdmin" class="form-select d-inline-block w-auto" style="min-width: 180px; font-size: 0.9rem;">
                        <option value="Semua">Semua Kategori</option>
                    </select>
                </div>
                <div class="input-group search-input-group" style="min-width: 220px;">
                    <span class="input-group-text"><i class="bi bi-search"></i></span>
                    <input type="text" id="searchBarang" class="form-control" placeholder="Cari nama barang..." autocomplete="off">
                </div>
            </div>
        </div>
    </div>

    {{-- Tabel Data Stok Barang --}}
    <div class="table-card">
        <div class="table-responsive">
            <table class="table table-custom align-middle">
                <thead>
                    <tr>
                        <th class="text-center" style="width: 50px;">No</th>
                        <th>Nama Barang</th>
                        <th style="width: 140px;">Kategori</th>
                        <th class="text-end" style="width: 140px;">Stok Tersedia</th>
                        <th class="text-end" style="width: 140px;">Stok Minimum</th>
                        <th class="text-center" style="width: 130px;">Status Stok</th>
                        <th class="text-end" style="width: 150px;">Harga</th>
                        <th class="text-center" style="width: 100px;">Aksi</th>
                    </tr>
                </thead>
                <tbody id="tabelBarangBody">
                    {{-- Diisi secara dinamis oleh public/js/admin-stok.js --}}
                </tbody>
            </table>
        </div>
    </div>

</div>

{{-- ======================================================================
     MODAL TAMBAH / EDIT BARANG (1 Modal untuk Tambah & Ubah)
     ====================================================================== --}}
<div class="modal fade" id="modalFormBarang" tabindex="-1" aria-labelledby="modalFormTitle" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content modal-content-custom">
            
            <div class="modal-header modal-header-custom">
                <h5 class="modal-title fw-bold text-dark fs-6" id="modalFormTitle">Tambah Barang Baru</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
            </div>

            <form id="formBarang" novalidate>
                <div class="modal-body p-4">
                    {{-- Input Hidden ID Barang --}}
                    <input type="hidden" id="barangId">

                    {{-- Kategori Barang (Dipilih Terlebih Dahulu) --}}
                    <div class="mb-3">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <label for="kategoriBarang" class="form-label small fw-semibold text-secondary mb-0">Pilih Kategori Barang <span class="text-danger">*</span></label>
                            <button type="button" class="btn btn-link text-decoration-none p-0 fw-semibold" style="font-size: 0.8rem; color: var(--primary-color);" onclick="bukaModalTambahKategoriDariBarang()">
                                <i class="bi bi-plus-circle me-1"></i>+ Kategori Baru
                            </button>
                        </div>
                        <select class="form-select" id="kategoriBarang">
                            <option value="" selected disabled>-- Pilih Kategori --</option>
                        </select>
                        <div id="kategoriBarangError" class="text-danger small mt-1 d-none"></div>
                    </div>

                    {{-- Nama Barang (Otomatis menampilkan saran produk sesuai kategori yang dipilih) --}}
                    <div class="mb-3">
                        <label for="namaBarang" class="form-label small fw-semibold text-secondary">Nama Barang <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="namaBarang" list="listSaranNamaBarang" placeholder="Contoh: Semen Gresik 50 kg" autocomplete="off">
                        <datalist id="listSaranNamaBarang"></datalist>
                        <div id="saranNamaChips" class="d-flex flex-wrap gap-1 mt-2"></div>
                        <div id="namaBarangError" class="text-danger small mt-1 d-none"></div>
                    </div>

                    {{-- Foto / Gambar Barang (Upload / Choose File) --}}
                    <div class="mb-3">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <label for="gambarBarang" class="form-label small fw-semibold text-secondary mb-0">
                                <i class="bi bi-image text-warning me-1"></i>Foto / Gambar Barang
                            </label>
                            <span class="text-muted" style="font-size: 0.75rem;">Opsional</span>
                        </div>
                        <input type="file" class="form-control" id="gambarBarang" accept="image/*">
                        <input type="hidden" id="gambarBarangBase64">
                        <div class="form-text text-muted" style="font-size: 0.74rem;">
                            Pilih file foto material (JPG, PNG, WEBP). Gambar akan otomatis tampil di katalog barang.
                        </div>

                        {{-- Kotak Preview Gambar --}}
                        <div id="wrapperPreviewGambar" class="d-none mt-2 p-2 bg-light rounded-3 border d-flex align-items-center justify-content-between gap-2">
                            <div class="d-flex align-items-center gap-2 overflow-hidden">
                                <img id="previewGambarBarang" src="" alt="Pratinjau Foto" class="rounded border flex-shrink-0" style="width: 52px; height: 52px; object-fit: cover;">
                                <div class="overflow-hidden">
                                    <div class="small fw-semibold text-dark text-truncate" id="previewNamaFileGambar">foto-barang.jpg</div>
                                    <div class="small text-muted" style="font-size: 0.72rem;">Foto siap ditampilkan di katalog</div>
                                </div>
                            </div>
                            <button type="button" class="btn btn-sm btn-outline-danger border-0 flex-shrink-0" id="btnHapusGambar" title="Hapus foto" onclick="hapusFotoBarang()">
                                <i class="bi bi-trash3"></i>
                            </button>
                        </div>
                    </div>

                    {{-- Baris Stok Tersedia & Stok Minimum --}}
                    <div class="row g-3 mb-3">
                        <div class="col-6">
                            <label for="stokBarang" class="form-label small fw-semibold text-secondary">Stok Tersedia <span class="text-danger">*</span></label>
                            <input type="number" class="form-control" id="stokBarang" min="0" placeholder="0">
                            <div id="stokBarangError" class="text-danger small mt-1 d-none"></div>
                        </div>
                        <div class="col-6">
                            <label for="stokMinimumBarang" class="form-label small fw-semibold text-secondary">Stok Minimum <span class="text-danger">*</span></label>
                            <input type="number" class="form-control" id="stokMinimumBarang" min="0" placeholder="0">
                            <div id="stokMinimumBarangError" class="text-danger small mt-1 d-none"></div>
                        </div>
                    </div>

                    {{-- Baris Satuan & Harga Barang --}}
                    <div class="row g-3 mb-3">
                        <div class="col-6">
                            <label for="satuanBarang" class="form-label small fw-semibold text-secondary">Satuan Barang <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="satuanBarang" list="listSatuan" placeholder="Contoh: sak">
                            <datalist id="listSatuan">
                                <option value="sak">sak (semen, plester)</option>
                                <option value="truk">truk (pasir, batu kali)</option>
                                <option value="batang">batang (besi beton, pipa, hollow)</option>
                                <option value="dus">dus (keramik, granit)</option>
                                <option value="kaleng">kaleng (cat, thinner)</option>
                                <option value="kg">kg (paku, kawat)</option>
                                <option value="buah">buah (bata, batako, genteng)</option>
                                <option value="lembar">lembar (triplek, seng, gypsum)</option>
                                <option value="meter">meter (selang, kabel)</option>
                                <option value="roll">roll (kasa, terpal)</option>
                            </datalist>
                            <div id="satuanBarangError" class="text-danger small mt-1 d-none"></div>
                        </div>
                        <div class="col-6">
                            <label for="hargaBarang" class="form-label small fw-semibold text-secondary">Harga Satuan (Rp) <span class="text-danger">*</span></label>
                            <div class="input-group">
                                <span class="input-group-text bg-light text-muted small">Rp</span>
                                <input type="number" class="form-control" id="hargaBarang" min="0" placeholder="65000">
                            </div>
                            <div id="hargaBarangError" class="text-danger small mt-1 d-none"></div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer modal-footer-custom">
                    <button type="button" class="btn btn-sm btn-outline-secondary px-3" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-sm btn-primary-custom px-4" id="btnSimpanBarang">
                        <i class="bi bi-save me-1"></i>
                        Simpan
                    </button>
                </div>
            </form>

        </div>
    </div>
</div>

{{-- ======================================================================
     MODAL KONFIRMASI HAPUS
     ====================================================================== --}}
<div class="modal fade" id="modalKonfirmasiHapus" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content modal-content-custom text-center p-3">
            <div class="modal-body pt-3 pb-2">
                <div class="text-danger mb-3">
                    <i class="bi bi-exclamation-circle fs-1"></i>
                </div>
                <h6 class="fw-bold text-dark mb-2">Hapus Barang?</h6>
                <p class="small text-muted mb-1">Yakin ingin menghapus barang ini?</p>
                <p class="small fw-semibold text-dark" id="namaBarangHapus">"Barang"</p>
            </div>
            <div class="d-flex justify-content-center gap-2 pt-2 pb-1">
                <button type="button" class="btn btn-sm btn-outline-secondary px-3" data-bs-dismiss="modal">Batal</button>
                <button type="button" class="btn btn-sm btn-danger px-3" id="btnKonfirmasiHapus">Hapus</button>
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
                <i class="bi bi-check-circle-fill text-success me-2 fs-6"></i>
                <span id="toastPesan">Operasi berhasil dilakukan.</span>
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Tutup"></button>
        </div>
    </div>
</div>

{{-- Modal Tambah/Edit Kategori & Modal Konfirmasi Hapus Kategori --}}
@include('admin.modal-kategori')

@endsection

@push('scripts')
    {{-- Memuat Skrip UI Halaman Admin Stok & Kategori --}}
    <script src="{{ asset('js/admin-stok.js') }}?v=2.9"></script>
    <script src="{{ asset('js/admin-kategori.js') }}?v=2.5"></script>
@endpush
