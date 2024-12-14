// Fungsi untuk memeriksa apakah user telah login atau belum
function checkLoginStatus() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  if (isLoggedIn === "true") {
    document.getElementById("sign-in-btn").style.display = "none";
    document.getElementById("profile-section").style.display = "block";
  } else {
    document.getElementById("sign-in-btn").style.display = "block";
    document.getElementById("profile-section").style.display = "none";
  }
}

// Fungsi untuk simulasi login
function login() {
  // Saat user login, set localStorage atau mekanisme autentikasi Anda
  localStorage.setItem("isLoggedIn", "true");

  // Bisa juga menyimpan nama pengguna atau foto profil
  localStorage.setItem("profilePicture", "user-profile.jpg"); // Path gambar profil

  // Panggil ulang fungsi untuk memperbarui UI
  checkLoginStatus();
}

// Fungsi untuk simulasi logout
// Fungsi untuk logout
function logout() {
  // Hapus status login dari localStorage
  localStorage.removeItem("isLoggedIn");

  // Alihkan pengguna ke halaman login
  window.location.href = "/bayar-in.github.io/src/page/login/login.html";
}

// Pastikan event listener diatur untuk tombol logout
document.addEventListener("DOMContentLoaded", () => {
  const logoutButton = document.getElementById("logout-btn");
  if (logoutButton) {
    logoutButton.addEventListener("click", logout);
  }
});

// Fungsi untuk memeriksa status login
function checkLoginStatus() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  if (isLoggedIn === "true") {
    document.getElementById("sign-in-btn").style.display = "none";
    document.getElementById("profile-section").style.display = "block";
  } else {
    document.getElementById("sign-in-btn").style.display = "block";
    document.getElementById("profile-section").style.display = "none";
  }
}

// Memastikan status login diperiksa saat halaman dimuat
window.onload = checkLoginStatus;

// Fungsi untuk menginisialisasi observer
function onIntersection(entries, observer) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible"); // Tambahkan kelas visible saat elemen terlihat
      observer.unobserve(entry.target); // Hentikan observasi untuk elemen ini
    }
  });
}

// Inisialisasi Intersection Observer
const observer = new IntersectionObserver(onIntersection, {
  threshold: 0.5, // Memastikan 50% dari elemen terlihat sebelum memicu animasi
});

// Pilih semua elemen dengan class 'transition-element-right' dan 'clients-logos'
const transitionElements = document.querySelectorAll(
  ".transition-element-right, .transition-element-left, .transition-element-down, .transition-element-up"
);

// Terapkan observer pada setiap elemen
transitionElements.forEach((element) => {
  observer.observe(element);
});

document.querySelectorAll(".faq-question").forEach((item) => {
  item.addEventListener("click", () => {
    const parent = item.parentElement;
    const answer = parent.querySelector(".faq-answer");

    if (parent.classList.contains("active")) {
      // Close the FAQ
      answer.style.maxHeight = null;
    } else {
      // Open the FAQ
      answer.style.maxHeight = answer.scrollHeight + "px";
    }

    parent.classList.toggle("active");

    // Change the icon based on the active state
    const icon = item.querySelector(".icon");
    icon.textContent = parent.classList.contains("active") ? "▲" : "▼";
  });
});

// logout.js

// Fungsi untuk menghapus cookie berdasarkan nama
function deleteCookie(name) {
  document.cookie =
    name + "=; Max-Age=0; path=/; domain=" + window.location.hostname;
}

// Fungsi untuk logout dari aplikasi (hapus sesi di front-end)
function logout() {
  // Hapus cookies yang relevan (misalnya, token otentikasi)
  deleteCookie("session_token");
  deleteCookie("user_id"); // Jika ada cookie lain yang perlu dihapus

  // Hapus data dari localStorage dan sessionStorage jika ada
  localStorage.removeItem("auth_token"); // Token yang disimpan di localStorage
  sessionStorage.removeItem("auth_token"); // Token yang disimpan di sessionStorage
  localStorage.removeItem("user_data"); // Data pengguna yang disimpan di localStorage
  sessionStorage.removeItem("user_data"); // Data pengguna yang disimpan di sessionStorage

  // Alihkan pengguna ke halaman login setelah logout
  window.location.href = "./../index.html"; // Ganti dengan URL halaman login Anda
}

// Panggil fungsi logout saat tombol logout ditekan
document.getElementById("profile-section").addEventListener("click", logout);

const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.getElementById("nav-menu");

menuToggle.addEventListener("click", () => {
  navMenu.classList.toggle("active");
});
