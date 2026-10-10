# Employee Demographic Dashboard (Google Apps Script)

A lightweight, serverless web application built on Google Apps Script (GAS) to visualize employee demographics, organizational structure, and track attrition rates. It uses Google Sheets as a Single Source of Truth (SSOT).

*(Bahasa Indonesia version below)*

## 🚀 Features
*   **Real-time Analytics**: No database syncing required. Reads directly from Google Sheets.
*   **Employee Attrition Module**: Track New Joiners, Resigned employees, Turnover Rate (TOR), and Retention Rate per period.
*   **Data Explorer**: Cross-dimensional pivot tool up to 3 levels deep (e.g., Department > Gender > Job Level) with dynamic charting.
*   **Granular Filters**: Cascade filtering by Company, Legal Entity, Department, Sub-Department, Position, and Status.
*   **Export Functionality**: Drill down into any chart or KPI and export the filtered data to CSV.

## 🛠️ Quick Setup (English)

1. **Prepare the Database**
   * Create a new Google Sheet.
   * Rename the active sheet to exactly: `Database Karyawan (ADI & BBB)`. If you want a different name, change the `SHEET_NAME` variable in `Code.gs`.
   * Recreate the columns from A to AM based on the structure defined in `templates/template_database.csv`.
2. **Setup Apps Script**
   * On your Google Sheet, click **Extensions > Apps Script**.
   * Create two files:
     * `Code.gs`: Copy the backend code from `src/Code.gs`.
     * `WebApp Demographic.html`: Create an HTML file and paste the code from `src/WebApp Demographic.html`.
3. **Deploy the Web App**
   * Click **Deploy > New deployment** in the top right corner.
   * Select type: **Web App**.
   * Execute as: *Me*.
   * Who has access: *Anyone within your organization* (or *Anyone* for testing).
   * Click **Deploy** and authorize the script. Open the Web App URL to view your dashboard!

<br>

# Dasbor Demografi Karyawan (Google Apps Script)

Aplikasi web internal tanpa server (serverless) yang dibangun di atas Google Apps Script (GAS) untuk memvisualisasikan demografi karyawan, struktur organisasi, dan melacak pergerakan tenaga kerja (attrition) menggunakan Google Sheets sebagai database utama.

## 🚀 Fitur Utama
*   **Real-time Analytics**: Tidak perlu sinkronisasi database. Sistem membaca data langsung dari Google Sheets.
*   **Modul Attrition**: Melacak pergerakan karyawan masuk (New Joiner), keluar (Resign), Turnover Rate (TOR), dan Retention Rate per bulan/tahun.
*   **Data Explorer**: Fitur pivot dinamis hingga 3 dimensi (contoh: Departemen > Gender > Job Level) lengkap dengan grafik otomatis.
*   **Filter Berlapis**: Filter cascading berdasarkan Company, Legal Entity, Departemen, Sub-Departemen, Posisi, hingga periode Join/Resign Date.
*   **Export Data**: Kemampuan untuk melihat data mentah (raw data) dari setiap segmen KPI/grafik dan mendownloadnya dalam format CSV.

## 🛠️ Cara Instalasi (Bahasa Indonesia)

1. **Siapkan Database**
   * Buat Google Sheet baru.
   * Ubah nama sheet yang aktif menjadi persis: `Database Karyawan (ADI & BBB)`. Jika ingin menggunakan nama lain, pastikan untuk mengubah variabel `SHEET_NAME` di dalam file `Code.gs`.
   * Salin struktur header kolom dari A sampai AM sesuai urutan yang ada di file `templates/template_database.csv`.
2. **Setup Apps Script**
   * Di dalam file Google Sheet, klik menu **Extensions (Ekstensi) > Apps Script**.
   * Buat dua file di editor:
     * `Code.gs`: Paste kode backend dari file `src/Code.gs`.
     * `WebApp Demographic.html`: Buat file HTML baru dengan nama tersebut dan paste kode frontend dari `src/WebApp Demographic.html`.
3. **Deploy Web App**
   * Klik tombol **Deploy (Terapkan) > New deployment (Penerapan baru)** di kanan atas.
   * Pilih jenis penerapan: **Web App (Aplikasi Web)**.
   * Jalankan sebagai: *Saya (Me)*.
   * Siapa yang memiliki akses: *Siapa saja di organisasi Anda* (atau *Siapa saja* jika ingin publik).
   * Klik **Deploy**, izinkan akses akun (authorize), dan buka URL Web App yang dihasilkan untuk melihat dasbor.
