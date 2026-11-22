{{-- 
    Navbar TB. Sumber Barokah Malang
    Memuat nama toko di sisi kiri, menu link Beranda, Katalog, dan Kalkulator,
    serta ikon Keranjang Belanja dan tombol Login di sisi kanan.
    Responsif di perangkat seluler dengan toggle menu Bootstrap.
--}}
<nav class="navbar navbar-expand-lg sticky-top custom-navbar">
    <div class="container">
        {{-- Brand / Identitas Toko (Sisi Kiri) --}}
        <a class="navbar-brand d-flex align-items-center gap-2 text-decoration-none" href="{{ route('home') }}">
            <div class="brand-icon">
                <i class="bi bi-building"></i>
            </div>
            <div class="d-flex flex-column">
                <span class="brand-title">TB. Sumber Barokah</span>
                <span class="brand-city">Malang</span>
            </div>
        </a>

        {{-- Tombol Toggle Menu Responsif (Tampilan Layar HP) --}}
        <button class="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>

        {{-- Menu Navigasi & Tombol Aksi --}}
        <div class="collapse navbar-collapse" id="navbarContent">
            {{-- Menu Link Publik (Beranda, Katalog, dan Kalkulator dengan penanda aktif) --}}
            <ul class="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center gap-1 gap-lg-2">
                <li class="nav-item">
                    <a class="nav-link custom-nav-link {{ request()->routeIs('home') ? 'active' : '' }}" href="{{ route('home') }}">
                        <i class="bi bi-house-door me-1 d-lg-none"></i> Beranda
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link custom-nav-link {{ request()->routeIs('katalog') ? 'active' : '' }}" href="{{ route('katalog') }}">
                        <i class="bi bi-grid me-1 d-lg-none"></i> Katalog
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link custom-nav-link {{ request()->routeIs('kalkulator') ? 'active' : '' }}" href="{{ route('kalkulator') }}">
                        <i class="bi bi-calculator me-1 d-lg-none"></i> Kalkulator
                    </a>
                </li>
            </ul>

            {{-- Sisi Kanan: Ikon Keranjang & Tombol Auth (Login / Info Akun + Logout) --}}
            <div class="d-flex align-items-center ms-lg-3 mt-3 mt-lg-0 gap-2 flex-wrap">
                {{-- Ikon Keranjang Belanja mengarah ke route keranjang --}}
                <a href="{{ route('keranjang') }}" class="btn-nav-cart position-relative {{ request()->routeIs('keranjang') ? 'active' : '' }}" title="Keranjang Belanja" id="navCartBtn">
                    <i class="bi bi-cart3"></i>
                    <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" id="navCartBadge" style="font-size: 0.68rem; padding: 0.25em 0.5em; display: none;">
                        0
                    </span>
                </a>

                {{-- Status 1: Belum Login (Guest / Masuk Tanpa Akun) --}}
                <div id="navAuthGuest" class="d-flex align-items-center">
                    <a href="{{ route('login') }}" class="btn-nav-login" id="btnNavLogin">
                        <i class="bi bi-box-arrow-in-right me-1"></i>
                        Login
                    </a>
                </div>

                {{-- Status 2: Sudah Login (Masuk ke Akun) --}}
                <div id="navAuthUser" class="d-none align-items-center gap-2">
                    <div class="nav-user-badge" id="navUserBadge" title="Akun Pengguna">
                        <i class="bi bi-person-circle text-primary"></i>
                        <span id="navUserEmail" class="text-truncate" style="max-width: 140px;">Akun</span>
                    </div>
                    <button type="button" class="btn-nav-logout" id="btnNavLogout" title="Keluar dari Akun">
                        <i class="bi bi-box-arrow-right me-1"></i>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    </div>
</nav>
