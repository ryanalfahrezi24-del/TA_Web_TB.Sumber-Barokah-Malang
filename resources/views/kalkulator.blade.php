@extends('layouts.app')

@section('title', 'Kalkulator Kebutuhan Material - TB. Sumber Barokah Malang')

@push('css')
    {{-- CSS Khusus Halaman Kalkulator --}}
    <link rel="stylesheet" href="{{ asset('css/kalkulator.css') }}">
@endpush

@section('content')

    {{-- ======================================================================
         1. HEADER HALAMAN KALKULATOR
         ====================================================================== --}}
    <section class="kalkulator-header">
        <div class="container">
            <span class="badge rounded-pill mb-2 px-3 py-2" style="background-color: var(--primary-light); color: var(--primary-color); font-weight: 600; font-size: 0.82rem;">
                <i class="bi bi-calculator me-1"></i> Estimasi Realistis & Cepat
            </span>
            <h1 class="kalkulator-header-title">Kalkulator Kebutuhan Material</h1>
            <p class="kalkulator-header-subtitle">
                Hitung perkiraan bahan bangunan sesuai luas pekerjaan Anda secara mudah, akurat, dan sesuai standar praktik tukang sehari-hari.
            </p>
        </div>
    </section>

    {{-- ======================================================================
         2. SECTION UTAMA: DUA KOLOM (FORM DI KIRI & HASIL DI KANAN)
         ====================================================================== --}}
    <section class="kalkulator-section">
        <div class="container">
            <div class="row g-4 align-items-stretch">
                
                {{-- KOLOM KIRI: FORM PERHITUNGAN --}}
                <div class="col-lg-5">
                    <div class="kalkulator-card">
                        
                        <h2 class="kalkulator-card-title">
                            <i class="bi bi-sliders text-warning"></i> Parameter Pekerjaan
                        </h2>
                        <p class="kalkulator-card-subtitle">Pilih jenis konstruksi dan tentukan luas area yang akan dikerjakan.</p>

                        <form id="formKalkulator" novalidate>
                            
                            {{-- 1. Pilihan Jenis Pekerjaan (3 Radio Card: Dinding, Lantai, Atap) --}}
                            <div class="mb-4">
                                <label class="form-label small fw-semibold text-secondary mb-2">
                                    Jenis Pekerjaan <span class="text-danger">*</span>
                                </label>
                                <div class="job-selector-grid">
                                    {{-- Dinding --}}
                                    <label class="job-option" title="Pekerjaan Dinding (Bata, Semen, Pasir, Cat)">
                                        <input type="radio" name="jenisPekerjaan" value="dinding">
                                        <div class="job-card">
                                            <i class="bi bi-bricks job-icon"></i>
                                            <span class="job-name">Dinding</span>
                                        </div>
                                    </label>

                                    {{-- Lantai --}}
                                    <label class="job-option" title="Pekerjaan Lantai (Keramik, Semen, Pasir, Nat)">
                                        <input type="radio" name="jenisPekerjaan" value="lantai">
                                        <div class="job-card">
                                            <i class="bi bi-layers job-icon"></i>
                                            <span class="job-name">Lantai</span>
                                        </div>
                                    </label>

                                    {{-- Atap --}}
                                    <label class="job-option" title="Pekerjaan Atap (Genteng, Rangka Galvalum, Paku/Sekrup)">
                                        <input type="radio" name="jenisPekerjaan" value="atap">
                                        <div class="job-card">
                                            <i class="bi bi-house-door job-icon"></i>
                                            <span class="job-name">Atap</span>
                                        </div>
                                    </label>
                                </div>
                                <div id="jenisPekerjaanError" class="text-danger small mt-1 d-none"></div>
                            </div>

                            {{-- 2. Input Luas Area (m²) --}}
                            <div class="mb-3">
                                <label for="inputLuas" class="form-label small fw-semibold text-secondary">
                                    Luas Area Pekerjaan <span class="text-danger">*</span>
                                </label>
                                <div class="input-group kalkulator-input-group">
                                    <span class="input-group-text"><i class="bi bi-textarea-resize"></i></span>
                                    <input type="number" step="0.1" min="0.1" max="10000" class="form-control" id="inputLuas" placeholder="Contoh: 20">
                                    <span class="input-group-text bg-light text-muted">m²</span>
                                </div>
                                <div id="inputLuasError" class="text-danger small mt-1 d-none"></div>
                            </div>

                            {{-- 3. Input Cadangan Material (%) --}}
                            <div class="mb-4">
                                <label for="inputCadangan" class="form-label small fw-semibold text-secondary">
                                    Cadangan Material (Waste)
                                </label>
                                <div class="input-group kalkulator-input-group">
                                    <span class="input-group-text"><i class="bi bi-shield-plus"></i></span>
                                    <input type="number" min="0" max="30" class="form-control" id="inputCadangan" value="10">
                                    <span class="input-group-text bg-light text-muted">%</span>
                                </div>
                                <small class="text-muted d-block mt-1" style="font-size: 0.8rem;">
                                    <i class="bi bi-info-circle me-1"></i> Untuk antisipasi sisa potongan dan material rusak (0 - 30%).
                                </small>
                                <div id="inputCadanganError" class="text-danger small mt-1 d-none"></div>
                            </div>

                            {{-- 4. Tombol Aksi: Hitung & Reset --}}
                            <div class="d-flex flex-column gap-2 mt-auto pt-2">
                                <button type="submit" class="btn btn-hitung-kalkulator">
                                    <i class="bi bi-calculator me-1"></i>
                                    Hitung Kebutuhan
                                </button>
                                <button type="button" class="btn btn-sm btn-link text-muted text-decoration-none" id="btnResetKalkulator">
                                    <i class="bi bi-arrow-counterclockwise me-1"></i> Reset Form
                                </button>
                            </div>

                        </form>

                    </div>
                </div>

                {{-- KOLOM KANAN: HASIL ESTIMASI & TABEL MATERIAL --}}
                <div class="col-lg-7">
                    <div class="kalkulator-card">
                        
                        <h2 class="kalkulator-card-title">
                            <i class="bi bi-clipboard2-check text-primary"></i> Hasil Estimasi Material
                        </h2>
                        <p class="kalkulator-card-subtitle">Rincian taksiran material dan kesiapan stok di TB. Sumber Barokah.</p>

                        {{-- Keadaan Kosong (Sebelum Tombol Hitung Ditekan) --}}
                        <div class="hasil-empty-state" id="hasilEmptyState">
                            <i class="bi bi-calculator hasil-empty-icon"></i>
                            <h3 class="fw-bold text-dark fs-5 mb-2">Belum Ada Perhitungan</h3>
                            <p class="hasil-empty-text">
                                Silakan pilih jenis pekerjaan, tentukan luas area, lalu tekan tombol <strong>Hitung Kebutuhan</strong> untuk melihat rincian bahan.
                            </p>
                        </div>

                        {{-- Keadaan Berisi Hasil (Tampil Setelah Dihitung) --}}
                        <div class="hasil-content d-none" id="hasilContentState">
                            
                            {{-- Tabel Hasil Material --}}
                            <div class="table-responsive flex-grow-1">
                                <table class="table tabel-hasil-kalkulator align-middle">
                                    <thead>
                                        <tr>
                                            <th class="text-center" style="width: 40px;"><i class="bi bi-check2-square"></i></th>
                                            <th>Material</th>
                                            <th class="text-center">Kebutuhan</th>
                                            <th class="text-end">Harga Satuan</th>
                                            <th class="text-end">Subtotal</th>
                                            <th class="text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody id="tabelHasilBody">
                                        {{-- Diisi secara dinamis oleh public/js/kalkulator.js --}}
                                    </tbody>
                                </table>
                            </div>

                            {{-- Box Total Estimasi Biaya --}}
                            <div class="total-estimasi-card">
                                <div>
                                    <span class="total-estimasi-label d-block">Total Estimasi Belanja</span>
                                    <small class="text-muted" style="font-size: 0.8rem;">Dihitung dari material yang dicentang</small>
                                </div>
                                <h3 class="total-estimasi-nominal" id="totalEstimasiNominal">Rp 0</h3>
                            </div>

                            {{-- Tombol Masukkan ke Keranjang --}}
                            <button type="button" class="btn btn-keranjang-kalkulator" id="btnTambahKeranjang">
                                <i class="bi bi-cart-plus fs-5"></i>
                                Masukkan ke Keranjang
                            </button>

                            {{-- Catatan Kecil --}}
                            <p class="kalkulator-disclaimer">
                                <i class="bi bi-exclamation-circle me-1"></i>
                                Catatan: Hasil ini hanya perkiraan, bukan perhitungan teknis konstruksi.
                            </p>

                        </div>

                    </div>
                </div>

            </div>
        </div>
    </section>

    {{-- ======================================================================
         TOAST NOTIFIKASI KERANJANG
         ====================================================================== --}}
    <div class="position-fixed top-0 end-0 p-3" style="z-index: 1090;">
        <div id="kalkulatorToast" class="toast align-items-center text-white bg-dark border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body d-flex align-items-center py-2 px-3 small">
                    <i class="bi bi-check-circle-fill text-success me-2 fs-6"></i>
                    <span id="toastKalkulatorPesan">Material berhasil dimasukkan ke keranjang.</span>
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Tutup"></button>
            </div>
        </div>
    </div>

@endsection

@push('scripts')
    {{-- PERHATIKAN URUTAN PEMUATAN SCRIPT SESUAI PANDUAN:
         1. stok-store.js      (Data layer stok barang dari katalog)
         2. koefisien-store.js (Data layer koefisien kebutuhan pekerjaan)
         3. keranjang-store.js (Data layer penyimpanan keranjang belanja)
         4. kalkulator.js      (Logika UI, perhitungan, validasi, dan event)
    --}}
    <script src="{{ asset('js/stok-store.js') }}?v=2.9"></script>
    <script src="{{ asset('js/koefisien-store.js') }}?v=2.9"></script>
    <script src="{{ asset('js/keranjang-store.js') }}?v=2.9"></script>
    <script src="{{ asset('js/kalkulator.js') }}?v=2.9"></script>
@endpush
