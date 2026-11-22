{{-- ======================================================================
     MODAL TAMBAH / EDIT KATEGORI (1 Modal untuk Tambah & Ubah)
     ====================================================================== --}}
<div class="modal fade" id="modalFormKategori" tabindex="-1" aria-labelledby="modalFormKategoriTitle" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content modal-content-custom">
            
            <div class="modal-header modal-header-custom">
                <h5 class="modal-title fw-bold text-dark fs-6" id="modalFormKategoriTitle">Tambah Kategori Baru</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
            </div>

            <form id="formKategori" novalidate>
                <div class="modal-body p-4">
                    {{-- Input Hidden ID Kategori --}}
                    <input type="hidden" id="kategoriId">

                    {{-- Nama Kategori --}}
                    <div class="mb-2">
                        <label for="namaKategoriInput" class="form-label small fw-semibold text-secondary">
                            Nama Kategori <span class="text-danger">*</span>
                        </label>
                        <input type="text" class="form-control form-control-lg fs-6" id="namaKategoriInput" placeholder="Contoh: Semen, Cat, Kayu, Listrik..." maxlength="30" autocomplete="off">
                        <div id="namaKategoriError" class="text-danger small mt-1 d-none"></div>
                        <small class="text-muted d-block mt-1" style="font-size: 0.8rem;">
                            Panjang 2 - 30 karakter. Nama kategori tidak boleh sama dengan kategori lain.
                        </small>
                    </div>
                </div>

                <div class="modal-footer modal-footer-custom d-flex justify-content-between align-items-center">
                    <div>
                        <button type="button" class="btn btn-sm btn-outline-danger d-none" id="btnHapusDariModalKategori">
                            <i class="bi bi-trash3 me-1"></i>Hapus Kategori
                        </button>
                    </div>
                    <div class="d-flex gap-2">
                        <button type="button" class="btn btn-sm btn-outline-secondary px-3" data-bs-dismiss="modal">Batal</button>
                        <button type="submit" class="btn btn-sm btn-primary-custom px-4" id="btnSimpanKategori">
                            <i class="bi bi-save me-1"></i>
                            Simpan Kategori
                        </button>
                    </div>
                </div>
            </form>

        </div>
    </div>
</div>

{{-- ======================================================================
     MODAL KONFIRMASI HAPUS KATEGORI
     ====================================================================== --}}
<div class="modal fade" id="modalKonfirmasiHapusKategori" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content modal-content-custom text-center p-3">
            <div class="modal-body pt-3 pb-2">
                <div class="text-danger mb-3">
                    <i class="bi bi-exclamation-triangle-fill fs-1"></i>
                </div>
                <h5 class="fw-bold text-dark mb-2">Hapus Kategori?</h5>
                <p class="small text-muted mb-2">Anda akan menghapus kategori berikut:</p>
                <div class="fw-bold text-dark fs-6 mb-3" id="namaKategoriHapus">"Kategori"</div>

                {{-- Alert Dinamis untuk Kategori yang Berisi Barang --}}
                <div id="alertPindahBarang" class="alert alert-warning text-start small d-none mb-3 py-2 px-3 border-warning">
                    <i class="bi bi-info-circle-fill me-1"></i>
                    <span id="pesanPindahBarang">Kategori ini berisi N barang. Barang akan dipindahkan ke kategori 'Lainnya'.</span>
                </div>
            </div>
            <div class="d-flex justify-content-center gap-2 pt-2 pb-1">
                <button type="button" class="btn btn-sm btn-outline-secondary px-3" data-bs-dismiss="modal">Batal</button>
                <button type="button" class="btn btn-sm btn-danger px-4" id="btnKonfirmasiHapusKategori">Ya, Hapus</button>
            </div>
        </div>
    </div>
</div>
