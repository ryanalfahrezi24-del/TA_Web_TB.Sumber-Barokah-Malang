/**
 * ==============================================================================
 * AUTH STORE TB. SUMBER BAROKAH MALANG
 * ==============================================================================
 * Mengelola status login pengguna (Frontend LocalStorage)
 * Key: 'sb_auth' -> { loggedIn: true, email: '...' }
 * 
 * Aturan:
 * 1. Saat belum login (tamu/tanpa akun):
 *    - Tidak bisa mengakses keranjang (/keranjang)
 *    - Saat klik tambah keranjang (di katalog/kalkulator), dialihkan ke /login
 *    - Di navbar tampil tombol "Login"
 * 2. Saat sudah login (masuk ke akun):
 *    - Di navbar tombol "Login" berganti menjadi tombol "Logout" + Info Akun
 *    - Bebas mengakses keranjang belanja dan memasukkan barang
 * ==============================================================================
 */

const STORAGE_KEY_AUTH = 'sb_auth';

/**
 * Mengecek apakah pengguna sedang dalam status login aktif.
 * @returns {boolean}
 */
function isUserLoggedIn() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_AUTH);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        return Boolean(parsed && parsed.loggedIn === true && parsed.email);
    } catch (e) {
        return false;
    }
}

/**
 * Mendapatkan objek informasi pengguna yang sedang login.
 * @returns {Object|null} { loggedIn: boolean, email: string, loginAt?: string }
 */
function getUserAuth() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_AUTH);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return (parsed && parsed.loggedIn === true) ? parsed : null;
    } catch (e) {
        return null;
    }
}

/**
 * Menyimpan status login pengguna ke localStorage.
 * @param {string} email 
 */
function loginUser(email) {
    try {
        const userObj = {
            loggedIn: true,
            email: String(email || '').trim().toLowerCase(),
            loginAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(userObj));
        syncNavbarAuth();
    } catch (e) {
        console.error("Gagal menyimpan data auth ke localStorage:", e);
    }
}

/**
 * Menghapus status login pengguna dari localStorage.
 */
function logoutUser() {
    try {
        localStorage.removeItem(STORAGE_KEY_AUTH);
        syncNavbarAuth();
    } catch (e) {
        console.error("Gagal menghapus data auth dari localStorage:", e);
    }
}

/**
 * Menyelaraskan status antarmuka navbar:
 * - Menampilkan tombol Login jika belum masuk
 * - Mengganti tombol Login menjadi tombol Logout + identitas akun jika sudah login
 * - Memproteksi klik ikon keranjang di navbar jika belum masuk
 */
function syncNavbarAuth() {
    const isLogged = isUserLoggedIn();
    const guestSection = document.getElementById('navAuthGuest');
    const userSection = document.getElementById('navAuthUser');
    const emailEl = document.getElementById('navUserEmail');
    const navCartBtn = document.getElementById('navCartBtn');

    if (isLogged) {
        const user = getUserAuth();
        if (guestSection) guestSection.classList.add('d-none');
        if (userSection) {
            userSection.classList.remove('d-none');
            userSection.classList.add('d-flex');
        }
        if (emailEl && user && user.email) {
            emailEl.textContent = user.email;
            emailEl.title = `Masuk sebagai: ${user.email}`;
        }
        if (navCartBtn) {
            navCartBtn.onclick = null; // Izinkan akses normal ke /keranjang
        }
    } else {
        if (guestSection) {
            guestSection.classList.remove('d-none');
            guestSection.classList.add('d-flex');
        }
        if (userSection) {
            userSection.classList.add('d-none');
            userSection.classList.remove('d-flex');
        }
        if (navCartBtn) {
            // Jika belum login, klik keranjang di navbar langsung dialihkan ke login
            navCartBtn.onclick = function (e) {
                e.preventDefault();
                window.location.href = '/login?redirect=keranjang&pesan=login_dulu';
            };
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    syncNavbarAuth();

    // Event listener tombol Logout di navbar
    const btnLogout = document.getElementById('btnNavLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function (e) {
            e.preventDefault();
            if (confirm('Apakah Anda yakin ingin keluar (logout) dari akun?')) {
                logoutUser();
                // Jika sedang di halaman keranjang, segera alihkan ke halaman login
                if (window.location.pathname.includes('/keranjang')) {
                    window.location.href = '/login?pesan=logout_berhasil';
                } else {
                    window.location.reload();
                }
            }
        });
    }
});

// Sinkronisasi status auth secara instan ketika ada tab lain yang login atau logout
window.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY_AUTH) {
        syncNavbarAuth();
    }
});
