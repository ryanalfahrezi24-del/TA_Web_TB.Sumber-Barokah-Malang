@extends('layouts.app')

@section('title', 'Keranjang Belanja - TB. Sumber Barokah Malang')

@push('css')
    {{-- CSS Khusus Halaman Keranjang --}}
    <link rel="stylesheet" href="{{ asset('css/keranjang.css') }}?v=2.8">
@endpush

@section('content')

    {{-- ======================================================================
         1. HEADER HALAMAN KERANJANG
         ====================================================================== --}}
    <section class="keranjang-header">
        <div class="container">
            <span class="badge rounded-pill mb-2 px-3 py-2" style="background-color: var(--primary-light); color: var(--primary-color); font-weight: 600; font-size: 0.82rem;">
                <i class="bi bi-cart-check me-1"></i> Pesanan Pelanggan
            </span>
            <h1 class="keranjang-header-title">Keranjang Belanja</h1>
            <p class="keranjang-header-subtitle">
                Daftar material dan bahan bangunan pilihan Anda yang siap dipesan di TB. Sumber Barokah Malang.
            </p>
        </div>
    </section>

    {{-- ======================================================================
         2. AREA UTAMA: DAFTAR ITEM & RINGKASAN BELANJA
         ====================================================================== --}}
    <section class="keranjang-section">
        <div class="container">
            
            {{-- KEADAAN BELUM LOGIN: Ditampilkan jika belum masuk ke akun --}}
            <div class="keranjang-empty-card d-none" id="keranjangAuthRequired">
                <i class="bi bi-shield-lock-fill text-warning keranjang-empty-icon"></i>
                <h2 class="keranjang-empty-title">Silakan Login Terlebih Dahulu</h2>
                <p class="keranjang-empty-subtitle">
                    Akses ke keranjang belanja memerlukan akun. Silakan masuk terlebih dahulu untuk melihat keranjang dan memproses pesanan material Anda.
                </p>
                <div class="d-flex flex-wrap justify-content-center gap-2">
                    <a href="{{ route('login') }}?redirect=keranjang&pesan=login_dulu" class="btn btn-primary-custom">
                        <i class="bi bi-box-arrow-in-right me-1"></i> Masuk ke Akun Sekarang
                    </a>
                    <a href="{{ route('katalog') }}" class="btn btn-dark-outline">
                        <i class="bi bi-grid-fill me-1"></i> Kembali ke Katalog
                    </a>
                </div>
            </div>

            {{-- KEADAAN KOSONG: Ditampilkan jika keranjang belum memiliki item --}}
            <div class="keranjang-empty-card d-none" id="keranjangEmptyState">
                <i class="bi bi-cart-x keranjang-empty-icon"></i>
                <h2 class="keranjang-empty-title">Keranjang Belanja Masih Kosong</h2>
                <p class="keranjang-empty-subtitle">
                    Anda belum memasukkan material atau barang apapun ke dalam keranjang belanja.
                </p>
                <div class="d-flex flex-wrap justify-content-center gap-2">
                    <a href="{{ route('katalog') }}" class="btn btn-primary-custom">
                        <i class="bi bi-grid-fill me-1"></i> Lihat Katalog Barang
                    </a>
                    <a href="{{ route('kalkulator') }}" class="btn btn-dark-outline">
                        <i class="bi bi-calculator me-1"></i> Hitung di Kalkulator
                    </a>
                </div>
            </div>

            {{-- KEADAAN BERISI: Tabel Item & Kartu Ringkasan --}}
            <div class="row g-4 align-items-start" id="keranjangContentRow">
                
                {{-- SISI KIRI: TABEL DAFTAR BARANG (8 Kolom Desktop) --}}
                <div class="col-lg-8">
                    <div class="keranjang-card">
                        
                        <div class="d-flex align-items-center justify-content-between mb-3">
                            <h2 class="keranjang-card-title mb-0">
                                <i class="bi bi-basket text-primary"></i> Daftar Material Belanja
                            </h2>
                            <button type="button" class="btn btn-sm btn-outline-danger border-0" onclick="bukaModalKosongkanKeranjang()">
                                <i class="bi bi-trash3 me-1"></i> Kosongkan Keranjang
                            </button>
                        </div>

                        {{-- Tabel Responsif --}}
                        <div class="table-responsive">
                            <table class="table tabel-keranjang align-middle">
                                <thead>
                                    <tr>
                                        <th class="text-center" style="width: 40px;">No</th>
                                        <th>Barang / Material</th>
                                        <th class="text-end d-none d-md-table-cell" style="width: 140px;">Harga Satuan</th>
                                        <th class="text-center" style="width: 150px;">Jumlah</th>
                                        <th class="text-end" style="width: 150px;">Subtotal</th>
                                        <th class="text-center" style="width: 60px;">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody id="tabelKeranjangBody">
                                    {{-- Diisi secara dinamis oleh public/js/keranjang.js --}}
                                </tbody>
                            </table>
                        </div>

                        {{-- Navigasi Bawah Tabel --}}
                        <div class="d-flex flex-wrap align-items-center justify-content-between pt-3 mt-3 border-top gap-2">
                            <a href="{{ route('katalog') }}" class="btn btn-sm btn-outline-secondary">
                                <i class="bi bi-arrow-left me-1"></i> Lanjut Belanja di Katalog
                            </a>
                            <a href="{{ route('kalkulator') }}" class="btn btn-sm btn-outline-primary">
                                <i class="bi bi-calculator me-1"></i> Hitung Material Baru
                            </a>
                        </div>

                    </div>
                </div>

                {{-- SISI KANAN: RINGKASAN PESANAN (4 Kolom Desktop) --}}
                <div class="col-lg-4">
                    <div class="keranjang-card sticky-lg-top" style="top: 90px; z-index: 10;">
                        
                        <h2 class="keranjang-card-title">
                            <i class="bi bi-receipt text-warning"></i> Ringkasan Pesanan
                        </h2>

                        <div class="ringkasan-row">
                            <span>Jumlah Variasi Barang</span>
                            <strong class="text-dark" id="ringkasanTotalJenis">0 macam</strong>
                        </div>

                        <div class="ringkasan-row">
                            <span>Total Jumlah Kuantitas</span>
                            <strong class="text-dark" id="ringkasanTotalQty">0</strong>
                        </div>

                        <div class="ringkasan-row">
                            <span>Subtotal Barang</span>
                            <span class="text-dark fw-semibold" id="ringkasanSubtotal">Rp 0</span>
                        </div>

                        {{-- Box Grand Total --}}
                        <div class="ringkasan-total-box">
                            <span class="small text-muted d-block mb-1">Total Estimasi Belanja</span>
                            <h3 class="ringkasan-total-nominal" id="ringkasanGrandTotal">Rp 0</h3>
                        </div>

                        {{-- Tombol Lanjut ke Pemesanan --}}
                        <button type="button" class="btn btn-checkout" onclick="bukaModalCheckout()">
                            <i class="bi bi-bag-check fs-5"></i>
                            Lanjut ke Pemesanan
                        </button>

                        <small class="text-muted text-center d-block mt-3" style="font-size: 0.78rem;">
                            <i class="bi bi-shield-check text-success me-1"></i>
                            Pemesanan amanah & konfirmasi cepat dari TB. Sumber Barokah Malang.
                        </small>

                    </div>
                </div>

            </div>

        </div>
    </section>

    {{-- ======================================================================
         MODAL KONFIRMASI KOSONGKAN KERANJANG
         ====================================================================== --}}
    <div class="modal fade" id="modalKonfirmasiKosongkan" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-sm">
            <div class="modal-content text-center p-3 rounded-4 border-0 shadow-lg">
                <div class="modal-body pt-3 pb-2">
                    <div class="text-danger mb-3">
                        <i class="bi bi-trash3 fs-1"></i>
                    </div>
                    <h5 class="fw-bold text-dark mb-2">Kosongkan Keranjang?</h5>
                    <p class="small text-muted mb-0">
                        Seluruh material di dalam keranjang akan dihapus. Yakin ingin melanjutkan?
                    </p>
                </div>
                <div class="d-flex justify-content-center gap-2 pt-3 pb-1">
                    <button type="button" class="btn btn-sm btn-outline-secondary px-3" data-bs-dismiss="modal">Batal</button>
                    <button type="button" class="btn btn-sm btn-danger px-3" id="btnKonfirmasiKosongkan">Kosongkan</button>
                </div>
            </div>
        </div>
    </div>

    {{-- ======================================================================
         MODAL SIMULASI CHECKOUT PEMESANAN
         ====================================================================== --}}
    <div class="modal fade" id="modalCheckout" tabindex="-1" aria-labelledby="modalCheckoutLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                <div class="modal-header bg-light border-bottom px-4 py-3">
                    <h5 class="modal-title fs-6 fw-bold text-dark" id="modalCheckoutLabel">
                        <i class="bi bi-clipboard2-check text-primary me-1"></i> Konfirmasi Pemesanan
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
                </div>

                <form id="formCheckoutSimulasi" novalidate>
                    <div class="modal-body p-4">
                        
                        <div class="alert alert-light border d-flex align-items-center mb-3 py-2 px-3 small">
                            <i class="bi bi-info-circle text-primary me-2 fs-5"></i>
                            <div>
                                Total Pembayaran: <strong class="text-primary fs-6" id="checkoutModalTotal">Rp 0</strong>
                            </div>
                        </div>

                        {{-- Nama Pemesan --}}
                        <div class="mb-3">
                            <label for="inputNamaPemesan" class="form-label small fw-semibold text-secondary">Nama Lengkap <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="inputNamaPemesan" placeholder="Contoh: Budi Santoso" required>
                        </div>

                        {{-- No. Telepon / WhatsApp --}}
                        <div class="mb-3">
                            <label for="inputTelpPemesan" class="form-label small fw-semibold text-secondary">No. WhatsApp / Telepon <span class="text-danger">*</span></label>
                            <input type="tel" class="form-control" id="inputTelpPemesan" placeholder="Contoh: 081234567890" required>
                        </div>

                        {{-- Pilihan Metode: Dikirim atau Diambil di Tempat --}}
                        <div class="mb-3">
                            <label class="form-label small fw-semibold text-secondary d-block mb-2">
                                Metode Pengambilan Barang <span class="text-danger">*</span>
                            </label>
                            <div class="row g-2">
                                <div class="col-6">
                                    <label class="metode-kirim-option w-100">
                                        <input type="radio" name="metodePengiriman" id="metodeDiambil" value="Diambil di Tempat" checked>
                                        <div class="metode-kirim-card">
                                            <i class="bi bi-shop me-1"></i>
                                            <span>Diambil di Tempat</span>
                                        </div>
                                    </label>
                                </div>
                                <div class="col-6">
                                    <label class="metode-kirim-option w-100">
                                        <input type="radio" name="metodePengiriman" id="metodeDikirim" value="Dikirim">
                                        <div class="metode-kirim-card">
                                            <i class="bi bi-truck me-1"></i>
                                            <span>Dikirim</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {{-- Info Ambil di Tempat (Muncul jika pilih Diambil di Tempat) --}}
                        <div id="infoAmbilDiTempat" class="p-2 px-3 rounded-3 bg-light border small text-secondary mb-2">
                            <div class="d-flex align-items-start gap-2">
                                <i class="bi bi-geo-alt-fill text-warning mt-1"></i>
                                <div>
                                    Barang dapat diambil langsung di toko <strong>TB. Sumber Barokah Malang</strong>:
                                    <div class="fw-semibold text-dark mt-1" id="checkoutAlamatTokoText">
                                        Jl. Raya Gadang No. 128, Gadang, Kec. Sukun, Kota Malang, Jawa Timur 65149
                                    </div>
                                </div>
                            </div>
                        </div>

                        {{-- Input Alamat Pengiriman (Muncul jika pilih Dikirim) --}}
                        <div id="wrapperAlamatPengiriman" class="mb-2 d-none">
                            <label for="inputAlamatPengiriman" class="form-label small fw-semibold text-secondary">
                                Nama Alamat / Lokasi Pengiriman <span class="text-danger">*</span>
                            </label>
                            <textarea class="form-control" id="inputAlamatPengiriman" rows="2" placeholder="Tuliskan nama jalan, nomor rumah/proyek, RT/RW, kelurahan, kecamatan..."></textarea>
                            <div id="errorAlamatPengiriman" class="text-danger small mt-1 d-none">
                                Mohon tuliskan alamat lengkap pengiriman barang.
                            </div>
                        </div>

                        {{-- ==========================================================
                             PILIHAN METODE PEMBAYARAN: TUNAI & TRANSFER BANK
                             ========================================================== --}}
                        <div class="mb-3 mt-3 pt-3 border-top">
                            <label class="form-label small fw-semibold text-secondary d-block mb-2">
                                Metode Pembayaran <span class="text-danger">*</span>
                            </label>
                            <div class="row g-2">
                                <div class="col-6">
                                    <label class="metode-bayar-option w-100">
                                        <input type="radio" name="metodePembayaran" id="metodeBayarTunai" value="Tunai" checked>
                                        <div class="metode-bayar-card">
                                            <i class="bi bi-cash-stack me-1 text-success"></i>
                                            <span>Tunai</span>
                                        </div>
                                    </label>
                                </div>
                                <div class="col-6">
                                    <label class="metode-bayar-option w-100">
                                        <input type="radio" name="metodePembayaran" id="metodeBayarTransfer" value="Transfer">
                                        <div class="metode-bayar-card">
                                            <i class="bi bi-bank me-1 text-primary"></i>
                                            <span>Transfer</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {{-- Petunjuk Pembayaran Tunai --}}
                        <div id="infoPembayaranTunai" class="p-2 px-3 rounded-3 bg-light border small text-secondary mb-2">
                            <div class="d-flex align-items-center gap-2">
                                <i class="bi bi-wallet2 text-success fs-5 flex-shrink-0"></i>
                                <div>
                                    <strong class="text-dark">Pembayaran Tunai (Cash):</strong>
                                    <div id="petunjukTunaiText" class="text-muted mt-1">
                                        Bayar langsung di kasir toko TB. Sumber Barokah saat pengambilan barang.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {{-- Petunjuk Pembayaran Transfer Bank BCA & Upload Bukti Pembayaran --}}
                        <div id="infoPembayaranTransfer" class="p-3 rounded-3 bg-light border small text-secondary mb-2 d-none">
                            
                            {{-- Panel Detail Rekening Resmi BCA --}}
                            <div class="p-3 rounded-3 bg-white border mb-3 shadow-sm">
                                <div class="d-flex align-items-center justify-content-between gap-3">
                                    <div>
                                        <div class="d-flex align-items-center gap-2 mb-1">
                                            <span class="badge bg-primary px-2 py-1 fw-bold" style="font-size: 0.72rem; letter-spacing: 0.5px;">BCA</span>
                                            <span class="fw-bold text-dark small">Bank Central Asia (BCA)</span>
                                        </div>
                                        <div class="fw-bold fs-5 text-dark font-monospace" style="letter-spacing: 1px;">44011460011</div>
                                        <div class="text-secondary small mt-1">
                                            a.n. <strong class="text-dark">Wahyu Ningsih</strong>
                                        </div>
                                    </div>
                                    <button type="button" class="btn btn-sm btn-outline-primary px-3 py-1 flex-shrink-0" onclick="salinNomorRekening('44011460011', this)">
                                        <i class="bi bi-copy me-1"></i>Salin Rekening
                                    </button>
                                </div>
                            </div>

                            {{-- Form Unggah Bukti Transfer --}}
                            <div class="pt-2 border-top">
                                <label for="inputBuktiTransfer" class="form-label small fw-semibold text-secondary mb-1 d-flex justify-content-between">
                                    <span><i class="bi bi-receipt text-primary me-1"></i>Unggah Bukti Pembayaran <span class="text-danger">*</span></span>
                                </label>
                                <input type="file" class="form-control form-control-sm" id="inputBuktiTransfer" accept="image/*">
                                <input type="hidden" id="buktiTransferBase64">
                                <div class="form-text text-muted" style="font-size: 0.73rem;">
                                    Pilih foto struk ATM atau screenshot m-Banking BCA Anda setelah transfer ke rekening di atas.
                                </div>
                                <div id="errorBuktiTransfer" class="text-danger small mt-1 d-none">
                                    Mohon unggah foto bukti transfer pembayaran Anda.
                                </div>

                                {{-- Pratinjau Foto Bukti Transfer --}}
                                <div id="wrapperPreviewBuktiTransfer" class="d-none mt-2 p-2 bg-white rounded-3 border d-flex align-items-center justify-content-between gap-2">
                                    <div class="d-flex align-items-center gap-2 overflow-hidden">
                                        <img id="previewImgBuktiTransfer" src="" alt="Bukti Transfer" class="rounded border flex-shrink-0" style="width: 44px; height: 44px; object-fit: cover;">
                                        <div class="overflow-hidden">
                                            <div class="small fw-semibold text-dark text-truncate" id="namaFileBuktiTransfer">bukti-transfer.jpg</div>
                                            <div class="text-success small" style="font-size: 0.72rem;"><i class="bi bi-check-circle-fill me-1"></i>Bukti siap dilampirkan</div>
                                        </div>
                                    </div>
                                    <button type="button" class="btn btn-sm btn-outline-danger border-0 flex-shrink-0" title="Hapus file bukti" onclick="hapusBuktiTransfer()">
                                        <i class="bi bi-trash3"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div class="modal-footer bg-light border-top px-4 py-3">
                        <button type="button" class="btn btn-sm btn-outline-secondary px-3" data-bs-dismiss="modal">Batal</button>
                        <button type="submit" class="btn btn-sm btn-primary-custom px-4">
                            <i class="bi bi-check-lg me-1"></i> Konfirmasi Pesanan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    {{-- ======================================================================
         MODAL SUKSES PEMESANAN (SIMULASI)
         ====================================================================== --}}
    <div class="modal fade" id="modalSuksesPesanan" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
        <div class="modal-dialog modal-dialog-centered" style="max-width: 440px;">
            <div class="modal-content text-center p-4 rounded-4 border-0 shadow-lg">
                <div class="text-success mb-2">
                    <i class="bi bi-check-circle-fill" style="font-size: 3rem;"></i>
                </div>
                <h5 class="fw-bold text-dark mb-1 fs-5">Pesanan Diterima!</h5>
                <p class="small text-muted mb-3">
                    Terima kasih, <strong id="suksesNamaPemesan" class="text-dark">Pelanggan</strong>. Pesanan Anda telah berhasil dikonfirmasi.
                </p>

                {{-- Notifikasi Stok Otomatis Berkurang --}}
                <div class="alert alert-success border-success-subtle py-2 px-3 mb-3 small d-flex align-items-center justify-content-center gap-2 text-wrap">
                    <i class="bi bi-box-seam flex-shrink-0 fs-6"></i>
                    <span class="fw-semibold">Stok barang di toko otomatis berkurang</span>
                </div>

                {{-- Detail Rincian Pesanan --}}
                <div class="p-3 rounded-3 bg-light border small text-start mb-3" id="suksesInfoPengiriman">
                    <div class="d-flex justify-content-between align-items-center py-1 border-bottom">
                        <span class="text-muted">Pengambilan</span>
                        <strong class="text-dark" id="suksesMetodeText">Diambil di Tempat</strong>
                    </div>
                    <div id="suksesAlamatWrapper" class="d-flex justify-content-between align-items-start py-1 border-bottom d-none">
                        <span class="text-muted text-nowrap me-2">Alamat Kirim</span>
                        <span class="text-dark text-end fw-semibold text-break" id="suksesAlamatText">-</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center pt-2">
                        <span class="text-muted">Pembayaran</span>
                        <span id="suksesPembayaranBadge" class="badge bg-success-subtle text-success border border-success-subtle">
                            <i class="bi bi-cash-stack me-1"></i>Tunai
                        </span>
                    </div>
                    <div id="suksesTransferNote" class="mt-2 p-2 rounded-2 bg-primary-subtle text-primary border border-primary-subtle small d-none" style="font-size: 0.76rem;">
                        <i class="bi bi-info-circle-fill me-1"></i> Harap kirimkan bukti transfer ke WhatsApp admin untuk memproses pesanan Anda.
                    </div>
                </div>

                {{-- Tombol Navigasi --}}
                <div class="d-grid gap-2">
                    <a href="{{ route('katalog') }}" class="btn btn-primary-custom py-2">
                        <i class="bi bi-grid-fill me-1"></i> Kembali ke Katalog
                    </a>
                    <a href="{{ route('home') }}" class="btn btn-outline-secondary btn-sm py-2">
                        Ke Halaman Utama
                    </a>
                </div>
            </div>
        </div>
    </div>

    {{-- ======================================================================
         TOAST NOTIFIKASI KERANJANG
         ====================================================================== --}}
    <div class="position-fixed top-0 end-0 p-3" style="z-index: 1090;">
        <div id="keranjangToast" class="toast align-items-center text-white bg-dark border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body d-flex align-items-center py-2 px-3 small">
                    <i class="bi bi-info-circle-fill text-warning me-2 fs-6"></i>
                    <span id="toastKeranjangPesan">Perubahan keranjang disimpan.</span>
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Tutup"></button>
            </div>
        </div>
    </div>

@endsection

@push('scripts')
    {{-- Memuat Stok Store, Pengiriman Store, Transaksi Store, Keranjang Store, dan Skrip UI Keranjang --}}
    <script src="{{ asset('js/stok-store.js') }}?v=2.9"></script>
    <script src="{{ asset('js/pengiriman-store.js') }}?v=2.9"></script>
    <script src="{{ asset('js/transaksi-store.js') }}?v=2.9"></script>
    <script src="{{ asset('js/keranjang-store.js') }}?v=2.9"></script>
    <script src="{{ asset('js/keranjang.js') }}?v=3.0"></script>
@endpush
