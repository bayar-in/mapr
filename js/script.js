document.getElementById("toggle-btn").addEventListener("click", function () {
  const toggleContent = document.getElementById("toggle-content");

  // Cek apakah elemen tersembunyi atau terlihat
  if (toggleContent.classList.contains("hidden")) {
    toggleContent.classList.remove("hidden");
    toggleContent.classList.add("visible");
    this.textContent = "Hidde"; // Ubah teks tombol
  } else {
    toggleContent.classList.remove("visible");
    toggleContent.classList.add("hidden");
    this.textContent = "Show"; // Ubah teks tombol
  }
});

// Tambahkan interaksi pada tombol Hitung
document.getElementById("btn-distance").addEventListener("click", function () {
  const distanceInput = document.getElementById("distance-input").value;
  const resultInfo = document.getElementById("result-info");

  if (distanceInput && distanceInput > 0) {
    resultInfo.textContent = `Radius yang dimasukkan adalah ${distanceInput} meter.`;
    resultInfo.style.display = "block";
    resultInfo.style.color = "green";
  } else {
    resultInfo.textContent = "Masukkan radius yang valid!";
    resultInfo.style.display = "block";
    resultInfo.style.color = "red";
  }
});


