@extends('layouts.app')

@section('title', 'Login - TB. Sumber Barokah Malang')

@stack('css')
@push('css')
    <link rel="stylesheet" href="{{ asset('css/login.css') }}">
@endpush

@section('content')
<div class="login-page-section">
    <div class="login-card">
        
        {{-- Ikon & Header Kartu Login --}}
        <div class="text-center">
            <div class="login-brand-icon">
                <i class="bi bi-shield-lock"></i>
            </div>
            <h1 class="login-title">Masuk ke Akun</h1>
            <p class="login-subtitle">TB. Sumber Barokah Malang</p>
        </div>

        {{-- Alert Informasi Redirect / Pengalihan Keranjang --}}
        <div id="loginNoticeAlert" class="alert alert-warning d-none d-flex align-items-center mb-3 py-2 px-3 small" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2 fs-5 text-warning"></i>
            <div id="loginNoticeText">
                Silakan masuk ke akun terlebih dahulu untuk mengakses keranjang belanja.
            </div>
        </div>

        {{-- Alert Notifikasi Hasil Validasi Login (Simulasi) --}}
        <div id="loginAlert" class="alert alert-success d-none d-flex align-items-center mb-3 py-2 px-3 small" role="alert">
            <i class="bi bi-check-circle-fill me-2 fs-5"></i>
            <div id="loginAlertText">
                <strong>Berhasil!</strong> Login berhasil. Mengalihkan ke halaman...
            </div>
        </div>

        {{-- Kotak Info Bila Pengguna Sudah Dalam Status Login --}}
        <div id="alreadyLoggedInCard" class="card border-0 bg-light p-3 mb-3 text-center d-none">
            <div class="text-muted small mb-1">Status saat ini:</div>
            <div class="fw-bold text-dark text-truncate mb-2" id="alreadyUserEmail"></div>
            <div class="d-flex flex-column gap-2 mt-2">
                <a href="{{ route('katalog') }}" class="btn btn-sm btn-primary-custom">
                    <i class="bi bi-grid-fill me-1"></i> Lanjut Belanja di Katalog
                </a>
                <a href="{{ route('keranjang') }}" class="btn btn-sm btn-outline-primary">
                    <i class="bi bi-cart3 me-1"></i> Buka Keranjang Belanja
                </a>
                <button type="button" class="btn btn-sm btn-outline-danger" id="btnKeluarDiLoginPage">
                    <i class="bi bi-box-arrow-right me-1"></i> Ganti Akun / Logout
                </button>
            </div>
        </div>

        {{-- Form Login Frontend --}}
        <form id="formLogin" novalidate>
            {{-- Input Email --}}
            <div class="mb-3">
                <label for="inputEmail" class="form-label small fw-semibold text-secondary">Alamat Email</label>
                <div class="input-group login-input-group">
                    <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                    <input type="email" class="form-control" id="inputEmail" placeholder="Masukkan email" autocomplete="email">
                </div>
                <div id="emailError" class="text-danger small mt-1 d-none"></div>
            </div>

            {{-- Input Password --}}
            <div class="mb-3">
                <label for="inputPassword" class="form-label small fw-semibold text-secondary">Password</label>
                <div class="input-group login-input-group">
                    <span class="input-group-text"><i class="bi bi-lock"></i></span>
                    <input type="password" class="form-control" id="inputPassword" placeholder="Masukkan password" autocomplete="current-password">
                </div>
                <div id="passwordError" class="text-danger small mt-1 d-none"></div>
            </div>

            {{-- Tombol Masuk --}}
            <button type="submit" class="btn btn-login-submit w-100 mt-2 mb-3" id="btnSubmitLogin">
                <i class="bi bi-box-arrow-in-right me-1"></i>
                Masuk
            </button>
        </form>

        {{-- Tautan Khusus Admin --}}
        <div class="text-center mb-3">
            <a href="{{ route('admin.stok') }}" class="login-admin-link">
                Admin
            </a>
        </div>

        {{-- Kembali ke Beranda --}}
        <div class="text-center pt-2 border-top">
            <a href="{{ url('/') }}" class="login-back-link">
                <i class="bi bi-arrow-left"></i>
                Kembali ke beranda
            </a>
        </div>

    </div>
</div>
@endsection

@push('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function () {
        const urlParams = new URLSearchParams(window.location.search);
        const pesan = urlParams.get('pesan');
        const redirect = urlParams.get('redirect');

        const noticeAlert = document.getElementById('loginNoticeAlert');
        const noticeText = document.getElementById('loginNoticeText');
        const alreadyCard = document.getElementById('alreadyLoggedInCard');
        const alreadyEmail = document.getElementById('alreadyUserEmail');
        const formLogin = document.getElementById('formLogin');

        // 1. Tangani Pesan Redirect dari URL
        if (pesan === 'login_dulu' || pesan === 'keranjang_butuh_login') {
            if (noticeAlert && noticeText) {
                noticeAlert.className = 'alert alert-warning d-flex align-items-center mb-3 py-2 px-3 small';
                noticeText.innerHTML = '<strong>Perhatian:</strong> Silakan login terlebih dahulu untuk mengakses keranjang belanja dan menyelesaikan pesanan.';
                noticeAlert.classList.remove('d-none');
            }
        } else if (pesan === 'login_tambah_keranjang') {
            if (noticeAlert && noticeText) {
                noticeAlert.className = 'alert alert-warning d-flex align-items-center mb-3 py-2 px-3 small';
                noticeText.innerHTML = '<strong>Perhatian:</strong> Anda harus masuk ke akun terlebih dahulu sebelum dapat menambahkan barang ke keranjang belanja.';
                noticeAlert.classList.remove('d-none');
            }
        } else if (pesan === 'logout_berhasil') {
            if (noticeAlert && noticeText) {
                noticeAlert.className = 'alert alert-info d-flex align-items-center mb-3 py-2 px-3 small';
                noticeText.innerHTML = '<strong>Informasi:</strong> Anda telah berhasil keluar (logout) dari akun.';
                noticeAlert.classList.remove('d-none');
            }
        }

        // 2. Cek apakah pengguna saat ini sudah login
        if (typeof isUserLoggedIn === 'function' && isUserLoggedIn()) {
            const user = typeof getUserAuth === 'function' ? getUserAuth() : null;
            if (alreadyCard && alreadyEmail && user) {
                alreadyEmail.textContent = user.email;
                alreadyCard.classList.remove('d-none');
                // Sembunyikan form login jika sudah login, agar rapi
                if (formLogin) {
                    formLogin.classList.add('d-none');
                }
            }
        }

        // Tombol keluar di kartu "already logged in"
        const btnKeluar = document.getElementById('btnKeluarDiLoginPage');
        if (btnKeluar) {
            btnKeluar.addEventListener('click', function () {
                if (typeof logoutUser === 'function') {
                    logoutUser();
                }
                if (alreadyCard) alreadyCard.classList.add('d-none');
                if (formLogin) formLogin.classList.remove('d-none');
                if (noticeAlert && noticeText) {
                    noticeAlert.className = 'alert alert-info d-flex align-items-center mb-3 py-2 px-3 small';
                    noticeText.innerHTML = 'Anda telah logout. Silakan login kembali dengan akun Anda.';
                    noticeAlert.classList.remove('d-none');
                }
            });
        }

        // 3. Validasi & Submit Form Login
        if (formLogin) {
            formLogin.addEventListener('submit', function(e) {
                e.preventDefault();

                const emailInput = document.getElementById('inputEmail');
                const passwordInput = document.getElementById('inputPassword');
                const emailError = document.getElementById('emailError');
                const passwordError = document.getElementById('passwordError');
                const alertBox = document.getElementById('loginAlert');
                const alertText = document.getElementById('loginAlertText');
                const btnSubmit = document.getElementById('btnSubmitLogin');

                let isValid = true;

                // Reset pesan error & alert
                emailError.classList.add('d-none');
                emailError.textContent = '';
                emailInput.classList.remove('is-invalid');

                passwordError.classList.add('d-none');
                passwordError.textContent = '';
                passwordInput.classList.remove('is-invalid');

                alertBox.classList.add('d-none');

                // Validasi Email
                const emailValue = emailInput.value.trim();
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailValue) {
                    emailError.textContent = 'Email tidak boleh kosong.';
                    emailError.classList.remove('d-none');
                    emailInput.classList.add('is-invalid');
                    isValid = false;
                } else if (!emailRegex.test(emailValue)) {
                    emailError.textContent = 'Format alamat email tidak valid.';
                    emailError.classList.remove('d-none');
                    emailInput.classList.add('is-invalid');
                    isValid = false;
                }

                // Validasi Password
                const passwordValue = passwordInput.value.trim();
                if (!passwordValue) {
                    passwordError.textContent = 'Password tidak boleh kosong.';
                    passwordError.classList.remove('d-none');
                    passwordInput.classList.add('is-invalid');
                    isValid = false;
                }

                // Jika lolos validasi, simpan status login dan alihkan
                if (isValid) {
                    if (typeof loginUser === 'function') {
                        loginUser(emailValue);
                    }

                    if (btnSubmit) {
                        btnSubmit.disabled = true;
                        btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Masuk...';
                    }

                    let targetUrl = "{{ route('katalog') }}";
                    if (redirect === 'keranjang') {
                        targetUrl = "{{ route('keranjang') }}";
                    } else if (redirect === 'kalkulator') {
                        targetUrl = "{{ route('kalkulator') }}";
                    } else if (redirect === 'katalog') {
                        targetUrl = "{{ route('katalog') }}";
                    }

                    if (alertBox && alertText) {
                        alertText.innerHTML = `<strong>Berhasil!</strong> Login berhasil sebagai <b>${emailValue}</b>. Mengalihkan...`;
                        alertBox.classList.remove('d-none');
                    }

                    setTimeout(function () {
                        window.location.href = targetUrl;
                    }, 600);
                }
            });
        }
    });
</script>
@endpush
