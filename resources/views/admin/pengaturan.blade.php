@extends('layouts.admin')

@section('title', 'Pengaturan Toko - Admin TB. Sumber Barokah Malang')

@section('content')
<div class="container">
    
    {{-- Header Halaman Admin Pengaturan --}}
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
            <h1 class="admin-header-title">Pengaturan Toko</h1>
            <p class="admin-header-subtitle mb-0">
                Kelola jam operasional, narahubung (contact person), dan alamat toko yang otomatis ditampilkan pada footer seluruh halaman website.
            </p>
        </div>
    </div>

    {{-- 3 Kartu Ringkasan Pengaturan Aktif --}}
    <div class="row g-3 mb-4">
        {{-- Card 1: Jam Kerja --}}
        <div class="col-sm-6 col-lg-4">
            <div class="stat-card">
                <div>
                    <div class="stat-label">Jam Kerja Aktif</div>
                    <div class="fw-bold text-dark mt-1 text-truncate" id="statJamKerja" style="max-width: 220px; font-size: 1.05rem;">
                        Memuat...
                    </div>
                    <div class="stat-subtext">Operasional toko</div>
                </div>
                <div class="stat-icon-wrapper stat-icon-total">
                    <i class="bi bi-clock-history"></i>
                </div>
            </div>
        </div>

        {{-- Card 2: Contact Person --}}
        <div class="col-sm-6 col-lg-4">
            <div class="stat-card">
                <div>
                    <div class="stat-label">Contact Person</div>
                    <div class="fw-bold text-dark mt-1 text-truncate" id="statKontak" style="max-width: 220px; font-size: 1.05rem;">
                        Memuat...
                    </div>
                    <div class="stat-subtext">No. Telepon / WhatsApp</div>
                </div>
                <div class="stat-icon-wrapper stat-icon-warning">
                    <i class="bi bi-headset"></i>
                </div>
            </div>
        </div>

        {{-- Card 3: Alamat Toko --}}
        <div class="col-sm-12 col-lg-4">
            <div class="stat-card">
                <div class="overflow-hidden">
                    <div class="stat-label">Alamat Toko Aktif</div>
                    <div class="fw-bold text-dark mt-1 text-truncate" id="statAlamat" style="max-width: 230px; font-size: 1rem;">
                        Memuat...
                    </div>
                    <div class="stat-subtext mt-1">
                        <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" id="statAlamatLink" class="text-decoration-none text-primary fw-semibold" style="font-size: 0.8rem;">
                            <i class="bi bi-box-arrow-up-right me-1"></i>Buka di Google Maps
                        </a>
                    </div>
                </div>
                <div class="stat-icon-wrapper stat-icon-danger">
                    <i class="bi bi-geo-alt"></i>
                </div>
            </div>
        </div>
    </div>

    {{-- Konten Utama: Formulir Pengaturan Toko --}}
    <div class="row">
        <div class="col-12">
            <div class="table-card p-4">
                
                <div class="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom">
                    <div>
                        <h2 class="fs-5 fw-bold text-dark mb-1">
                            <i class="bi bi-sliders text-primary me-2"></i>Formulir Informasi Toko
                        </h2>
                        <p class="small text-muted mb-0">Ubah data toko di bawah ini, lalu klik Simpan untuk memperbarui footer publik.</p>
                    </div>
                </div>

                <form id="formPengaturanToko" novalidate>
                    
                    {{-- Bagian 1: Jam Kerja --}}
                    <div class="mb-4">
                        <label for="inputJamKerja" class="form-label fw-bold text-dark small">
                            <i class="bi bi-clock text-primary me-1"></i> 1. Jam Kerja / Operasional Toko <span class="text-danger">*</span>
                        </label>
                        <input type="text" class="form-control" id="inputJamKerja" placeholder="Contoh: Senin - Sabtu: 07.30 - 16.30 WIB (Minggu Libur)" required>
                        <div class="form-text small text-muted">
                            Tentukan hari buka, jam buka/tutup, serta keterangan hari libur toko.
                        </div>
                    </div>

                    {{-- Bagian 2: Contact Person --}}
                    <div class="mb-4">
                        <label class="form-label fw-bold text-dark small">
                            <i class="bi bi-telephone text-primary me-1"></i> 2. Contact Person (Narahubung Toko) <span class="text-danger">*</span>
                        </label>
                        <div class="row g-3 mb-3">
                            <div class="col-md-6">
                                <label for="inputNamaKontak" class="form-label small text-muted">Nama Kontak / Penanggung Jawab</label>
                                <input type="text" class="form-control" id="inputNamaKontak" placeholder="Contoh: Bpk. Ahmad (Admin Toko)">
                            </div>
                            <div class="col-md-6">
                                <label for="inputTeleponKontak" class="form-label small text-muted">No. Telepon / WhatsApp <span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="bi bi-whatsapp"></i></span>
                                    <input type="text" class="form-control" id="inputTeleponKontak" placeholder="Contoh: 0812-3456-7890" required>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label for="inputEmailKontak" class="form-label small text-muted">Alamat Email Toko (Opsional)</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                                <input type="email" class="form-control" id="inputEmailKontak" placeholder="Contoh: sumberbarokah.malang@gmail.com">
                            </div>
                        </div>
                    </div>

                    {{-- Bagian 3: Alamat Toko --}}
                    <div class="mb-4">
                        <label class="form-label fw-bold text-dark small">
                            <i class="bi bi-geo-alt text-primary me-1"></i> 3. Alamat Toko <span class="text-danger">*</span>
                        </label>
                        <div class="mb-3">
                            <label for="inputAlamatToko" class="form-label small text-muted">Alamat Lengkap Toko</label>
                            <textarea class="form-control" id="inputAlamatToko" rows="2" placeholder="Contoh: Jl. Raya Gadang No. 128, Gadang, Kec. Sukun, Kota Malang, Jawa Timur 65149" required></textarea>
                        </div>
                        <div>
                            <label for="inputKotaToko" class="form-label small text-muted">Kota / Daerah Singkat</label>
                            <input type="text" class="form-control" id="inputKotaToko" placeholder="Contoh: Malang, Jawa Timur">
                        </div>
                    </div>

                    {{-- Tombol Aksi --}}
                    <div class="d-flex flex-wrap align-items-center gap-2 pt-3 border-top">
                        <button type="submit" class="btn btn-tambah-barang px-4" id="btnSimpanPengaturan">
                            <i class="bi bi-check-lg me-1"></i> Simpan Perubahan Toko
                        </button>
                        <button type="button" class="btn btn-outline-secondary px-3" id="btnResetPengaturan">
                            <i class="bi bi-arrow-counterclockwise me-1"></i> Kembalikan ke Bawaan
                        </button>
                    </div>

                </form>

            </div>
        </div>
    </div>

</div>

{{-- Toast Notifikasi Admin --}}
<div class="admin-toast-container">
    <div id="adminToast" class="toast align-items-center text-white bg-dark border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
            <div class="toast-body d-flex align-items-center py-2 px-3 small">
                <i class="bi bi-check-circle-fill text-success me-2 fs-6"></i>
                <span id="toastPesan">Pengaturan berhasil disimpan.</span>
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Tutup"></button>
        </div>
    </div>
</div>
@endsection

@push('scripts')
    {{-- Script Khusus Pengaturan Toko --}}
    <script src="{{ asset('js/admin-pengaturan.js') }}?v=1.0"></script>
@endpush
