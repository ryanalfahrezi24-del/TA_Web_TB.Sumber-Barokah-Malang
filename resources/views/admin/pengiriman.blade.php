@extends('layouts.admin')

@section('title', 'Pengiriman Barang - Admin TB. Sumber Barokah Malang')

@section('content')
<div class="container">

    {{-- Header Halaman Admin Pengiriman --}}
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
            <h1 class="admin-header-title">Pengiriman Barang</h1>
            <p class="admin-header-subtitle mb-0">Pantau pesanan yang harus diantar kurir</p>
        </div>
    </div>

    {{-- 3 Kartu Ringkasan Status Pengantaran --}}
    <div class="row g-3 mb-4">
        {{-- Card 1: Belum Diantar --}}
        <div class="col-sm-6 col-lg-4">
            <div class="stat-card" id="cardStatBelum">
                <div>
                    <div class="stat-label">Belum Diantar</div>
                    <h2 class="stat-value text-danger" id="statBelumDiantar">0</h2>
                    <div class="stat-subtext">Menunggu jadwal kurir</div>
                </div>
                <div class="stat-icon-wrapper stat-icon-danger">
                    <i class="bi bi-clock"></i>
                </div>
            </div>
        </div>

        {{-- Card 2: Dalam Proses --}}
        <div class="col-sm-6 col-lg-4">
            <div class="stat-card" id="cardStatProses">
                <div>
                    <div class="stat-label">Dalam Proses</div>
                    <h2 class="stat-value text-warning" id="statDalamProses">0</h2>
                    <div class="stat-subtext">Sedang diantar kurir</div>
                </div>
                <div class="stat-icon-wrapper stat-icon-warning">
                    <i class="bi bi-truck"></i>
                </div>
            </div>
        </div>

        {{-- Card 3: Sudah Diantar --}}
        <div class="col-sm-12 col-lg-4">
            <div class="stat-card" id="cardStatSelesai">
                <div>
                    <div class="stat-label">Sudah Diantar</div>
                    <h2 class="stat-value text-success" id="statSudahDiantar">0</h2>
                    <div class="stat-subtext">Pengantaran selesai</div>
                </div>
                <div class="stat-icon-wrapper stat-icon-success">
                    <i class="bi bi-check-circle"></i>
                </div>
            </div>
        </div>
    </div>

    {{-- Toolbar: Tombol Tambah Pesanan, Pencarian, & Urutan Tanggal --}}
    <div class="admin-toolbar-card">
        <div class="row g-3 align-items-center justify-content-between">
            {{-- Sisi Kiri: Tombol Tambah Pesanan --}}
            <div class="col-12 col-md-auto">
                <button type="button" id="btnBukaTambahPesanan" class="btn btn-tambah-barang w-100 w-md-auto" onclick="bukaModalTambahPesanan()">
                    <i class="bi bi-plus-lg me-1"></i>
                    Tambah Pesanan
                </button>
            </div>

            {{-- Sisi Kanan: Pencarian --}}
            <div class="col-12 col-md-auto">
                <div class="input-group search-input-group" style="min-width: 260px;">
                    <span class="input-group-text"><i class="bi bi-search"></i></span>
                    <input type="text" id="searchPengiriman" class="form-control" placeholder="Cari" autocomplete="off">
                </div>
            </div>
        </div>

        {{-- Baris Info Jumlah Hasil --}}
        <div class="d-flex align-items-center justify-content-between mt-3 pt-2 border-top">
            <span class="small text-muted fw-medium" id="infoJumlahPesanan">Menampilkan 0 pesanan</span>
            <button type="button" id="btnResetFilterToolbar" class="btn btn-link btn-sm text-decoration-none p-0 d-none" style="color: var(--primary-color); font-weight: 600;" onclick="resetFilterPengiriman()">
                <i class="bi bi-arrow-counterclockwise me-1"></i>Reset pencarian
            </button>
        </div>
    </div>

    {{-- Tabel Daftar Pengiriman --}}
    <div class="table-card">
        <div class="table-responsive">
            <table class="table table-custom align-middle">
                <thead>
                    <tr>
                        <th class="text-center" style="width: 60px;">No</th>
                        <th style="width: 170px;">Tanggal</th>
                        <th style="min-width: 250px;">Pelanggan dan Alamat</th>
                        <th style="min-width: 260px;">Barang yang Diantar</th>
                        <th class="text-center" style="width: 160px;">Status</th>
                        <th class="text-center" style="width: 140px;">Aksi</th>
                    </tr>
                </thead>
                <tbody id="tabelPengirimanBody">
                    {{-- Diisi secara dinamis oleh public/js/admin-pengiriman.js --}}
                </tbody>
            </table>
        </div>
    </div>

</div>

{{-- ======================================================================
     1. MODAL DETAIL PESANAN
     ====================================================================== --}}
<div class="modal fade" id="modalDetailPesanan" tabindex="-1" aria-labelledby="modalDetailPesananLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content modal-content-custom">
            <div class="modal-header modal-header-custom">
                <h5 class="modal-title fw-bold text-dark fs-6" id="modalDetailPesananLabel">
                    <i class="bi bi-clipboard2-data text-warning me-2"></i>Detail Pesanan Pengiriman
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
            </div>
            <div class="modal-body p-4">
                <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 pb-3 mb-3 border-bottom">
                    <div>
                        <div class="text-muted small">Nama Pelanggan</div>
                        <div class="fw-bold text-dark fs-6 mt-1" id="detailPelangganPesanan">-</div>
                    </div>
                    <div class="text-end">
                        <div class="text-muted small mb-1">Status Pengantaran</div>
                        <div id="detailStatusBadge"></div>
                    </div>
                </div>

                <div class="row g-3 mb-3">
                    <div class="col-12">
                        <div class="text-muted small">Tanggal Pengiriman</div>
                        <div class="fw-semibold text-dark" id="detailTanggalPesanan">-</div>
                    </div>
                    <div class="col-12">
                        <div class="text-muted small">Alamat Pengantaran</div>
                        <div class="p-2 px-3 rounded-3 bg-light border small text-dark mt-1" id="detailAlamatPesanan">-</div>
                    </div>
                </div>

                <div>
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="small fw-bold text-dark text-uppercase" style="letter-spacing: 0.4px;">
                            <i class="bi bi-box-seam text-warning me-1"></i>Daftar Barang yang Diantar
                        </span>
                        <span class="badge bg-light text-dark border" id="detailTotalJenisBarang">0 jenis</span>
                    </div>
                    <ul class="list-group list-group-flush border rounded-3 overflow-hidden" id="detailDaftarBarangList">
                        {{-- Diisi secara dinamis --}}
                    </ul>
                </div>
            </div>
            <div class="modal-footer modal-footer-custom">
                <button type="button" class="btn btn-sm btn-secondary px-4" data-bs-dismiss="modal">Tutup</button>
            </div>
        </div>
    </div>
</div>

{{-- ======================================================================
     2. MODAL UBAH STATUS PENGANTARAN
     ====================================================================== --}}
<div class="modal fade" id="modalUbahStatus" tabindex="-1" aria-labelledby="modalUbahStatusLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content modal-content-custom">
            <div class="modal-header modal-header-custom">
                <h5 class="modal-title fw-bold text-dark fs-6" id="modalUbahStatusLabel">
                    <i class="bi bi-arrow-repeat text-warning me-2"></i>Ubah Status Pengantaran
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
            </div>
            <form id="formUbahStatus" novalidate>
                <div class="modal-body p-4">
                    <input type="hidden" id="ubahStatusIdPesanan">

                    <div class="p-3 rounded-3 bg-light border mb-3">
                        <div class="small text-muted">Pelanggan</div>
                        <div class="fw-bold text-dark fs-6" id="ubahStatusPelangganPesanan">-</div>
                    </div>

                    <label class="form-label small fw-bold text-secondary mb-2">Pilih Status Pengantaran:</label>

                    {{-- Pilihan 1: Belum Diantar --}}
                    <label class="status-radio-option">
                        <input type="radio" name="pilihanStatusBaru" value="Belum Diantar">
                        <div class="status-radio-card card-belum">
                            <div class="status-radio-icon stat-icon-danger">
                                <i class="bi bi-clock"></i>
                            </div>
                            <div>
                                <div class="fw-bold text-dark small">Belum Diantar</div>
                                <div class="text-muted" style="font-size: 0.78rem;">Pesanan sudah tercatat dan menunggu kurir berangkat.</div>
                            </div>
                        </div>
                    </label>

                    {{-- Pilihan 2: Dalam Proses --}}
                    <label class="status-radio-option">
                        <input type="radio" name="pilihanStatusBaru" value="Dalam Proses">
                        <div class="status-radio-card card-proses">
                            <div class="status-radio-icon stat-icon-warning">
                                <i class="bi bi-truck"></i>
                            </div>
                            <div>
                                <div class="fw-bold text-dark small">Dalam Proses</div>
                                <div class="text-muted" style="font-size: 0.78rem;">Material sedang dalam perjalanan diantar oleh kurir.</div>
                            </div>
                        </div>
                    </label>

                    {{-- Pilihan 3: Sudah Diantar --}}
                    <label class="status-radio-option mb-0">
                        <input type="radio" name="pilihanStatusBaru" value="Sudah Diantar">
                        <div class="status-radio-card card-selesai">
                            <div class="status-radio-icon stat-icon-success">
                                <i class="bi bi-check-circle"></i>
                            </div>
                            <div>
                                <div class="fw-bold text-dark small">Sudah Diantar</div>
                                <div class="text-muted" style="font-size: 0.78rem;">Barang telah diterima pelanggan di lokasi tujuan.</div>
                            </div>
                        </div>
                    </label>
                </div>
                <div class="modal-footer modal-footer-custom">
                    <button type="button" class="btn btn-sm btn-outline-secondary px-3" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-sm btn-tambah-barang px-4">
                        <i class="bi bi-check-lg me-1"></i>Simpan
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

{{-- ======================================================================
     3. MODAL TAMBAH PESANAN PENGIRIMAN
     ====================================================================== --}}
<div class="modal fade" id="modalTambahPesanan" tabindex="-1" aria-labelledby="modalTambahPesananLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content modal-content-custom">
            <div class="modal-header modal-header-custom">
                <h5 class="modal-title fw-bold text-dark fs-6" id="modalTambahPesananLabel">
                    <i class="bi bi-truck text-warning me-2"></i>Tambah Pesanan Pengiriman Baru
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
            </div>
            <form id="formTambahPesanan" novalidate>
                <div class="modal-body p-4">
                    <div class="row g-3 mb-3">
                        {{-- Nama Pelanggan --}}
                        <div class="col-md-7">
                            <label for="inputPelangganPengiriman" class="form-label small fw-semibold text-secondary">
                                Nama Pelanggan <span class="text-danger">*</span>
                            </label>
                            <input type="text" class="form-control" id="inputPelangganPengiriman" placeholder="Contoh: Bpk. Supriyadi / CV. Mitra Bangun">
                            <div class="text-danger small mt-1 d-none" id="errorPelangganPengiriman"></div>
                        </div>

                        {{-- Tanggal Pengiriman --}}
                        <div class="col-md-5">
                            <label for="inputTanggalPengiriman" class="form-label small fw-semibold text-secondary">
                                Tanggal Pengiriman <span class="text-danger">*</span>
                            </label>
                            <input type="date" class="form-control" id="inputTanggalPengiriman">
                            <div class="text-danger small mt-1 d-none" id="errorTanggalPengiriman"></div>
                        </div>

                        {{-- Alamat Pengiriman --}}
                        <div class="col-12">
                            <label for="inputAlamatPengiriman" class="form-label small fw-semibold text-secondary">
                                Alamat Pengantaran <span class="text-danger">*</span>
                            </label>
                            <textarea class="form-control" id="inputAlamatPengiriman" rows="2" placeholder="Contoh: Jl. Veteran No. 12, Lowokwaru, Kota Malang"></textarea>
                            <div class="text-danger small mt-1 d-none" id="errorAlamatPengiriman"></div>
                        </div>
                    </div>

                    {{-- Daftar Barang Dinamis --}}
                    <div class="mb-2">
                        <div class="d-flex align-items-center justify-content-between mb-2">
                            <label class="form-label small fw-semibold text-secondary mb-0">
                                Daftar Barang yang Diantar <span class="text-danger">*</span>
                            </label>
                            <button type="button" class="btn btn-sm btn-outline-primary fw-semibold" onclick="tambahBarisInputBarang()">
                                <i class="bi bi-plus-lg me-1"></i>+ Barang
                            </button>
                        </div>

                        <div id="containerBarisBarang">
                            {{-- Baris input barang dinamis dimasukkan oleh JS --}}
                        </div>
                        <div class="text-danger small mt-1 d-none" id="errorBarangPengiriman"></div>
                    </div>

                    <div class="p-2 px-3 rounded-3 bg-light border small text-muted mt-3 d-flex align-items-center gap-2">
                        <i class="bi bi-info-circle text-warning"></i>
                        <span>Status awal pesanan baru otomatis diatur menjadi <strong>Belum Diantar</strong>.</span>
                    </div>
                </div>
                <div class="modal-footer modal-footer-custom">
                    <button type="button" class="btn btn-sm btn-outline-secondary px-3" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-sm btn-tambah-barang px-4">
                        <i class="bi bi-check-lg me-1"></i>Simpan Pesanan
                    </button>
                </div>
            </form>
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
    {{-- Urutan script: stok-store.js, pengiriman-store.js, baru admin-pengiriman.js --}}
    <script src="{{ asset('js/stok-store.js') }}?v=2.5"></script>
    <script src="{{ asset('js/pengiriman-store.js') }}?v=1.0"></script>
    <script src="{{ asset('js/admin-pengiriman.js') }}?v=1.0"></script>
@endpush
