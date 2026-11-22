/**
 * ============================================================================
 * Logika Tampilan Halaman Katalog Produk (katalog.js)
 * TB. Sumber Barokah Malang
 * ============================================================================
 * Mengambil data barang dari `barang-store.js` (localStorage), melakukan
 * render grid kartu produk, pencarian nama barang langsung, serta
 * sinkronisasi otomatis via event 'storage'.
 */

import { getBarang, hitungStatus } from './barang-store.js';

/**
 * Format angka ke dalam mata uang Rupiah (contoh: Rp 65.000).
 * @param {number} nominal
 * @returns {string}
 */
function formatRupiah(nominal) {
    const angka = Number(nominal) || 0;
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(angka);
}

/**
 * Menentukan tema warna lembut dan ikon SVG sesuai kata kunci nama barang.
 * Variasi warna lembut: oranye muda, kuning muda, biru muda, hijau muda.
 * @param {string} namaBarang
 * @returns {{bgClass: string, textClass: string, borderClass: string, svg: string}}
 */
function dapatkanVisualBarang(namaBarang) {
    const nama = (namaBarang || '').toLowerCase();

    // 1. Semen
    if (nama.includes('semen')) {
        return {
            bgClass: 'bg-stone-100',
            textClass: 'text-stone-700',
            borderClass: 'border-stone-200',
            svg: `<svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>`,
        };
    }

    // 2. Pasir
    if (nama.includes('pasir')) {
        return {
            bgClass: 'bg-amber-50',
            textClass: 'text-amber-700',
            borderClass: 'border-amber-200',
            svg: `<svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>`,
        };
    }

    // 3. Besi / Baja
    if (nama.includes('besi') || nama.includes('baja')) {
        return {
            bgClass: 'bg-sky-50',
            textClass: 'text-sky-700',
            borderClass: 'border-sky-200',
            svg: `<svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>`,
        };
    }

    // 4. Cat / Pelapis
    if (nama.includes('cat') || nama.includes('kuas') || nama.includes('thinner')) {
        return {
            bgClass: 'bg-emerald-50',
            textClass: 'text-emerald-700',
            borderClass: 'border-emerald-200',
            svg: `<svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-1.928l-.22-1.445zm0 0L14.25 8.25m0 0l2.25 2.25m-2.25-2.25l2.25-2.25a2.25 2.25 0 013.182 3.182l-2.25 2.25" />
                  </svg>`,
        };
    }

    // 5. Keramik / Granit / Ubin
    if (nama.includes('keramik') || nama.includes('granit') || nama.includes('ubin')) {
        return {
            bgClass: 'bg-indigo-50',
            textClass: 'text-indigo-700',
            borderClass: 'border-indigo-200',
            svg: `<svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>`,
        };
    }

    // 6. Paku / Baut / Mur
    if (nama.includes('paku') || nama.includes('baut') || nama.includes('sekrup')) {
        return {
            bgClass: 'bg-orange-50',
            textClass: 'text-[#F97316]',
            borderClass: 'border-orange-200',
            svg: `<svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.32l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.32 4.486c.09.914-.07 1.85-.466 2.658" />
                  </svg>`,
        };
    }

    // Default umum (Peralatan / Balok Bangunan)
    return {
        bgClass: 'bg-gray-100',
        textClass: 'text-gray-700',
        borderClass: 'border-gray-200',
        svg: `<svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>`,
    };
}

/**
 * Membuat badge ketersediaan stok khusus katalog pelanggan:
 * - "Tersedia" (hijau) jika stok > stokMinimum
 * - "Stok Terbatas" (kuning/oranye) jika status Menipis (0 < stok <= stokMinimum)
 * - "Habis" (merah) jika stok = 0
 * @param {object} barang
 * @returns {string}
 */
function buatBadgeKatalog(barang) {
    const status = hitungStatus(barang);

    if (status === 'Habis' || Number(barang.stok) <= 0) {
        return `<span class="badge-status badge-habis">Habis</span>`;
    }
    if (status === 'Menipis') {
        return `<span class="badge-status badge-menipis">Stok Terbatas</span>`;
    }
    return `<span class="badge-status badge-aman">Tersedia</span>`;
}

/**
 * Mengamankan teks dari karakter berbahaya sebelum disisipkan ke HTML.
 * @param {string} teks
 * @returns {string}
 */
function escapeHtml(teks) {
    const div = document.createElement('div');
    div.textContent = String(teks ?? '');
    return div.innerHTML;
}

/**
 * Inisialisasi logika Halaman Katalog.
 */
export function initKatalog() {
    const halamanKatalog = document.getElementById('halaman-katalog');
    if (!halamanKatalog) {
        return;
    }

    const inputCari = document.getElementById('input-cari-katalog');
    const wadahGrid = document.getElementById('wadah-grid-katalog');
    const gridProduk = document.getElementById('grid-produk-katalog');
    const keadaanKosong = document.getElementById('katalog-keadaan-kosong');
    const teksKeadaanKosong = document.getElementById('teks-katalog-kosong');
    const jumlahBarangTampil = document.getElementById('jumlah-barang-tampil');

    /**
     * Render grid kartu produk berdasarkan pencarian nama barang.
     */
    function renderKatalog() {
        const semuaBarang = getBarang();
        const kataKunci = (inputCari?.value || '').trim().toLowerCase();

        // Filter pencarian nama barang
        const hasil = semuaBarang.filter((item) => {
            return item.nama.toLowerCase().includes(kataKunci);
        });

        // Update counter teks
        if (jumlahBarangTampil) {
            jumlahBarangTampil.textContent = `Menampilkan ${hasil.length} barang`;
        }

        // Cek keadaan kosong
        if (hasil.length === 0) {
            if (gridProduk) gridProduk.innerHTML = '';
            if (wadahGrid) wadahGrid.classList.add('hidden');
            if (keadaanKosong) keadaanKosong.classList.remove('hidden');

            if (teksKeadaanKosong) {
                if (semuaBarang.length === 0) {
                    teksKeadaanKosong.textContent = 'Belum ada barang di katalog.';
                } else {
                    teksKeadaanKosong.textContent = 'Barang tidak ditemukan.';
                }
            }
            return;
        }

        if (wadahGrid) wadahGrid.classList.remove('hidden');
        if (keadaanKosong) keadaanKosong.classList.add('hidden');

        if (!gridProduk) return;

        gridProduk.innerHTML = hasil
            .map((barang) => {
                const visual = dapatkanVisualBarang(barang.nama);
                const habis = Number(barang.stok) <= 0;
                const kartuFadeClass = habis ? 'opacity-75 grayscale-[0.2]' : '';

                return `
                    <article class="katalog-card bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm flex flex-col justify-between transition-all duration-200 ${kartuFadeClass}">
                        <div>
                            <!-- Placeholder Foto Produk (Dikosongkan Sementara) -->
                            <div class="w-full h-36 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 mb-4 transition-colors" aria-hidden="true">
                                <svg class="w-8 h-8 text-gray-300 mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                </svg>
                                <span class="text-[11px] font-medium text-gray-400">Foto Produk</span>
                            </div>

                            <!-- Header Kartu: Status Stok -->
                            <div class="flex items-center justify-between gap-2 mb-2">
                                ${buatBadgeKatalog(barang)}
                                <span class="text-xs font-semibold text-gray-500">
                                    Stok: ${Number(barang.stok)}
                                </span>
                            </div>

                            <!-- Nama Barang -->
                            <h3 class="text-base font-bold text-[#1F2937] leading-snug mb-2 line-clamp-2" title="${escapeHtml(barang.nama)}">
                                ${escapeHtml(barang.nama)}
                            </h3>
                        </div>

                        <!-- Harga Barang -->
                        <div class="pt-3 mt-3 border-t border-gray-100 flex items-baseline justify-between">
                            <span class="text-xs font-medium text-gray-400">Harga Satuan</span>
                            <span class="text-lg font-extrabold text-[#F97316]">
                                ${formatRupiah(barang.harga)}
                            </span>
                        </div>
                    </article>
                `;
            })
            .join('');
    }

    // Event Listener: Input pencarian live
    inputCari?.addEventListener('input', () => {
        renderKatalog();
    });

    // Event Listener: Sinkronisasi antar tab browser (admin update data -> katalog auto update)
    window.addEventListener('storage', (event) => {
        if (event.key === 'sips_barang') {
            renderKatalog();
        }
    });

    // Render pertama kali saat halaman dimuat
    renderKatalog();
}
