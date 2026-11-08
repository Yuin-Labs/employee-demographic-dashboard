# Employee Demographic Dashboard (Google Apps Script)

A lightweight, serverless web application built on Google Apps Script (GAS) to visualize employee demographics, organizational structures, and workforce attrition metrics, using Google Sheets as a Single Source of Truth (SSOT).

*(Versi Bahasa Indonesia tersedia di bawah)*

---

## 🚀 Key Features

* **Real-time Analytics:** Direct integration with Google Sheets with zero database synchronization latency.
* **Employee Attrition Module:** Comprehensive tracking of New Joiners, Resignations, Turnover Rate (TOR), and Retention Rate across configurable time periods.
* **Data Explorer:** Multi-dimensional cross-tabulation and dynamic pivot analysis up to 3 hierarchical levels deep (e.g., Department > Gender > Job Level) with automated chart generation.
* **Granular Filtering:** Cascading filters spanning Company, Legal Entity, Department, Sub-Department, Position, Employment Status, and Join/Resign Date intervals.
* **Drill-down & Export:** Click-to-inspect functionality on any chart segment or KPI card with instant CSV data export capabilities.

---

## 🛠️ Quick Setup (English)

### 1. Database Preparation
1. Create a new Google Sheet.
2. Rename your active worksheet tab to match the code config: `emp_database` (or update the `SHEET_NAME` variable inside `Code.gs` to match your custom sheet name).
3. Set up your column headers sequentially from Column A onward, aligning with the expected data mapping structure in `Code.gs` (including User ID, Full Name, Organization, Sub-Department, Position, Job Level, Join Date, Resign Date, Status, Gender, Legal Entity, Company, etc.).

### 2. Apps Script Setup
1. Inside your Google Sheet, navigate to **Extensions** > **Apps Script**.
2. Create or replace the project files with the following components:
   * `Code.gs`: Paste the backend script logic.
   * `WebApp_Demographic.html`: Create an HTML file and paste the frontend dashboard template.

### 3. Deploy as a Web App
1. In the top-right corner of the Apps Script editor, click **Deploy** > **New deployment**.
2. Select type: **Web app**.
3. Configure deployment settings:
   * **Execute as:** Me
   * **Who has access:** Anyone within your organization (or Anyone, depending on your testing needs).
4. Click **Deploy**, authorize the required permissions, and open the generated Web App URL to launch your dashboard.

---
---

# Dasbor Demografi Karyawan (Google Apps Script)

Aplikasi web internal *serverless* yang dibangun di atas Google Apps Script (GAS) untuk memvisualisasikan demografi karyawan, struktur organisasi, dan melacak pergerakan tenaga kerja (*attrition*) dengan memanfaatkan Google Sheets sebagai *Single Source of Truth* (SSOT).

---

## 🚀 Fitur Utama

* **Real-time Analytics:** Pembacaan data langsung dari Google Sheets tanpa memerlukan sinkronisasi database eksternal.
* **Modul Attrition:** Memantau pergerakan karyawan masuk (*New Joiner*), keluar (*Resign*), *Turnover Rate* (TOR), serta *Retention Rate* berdasarkan rentang waktu tertentu.
* **Data Explorer:** Fitur *pivot* dinamis interaktif hingga 3 level dimensi (contoh: Departemen > Gender > Job Level) lengkap dengan visualisasi grafik otomatis.
* **Filter Berlapis:** Penyaringan data bertingkat (*cascading*) berdasarkan Perusahaan, *Legal Entity*, Departemen, Sub-Departemen, Posisi, Status Karyawan, hingga periode tanggal bergabung/keluar.
* **Drill-down & Ekspor CSV:** Kemampuan untuk menelusuri data mentah (*raw data*) dari setiap segmen KPI atau grafik dan mengunduhnya langsung dalam format CSV.

---

## 🛠️ Cara Instalasi (Bahasa Indonesia)

### 1. Persiapan Database
1. Buat dokumen Google Sheet baru.
2. Ubah nama *tab sheet* yang aktif menjadi: `emp_database` (atau sesuaikan variabel `SHEET_NAME` di dalam file `Code.gs` jika Anda menggunakan nama sheet yang berbeda).
3. Buat header kolom sesuai dengan struktur pemetaan data yang dibutuhkan pada backend script (mulai dari ID Karyawan, Nama Lengkap, Departemen, Sub-Departemen, Posisi, Job Level, Tanggal Join, Tanggal Resign, Status, Gender, Legal Entity, hingga Perusahaan).

### 2. Konfigurasi Apps Script
1. Pada lembar kerja Google Sheet Anda, klik menu **Extensions (Ekstensi)** > **Apps Script**.
2. Buat atau perbarui file pada editor proyek:
   * `Code.gs`: Salin dan tempel kode *backend*.
   * `WebApp_Demographic.html`: Buat file HTML baru dengan nama tersebut, lalu tempel kode *frontend*.

### 3. Deployment Aplikasi Web
1. Di sudut kanan atas editor Apps Script, klik **Deploy (Terapkan)** > **New deployment (Penerapan baru)**.
2. Pilih jenis penerapan (*Select type*): **Web app**.
3. Atur konfigurasi berikut:
   * **Execute as (Jalankan sebagai):** Saya (Me)
   * **Who has access (Siapa yang memiliki akses):** Siapa saja di organisasi Anda (atau sesuai kebutuhan akses).
4. Klik **Deploy**, selesaikan proses otorisasi akun (*authorization*), lalu buka URL Web App yang dihasilkan untuk mulai menggunakan dasbor.
