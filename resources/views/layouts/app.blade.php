<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    
    <title>@yield('title', 'TB. Sumber Barokah Malang - Toko Bahan Bangunan & Kalkulator Material')</title>

    {{-- Google Font: Poppins (CDN) --}}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    {{-- Bootstrap 5.3 CSS (CDN) --}}
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">

    {{-- Bootstrap Icons (CDN) --}}
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    {{-- Custom Stylesheet Toko Bangunan Sumber Barokah --}}
    <link rel="stylesheet" href="{{ asset('css/style.css') }}?v=2.5">

    {{-- Stack khusus bila halaman butuh CSS tambahan --}}
    @stack('css')
</head>
<body>

    {{-- Header / Navigasi Atas --}}
    @include('partials.navbar')

    {{-- Konten Utama Halaman --}}
    <main>
        @yield('content')
    </main>

    {{-- Footer Bawah --}}
    @include('partials.footer')

    {{-- Bootstrap 5.3 JavaScript Bundle (CDN) --}}
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>

    {{-- Data Layer Autentikasi Pengguna, Keranjang, & Pengaturan Toko untuk Seluruh Halaman Publik --}}
    <script src="{{ asset('js/auth-store.js') }}?v=1.0"></script>
    <script src="{{ asset('js/keranjang-store.js') }}"></script>
    <script src="{{ asset('js/pengaturan-store.js') }}?v=1.0"></script>
    <script>
        /**
         * Memperbarui angka badge keranjang di navbar secara otomatis
         * pada saat halaman dimuat maupun ketika ada perubahan via localStorage (antar tab).
         */
        function updateNavbarBadgeKeranjang() {
            const badge = document.getElementById('navCartBadge');
            if (badge && typeof hitungJumlahItem === 'function') {
                const totalItem = hitungJumlahItem();
                badge.textContent = totalItem;
                // Jika total item 0, sembunyikan atau tetap tampilkan 0 dengan rapi
                badge.style.display = totalItem > 0 ? 'inline-block' : 'none';
            }
        }

        document.addEventListener('DOMContentLoaded', updateNavbarBadgeKeranjang);
        window.addEventListener('storage', function(e) {
            if (e.key === 'sb_keranjang') {
                updateNavbarBadgeKeranjang();
            }
        });
    </script>

    {{-- Stack khusus bila halaman butuh JavaScript tambahan --}}
    @stack('scripts')
</body>
</html>
