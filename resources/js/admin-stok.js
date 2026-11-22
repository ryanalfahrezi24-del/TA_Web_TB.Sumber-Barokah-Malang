/**
 * ============================================================================
 * Logika Tampilan Halaman Admin — Informasi Stok Barang (admin-stok.js)
 * TB. Sumber Barokah Malang
 * ============================================================================
 * Mengelola render tabel stok barang, pencarian langsung (client-side),
 * modal tambah/ubah beserta validasi form, modal konfirmasi hapus,
 * dan notifikasi toast sementara.
 */

import {
    getBarang,
    tambahBarang,
    ubahBarang,
    hapusBarang,
    hitungStatus,
} from './barang-store.js';

/**
 * Memformat angka ke dalam format Rupiah (contoh: Rp 65.000).
 * @param {number} nominal
 * @returns {string}
 */
function formatRupiah(nominal) {
    const angka = Number(nominal) || 0;
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(angka);
}

/**
 * Mengamankan teks dari karakter HTML berbahaya sebelum dirender ke tabel.
 * @param {string} teks
 * @returns {string}
 */
function escapeHtml(teks) {
    const div = document.createElement('div');
    div.textContent = String(teks ?? '');
    return div.innerHTML;
}

/**
 * Menghasilkan markup badge Status Stok sesuai aturan:
 * - Habis   (stok = 0)                 -> Badge merah
 * - Menipis (0 < stok <= stokMinimum)  -> Badge kuning/oranye
 * - Aman    (stok > stokMinimum)       -> Badge hijau
 *
 * @param {object} barang
 * @returns {string}
 */
function buatBadgeStatus(barang) {
    const status = hitungStatus(barang);

    if (status === 'Habis') {
        return `<span class="badge-status badge-habis">Habis</span>`;
    }
    if (status === 'Menipis') {
        return `<span class="badge-status badge-menipis">Menipis</span>`;
    }
    return `<span class="badge-status badge-aman">Aman</span>`;
}

/**
 * Inisialisasi seluruh interaksi pada Halaman Admin Stok Barang.
 */
export function initAdminStok() {
    const halamanAdmin = document.getElementById('halaman-admin-stok');
    if (!halamanAdmin) {
        return;
    }

    // Elemen Tabel & Pencarian
    const inputCari = document.getElementById('input-cari-barang');
    const btnTambah = document.getElementById('btn-tambah-barang');
    const wadahTabel = document.getElementById('wadah-tabel-barang');
    const tbodyStok = document.getElementById('tbody-stok-barang');
    const keadaanKosong = document.getElementById('keadaan-kosong');
    const teksKeadaanKosong = document.getElementById('teks-keadaan-kosong');

    // Elemen Modal Form Tambah / Ubah
    const modalForm = document.getElementById('modal-form-barang');
    const backdropForm = document.getElementById('backdrop-modal-form');
    const judulModalForm = document.getElementById('judul-modal-form');
    const btnTutupForm = document.getElementById('btn-tutup-modal-form');
    const btnBatalForm = document.getElementById('btn-batal-form');
    const formBarang = document.getElementById('form-barang');

    // Input & Pesan Error di dalam Modal Form
    const inputId = document.getElementById('input-id-barang');
    const inputNama = document.getElementById('input-nama-barang');
    const inputStok = document.getElementById('input-stok-barang');
    const inputStokMin = document.getElementById('input-stok-minimum');
    const inputHarga = document.getElementById('input-harga-barang');

    const errorNama = document.getElementById('error-nama-barang');
    const errorStok = document.getElementById('error-stok-barang');
    const errorStokMin = document.getElementById('error-stok-minimum');
    const errorHarga = document.getElementById('error-harga-barang');

    // Elemen Modal Konfirmasi Hapus
    const modalHapus = document.getElementById('modal-hapus-barang');
    const backdropHapus = document.getElementById('backdrop-modal-hapus');
    const teksKonfirmasiHapus = document.getElementById('teks-konfirmasi-hapus');
    const btnBatalHapus = document.getElementById('btn-batal-hapus');
    const btnKonfirmasiHapus = document.getElementById('btn-konfirmasi-hapus');

    // Elemen Toast Notifikasi
    const toastBox = document.getElementById('toast-notifikasi');
    const teksToast = document.getElementById('teks-toast-notifikasi');

    let idHapusAktif = null;
    let timerToast = null;

    /**
     * Menampilkan notifikasi kecil (toast) sementara selama 3 detik.
     * @param {string} pesan
     */
    function tampilkanToast(pesan) {
        if (!toastBox || !teksToast) return;

        teksToast.textContent = pesan;
        toastBox.classList.remove('hidden');

        if (timerToast) {
            clearTimeout(timerToast);
        }

        timerToast = setTimeout(() => {
            toastBox.classList.add('hidden');
        }, 3000);
    }

    /**
     * Merender isi tabel berdasarkan data di localStorage dan kata kunci pencarian.
     */
    function renderTabel() {
        const semuaBarang = getBarang();
        const kataKunci = (inputCari?.value || '').trim().toLowerCase();

        const daftarTampil = kataKunci
            ? semuaBarang.filter((item) => item.nama.toLowerCase().includes(kataKunci))
            : semuaBarang;

        // Jika data kosong atau hasil pencarian tidak ditemukan
        if (daftarTampil.length === 0) {
            wadahTabel.classList.add('hidden');
            keadaanKosong.classList.remove('hidden');

            if (semuaBarang.length === 0) {
                teksKeadaanKosong.textContent = 'Belum ada barang. Klik Tambah Barang untuk memulai.';
            } else {
                teksKeadaanKosong.textContent = `Tidak ada barang yang cocok dengan pencarian "${inputCari.value.trim()}".`;
            }

            tbodyStok.innerHTML = '';
            return;
        }

        wadahTabel.classList.remove('hidden');
        keadaanKosong.classList.add('hidden');

        tbodyStok.innerHTML = daftarTampil
            .map((barang, index) => {
                return `
                    <tr class="table-row-hover transition-all duration-150">
                        <td class="py-3.5 px-4 sm:px-6 text-center text-gray-500 font-medium">
                            ${index + 1}
                        </td>
                        <td class="py-3.5 px-4 sm:px-6 font-semibold text-[#1F2937]">
                            ${escapeHtml(barang.nama)}
                        </td>
                        <td class="py-3.5 px-4 sm:px-6 text-right font-semibold text-[#1F2937]">
                            ${Number(barang.stok)}
                        </td>
                        <td class="py-3.5 px-4 sm:px-6 text-right text-gray-600">
                            ${Number(barang.stokMinimum)}
                        </td>
                        <td class="py-3.5 px-4 sm:px-6 text-center">
                            ${buatBadgeStatus(barang)}
                        </td>
                        <td class="py-3.5 px-4 sm:px-6 text-right font-semibold text-[#1F2937]">
                            ${formatRupiah(barang.harga)}
                        </td>
                        <td class="py-3.5 px-4 sm:px-6 text-center">
                            <div class="inline-flex items-center justify-center gap-2">
                                <button
                                    type="button"
                                    data-aksi="ubah"
                                    data-id="${barang.id}"
                                    class="btn-aksi-ubah px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer"
                                >
                                    Ubah
                                </button>
                                <button
                                    type="button"
                                    data-aksi="hapus"
                                    data-id="${barang.id}"
                                    class="btn-aksi-hapus px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer"
                                >
                                    Hapus
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            })
            .join('');
    }

    /**
     * Membersihkan seluruh pesan kesalahan validasi pada form modal.
     */
    function bersihkanErrorForm() {
        [
            [inputNama, errorNama],
            [inputStok, errorStok],
            [inputStokMin, errorStokMin],
            [inputHarga, errorHarga],
        ].forEach(([inputEl, errorEl]) => {
            if (inputEl) inputEl.classList.remove('input-error');
            if (errorEl) {
                errorEl.textContent = '';
                errorEl.classList.add('hidden');
            }
        });
    }

    /**
     * Menampilkan pesan error di bawah satu kolom input.
     */
    function setErrorInput(inputEl, errorEl, pesan) {
        if (inputEl) inputEl.classList.add('input-error');
        if (errorEl) {
            errorEl.textContent = pesan;
            errorEl.classList.remove('hidden');
        }
    }

    /**
     * Membuka modal form untuk Tambah Barang atau Ubah Barang.
     * @param {object|null} barang - Jika null maka mode Tambah, jika ada maka mode Ubah.
     */
    function bukaModalForm(barang = null) {
        bersihkanErrorForm();

        if (barang) {
            judulModalForm.textContent = 'Ubah Barang';
            inputId.value = String(barang.id);
            inputNama.value = barang.nama;
            inputStok.value = String(barang.stok);
            inputStokMin.value = String(barang.stokMinimum);
            inputHarga.value = String(barang.harga);
        } else {
            judulModalForm.textContent = 'Tambah Barang';
            inputId.value = '';
            formBarang.reset();
        }

        modalForm.classList.remove('hidden');
        setTimeout(() => inputNama.focus(), 50);
    }

    /**
     * Menutup modal form Tambah/Ubah Barang.
     */
    function tutupModalForm() {
        modalForm.classList.add('hidden');
        bersihkanErrorForm();
    }

    /**
     * Membuka modal konfirmasi hapus untuk barang tertentu.
     * @param {object} barang
     */
    function bukaModalHapus(barang) {
        idHapusAktif = barang.id;
        teksKonfirmasiHapus.textContent = `Yakin ingin menghapus ${barang.nama}?`;
        modalHapus.classList.remove('hidden');
    }

    /**
     * Menutup modal konfirmasi hapus.
     */
    function tutupModalHapus() {
        idHapusAktif = null;
        modalHapus.classList.add('hidden');
    }

    /**
     * Validasi isian form sebelum disimpan ke localStorage.
     * @returns {boolean}
     */
    function validasiForm() {
        bersihkanErrorForm();
        let valid = true;

        const nama = inputNama.value.trim();
        const stokRaw = inputStok.value.trim();
        const stokMinRaw = inputStokMin.value.trim();
        const hargaRaw = inputHarga.value.trim();

        if (!nama) {
            setErrorInput(inputNama, errorNama, 'Nama barang wajib diisi.');
            valid = false;
        }

        if (stokRaw === '') {
            setErrorInput(inputStok, errorStok, 'Stok tersedia wajib diisi.');
            valid = false;
        } else if (Number.isNaN(Number(stokRaw)) || Number(stokRaw) < 0) {
            setErrorInput(inputStok, errorStok, 'Stok tersedia tidak boleh bernilai negatif.');
            valid = false;
        }

        if (stokMinRaw === '') {
            setErrorInput(inputStokMin, errorStokMin, 'Stok minimum wajib diisi.');
            valid = false;
        } else if (Number.isNaN(Number(stokMinRaw)) || Number(stokMinRaw) < 0) {
            setErrorInput(inputStokMin, errorStokMin, 'Stok minimum tidak boleh bernilai negatif.');
            valid = false;
        }

        if (hargaRaw === '') {
            setErrorInput(inputHarga, errorHarga, 'Harga barang wajib diisi.');
            valid = false;
        } else if (Number.isNaN(Number(hargaRaw)) || Number(hargaRaw) < 0) {
            setErrorInput(inputHarga, errorHarga, 'Harga barang tidak boleh bernilai negatif.');
            valid = false;
        }

        return valid;
    }

    // Event Listener: Pencarian barang secara langsung
    inputCari?.addEventListener('input', () => {
        renderTabel();
    });

    // Event Listener: Klik tombol "+ Tambah Barang"
    btnTambah?.addEventListener('click', () => {
        bukaModalForm(null);
    });

    // Event Listener: Tutup modal form (Tombol X, Batal, atau Klik Latar Gelap)
    btnTutupForm?.addEventListener('click', tutupModalForm);
    btnBatalForm?.addEventListener('click', tutupModalForm);
    backdropForm?.addEventListener('click', tutupModalForm);

    // Event Listener: Submit Form Tambah / Ubah Barang
    formBarang?.addEventListener('submit', (event) => {
        event.preventDefault();

        if (!validasiForm()) {
            return;
        }

        const dataInput = {
            nama: inputNama.value.trim(),
            stok: Math.floor(Number(inputStok.value)),
            stokMinimum: Math.floor(Number(inputStokMin.value)),
            harga: Math.floor(Number(inputHarga.value)),
        };

        const idEdit = inputId.value.trim();

        if (idEdit) {
            ubahBarang(idEdit, dataInput);
            tutupModalForm();
            renderTabel();
            tampilkanToast('Barang berhasil diperbarui');
        } else {
            tambahBarang(dataInput);
            tutupModalForm();
            renderTabel();
            tampilkanToast('Barang berhasil ditambahkan');
        }
    });

    // Event Listener: Delegasi klik tombol "Ubah" dan "Hapus" pada baris tabel
    tbodyStok?.addEventListener('click', (event) => {
        const tombol = event.target.closest('button[data-aksi]');
        if (!tombol) return;

        const aksi = tombol.getAttribute('data-aksi');
        const id = Number(tombol.getAttribute('data-id'));
        const barang = getBarang().find((item) => Number(item.id) === id);

        if (!barang) return;

        if (aksi === 'ubah') {
            bukaModalForm(barang);
        } else if (aksi === 'hapus') {
            bukaModalHapus(barang);
        }
    });

    // Event Listener: Modal Konfirmasi Hapus (Batal, Latar Gelap, & Hapus)
    btnBatalHapus?.addEventListener('click', tutupModalHapus);
    backdropHapus?.addEventListener('click', tutupModalHapus);

    btnKonfirmasiHapus?.addEventListener('click', () => {
        if (idHapusAktif !== null) {
            hapusBarang(idHapusAktif);
            tutupModalHapus();
            renderTabel();
            tampilkanToast('Barang berhasil dihapus');
        }
    });

    // Event Listener: Tutup modal saat menekan tombol Escape
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (!modalForm.classList.contains('hidden')) {
                tutupModalForm();
            }
            if (!modalHapus.classList.contains('hidden')) {
                tutupModalHapus();
            }
        }
    });

    // Render tabel pertama kali saat halaman dimuat
    renderTabel();
}
