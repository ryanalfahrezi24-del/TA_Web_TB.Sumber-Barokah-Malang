/**
 * ==============================================================================
 * LOGIKA TAMPILAN HALAMAN KERANJANG TB. SUMBER BAROKAH MALANG
 * ==============================================================================
 * File ini menangani interaksi pengguna pada halaman keranjang:
 * - Menampilkan daftar item belanja dari keranjang-store.js
 * - Mengubah kuantitas item (+ / -)
 * - Menghapus item tertentu atau mengosongkan keranjang
 * - Memperbarui ringkasan total pesanan secara instan
 * - Simulasi konfirmasi pemesanan
 */

let modalKonfirmasiKosongInstance = null;
let modalCheckoutInstance = null;
let modalSuksesCheckoutInstance = null;

document.addEventListener('DOMContentLoaded', function () {
    // 1. Proteksi Autentikasi Pengguna: Tamu / Belum Login dilarang mengakses keranjang
    if (typeof isUserLoggedIn === 'function' && !isUserLoggedIn()) {
        const authGuard = document.getElementById('keranjangAuthRequired');
        const emptyState = document.getElementById('keranjangEmptyState');
        const contentRow = document.getElementById('keranjangContentRow');

        if (authGuard) authGuard.classList.remove('d-none');
        if (emptyState) emptyState.classList.add('d-none');
        if (contentRow) contentRow.classList.add('d-none');

        // Alihkan segera ke halaman login
        window.location.replace('/login?redirect=keranjang&pesan=login_dulu');
        return;
    }

    // Inisialisasi modal-modal Bootstrap
    const elModalKosong = document.getElementById('modalKonfirmasiKosongkan');
    if (elModalKosong) modalKonfirmasiKosongInstance = new bootstrap.Modal(elModalKosong);

    const elModalCheckout = document.getElementById('modalCheckout');
    if (elModalCheckout) modalCheckoutInstance = new bootstrap.Modal(elModalCheckout);

    const elModalSukses = document.getElementById('modalSuksesPesanan');
    if (elModalSukses) modalSuksesCheckoutInstance = new bootstrap.Modal(elModalSukses);

    // Render tampilan awal keranjang
    renderTampilanKeranjang();

    // Event listener tombol konfirmasi kosongkan keranjang
    const btnKonfirmKosong = document.getElementById('btnKonfirmasiKosongkan');
    if (btnKonfirmKosong) {
        btnKonfirmKosong.addEventListener('click', function () {
            kosongkanKeranjang();
            if (modalKonfirmasiKosongInstance) modalKonfirmasiKosongInstance.hide();
            if (typeof updateNavbarBadgeKeranjang === 'function') updateNavbarBadgeKeranjang();
            renderTampilanKeranjang();
            tampilkanToastKeranjang('Keranjang belanja berhasil dikosongkan.');
        });
    }

    // Event listener form checkout simulasi
    const formCheckout = document.getElementById('formCheckoutSimulasi');
    if (formCheckout) {
        formCheckout.addEventListener('submit', handleProsesCheckoutSimulasi);
    }

    // Event listener perubahan pilihan metode pengiriman (Diambil di Tempat / Dikirim)
    const radiosMetode = document.querySelectorAll('input[name="metodePengiriman"]');
    radiosMetode.forEach(radio => {
        radio.addEventListener('change', handleUbahMetodePengiriman);
    });

    // Event listener perubahan pilihan metode pembayaran (Tunai / Transfer Bank)
    const radiosBayar = document.querySelectorAll('input[name="metodePembayaran"]');
    radiosBayar.forEach(radio => {
        radio.addEventListener('change', handleUbahMetodePembayaran);
    });

    // Event listener perubahan pilihan saluran transfer (jika tersedia)
    const radiosSubTransfer = document.querySelectorAll('input[name="subMetodeTransfer"]');
    radiosSubTransfer.forEach(radio => {
        radio.addEventListener('change', handleUbahSubMetodeTransfer);
    });

    // Event listener pemilihan file bukti transfer
    const inputBukti = document.getElementById('inputBuktiTransfer');
    if (inputBukti) {
        inputBukti.addEventListener('change', handlePilihBuktiTransfer);
    }

    // Sinkronisasi antar tab
    window.addEventListener('storage', function (e) {
        if (e.key === 'sb_keranjang') {
            renderTampilanKeranjang();
        }
        if (e.key === 'sb_auth') {
            if (typeof isUserLoggedIn === 'function' && !isUserLoggedIn()) {
                window.location.replace('/login?redirect=keranjang&pesan=login_dulu');
            } else {
                renderTampilanKeranjang();
            }
        }
    });
});

/**
 * Merender seluruh tampilan halaman keranjang belanja:
 * Menampilkan tabel item jika ada data, atau menampilkan empty state jika kosong.
 */
function renderTampilanKeranjang() {
    // Cek jika pengguna belum login
    if (typeof isUserLoggedIn === 'function' && !isUserLoggedIn()) {
        const authGuard = document.getElementById('keranjangAuthRequired');
        const emptyState = document.getElementById('keranjangEmptyState');
        const contentRow = document.getElementById('keranjangContentRow');

        if (authGuard) authGuard.classList.remove('d-none');
        if (emptyState) emptyState.classList.add('d-none');
        if (contentRow) contentRow.classList.add('d-none');
        return;
    }

    const keranjang = typeof getKeranjang === 'function' ? getKeranjang() : [];
    const emptyState = document.getElementById('keranjangEmptyState');
    const contentRow = document.getElementById('keranjangContentRow');
    const tbody = document.getElementById('tabelKeranjangBody');

    if (keranjang.length === 0) {
        if (emptyState) emptyState.classList.remove('d-none');
        if (contentRow) contentRow.classList.add('d-none');
        return;
    }

    if (emptyState) emptyState.classList.add('d-none');
    if (contentRow) contentRow.classList.remove('d-none');
    if (!tbody) return;

    tbody.innerHTML = '';

    keranjang.forEach((item, index) => {
        const satuan = escapeHtml(item.satuan || (typeof getSatuanBarang === 'function' ? getSatuanBarang(item) : 'unit'));
        const subtotal = (parseInt(item.harga, 10) || 0) * (parseInt(item.jumlah, 10) || 0);
        const hargaText = typeof formatRupiah === 'function' ? formatRupiah(item.harga) : `Rp ${item.harga}`;
        const subtotalText = typeof formatRupiah === 'function' ? formatRupiah(subtotal) : `Rp ${subtotal}`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-center text-muted fw-semibold" style="width: 40px;">${index + 1}</td>
            <td>
                <div class="d-flex align-items-center gap-3">
                    <div class="keranjang-item-icon">
                        <i class="bi bi-box-seam"></i>
                    </div>
                    <div>
                        <div class="fw-bold text-dark">${escapeHtml(item.nama)}</div>
                        <small class="text-muted d-block">${hargaText} /${satuan}</small>
                    </div>
                </div>
            </td>
            <td class="text-end fw-semibold text-secondary d-none d-md-table-cell" style="width: 140px;">
                ${hargaText}
                <small class="text-muted d-block" style="font-size: 0.78rem;">/${satuan}</small>
            </td>
            <td class="text-center" style="width: 150px;">
                <div class="qty-control-group">
                    <button type="button" class="btn-qty" onclick="handleUbahJumlah('${item.idBarang}', -1)" title="Kurangi jumlah">
                        <i class="bi bi-dash"></i>
                    </button>
                    <input type="number" class="qty-input" value="${item.jumlah}" min="1" 
                        onchange="handleInputManualJumlah('${item.idBarang}', this)" title="Kuantitas">
                    <button type="button" class="btn-qty" onclick="handleUbahJumlah('${item.idBarang}', 1)" title="Tambah jumlah">
                        <i class="bi bi-plus"></i>
                    </button>
                </div>
                <div class="text-muted small mt-1" style="font-size: 0.78rem;">${satuan}</div>
            </td>
            <td class="text-end fw-bold text-dark" style="width: 150px;">
                ${subtotalText}
            </td>
            <td class="text-center" style="width: 60px;">
                <button type="button" class="btn btn-hapus-item" onclick="handleHapusBarang('${item.idBarang}')" title="Hapus dari keranjang">
                    <i class="bi bi-trash3"></i>
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });

    // Perbarui angka-angka ringkasan pesanan
    perbaruiRingkasanPesanan(keranjang);
}

/**
 * Menghitung dan memperbarui kartu ringkasan pesanan di sisi kanan.
 * @param {Array} keranjang 
 */
function perbaruiRingkasanPesanan(keranjang) {
    const totalJenis = keranjang.length;
    const totalQty = typeof hitungTotalKuantitas === 'function' ? hitungTotalKuantitas() : keranjang.reduce((a, b) => a + (b.jumlah || 0), 0);
    const grandTotal = typeof hitungTotalHargaKeranjang === 'function' ? hitungTotalHargaKeranjang() : keranjang.reduce((a, b) => a + (b.harga * b.jumlah), 0);

    const elJenis = document.getElementById('ringkasanTotalJenis');
    const elQty = document.getElementById('ringkasanTotalQty');
    const elSubtotal = document.getElementById('ringkasanSubtotal');
    const elGrandTotal = document.getElementById('ringkasanGrandTotal');

    if (elJenis) elJenis.textContent = `${totalJenis} macam`;
    if (elQty) elQty.textContent = `${totalQty.toLocaleString('id-ID')} unit/sak/kg`;
    
    const formattedTotal = typeof formatRupiah === 'function' ? formatRupiah(grandTotal) : `Rp ${grandTotal.toLocaleString('id-ID')}`;
    if (elSubtotal) elSubtotal.textContent = formattedTotal;
    if (elGrandTotal) elGrandTotal.textContent = formattedTotal;
}

/**
 * Mengubah jumlah item dengan tombol + atau -.
 * @param {string|number} idBarang 
 * @param {number} delta 
 */
function handleUbahJumlah(idBarang, delta) {
    const keranjang = getKeranjang();
    const item = keranjang.find(k => String(k.idBarang) === String(idBarang));
    if (!item) return;

    const qtyBaru = (parseInt(item.jumlah, 10) || 1) + delta;
    if (qtyBaru <= 0) {
        handleHapusBarang(idBarang);
        return;
    }

    // Cek batas stok di master data barang toko
    if (delta > 0 && typeof getBarang === 'function') {
        const semuaBarang = getBarang();
        const idMaster = String(item.idMasterBarang || idBarang).split('_')[0];
        const master = semuaBarang.find(b => String(b.id) === idMaster);
        if (master) {
            const stokTersedia = parseInt(master.stok, 10) || 0;
            if (qtyBaru > stokTersedia) {
                tampilkanToastKeranjang(`Jumlah tidak boleh melebihi stok yang tersedia (${stokTersedia} ${master.satuan || 'unit'}).`);
                return;
            }
        }
    }

    ubahJumlahKeranjang(idBarang, qtyBaru);
    if (typeof updateNavbarBadgeKeranjang === 'function') updateNavbarBadgeKeranjang();
    renderTampilanKeranjang();
}

/**
 * Mengubah jumlah item secara langsung melalui input ketik.
 * @param {string|number} idBarang 
 * @param {HTMLInputElement} inputEl 
 */
function handleInputManualJumlah(idBarang, inputEl) {
    let val = parseInt(inputEl.value, 10);
    if (isNaN(val) || val <= 0) {
        val = 1;
        inputEl.value = 1;
    }

    // Cek batas stok di master data barang toko
    if (typeof getBarang === 'function') {
        const semuaBarang = getBarang();
        const idMaster = String(idBarang).split('_')[0];
        const master = semuaBarang.find(b => String(b.id) === idMaster);
        if (master) {
            const stokTersedia = parseInt(master.stok, 10) || 0;
            if (val > stokTersedia) {
                val = Math.max(1, stokTersedia);
                inputEl.value = val;
                tampilkanToastKeranjang(`Jumlah disesuaikan dengan stok tersedia (${stokTersedia} ${master.satuan || 'unit'}).`);
            }
        }
    }

    ubahJumlahKeranjang(idBarang, val);
    if (typeof updateNavbarBadgeKeranjang === 'function') updateNavbarBadgeKeranjang();
    renderTampilanKeranjang();
}

/**
 * Menghapus satu item dari keranjang.
 * @param {string|number} idBarang 
 */
function handleHapusBarang(idBarang) {
    hapusDariKeranjang(idBarang);
    if (typeof updateNavbarBadgeKeranjang === 'function') updateNavbarBadgeKeranjang();
    renderTampilanKeranjang();
    tampilkanToastKeranjang('Item telah dihapus dari keranjang.');
}

/**
 * Membuka modal konfirmasi untuk mengosongkan keranjang.
 */
function bukaModalKosongkanKeranjang() {
    if (modalKonfirmasiKosongInstance) {
        modalKonfirmasiKosongInstance.show();
    }
}

/**
 * Menampilkan atau menyembunyikan input alamat pengiriman sesuai metode yang dipilih
 * (Diambil di Tempat vs Dikirim).
 */
function handleUbahMetodePengiriman() {
    const radioTerpilih = document.querySelector('input[name="metodePengiriman"]:checked');
    const metode = radioTerpilih ? radioTerpilih.value : 'Diambil di Tempat';

    const wrapperAlamat = document.getElementById('wrapperAlamatPengiriman');
    const infoAmbil = document.getElementById('infoAmbilDiTempat');
    const inputAlamat = document.getElementById('inputAlamatPengiriman');
    const errorAlamat = document.getElementById('errorAlamatPengiriman');

    if (metode === 'Dikirim') {
        if (wrapperAlamat) wrapperAlamat.classList.remove('d-none');
        if (infoAmbil) infoAmbil.classList.add('d-none');
        if (inputAlamat) inputAlamat.focus();
    } else {
        if (wrapperAlamat) wrapperAlamat.classList.add('d-none');
        if (infoAmbil) infoAmbil.classList.remove('d-none');
        if (errorAlamat) errorAlamat.classList.add('d-none');
        if (inputAlamat) inputAlamat.classList.remove('is-invalid');
    }

    // Perbarui juga petunjuk pembayaran tunai sesuai metode pengambilan
    handleUbahMetodePembayaran();
}

/**
 * Menangani peralihan tampilan metode pembayaran (Tunai vs Transfer Bank).
 */
function handleUbahMetodePembayaran() {
    const radioBayar = document.querySelector('input[name="metodePembayaran"]:checked');
    const metodeBayar = radioBayar ? radioBayar.value : 'Tunai';

    const infoTunai = document.getElementById('infoPembayaranTunai');
    const infoTransfer = document.getElementById('infoPembayaranTransfer');
    const petunjukTunai = document.getElementById('petunjukTunaiText');

    const radioKirim = document.querySelector('input[name="metodePengiriman"]:checked');
    const metodeKirim = radioKirim ? radioKirim.value : 'Diambil di Tempat';

    if (metodeBayar === 'Transfer') {
        if (infoTunai) infoTunai.classList.add('d-none');
        if (infoTransfer) infoTransfer.classList.remove('d-none');
        handleUbahSubMetodeTransfer();
    } else {
        if (infoTransfer) infoTransfer.classList.add('d-none');
        if (infoTunai) infoTunai.classList.remove('d-none');
        if (petunjukTunai) {
            if (metodeKirim === 'Dikirim') {
                petunjukTunai.textContent = 'Bayar tunai di tempat saat barang tiba di lokasi pengiriman (COD).';
            } else {
                petunjukTunai.textContent = 'Bayar langsung di kasir toko TB. Sumber Barokah saat pengambilan barang.';
            }
        }
    }
}

/**
 * Menangani tampilan informasi transfer pembayaran BCA.
 */
function handleUbahSubMetodeTransfer() {
    // Toko menggunakan pembayaran transfer tunggal ke rekening BCA
}

/**
 * Menyalin nomor rekening bank ke clipboard.
 * @param {string} nomor 
 * @param {HTMLButtonElement} btnEl 
 */
function salinNomorRekening(nomor, btnEl) {
    if (!nomor) return;

    const salinKeClipboard = (teks) => {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(teks);
        } else {
            // Fallback untuk environment tanpa clipboard API
            const inputTemp = document.createElement('textarea');
            inputTemp.value = teks;
            inputTemp.style.position = 'fixed';
            inputTemp.style.left = '-9999px';
            document.body.appendChild(inputTemp);
            inputTemp.focus();
            inputTemp.select();
            try {
                document.execCommand('copy');
                document.body.removeChild(inputTemp);
                return Promise.resolve();
            } catch (err) {
                document.body.removeChild(inputTemp);
                return Promise.reject(err);
            }
        }
    };

    salinKeClipboard(nomor).then(() => {
        if (btnEl) {
            const htmlAsli = btnEl.innerHTML;
            btnEl.innerHTML = '<i class="bi bi-check-lg text-success"></i> <span class="text-success fw-bold">Tersalin!</span>';
            setTimeout(() => {
                btnEl.innerHTML = htmlAsli;
            }, 2000);
        }
        tampilkanToastKeranjang(`Nomor rekening ${nomor} berhasil disalin.`);
    }).catch(() => {
        tampilkanToastKeranjang(`Nomor rekening: ${nomor}`);
    });
}

/**
 * Mengompres file foto bukti transfer menjadi Base64 ringan (maks 800px).
 * @param {File} file 
 * @returns {Promise<string>}
 */
function prosesFileBuktiTransfer(file) {
    return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith('image/')) {
            return reject(new Error('File bukan gambar.'));
        }
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                const canvas = document.createElement('canvas');
                const maxDim = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxDim) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    }
                } else {
                    if (height > maxDim) {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const base64 = canvas.toDataURL('image/jpeg', 0.82);
                resolve(base64);
            };
            img.onerror = () => reject(new Error('Gagal memproses gambar bukti.'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Gagal membaca file bukti.'));
        reader.readAsDataURL(file);
    });
}

/**
 * Menangani pemilihan file foto bukti transfer dari input file.
 * @param {Event} e 
 */
async function handlePilihBuktiTransfer(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
        const base64 = await prosesFileBuktiTransfer(file);
        const elBase64 = document.getElementById('buktiTransferBase64');
        const wrapper = document.getElementById('wrapperPreviewBuktiTransfer');
        const img = document.getElementById('previewImgBuktiTransfer');
        const namaText = document.getElementById('namaFileBuktiTransfer');
        const errText = document.getElementById('errorBuktiTransfer');

        if (elBase64) elBase64.value = base64;
        if (img) img.src = base64;
        if (namaText) namaText.textContent = file.name;
        if (wrapper) wrapper.classList.remove('d-none');
        if (errText) errText.classList.add('d-none');
    } catch (err) {
        console.error('Gagal memproses bukti transfer:', err);
        tampilkanToastKeranjang('Gagal memuat file bukti. Pastikan format file adalah foto (JPG/PNG/WEBP).');
        hapusBuktiTransfer();
    }
}

/**
 * Menghapus lampiran bukti transfer.
 */
function hapusBuktiTransfer() {
    const input = document.getElementById('inputBuktiTransfer');
    const elBase64 = document.getElementById('buktiTransferBase64');
    const wrapper = document.getElementById('wrapperPreviewBuktiTransfer');
    const errText = document.getElementById('errorBuktiTransfer');
    if (input) input.value = '';
    if (elBase64) elBase64.value = '';
    if (wrapper) wrapper.classList.add('d-none');
    if (errText) errText.classList.add('d-none');
}

/**
 * Membuka modal konfirmasi / formulir checkout simulasi.
 */
function bukaModalCheckout() {
    if (typeof isUserLoggedIn === 'function' && !isUserLoggedIn()) {
        window.location.replace('/login?redirect=keranjang&pesan=login_dulu');
        return;
    }

    const keranjang = getKeranjang();
    if (keranjang.length === 0) return;

    const grandTotal = typeof hitungTotalHargaKeranjang === 'function' ? hitungTotalHargaKeranjang() : 0;
    const elTotalModal = document.getElementById('checkoutModalTotal');
    if (elTotalModal) {
        elTotalModal.textContent = typeof formatRupiah === 'function' ? formatRupiah(grandTotal) : `Rp ${grandTotal}`;
    }

    // Perbarui alamat fisik toko untuk opsi "Diambil di Tempat"
    const elCheckoutAlamatToko = document.getElementById('checkoutAlamatTokoText');
    if (elCheckoutAlamatToko && typeof getPengaturanToko === 'function') {
        const profilToko = getPengaturanToko();
        if (profilToko && profilToko.alamat) {
            elCheckoutAlamatToko.textContent = profilToko.alamat;
        }
    }

    handleUbahMetodePengiriman();
    handleUbahMetodePembayaran();
    handleUbahSubMetodeTransfer();
    hapusBuktiTransfer();

    if (modalCheckoutInstance) {
        modalCheckoutInstance.show();
    }
}

/**
 * Memproses submit form checkout simulasi.
 * @param {Event} e 
 */
function handleProsesCheckoutSimulasi(e) {
    e.preventDefault();

    const nama = document.getElementById('inputNamaPemesan').value.trim();
    const telp = document.getElementById('inputTelpPemesan').value.trim();
    const radioMetode = document.querySelector('input[name="metodePengiriman"]:checked');
    const metode = radioMetode ? radioMetode.value : 'Diambil di Tempat';
    const radioBayar = document.querySelector('input[name="metodePembayaran"]:checked');
    const metodeBayar = radioBayar ? radioBayar.value : 'Tunai';
    const subMetode = 'BCA';

    const inputAlamat = document.getElementById('inputAlamatPengiriman');
    const errorAlamat = document.getElementById('errorAlamatPengiriman');
    const alamat = inputAlamat ? inputAlamat.value.trim() : '';

    if (!nama || !telp) {
        alert('Mohon lengkapi Nama dan No. WhatsApp/Telepon pemesan.');
        return;
    }

    // Jika memilih Dikirim, alamat wajib diisi
    if (metode === 'Dikirim' && !alamat) {
        if (errorAlamat) errorAlamat.classList.remove('d-none');
        if (inputAlamat) {
            inputAlamat.classList.add('is-invalid');
            inputAlamat.focus();
        }
        return;
    } else {
        if (errorAlamat) errorAlamat.classList.add('d-none');
        if (inputAlamat) inputAlamat.classList.remove('is-invalid');
    }

    // Jika memilih Transfer, bukti pembayaran wajib dilampirkan
    const elBuktiBase64 = document.getElementById('buktiTransferBase64');
    const buktiTransfer = elBuktiBase64 ? elBuktiBase64.value.trim() : '';
    const errorBukti = document.getElementById('errorBuktiTransfer');
    if (metodeBayar === 'Transfer' && !buktiTransfer) {
        if (errorBukti) errorBukti.classList.remove('d-none');
        const inputBukti = document.getElementById('inputBuktiTransfer');
        if (inputBukti) inputBukti.focus();
        return;
    } else {
        if (errorBukti) errorBukti.classList.add('d-none');
    }

    // Ambil daftar barang yang ada di keranjang belanja saat ini
    const keranjangSaatIni = getKeranjang();
    if (keranjangSaatIni.length === 0) {
        alert('Keranjang belanja masih kosong.');
        return;
    }

    // Validasi kecukupan stok seluruh item sebelum memproses pembelian
    if (typeof getBarang === 'function') {
        const semuaBarang = getBarang();
        const rekapQtyPerBarang = {};

        for (const item of keranjangSaatIni) {
            const idMaster = String(item.idMasterBarang || item.idBarang).split('_')[0];
            let master = semuaBarang.find(b => String(b.id) === idMaster);
            if (!master && item.nama) {
                const namaClean = String(item.nama).replace(/\s*\([^)]*\)\s*$/, '').trim().toLowerCase();
                master = semuaBarang.find(b => b.nama.trim().toLowerCase() === namaClean);
            }
            const key = master ? String(master.id) : idMaster;
            if (!rekapQtyPerBarang[key]) {
                rekapQtyPerBarang[key] = {
                    master: master,
                    nama: item.nama,
                    totalDiminta: 0
                };
            }
            rekapQtyPerBarang[key].totalDiminta += (parseInt(item.jumlah, 10) || 0);
        }

        for (const key in rekapQtyPerBarang) {
            const dataCek = rekapQtyPerBarang[key];
            if (dataCek.master) {
                const stokTersedia = parseInt(dataCek.master.stok, 10) || 0;
                if (dataCek.totalDiminta > stokTersedia) {
                    alert(`Maaf, stok untuk "${dataCek.master.nama}" tersisa ${stokTersedia} ${dataCek.master.satuan || 'unit'}, namun pesanan Anda membutuhkan ${dataCek.totalDiminta} ${dataCek.master.satuan || 'unit'}. Mohon sesuaikan jumlah pesanan Anda.`);
                    if (modalCheckoutInstance) modalCheckoutInstance.hide();
                    renderTampilanKeranjang();
                    return;
                }
            }
        }
    }

    // 1. KURANGI STOK BARANG: Barang yang dibeli otomatis mengurangi stok di stok-store.js
    if (typeof kurangiStokPembelian === 'function') {
        const barangDikurangi = kurangiStokPembelian(keranjangSaatIni);
        console.log('[TB Sumber Barokah] Stok barang berhasil dikurangi setelah pembelian:', barangDikurangi);
    }

    // 2. CATAT TRANSAKSI: Simpan ke transaksi-store.js dengan metode 'Tunai' atau 'Transfer' (lengkap dengan bukti transfer jika ada)
    if (typeof tambahTransaksi === 'function') {
        const itemsTrx = keranjangSaatIni.map(item => ({
            nama: item.nama,
            kategori: item.kategori || 'Material',
            jumlah: item.jumlah,
            harga: item.harga
        }));
        tambahTransaksi({
            pelanggan: nama,
            items: itemsTrx,
            metode: metodeBayar === 'Transfer' ? 'Transfer' : 'Tunai',
            subMetode: metodeBayar === 'Transfer' ? subMetode : '',
            buktiTransfer: metodeBayar === 'Transfer' ? buktiTransfer : ''
        });
    }

    // 3. CATAT PENGIRIMAN: Jika metode 'Dikirim', simpan pesanan ke pengiriman-store.js
    if (metode === 'Dikirim' && typeof tambahPengiriman === 'function') {
        const itemsKirim = keranjangSaatIni.map(item => ({
            nama: item.nama,
            jumlah: item.jumlah
        }));
        tambahPengiriman({
            pelanggan: nama,
            alamat: alamat,
            items: itemsKirim
        });
    }

    // Kosongkan keranjang & reset bukti transfer setelah checkout berhasil
    kosongkanKeranjang();
    hapusBuktiTransfer();
    if (typeof updateNavbarBadgeKeranjang === 'function') updateNavbarBadgeKeranjang();

    if (modalCheckoutInstance) modalCheckoutInstance.hide();
    
    // Tampilkan modal sukses beserta info metode pengiriman, alamat, dan metode pembayaran
    const elSuksesNama = document.getElementById('suksesNamaPemesan');
    const elSuksesMetode = document.getElementById('suksesMetodeText');
    const elSuksesAlamatWrap = document.getElementById('suksesAlamatWrapper');
    const elSuksesAlamatText = document.getElementById('suksesAlamatText');
    const elSuksesBayarBadge = document.getElementById('suksesPembayaranBadge');
    const elSuksesTransferNote = document.getElementById('suksesTransferNote');

    if (elSuksesNama) elSuksesNama.textContent = nama;
    if (elSuksesMetode) elSuksesMetode.textContent = metode;

    if (metode === 'Dikirim' && alamat) {
        if (elSuksesAlamatWrap) elSuksesAlamatWrap.classList.remove('d-none');
        if (elSuksesAlamatText) elSuksesAlamatText.textContent = alamat;
    } else {
        if (elSuksesAlamatWrap) elSuksesAlamatWrap.classList.add('d-none');
    }

    // Tampilkan badge status metode pembayaran
    if (elSuksesBayarBadge) {
        if (metodeBayar === 'Transfer') {
            elSuksesBayarBadge.className = 'badge bg-primary-subtle text-primary border border-primary-subtle';
            elSuksesBayarBadge.innerHTML = '<i class="bi bi-bank me-1"></i>Transfer BCA';
        } else {
            elSuksesBayarBadge.className = 'badge bg-success-subtle text-success border border-success-subtle';
            elSuksesBayarBadge.innerHTML = '<i class="bi bi-cash-stack me-1"></i>Tunai (Cash)';
        }
    }

    // Tampilkan petunjuk khusus untuk transfer
    if (elSuksesTransferNote) {
        if (metodeBayar === 'Transfer') {
            elSuksesTransferNote.classList.remove('d-none');
            elSuksesTransferNote.innerHTML = '<i class="bi bi-check-circle-fill text-success me-1"></i> Bukti transfer ke rekening <strong>BCA 44011460011 (a.n. Wahyu Ningsih)</strong> berhasil dilampirkan & otomatis tersimpan.';
        } else {
            elSuksesTransferNote.classList.add('d-none');
        }
    }

    if (modalSuksesCheckoutInstance) modalSuksesCheckoutInstance.show();

    renderTampilanKeranjang();
}

/**
 * Menampilkan Toast notifikasi pada halaman keranjang.
 * @param {string} pesan 
 */
function tampilkanToastKeranjang(pesan) {
    const elPesan = document.getElementById('toastKeranjangPesan');
    const elToast = document.getElementById('keranjangToast');
    if (elPesan) elPesan.textContent = pesan;
    if (elToast) {
        const toast = new bootstrap.Toast(elToast, { delay: 3500 });
        toast.show();
    }
}

/**
 * Mencegah XSS pada nama barang.
 */
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
