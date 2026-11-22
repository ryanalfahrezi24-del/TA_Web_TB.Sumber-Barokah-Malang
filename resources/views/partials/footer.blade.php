{{-- 
    Footer Publik TB. Sumber Barokah Malang
    Memuat Identitas Toko, Alamat Toko, Jam Kerja, Contact Person, dan Hak Cipta.
    Data jam kerja, kontak, dan alamat dapat diatur secara fleksibel oleh Admin melalui menu Pengaturan Toko.
--}}
<footer class="custom-footer">
    <div class="container">
        <div class="row g-4 justify-content-between">
            
            {{-- Kolom 1: Identitas & Profil Toko (4 Kolom Desktop) --}}
            <div class="col-lg-4 col-md-6 text-center text-md-start">
                <div class="footer-brand justify-content-center justify-content-md-start mb-2">
                    <i class="bi bi-shop"></i>
                    <span>TB. Sumber Barokah</span>
                </div>
                <div class="footer-location justify-content-center justify-content-md-start mb-2">
                    <i class="bi bi-geo-alt-fill"></i>
                    <span id="footerKotaText">Malang, Jawa Timur</span>
                </div>
                <p class="footer-desc">
                    Menyediakan material bangunan berkualitas dan solusi estimasi kebutuhan material terpercaya untuk proyek dan hunian Anda.
                </p>
                <div class="mt-3">
                    <span class="badge rounded-pill bg-dark border border-secondary px-3 py-2 text-white-50">
                        <i class="bi bi-shield-check text-warning me-1"></i> Pelayanan Ramah & Amanah
                    </span>
                </div>
            </div>

            {{-- Kolom 2: Alamat Toko (3 Kolom Desktop) --}}
            <div class="col-lg-3 col-md-6 text-center text-md-start">
                <h5 class="footer-section-title justify-content-center justify-content-md-start">
                    <i class="bi bi-geo-alt text-primary"></i>
                    <span>Alamat Toko</span>
                </h5>
                <a href="https://www.google.com/maps/search/?api=1&query=Malang" target="_blank" rel="noopener noreferrer" class="footer-item-text text-decoration-none d-block mb-2" id="footerAlamatLink" title="Klik untuk membuka lokasi di Google Maps">
                    <span id="footerAlamatText">
                        Jl. Raya Gadang No. 128, Gadang, Kec. Sukun, Kota Malang, Jawa Timur 65149
                    </span>
                </a>
                <a href="https://www.google.com/maps/search/?api=1&query=Malang" target="_blank" rel="noopener noreferrer" class="footer-map-link justify-content-center justify-content-md-start" id="footerMapLink" title="Buka alamat toko di Google Maps">
                    <i class="bi bi-box-arrow-up-right me-1"></i> Lihat Peta Lokasi
                </a>
            </div>

            {{-- Kolom 3: Jam Kerja / Operasional (2 Kolom Desktop) --}}
            <div class="col-lg-2 col-md-6 text-center text-md-start">
                <h5 class="footer-section-title justify-content-center justify-content-md-start">
                    <i class="bi bi-clock text-primary"></i>
                    <span>Jam Kerja</span>
                </h5>
                <div class="footer-item-text" id="footerJamKerjaText" style="white-space: pre-line;">
                    Senin - Sabtu: 07.30 - 16.30 WIB (Minggu Libur)
                </div>
            </div>

            {{-- Kolom 4: Contact Person (3 Kolom Desktop) --}}
            <div class="col-lg-3 col-md-6 text-center text-md-start">
                <h5 class="footer-section-title justify-content-center justify-content-md-start">
                    <i class="bi bi-headset text-primary"></i>
                    <span>Contact Person</span>
                </h5>
                <div class="footer-contact-item mb-2">
                    <div class="small text-white-50">Penanggung Jawab / Admin:</div>
                    <div class="fw-semibold text-white" id="footerNamaKontakText">Bpk. Ahmad (Admin Toko)</div>
                </div>
                <div class="footer-contact-item mb-2">
                    <div class="small text-white-50">WhatsApp / Telepon:</div>
                    <a href="tel:081234567890" class="text-warning text-decoration-none fw-bold d-inline-flex align-items-center gap-1" id="footerTeleponLink">
                        <i class="bi bi-whatsapp"></i>
                        <span id="footerTeleponText">0812-3456-7890</span>
                    </a>
                </div>
                <div class="footer-contact-item" id="footerEmailWrapper">
                    <div class="small text-white-50">Email:</div>
                    <span class="text-white-50 small" id="footerEmailText">sumberbarokah.malang@gmail.com</span>
                </div>
            </div>

        </div>

        <div class="footer-divider"></div>

        {{-- Baris Hak Cipta --}}
        <div class="row">
            <div class="col-12">
                <p class="footer-copyright">
                    &copy; 2026 TB. Sumber Barokah Malang. All rights reserved.
                </p>
            </div>
        </div>
    </div>
</footer>
