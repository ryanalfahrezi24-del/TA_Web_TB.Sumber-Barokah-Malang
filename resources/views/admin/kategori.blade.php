@extends('layouts.admin')

@section('title', 'Kelola Kategori - Admin TB. Sumber Barokah Malang')

@section('content')
<div class="container">
    
    {{-- Header Halaman Kelola Kategori --}}
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
            <h1 class="admin-header-title">Kelola Kategori</h1>
            <p class="admin-header-subtitle mb-0">Atur kategori yang tampil di katalog dan form barang.</p>
        </div>
    </div>

    {{-- 2 Kartu Ringkasan (Summary Cards) --}}
    <div class="row g-3 mb-4">
        {{-- Card 1: Total Kategori --}}
        <div class="col-sm-6 col-lg-6">
            <div class="stat-card">
                <div>
                    <div class="stat-label">Total Kategori</div>
                    <h2 class="stat-value" id="statTotalKategori">0</h2>
                </div>
                <div class="stat-icon-wrapper stat-icon-total">
                    <i class="bi bi-tags"></i>
                </div>
            </div>
        </div>

        {{-- Card 2: Kategori Kosong (Tanpa Barang) --}}
        <div class="col-sm-6 col-lg-6">
            <div class="stat-card">
                <div>
                    <div class="stat-label">Kategori Kosong (0 Barang)</div>
                    <h2 class="stat-value text-warning" id="statKategoriKosong">0</h2>
                </div>
                <div class="stat-icon-wrapper stat-icon-warning">
                    <i class="bi bi-inbox"></i>
                </div>
            </div>
        </div>
    </div>

    {{-- Toolbar Aksi: Tambah Kategori & Kolom Pencarian --}}
    <div class="admin-toolbar-card">
        <div class="row g-3 align-items-center justify-content-between">
            {{-- Tombol Tambah Kategori --}}
            <div class="col-12 col-md-auto">
                <button type="button" class="btn btn-tambah-barang w-100 w-md-auto" onclick="bukaModalTambahKategori()">
                    <i class="bi bi-plus-lg me-1"></i>
                    Tambah Kategori
                </button>
            </div>

            {{-- Kolom Pencarian Kategori --}}
            <div class="col-12 col-md-auto">
                <div class="input-group search-input-group" style="min-width: 260px;">
                    <span class="input-group-text"><i class="bi bi-search"></i></span>
                    <input type="text" id="searchKategori" class="form-control" placeholder="Cari nama kategori..." autocomplete="off">
                </div>
            </div>
        </div>
    </div>

    {{-- Tabel Data Kategori --}}
    <div class="table-card">
        <div class="table-responsive">
            <table class="table table-custom align-middle">
                <thead>
                    <tr>
                        <th class="text-center" style="width: 60px;">No</th>
                        <th>Nama Kategori</th>
                        <th class="text-center" style="width: 180px;">Jumlah Barang</th>
                        <th class="text-center" style="width: 120px;">Aksi</th>
                    </tr>
                </thead>
                <tbody id="tabelKategoriBody">
                    {{-- Diisi secara dinamis oleh public/js/admin-kategori.js --}}
                </tbody>
            </table>
        </div>
    </div>

</div>

{{-- Modal Tambah/Edit Kategori & Modal Konfirmasi Hapus --}}
@include('admin.modal-kategori')

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

@endsection

@push('scripts')
    {{-- Urutan Script: stok-store.js lebih dahulu, kemudian admin-kategori.js --}}
    <script src="{{ asset('js/stok-store.js') }}?v=2.5"></script>
    <script src="{{ asset('js/admin-kategori.js') }}?v=2.5"></script>
@endpush
