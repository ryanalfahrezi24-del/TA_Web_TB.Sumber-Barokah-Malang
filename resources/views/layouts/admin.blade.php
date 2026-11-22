<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    
    <title>@yield('title', 'Admin - TB. Sumber Barokah Malang')</title>

    {{-- Google Font: Poppins (CDN) --}}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    {{-- Bootstrap 5.3 CSS (CDN) --}}
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">

    {{-- Bootstrap Icons (CDN) --}}
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    {{-- Custom Stylesheet Dasar --}}
    <link rel="stylesheet" href="{{ asset('css/style.css') }}?v=2.2">

    {{-- Custom Stylesheet Khusus Admin --}}
    <link rel="stylesheet" href="{{ asset('css/admin.css') }}?v=2.2">

    {{-- Stack CSS Tambahan --}}
    @stack('css')
</head>
<body class="admin-body">

    {{-- Navbar Khusus Admin --}}
    <nav class="navbar navbar-expand admin-navbar sticky-top">
        <div class="container">
            {{-- Sisi Kiri: Nama & Badge Admin --}}
            <a class="navbar-brand d-flex align-items-center gap-2 text-decoration-none" href="{{ route('admin.stok') }}">
                <div class="admin-brand-icon">
                    <i class="bi bi-boxes"></i>
                </div>
                <div class="d-flex align-items-center">
                    <span class="admin-brand-title">TB. Sumber Barokah</span>
                    <span class="admin-badge-role">Admin</span>
                </div>
            </a>

            {{-- Sisi Kanan: Tombol Keluar (kembali ke landing page "/") --}}
            <div class="ms-auto">
                <a href="{{ url('/') }}" class="btn-admin-logout" title="Keluar ke Halaman Utama">
                    <i class="bi bi-box-arrow-right me-1"></i>
                    Keluar
                </a>
            </div>
        </div>
    </nav>

    {{-- Sub-Navigasi Tab Menu Admin (Stok Barang, Kategori, Pengiriman, & Pengaturan Toko) --}}
    <div class="admin-subnav-bar">
        <div class="container">
            <ul class="nav admin-nav-tabs">
                <li class="nav-item">
                    <a class="nav-link admin-tab-link {{ request()->routeIs('admin.stok') ? 'active' : '' }}" href="{{ route('admin.stok') }}">
                        <i class="bi bi-boxes me-1"></i>
                        Stok Barang
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link admin-tab-link {{ request()->routeIs('admin.kategori') ? 'active' : '' }}" href="{{ route('admin.kategori') }}">
                        <i class="bi bi-tags me-1"></i>
                        Kategori
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link admin-tab-link {{ request()->routeIs('admin.pengiriman') ? 'active' : '' }}" href="{{ route('admin.pengiriman') }}">
                        <i class="bi bi-truck me-1"></i>
                        Pengiriman
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link admin-tab-link {{ request()->routeIs('admin.laporan') ? 'active' : '' }}" href="{{ route('admin.laporan') }}">
                        <i class="bi bi-file-earmark-bar-graph me-1"></i>
                        Laporan
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link admin-tab-link {{ request()->routeIs('admin.pengaturan') ? 'active' : '' }}" href="{{ route('admin.pengaturan') }}">
                        <i class="bi bi-gear me-1"></i>
                        Pengaturan Toko
                    </a>
                </li>
            </ul>
        </div>
    </div>

    {{-- Konten Utama Admin --}}
    <main class="admin-main-container">
        @yield('content')
    </main>

    {{-- Bootstrap 5.3 JavaScript Bundle (CDN) --}}
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>

    {{-- Data Layer Stok Store & Pengaturan Toko (localStorage) --}}
    @unless(request()->routeIs('admin.kategori', 'admin.pengiriman', 'admin.laporan'))
        <script src="{{ asset('js/stok-store.js') }}?v=2.9"></script>
    @endunless
    <script src="{{ asset('js/pengaturan-store.js') }}?v=1.0"></script>

    {{-- Stack Scripts Tambahan --}}
    @stack('scripts')
</body>
</html>
