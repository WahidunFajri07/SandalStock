'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

const translations = {
  id: {
    /* ── Nav ───────────────────────── */
    dashboard:        'Dasbor',
    categories:       'Kategori',
    sandals:          'Sandal',
    stockIn:          'Stok Masuk',
    stockSold:        'Stok Terjual',
    reports:          'Laporan',
    profile:          'Profil',
    /* ── Theme / Lang ─────────────── */
    light:            'Terang',
    dark:             'Gelap',
    signOut:          'Keluar',
    /* ── Brand ────────────────────── */
    tokoKembar:       'Toko Kembar',
    inventoryPro:     'Langkah Serasi',
    /* ── Dashboard ────────────────── */
    dashboardOverview:'Pantau inventaris sandal secara real-time.',
    welcomeSystem:    'Sistem Aktif',
    welcomeGreetMorning: 'Selamat Pagi',
    welcomeGreetDay:     'Selamat Siang',
    welcomeGreetAfternoon:'Selamat Sore',
    welcomeGreetNight:   'Selamat Malam',
    welcomeDesc:      'Selamat datang di sistem manajemen inventaris Toko Kembar.',
    welcomeSubDesc:   'Pantau stok sandal Anda secara real-time.',
    roleAdmin:        'Administrator',
    roleStaff:        'Staff',
    currentTime:      'Waktu Sekarang',
    quickTips:        'Tips Cepat',
    tip1:             'Lihat grafik tren 30 hari terakhir di bawah',
    tip2:             'Cek panel stok kritis secara rutin',
    tip3:             'Tekan Refresh untuk data real-time',
    refresh:          'Perbarui',
    /* ── Category ─────────────────── */
    manageCategory:   'Kelola kategori sandal',
    newCategory:      'Kategori Baru',
    addCategory:      'Tambah Kategori',
    editCategory:     'Edit Kategori',
    categoryName:     'Nama Kategori',
    categoryPlaceholder: 'Contoh: Sepatu Gunung',
    /* ── Sandal ───────────────────── */
    manageSandals:    'Kelola data produk sandal',
    newSandal:        'Sandal Baru',
    addSandal:        'Tambah Sandal',
    editSandal:       'Edit Sandal',
    /* ── Stock In ─────────────────── */
    stockInHistory:   'Riwayat Stok Masuk',
    newStockIn:       'Manifest Baru',
    recordStockIn:    'Catat Stok Masuk',
    editStockIn:      'Edit Entri Stok Masuk',
    /* ── Stock Sold ───────────────── */
    stockSoldHistory: 'Riwayat Penjualan',
    newSale:          'Transaksi Baru',
    recordSale:       'Catat Penjualan',
    editSale:         'Edit Entri Penjualan',
    outOfStock:       'Sandal ini kehabisan stok.',
    /* ── Reports ──────────────────── */
    stockReport:      'Laporan Stok',
    stockReportDesc:  'Ringkasan stok lengkap dengan opsi ekspor',
    startDate:        'Tanggal Mulai',
    endDate:          'Tanggal Akhir',
    allCategories:    'Semua Kategori',
    totalIn:          'Total Masuk',
    totalSold:        'Total Terjual',
    currentStock:     'Stok Saat Ini',
    sellThrough:      'Sell-Through',
    /* ── Profile ──────────────────── */
    myProfile:        'Profil Saya',
    profileDesc:      'Informasi akun dan preferensi pengguna',
    accountInfo:      'Informasi Akun',
    username:         'Nama Pengguna',
    role:             'Peran',
    changePassword:   'Ganti Kata Sandi',
    currentPassword:  'Kata Sandi Lama',
    newPassword:      'Kata Sandi Baru',
    confirmPassword:  'Konfirmasi Kata Sandi',
    updatePassword:   'Perbarui Kata Sandi',
    passwordUpdated:  'Kata sandi berhasil diperbarui',
    passwordMismatch: 'Kata sandi baru tidak cocok',
    passwordShort:    'Kata sandi minimal 6 karakter',
    /* ── Common Fields ────────────── */
    code:             'Kode',
    name:             'Nama',
    color:            'Warna',
    size:             'Ukuran',
    stock:            'Stok',
    quantity:         'Jumlah',
    date:             'Tanggal',
    note:             'Catatan',
    category:         'Kategori',
    sandal:           'Sandal',
    items:            'Item',
    actions:          'Aksi',
    image:            'Gambar',
    /* ── Table Stats ──────────────── */
    recordsFound:     'record ditemukan',
    itemsFound:       'item ditemukan',
    transactionsFound:'transaksi ditemukan',
    records:          'Records',
    /* ── States ───────────────────── */
    loading:          'Memuat...',
    notFound:         'Tidak ditemukan',
    noData:           'Tidak ada data',
    saving:           'Menyimpan...',
    processing:       'Memproses...',
    /* ── Actions ──────────────────── */
    cancel:           'Batal',
    save:             'Simpan',
    delete:           'Hapus',
    edit:             'Edit',
    add:              'Tambah',
    select:           'Pilih...',
    selectSandal:     'Pilih sandal',
    allSandals:       'Semua Sandal',
    resetFilter:      'Reset Filter',
    clearFilter:      'Hapus Filter',
    retry:            'Coba Lagi',
    /* ── Misc ─────────────────────── */
    optionalNote:     'Catatan opsional',
    searchPlaceholder:'Cari berdasarkan nama...',
    searchSandal:     'Cari nama, kode, atau warna...',
    stockSafe:        'Stok Aman',
    stockSafeDesc:    'Tidak ada item di bawah batas kritis.',
    criticalStock:    'Stok Kritis',
    recentActivity:   'Aktivitas Terkini',
    inventoryDist:    'Distribusi Inventaris',
    stockPerCat:      'Stok per Kategori',
    totalStock:       'Total Stok',
    stockTrend:       'Tren Pergerakan Stok',
    lastNDays:        'Hari Terakhir',
    catPortion:       'Porsi Kategori',
    stockIn2:         'Masuk',
    stockSold2:       'Terjual',
    live:             'Live',
    noActivity:       'Belum ada aktivitas',
    noInventory:      'Belum ada data inventaris',
    outLabel:         'HABIS',
    leftLabel:        'left',
  },
  en: {
    /* ── Nav ───────────────────────── */
    dashboard:        'Dashboard',
    categories:       'Categories',
    sandals:          'Sandals',
    stockIn:          'Stock In',
    stockSold:        'Stock Sold',
    reports:          'Reports',
    profile:          'Profile',
    /* ── Theme / Lang ─────────────── */
    light:            'Light',
    dark:             'Dark',
    signOut:          'Sign Out',
    /* ── Brand ────────────────────── */
    tokoKembar:       'Toko Kembar',
    inventoryPro:     'Harmonious Steps',
    /* ── Dashboard ────────────────── */
    dashboardOverview:'Monitor sandal inventory in real-time.',
    welcomeSystem:    'System Active',
    welcomeGreetMorning: 'Good Morning',
    welcomeGreetDay:     'Good Afternoon',
    welcomeGreetAfternoon:'Good Afternoon',
    welcomeGreetNight:   'Good Evening',
    welcomeDesc:      'Welcome to the Toko Kembar inventory management system.',
    welcomeSubDesc:   'Monitor your sandal stock in real-time.',
    roleAdmin:        'Administrator',
    roleStaff:        'Staff',
    currentTime:      'Current Time',
    quickTips:        'Quick Tips',
    tip1:             'View the 30-day trend chart below',
    tip2:             'Check the critical stock panel regularly',
    tip3:             'Press Refresh for real-time data',
    refresh:          'Refresh',
    /* ── Category ─────────────────── */
    manageCategory:   'Manage sandal categories',
    newCategory:      'New Category',
    addCategory:      'Add Category',
    editCategory:     'Edit Category',
    categoryName:     'Category Name',
    categoryPlaceholder: 'e.g. Mountain Shoes',
    /* ── Sandal ───────────────────── */
    manageSandals:    'Manage sandal inventory',
    newSandal:        'New Sandal',
    addSandal:        'Add Sandal',
    editSandal:       'Edit Sandal',
    /* ── Stock In ─────────────────── */
    stockInHistory:   'Stock In History',
    newStockIn:       'New Manifest',
    recordStockIn:    'Record Stock In',
    editStockIn:      'Edit Stock In Entry',
    /* ── Stock Sold ───────────────── */
    stockSoldHistory: 'Sales History',
    newSale:          'New Sale',
    recordSale:       'Record Sale',
    editSale:         'Edit Sale Entry',
    outOfStock:       'This sandal is out of stock.',
    /* ── Reports ──────────────────── */
    stockReport:      'Stock Report',
    stockReportDesc:  'Full stock summary with export options',
    startDate:        'Start Date',
    endDate:          'End Date',
    allCategories:    'All Categories',
    totalIn:          'Total In',
    totalSold:        'Total Sold',
    currentStock:     'Current Stock',
    sellThrough:      'Sell-Through',
    /* ── Profile ──────────────────── */
    myProfile:        'My Profile',
    profileDesc:      'Account information and user preferences',
    accountInfo:      'Account Information',
    username:         'Username',
    role:             'Role',
    changePassword:   'Change Password',
    currentPassword:  'Current Password',
    newPassword:      'New Password',
    confirmPassword:  'Confirm Password',
    updatePassword:   'Update Password',
    passwordUpdated:  'Password updated successfully',
    passwordMismatch: 'New passwords do not match',
    passwordShort:    'Password must be at least 6 characters',
    /* ── Common Fields ────────────── */
    code:             'Code',
    name:             'Name',
    color:            'Color',
    size:             'Size',
    stock:            'Stock',
    quantity:         'Quantity',
    date:             'Date',
    note:             'Note',
    category:         'Category',
    sandal:           'Sandal',
    items:            'Items',
    actions:          'Actions',
    image:            'Image',
    /* ── Table Stats ──────────────── */
    recordsFound:     'records found',
    itemsFound:       'items found',
    transactionsFound:'transactions found',
    records:          'Records',
    /* ── States ───────────────────── */
    loading:          'Loading...',
    notFound:         'Not found',
    noData:           'No data',
    saving:           'Saving...',
    processing:       'Processing...',
    /* ── Actions ──────────────────── */
    cancel:           'Cancel',
    save:             'Save',
    delete:           'Delete',
    edit:             'Edit',
    add:              'Add',
    select:           'Select...',
    selectSandal:     'Select sandal',
    allSandals:       'All Sandals',
    resetFilter:      'Reset Filter',
    clearFilter:      'Clear Filter',
    retry:            'Retry',
    /* ── Misc ─────────────────────── */
    optionalNote:     'Optional note',
    searchPlaceholder:'Search by name...',
    searchSandal:     'Search by name, code, or color...',
    stockSafe:        'Stock Safe',
    stockSafeDesc:    'No items below critical threshold.',
    criticalStock:    'Critical Stock',
    recentActivity:   'Recent Activity',
    inventoryDist:    'Inventory Distribution',
    stockPerCat:      'Stock per Category',
    totalStock:       'Total Stock',
    stockTrend:       'Stock Movement Trend',
    lastNDays:        'Last Days',
    catPortion:       'Category Portion',
    stockIn2:         'In',
    stockSold2:       'Sold',
    live:             'Live',
    noActivity:       'No recent activity',
    noInventory:      'No inventory data yet',
    outLabel:         'OUT',
    leftLabel:        'left',
  }
}

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('id')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const f = requestAnimationFrame(() => setMounted(true))
    const stored = localStorage.getItem('app_lang')
    if (stored && ['id', 'en'].includes(stored)) {
      requestAnimationFrame(() => setLang(stored))
    }
    return () => cancelAnimationFrame(f)
  }, [])

  const toggleLang = () => {
    const newLang = lang === 'id' ? 'en' : 'id'
    setLang(newLang)
    localStorage.setItem('app_lang', newLang)
  }

  const t = (key) => translations[lang]?.[key] ?? translations['en']?.[key] ?? key

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
