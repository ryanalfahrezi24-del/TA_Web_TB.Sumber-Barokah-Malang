@extends('layouts.app')

{{-- Judul Tab Browser --}}
@section('title', 'TB. Sumber Barokah Malang - Halaman Utama')

@section('content')

    {{-- ======================================================================
         1. HERO SECTION
         Memuat nama toko, sambutan ramah, deskripsi 2-3 kalimat,
         tombol Lihat Katalog, tombol Hitung Kebutuhan Material,
         serta visual dekoratif CSS murni di sisi kanan.
         ====================================================================== --}}
    <section class="hero-section">
        <div class="container hero-content">
            <div class="row align-items-center gy-5">
                
                {{-- Sisi Kiri: Teks Sambutan & Tombol Tindakan --}}
                <div class="col-lg-6 text-start">
                    
                    {{-- Elemen 1: Badge Identitas Toko & Lokasi --}}
                    <div class="hero-badge">
                        <i class="bi bi-geo-alt-fill"></i>
                        <span>TB. Sumber Barokah &bull; <small>Malang</small></span>
                    </div>

                    {{-- Elemen 2: Kalimat Sambutan Ramah untuk Pelanggan --}}
                    <h1 class="hero-title">
                        Selamat Datang di <br>
                        <span class="text-primary-custom">TB. Sumber Barokah</span>
                    </h1>

                    {{-- Elemen 3: Deskripsi Singkat Layanan Toko (2 - 3 Kalimat) --}}
                    <p class="hero-description">
                        Kami adalah mitra terpercaya yang menyediakan berbagai macam kebutuhan bahan bangunan berkualitas untuk proyek pembangunan dan renovasi hunian Anda di wilayah Malang. Nikmati kemudahan berbelanja material secara eceran maupun grosir dengan harga yang bersahabat. Dapatkan pula kemudahan menghitung estimasi kebutuhan material secara cepat dan tepat langsung dari website kami.
                    </p>

                    {{-- Tombol Aksi (Elemen 4 & Elemen 5) --}}
                    <div class="hero-buttons">
                        {{-- Elemen 4: Tombol Lihat Katalog mengarah ke route katalog --}}
                        <a href="{{ route('katalog') }}" class="btn-primary-custom">
                            <i class="bi bi-grid-fill me-2"></i>
                            Lihat Katalog
                        </a>

                        {{-- Elemen 5: Tombol Hitung Kebutuhan Material mengarah ke route kalkulator --}}
                        <a href="{{ route('kalkulator') }}" class="btn-dark-outline">
                            <i class="bi bi-calculator me-2"></i>
                            Hitung Kebutuhan Material
                        </a>
                    </div>
                </div>

                {{-- Sisi Kanan: Visual Dekoratif (Murni CSS & Ikon Bootstrap, Tanpa Gambar Eksternal) --}}
                <div class="col-lg-6">
                    <div class="hero-visual-wrapper">
                        
                        {{-- Kartu Utama Dekoratif --}}
                        <div class="hero-main-card">
                            <div class="d-flex align-items-center justify-content-between mb-3">
                                <div class="hero-card-icon-big">
                                    <i class="bi bi-house-gear-fill"></i>
                                </div>
                                <span class="badge rounded-pill" style="background-color: var(--accent-light); color: #B45309; font-weight: 600; font-size: 0.8rem; padding: 0.45rem 0.85rem;">
                                    <i class="bi bi-star-fill text-warning me-1"></i> Terpercaya di Malang
                                </span>
                            </div>

                            <h4 class="mb-2" style="font-size: 1.35rem;">Solusi Bahan Bangunan Lengkap</h4>
                            <p class="text-muted small mb-4">
                                Menyediakan semen, pasir, bata, besi, pipa, cat, hingga perkakas konstruksi dengan mutu terbaik.
                            </p>

                            {{-- Mini Feature Card 1 --}}
                            <div class="floating-badge mb-2">
                                <div class="floating-icon" style="background-color: var(--primary-light); color: var(--primary-color);">
                                    <i class="bi bi-calculator-fill"></i>
                                </div>
                                <div>
                                    <div class="fw-bold text-dark small">Kalkulator Material Cepat</div>
                                    <div class="text-muted" style="font-size: 0.78rem;">Estimasi bata, semen, & plester instan</div>
                                </div>
                            </div>

                            {{-- Mini Feature Card 2 --}}
                            <div class="floating-badge">
                                <div class="floating-icon" style="background-color: #EFF6FF; color: #2563EB;">
                                    <i class="bi bi-truck"></i>
                                </div>
                                <div>
                                    <div class="fw-bold text-dark small">Layanan Antar Cepat</div>
                                    <div class="text-muted" style="font-size: 0.78rem;">Siap antar material langsung ke lokasi proyek</div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    </section>

    {{-- ======================================================================
         2. SECTION LAYANAN KAMI
         Memuat 3 kartu ringkas dengan ikon:
         a. Bahan bangunan lengkap
         b. Satuan jual fleksibel (sak, kg, batang, lembar)
         c. Kalkulator kebutuhan material
         ====================================================================== --}}
    <section class="services-section">
        <div class="container">
            
            {{-- Header Section --}}
            <div class="section-header">
                <span class="section-pill">Pelayanan Unggulan</span>
                <h2 class="section-title">Layanan Kami</h2>
                <p class="section-subtitle">
                    Komitmen TB. Sumber Barokah Malang dalam memberikan kemudahan dan kepuasan maksimal bagi setiap kebutuhan bangunan Anda.
                </p>
            </div>

            {{-- 3 Kartu Layanan --}}
            <div class="row g-4">
                
                {{-- Kartu A: Bahan Bangunan Lengkap --}}
                <div class="col-md-4">
                    <div class="service-card">
                        <div class="service-icon-box">
                            <i class="bi bi-bricks"></i>
                        </div>
                        <h3 class="service-title">Bahan Bangunan Lengkap</h3>
                        <p class="service-desc">
                            Menyediakan material konstruksi bermutu lengkap mulai dari pondasi hingga atap untuk rumah dan proyek.
                        </p>
                    </div>
                </div>

                {{-- Kartu B: Layanan Antar ke Lokasi --}}
                <div class="col-md-4">
                    <div class="service-card">
                        <div class="service-icon-box">
                            <i class="bi bi-truck"></i>
                        </div>
                        <h3 class="service-title">Layanan Antar ke Lokasi</h3>
                        <p class="service-desc">
                            Siap antar pesanan material langsung ke alamat rumah atau lokasi proyek Anda di wilayah Malang dan sekitarnya.
                        </p>
                    </div>
                </div>

                {{-- Kartu C: Kalkulator Kebutuhan Material --}}
                <div class="col-md-4">
                    <div class="service-card">
                        <div class="service-icon-box">
                            <i class="bi bi-calculator-fill"></i>
                        </div>
                        <h3 class="service-title">Kalkulator Kebutuhan Material</h3>
                        <p class="service-desc">
                            Hitung taksiran kebutuhan semen, pasir, dan bata secara tepat agar anggaran belanja proyek Anda lebih efisien.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    </section>

@endsection
