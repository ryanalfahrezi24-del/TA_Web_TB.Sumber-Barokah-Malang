/**
 * ==============================================================================
 * DATA LAYER: STOK BARANG & KATEGORI TB. SUMBER BAROKAH MALANG
 * ==============================================================================
 * File ini mengelola penyimpanan data stok barang menggunakan browser localStorage
 * dengan key 'sb_barang' dan 'sb_kategori'.
 * 
 * Fitur:
 * - Daftar kategori baku material bangunan
 * - Migrasi otomatis untuk barang lama yang belum memiliki atribut 'kategori' atau 'satuan'
 * - Pengelompokan dan penghitungan barang per kategori
 * - Fungsi CRUD dan format mata uang Rupiah
 */

const STORAGE_KEY_BARANG = 'sb_barang';
const STORAGE_KEY_KATEGORI = 'sb_kategori';
const STORAGE_KEY_VERSI = 'sb_barang_versi';
const CURRENT_DATA_VERSION = 'v7_stok_aman_menipis_habis';

/**
 * Daftar Kategori Baku Awal (Seed) Toko Bangunan Sumber Barokah Malang.
 */
const DEFAULT_KATEGORI = [
    {
        "id": 1,
        "nama": "Semen",
        "ikon": "bi-boxes"
    },
    {
        "id": 2,
        "nama": "Kayu",
        "ikon": "bi-tree"
    },
    {
        "id": 3,
        "nama": "Pipa",
        "ikon": "bi-droplet-half"
    },
    {
        "id": 4,
        "nama": "Pasir",
        "ikon": "bi-bucket"
    },
    {
        "id": 5,
        "nama": "Bata",
        "ikon": "bi-bricks"
    },
    {
        "id": 6,
        "nama": "Cat",
        "ikon": "bi-palette"
    },
    {
        "id": 7,
        "nama": "Seng",
        "ikon": "bi-shield-shaded"
    },
    {
        "id": 8,
        "nama": "Besi",
        "ikon": "bi-hammer"
    },
    {
        "id": 9,
        "nama": "Rangka Atap Galvalum",
        "ikon": "bi-house-gear"
    },
    {
        "id": 10,
        "nama": "Barang Pelengkap",
        "ikon": "bi-tools"
    },
    {
        "id": 11,
        "nama": "Asbes",
        "ikon": "bi-layers"
    },
    {
        "id": 12,
        "nama": "Genteng",
        "ikon": "bi-house"
    },
    {
        "id": 13,
        "nama": "Keramik",
        "ikon": "bi-grid-3x3"
    }
];

/**
 * Daftar Master Data Barang Awal Toko Bangunan Sumber Barokah Malang.
 */
const DEFAULT_BARANG = [
    {
        "id": 101,
        "nama": "Semen Gresik PCC 40kg",
        "kategori": "Semen",
        "stok": 120,
        "stokMinimum": 20,
        "satuan": "sak",
        "harga": 54000,
        "gambar": ""
    },
    {
        "id": 102,
        "nama": "Semen Tiga Roda 40kg",
        "kategori": "Semen",
        "stok": 100,
        "stokMinimum": 20,
        "satuan": "sak",
        "harga": 56000,
        "gambar": ""
    },
    {
        "id": 103,
        "nama": "Semen Putih Tiga Roda 40kg",
        "kategori": "Semen",
        "stok": 0,
        "stokMinimum": 10,
        "satuan": "sak",
        "harga": 95000,
        "gambar": ""
    },
    {
        "id": 104,
        "nama": "Semen Perekat Bata Ringan 40kg",
        "kategori": "Semen",
        "stok": 60,
        "stokMinimum": 15,
        "satuan": "sak",
        "harga": 75000,
        "gambar": ""
    },
    {
        "id": 105,
        "nama": "Semen Acian Instan 40kg",
        "kategori": "Semen",
        "stok": 8,
        "stokMinimum": 15,
        "satuan": "sak",
        "harga": 68000,
        "gambar": ""
    },
    {
        "id": 106,
        "nama": "Cornice Adhesive Compound Aplus 20kg",
        "kategori": "Semen",
        "stok": 45,
        "stokMinimum": 10,
        "satuan": "sak",
        "harga": 72000,
        "gambar": ""
    },
    {
        "id": 107,
        "nama": "Calsium Karbonat Powder 40kg",
        "kategori": "Semen",
        "stok": 40,
        "stokMinimum": 10,
        "satuan": "sak",
        "harga": 38000,
        "gambar": ""
    },
    {
        "id": 201,
        "nama": "Kayu Meranti Balok 5x7 (4 Meter)",
        "kategori": "Kayu",
        "stok": 80,
        "stokMinimum": 15,
        "satuan": "batang",
        "harga": 65000,
        "gambar": ""
    },
    {
        "id": 202,
        "nama": "Kayu Kamper 5x7 (4 Meter)",
        "kategori": "Kayu",
        "stok": 6,
        "stokMinimum": 10,
        "satuan": "batang",
        "harga": 88000,
        "gambar": ""
    },
    {
        "id": 203,
        "nama": "Kayu Sengon Kaso 4x6 (4 Meter)",
        "kategori": "Kayu",
        "stok": 150,
        "stokMinimum": 25,
        "satuan": "batang",
        "harga": 28000,
        "gambar": ""
    },
    {
        "id": 204,
        "nama": "Kayu Reng Sengon 2x3 (3 Meter)",
        "kategori": "Kayu",
        "stok": 180,
        "stokMinimum": 30,
        "satuan": "batang",
        "harga": 14000,
        "gambar": ""
    },
    {
        "id": 205,
        "nama": "Kayu Reng Meranti 3x4 (4 Meter)",
        "kategori": "Kayu",
        "stok": 120,
        "stokMinimum": 20,
        "satuan": "batang",
        "harga": 22000,
        "gambar": ""
    },
    {
        "id": 206,
        "nama": "Papan Kayu Cor Bekisting Meranti (4 Meter)",
        "kategori": "Kayu",
        "stok": 75,
        "stokMinimum": 15,
        "satuan": "lembar",
        "harga": 35000,
        "gambar": ""
    },
    {
        "id": 301,
        "nama": "Pipa PVC Maspion AW 1/2 Inch (4 Meter)",
        "kategori": "Pipa",
        "stok": 90,
        "stokMinimum": 20,
        "satuan": "batang",
        "harga": 26000,
        "gambar": ""
    },
    {
        "id": 302,
        "nama": "Pipa PVC Maspion AW 3/4 Inch (4 Meter)",
        "kategori": "Pipa",
        "stok": 85,
        "stokMinimum": 20,
        "satuan": "batang",
        "harga": 34000,
        "gambar": ""
    },
    {
        "id": 303,
        "nama": "Pipa PVC Maspion D 3 Inch (4 Meter)",
        "kategori": "Pipa",
        "stok": 0,
        "stokMinimum": 10,
        "satuan": "batang",
        "harga": 82000,
        "gambar": ""
    },
    {
        "id": 304,
        "nama": "Pipa PVC Rucika AW 1/2 Inch (4 Meter)",
        "kategori": "Pipa",
        "stok": 110,
        "stokMinimum": 25,
        "satuan": "batang",
        "harga": 29000,
        "gambar": ""
    },
    {
        "id": 305,
        "nama": "Pipa PVC Rucika AW 3/4 Inch (4 Meter)",
        "kategori": "Pipa",
        "stok": 95,
        "stokMinimum": 20,
        "satuan": "batang",
        "harga": 38000,
        "gambar": ""
    },
    {
        "id": 306,
        "nama": "Pipa PVC Rucika D 4 Inch (4 Meter)",
        "kategori": "Pipa",
        "stok": 5,
        "stokMinimum": 10,
        "satuan": "batang",
        "harga": 115000,
        "gambar": ""
    },
    {
        "id": 307,
        "nama": "Pipa Talang Kotak PVC Rucika (4 Meter)",
        "kategori": "Pipa",
        "stok": 45,
        "stokMinimum": 10,
        "satuan": "batang",
        "harga": 65000,
        "gambar": ""
    },
    {
        "id": 401,
        "nama": "Pasir Pasang Lumajang (1 Pickup)",
        "kategori": "Pasir",
        "stok": 20,
        "stokMinimum": 5,
        "satuan": "pickup",
        "harga": 350000,
        "gambar": ""
    },
    {
        "id": 402,
        "nama": "Pasir Pasang Karungan (50kg)",
        "kategori": "Pasir",
        "stok": 80,
        "stokMinimum": 15,
        "satuan": "karung",
        "harga": 18000,
        "gambar": ""
    },
    {
        "id": 403,
        "nama": "Pasir Cor Hitam Lumajang (1 Pickup)",
        "kategori": "Pasir",
        "stok": 18,
        "stokMinimum": 5,
        "satuan": "pickup",
        "harga": 390000,
        "gambar": ""
    },
    {
        "id": 404,
        "nama": "Pasir Cor Karungan (50kg)",
        "kategori": "Pasir",
        "stok": 75,
        "stokMinimum": 15,
        "satuan": "karung",
        "harga": 20000,
        "gambar": ""
    },
    {
        "id": 405,
        "nama": "Batu Split / Kerikil Cor (1 Pickup)",
        "kategori": "Pasir",
        "stok": 3,
        "stokMinimum": 5,
        "satuan": "pickup",
        "harga": 420000,
        "gambar": ""
    },
    {
        "id": 406,
        "nama": "Batu Split Karungan (50kg)",
        "kategori": "Pasir",
        "stok": 60,
        "stokMinimum": 15,
        "satuan": "karung",
        "harga": 22000,
        "gambar": ""
    },
    {
        "id": 501,
        "nama": "Bata Merah Bakar Berkualitas",
        "kategori": "Bata",
        "stok": 15000,
        "stokMinimum": 2000,
        "satuan": "buah",
        "harga": 850,
        "gambar": ""
    },
    {
        "id": 502,
        "nama": "Bata Ringan (Hebel) AAC 7.5cm",
        "kategori": "Bata",
        "stok": 1200,
        "stokMinimum": 200,
        "satuan": "buah",
        "harga": 8500,
        "gambar": ""
    },
    {
        "id": 503,
        "nama": "Bata Ringan (Hebel) AAC 10cm",
        "kategori": "Bata",
        "stok": 1500,
        "stokMinimum": 200,
        "satuan": "buah",
        "harga": 9500,
        "gambar": ""
    },
    {
        "id": 504,
        "nama": "Batako Press Semen",
        "kategori": "Bata",
        "stok": 120,
        "stokMinimum": 150,
        "satuan": "buah",
        "harga": 3500,
        "gambar": ""
    },
    {
        "id": 601,
        "nama": "Cat Tembok Paragon 5kg",
        "kategori": "Cat",
        "stok": 65,
        "stokMinimum": 15,
        "satuan": "kaleng",
        "harga": 115000,
        "gambar": "",
        "pilihanWarna": [
            "Putih Salju",
            "Putih Tulang",
            "Krem Lembut",
            "Abu-abu Modern",
            "Biru Cerah",
            "Hijau Muda",
            "Kuning Mentari"
        ]
    },
    {
        "id": 602,
        "nama": "Cat Pelapis Anti Bocor No Drop 4kg",
        "kategori": "Cat",
        "stok": 50,
        "stokMinimum": 12,
        "satuan": "kaleng",
        "harga": 215000,
        "gambar": "",
        "pilihanWarna": [
            "Abu-abu (002)",
            "Transparan (001)",
            "Putih (010)",
            "Hitam (009)",
            "Biru (008)",
            "Hijau (007)",
            "Cokelat (006)"
        ]
    },
    {
        "id": 603,
        "nama": "Cat Kayu & Besi Avian 1kg",
        "kategori": "Cat",
        "stok": 70,
        "stokMinimum": 15,
        "satuan": "kaleng",
        "harga": 68000,
        "gambar": "",
        "pilihanWarna": [
            "Putih Kilap (SW)",
            "Hitam Kilap (SB)",
            "Coklat Kayu (650)",
            "Hijau Daun (732)",
            "Biru Langit (540)",
            "Merah Cerah (110)",
            "Kuning (301)"
        ]
    },
    {
        "id": 604,
        "nama": "Cat Tembok Mowilex Emulsion 2.5L",
        "kategori": "Cat",
        "stok": 7,
        "stokMinimum": 10,
        "satuan": "kaleng",
        "harga": 245000,
        "gambar": "",
        "pilihanWarna": [
            "White E-1000",
            "Ivory E-100",
            "Morning Dew",
            "Platinum Grey",
            "Warm White",
            "Ocean Blue"
        ]
    },
    {
        "id": 605,
        "nama": "Thinner B Super 1 Liter",
        "kategori": "Cat",
        "stok": 55,
        "stokMinimum": 15,
        "satuan": "kaleng",
        "harga": 28000,
        "gambar": ""
    },
    {
        "id": 701,
        "nama": "Seng Talang BJLS Lebar 90cm",
        "kategori": "Seng",
        "stok": 200,
        "stokMinimum": 30,
        "satuan": "meter",
        "harga": 32000,
        "gambar": ""
    },
    {
        "id": 702,
        "nama": "Seng Gelombang BJLS 0.20mm (1.8m)",
        "kategori": "Seng",
        "stok": 90,
        "stokMinimum": 20,
        "satuan": "lembar",
        "harga": 58000,
        "gambar": ""
    },
    {
        "id": 703,
        "nama": "Seng Galvalum Spandek 0.30mm (3m)",
        "kategori": "Seng",
        "stok": 10,
        "stokMinimum": 15,
        "satuan": "lembar",
        "harga": 110000,
        "gambar": ""
    },
    {
        "id": 704,
        "nama": "Plat Seng Galvalum Polos 0.30mm",
        "kategori": "Seng",
        "stok": 150,
        "stokMinimum": 25,
        "satuan": "meter",
        "harga": 38000,
        "gambar": ""
    },
    {
        "id": 801,
        "nama": "Besi Beton Polos SNI 8mm (12 Meter)",
        "kategori": "Besi",
        "stok": 180,
        "stokMinimum": 30,
        "satuan": "batang",
        "harga": 48000,
        "gambar": ""
    },
    {
        "id": 802,
        "nama": "Besi Beton Polos SNI 10mm (12 Meter)",
        "kategori": "Besi",
        "stok": 150,
        "stokMinimum": 25,
        "satuan": "batang",
        "harga": 76000,
        "gambar": ""
    },
    {
        "id": 803,
        "nama": "Besi Beton Polos SNI 12mm (12 Meter)",
        "kategori": "Besi",
        "stok": 110,
        "stokMinimum": 20,
        "satuan": "batang",
        "harga": 112000,
        "gambar": ""
    },
    {
        "id": 804,
        "nama": "Besi Beton Ulir SNI 10mm (12 Meter)",
        "kategori": "Besi",
        "stok": 130,
        "stokMinimum": 25,
        "satuan": "batang",
        "harga": 79000,
        "gambar": ""
    },
    {
        "id": 805,
        "nama": "Besi Beton Ulir SNI 13mm (12 Meter)",
        "kategori": "Besi",
        "stok": 14,
        "stokMinimum": 20,
        "satuan": "batang",
        "harga": 134000,
        "gambar": ""
    },
    {
        "id": 806,
        "nama": "Kawat Bendrat Ikat Beton (1kg)",
        "kategori": "Besi",
        "stok": 80,
        "stokMinimum": 20,
        "satuan": "roll",
        "harga": 24000,
        "gambar": ""
    },
    {
        "id": 901,
        "nama": "Kanal C Galvalum Truss 0.75mm (6m)",
        "kategori": "Rangka Atap Galvalum",
        "stok": 140,
        "stokMinimum": 25,
        "satuan": "batang",
        "harga": 85000,
        "gambar": ""
    },
    {
        "id": 902,
        "nama": "Reng Galvalum 0.40mm (6m)",
        "kategori": "Rangka Atap Galvalum",
        "stok": 200,
        "stokMinimum": 35,
        "satuan": "batang",
        "harga": 38000,
        "gambar": ""
    },
    {
        "id": 903,
        "nama": "Hollow Galvalum 2x4 Plafon (4m)",
        "kategori": "Rangka Atap Galvalum",
        "stok": 160,
        "stokMinimum": 30,
        "satuan": "batang",
        "harga": 22000,
        "gambar": ""
    },
    {
        "id": 904,
        "nama": "Hollow Galvalum 4x4 Partisi (4m)",
        "kategori": "Rangka Atap Galvalum",
        "stok": 18,
        "stokMinimum": 25,
        "satuan": "batang",
        "harga": 32000,
        "gambar": ""
    },
    {
        "id": 1001,
        "nama": "Fitting Sambungan Pipa PVC Knee / L 1/2 Inch",
        "kategori": "Barang Pelengkap",
        "stok": 120,
        "stokMinimum": 25,
        "satuan": "buah",
        "harga": 3500,
        "gambar": ""
    },
    {
        "id": 1002,
        "nama": "Fitting Sambungan Pipa PVC Tee / T 1/2 Inch",
        "kategori": "Barang Pelengkap",
        "stok": 100,
        "stokMinimum": 20,
        "satuan": "buah",
        "harga": 4500,
        "gambar": ""
    },
    {
        "id": 1003,
        "nama": "Gergaji Kayu Manual 18 Inch Gagang Karet",
        "kategori": "Barang Pelengkap",
        "stok": 0,
        "stokMinimum": 8,
        "satuan": "buah",
        "harga": 48000,
        "gambar": ""
    },
    {
        "id": 1004,
        "nama": "Cetok Semen Lancip Gagang Kayu",
        "kategori": "Barang Pelengkap",
        "stok": 45,
        "stokMinimum": 10,
        "satuan": "buah",
        "harga": 18000,
        "gambar": ""
    },
    {
        "id": 1005,
        "nama": "Lem Kayu Rajawali Putih 1kg",
        "kategori": "Barang Pelengkap",
        "stok": 50,
        "stokMinimum": 12,
        "satuan": "bungkus",
        "harga": 25000,
        "gambar": ""
    },
    {
        "id": 1006,
        "nama": "Kuas Cat Tangan 3 Inch",
        "kategori": "Barang Pelengkap",
        "stok": 120,
        "stokMinimum": 25,
        "satuan": "buah",
        "harga": 9000,
        "gambar": ""
    },
    {
        "id": 1007,
        "nama": "Kuas Cat Tangan 2 Inch",
        "kategori": "Barang Pelengkap",
        "stok": 100,
        "stokMinimum": 20,
        "satuan": "buah",
        "harga": 6000,
        "gambar": ""
    },
    {
        "id": 1008,
        "nama": "Engsel Pintu Stainless Steel 4 Inch (1 Pasang)",
        "kategori": "Barang Pelengkap",
        "stok": 60,
        "stokMinimum": 15,
        "satuan": "pasang",
        "harga": 28000,
        "gambar": ""
    },
    {
        "id": 1009,
        "nama": "Skrup Gypsum / GRC 1 Inch (1 Kotak)",
        "kategori": "Barang Pelengkap",
        "stok": 70,
        "stokMinimum": 15,
        "satuan": "kotak",
        "harga": 35000,
        "gambar": ""
    },
    {
        "id": 1010,
        "nama": "Skrup Roofing Baja Ringan 5cm (1 Kotak)",
        "kategori": "Barang Pelengkap",
        "stok": 80,
        "stokMinimum": 20,
        "satuan": "kotak",
        "harga": 42000,
        "gambar": ""
    },
    {
        "id": 1011,
        "nama": "Terpal Plastik Biru Silver A3 (3x4 Meter)",
        "kategori": "Barang Pelengkap",
        "stok": 4,
        "stokMinimum": 6,
        "satuan": "lembar",
        "harga": 65000,
        "gambar": ""
    },
    {
        "id": 1012,
        "nama": "Slot Pintu / Grendel Stainless 3 Inch",
        "kategori": "Barang Pelengkap",
        "stok": 50,
        "stokMinimum": 12,
        "satuan": "buah",
        "harga": 16000,
        "gambar": ""
    },
    {
        "id": 1013,
        "nama": "Paku Kayu Campur 5-10cm (Per Kg)",
        "kategori": "Barang Pelengkap",
        "stok": 150,
        "stokMinimum": 30,
        "satuan": "kg",
        "harga": 19000,
        "gambar": ""
    },
    {
        "id": 1014,
        "nama": "Paku Seng Payung (Per Kg)",
        "kategori": "Barang Pelengkap",
        "stok": 80,
        "stokMinimum": 20,
        "satuan": "kg",
        "harga": 28000,
        "gambar": ""
    },
    {
        "id": 1015,
        "nama": "Paku Beton Hitam 3 Inch (Per Kotak)",
        "kategori": "Barang Pelengkap",
        "stok": 60,
        "stokMinimum": 15,
        "satuan": "kotak",
        "harga": 22000,
        "gambar": ""
    },
    {
        "id": 1016,
        "nama": "Meteran Roll Karet 5 Meter",
        "kategori": "Barang Pelengkap",
        "stok": 5,
        "stokMinimum": 8,
        "satuan": "buah",
        "harga": 24000,
        "gambar": ""
    },
    {
        "id": 1101,
        "nama": "Asbes Polos Datar 1x1 Meter",
        "kategori": "Asbes",
        "stok": 0,
        "stokMinimum": 15,
        "satuan": "lembar",
        "harga": 32000,
        "gambar": ""
    },
    {
        "id": 1102,
        "nama": "Asbes Gelombang Djabesmen 1.8 Meter",
        "kategori": "Asbes",
        "stok": 90,
        "stokMinimum": 20,
        "satuan": "lembar",
        "harga": 55000,
        "gambar": ""
    },
    {
        "id": 1103,
        "nama": "Papan Gipsum Jayaboard 9mm (1.2 x 2.4m)",
        "kategori": "Asbes",
        "stok": 70,
        "stokMinimum": 15,
        "satuan": "lembar",
        "harga": 72000,
        "gambar": ""
    },
    {
        "id": 1104,
        "nama": "Kalsiboard Dinding & Plafon 3.5mm (1.2 x 2.4m)",
        "kategori": "Asbes",
        "stok": 85,
        "stokMinimum": 20,
        "satuan": "lembar",
        "harga": 58000,
        "gambar": ""
    },
    {
        "id": 1201,
        "nama": "Genteng Karang Pilang Asli",
        "kategori": "Genteng",
        "stok": 3000,
        "stokMinimum": 500,
        "satuan": "buah",
        "harga": 3200,
        "gambar": ""
    },
    {
        "id": 1202,
        "nama": "Genteng Beton Flat Minimalis",
        "kategori": "Genteng",
        "stok": 2500,
        "stokMinimum": 400,
        "satuan": "buah",
        "harga": 5500,
        "gambar": ""
    },
    {
        "id": 1301,
        "nama": "Keramik Lantai 40x40 Putih Polos (1 Dus)",
        "kategori": "Keramik",
        "stok": 120,
        "stokMinimum": 25,
        "satuan": "dus",
        "harga": 58000,
        "gambar": ""
    },
    {
        "id": 1302,
        "nama": "Keramik Lantai 40x40 Motif Marmer (1 Dus)",
        "kategori": "Keramik",
        "stok": 16,
        "stokMinimum": 20,
        "satuan": "dus",
        "harga": 66000,
        "gambar": ""
    },
    {
        "id": 1303,
        "nama": "Semen Nat Keramik Pengisi Nat 1kg",
        "kategori": "Keramik",
        "stok": 80,
        "stokMinimum": 15,
        "satuan": "bungkus",
        "harga": 12000,
        "gambar": ""
    }
];

/**
 * Migrasi otomatis data kategori dan barang ke versi data lengkap toko.
 */
if (typeof localStorage !== 'undefined') {
    try {
        const versiApp = localStorage.getItem(STORAGE_KEY_VERSI);
        if (versiApp !== CURRENT_DATA_VERSION) {
            localStorage.setItem(STORAGE_KEY_BARANG, JSON.stringify(DEFAULT_BARANG));
            localStorage.setItem(STORAGE_KEY_KATEGORI, JSON.stringify(DEFAULT_KATEGORI));
            localStorage.setItem(STORAGE_KEY_VERSI, CURRENT_DATA_VERSION);
        }
    } catch (e) {
        console.warn('Gagal memuat data awal toko:', e);
    }
}

/**
 * Inisialisasi data kategori awal di localStorage jika belum pernah ada.
 */
function inisialisasiKategoriStore() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_KATEGORI);
        if (!raw || raw === '[]') {
            localStorage.setItem(STORAGE_KEY_KATEGORI, JSON.stringify(DEFAULT_KATEGORI));
        }
    } catch (e) {
        console.error("Gagal inisialisasi kategori store:", e);
    }
}

/**
 * Mengambil seluruh daftar kategori dari localStorage ('sb_kategori').
 * @returns {Array} Array objek kategori { id, nama, ikon }
 */
function getKategori() {
    inisialisasiKategoriStore();
    try {
        const raw = localStorage.getItem(STORAGE_KEY_KATEGORI);
        const data = raw ? JSON.parse(raw) : [];
        return Array.isArray(data) && data.length > 0 ? data : DEFAULT_KATEGORI;
    } catch (e) {
        console.error("Gagal membaca kategori dari localStorage:", e);
        return DEFAULT_KATEGORI;
    }
}

/**
 * Menyimpan array kategori ke localStorage.
 * @param {Array} daftarKategori 
 */
function simpanSemuaKategori(daftarKategori) {
    localStorage.setItem(STORAGE_KEY_KATEGORI, JSON.stringify(daftarKategori));
}

/**
 * Mengambil nama ikon Bootstrap Icons berdasarkan nama kategori.
 * @param {string} namaKategori 
 * @returns {string}
 */
function getIkonKategori(namaKategori) {
    const list = getKategori();
    const kat = list.find(k => k.nama.toLowerCase() === String(namaKategori || '').toLowerCase());
    return kat ? kat.ikon : "bi-box-seam";
}

/**
 * Mengecek apakah suatu kategori dilindungi.
 * Saat ini seluruh kategori dapat diubah dan dihapus secara bebas oleh admin.
 * @param {Object|string} kategori 
 * @returns {boolean}
 */
function isKategoriDilindungi(kategori) {
    return false;
}

/**
 * Menghitung berapa banyak barang di katalog ('sb_barang') yang berada di bawah kategori ini.
 * @param {string} namaKategori 
 * @returns {number}
 */
function hitungBarangDiKategori(namaKategori) {
    const target = String(namaKategori || '').trim().toLowerCase();
    const daftarBarang = getBarang();
    return daftarBarang.filter(b => String(b.kategori || '').trim().toLowerCase() === target).length;
}

/**
 * Menambahkan kategori baru ke dalam daftar.
 * @param {Object} param0 { nama, ikon }
 * @returns {Object} { success: boolean, message?: string, data?: Object }
 */
function tambahKategori({ nama, ikon }) {
    const namaBersih = String(nama || '').trim();
    const ikonBersih = String(ikon || 'bi-box-seam').trim();

    if (namaBersih.length < 2 || namaBersih.length > 30) {
        return { success: false, message: "Nama kategori harus terdiri dari 2 sampai 30 karakter." };
    }

    const daftar = getKategori();
    const duplikat = daftar.some(k => k.nama.toLowerCase() === namaBersih.toLowerCase());
    if (duplikat) {
        return { success: false, message: `Kategori "${namaBersih}" sudah ada. Gunakan nama yang berbeda.` };
    }

    const itemBaru = {
        id: Date.now(),
        nama: namaBersih,
        ikon: ikonBersih || "bi-box-seam"
    };

    daftar.push(itemBaru);
    simpanSemuaKategori(daftar);
    return { success: true, data: itemBaru };
}

/**
 * Mengubah nama atau ikon kategori berdasarkan ID.
 * @param {number|string} id 
 * @param {Object} param1 { nama, ikon }
 * @returns {Object} { success: boolean, message?: string, data?: Object }
 */
function ubahKategori(id, { nama, ikon }) {
    const namaBersih = String(nama || '').trim();
    const ikonBersih = String(ikon || '').trim();

    if (namaBersih.length < 2 || namaBersih.length > 30) {
        return { success: false, message: "Nama kategori harus terdiri dari 2 sampai 30 karakter." };
    }

    const daftar = getKategori();
    const index = daftar.findIndex(k => String(k.id) === String(id));
    if (index === -1) {
        return { success: false, message: "Kategori tidak ditemukan." };
    }

    const namaLama = daftar[index].nama;
    const duplikat = daftar.some(k => String(k.id) !== String(id) && k.nama.toLowerCase() === namaBersih.toLowerCase());
    if (duplikat) {
        return { success: false, message: `Kategori "${namaBersih}" sudah digunakan oleh kategori lain.` };
    }

    daftar[index].nama = namaBersih;
    if (ikonBersih) daftar[index].ikon = ikonBersih;
    simpanSemuaKategori(daftar);

    if (namaLama.toLowerCase() !== namaBersih.toLowerCase()) {
        const semuaBarang = getBarang();
        let adaBarangDiubah = false;
        semuaBarang.forEach(b => {
            if (String(b.kategori || '').toLowerCase() === namaLama.toLowerCase()) {
                b.kategori = namaBersih;
                adaBarangDiubah = true;
            }
        });
        if (adaBarangDiubah) {
            simpanSemuaBarang(semuaBarang);
        }
    }

    return { success: true, data: daftar[index] };
}

/**
 * Menghapus kategori berdasarkan ID.
 * @param {number|string} id 
 * @returns {Object} { success: boolean, message?: string, totalDipindahkan?: number, kategoriTujuan?: string }
 */
function hapusKategori(id) {
    const daftar = getKategori();
    const index = daftar.findIndex(k => String(k.id) === String(id));
    if (index === -1) {
        return { success: false, message: "Kategori tidak ditemukan." };
    }

    const targetKategori = daftar[index];
    const namaTarget = targetKategori.nama;

    daftar.splice(index, 1);
    simpanSemuaKategori(daftar);

    const kategoriTujuan = daftar.length > 0 ? daftar[0].nama : "Umum";
    const semuaBarang = getBarang();
    let totalDipindahkan = 0;

    semuaBarang.forEach(b => {
        if (String(b.kategori || '').toLowerCase() === namaTarget.toLowerCase()) {
            b.kategori = kategoriTujuan;
            totalDipindahkan++;
        }
    });

    if (totalDipindahkan > 0) {
        simpanSemuaBarang(semuaBarang);
    }

    return { success: true, totalDipindahkan: totalDipindahkan, kategoriTujuan: kategoriTujuan };
}

/**
 * Menebak kategori material secara otomatis berdasarkan kata kunci pada nama barang.
 * @param {string} nama 
 * @returns {string} Nama kategori aktif
 */
function tebakKategori(nama) {
    const lower = String(nama || '').toLowerCase();
    let hasil = "";

    if (lower.includes('semen') || lower.includes('mortar') || lower.includes('cornice') || lower.includes('calsium') || lower.includes('kalsium') || lower.includes('acian')) hasil = "Semen";
    else if (lower.includes('pasir') || lower.includes('split') || lower.includes('kerikil') || lower.includes('koral')) hasil = "Pasir";
    else if (lower.includes('bata') || lower.includes('hebel') || lower.includes('batako')) hasil = "Bata";
    else if (lower.includes('cat') || lower.includes('thinner') || lower.includes('mowilex') || lower.includes('paragon') || lower.includes('avian') || lower.includes('no drop')) hasil = "Cat";
    else if (lower.includes('keramik') || lower.includes('granit') || lower.includes('nat')) hasil = "Keramik";
    else if (lower.includes('genteng')) hasil = "Genteng";
    else if (lower.includes('seng') || lower.includes('spandek')) hasil = "Seng";
    else if (lower.includes('kanal') || lower.includes('hollow') || lower.includes('holo') || lower.includes('rangka atap') || (lower.includes('reng') && lower.includes('galvalum'))) hasil = "Rangka Atap Galvalum";
    else if (lower.includes('besi') || lower.includes('bendrat') || lower.includes('beton polos') || lower.includes('beton ulir')) hasil = "Besi";
    else if (lower.includes('kayu') || lower.includes('meranti') || lower.includes('kamper') || lower.includes('sengon') || lower.includes('kaso')) hasil = "Kayu";
    else if (lower.includes('pipa') || lower.includes('maspion') || lower.includes('rucika') || lower.includes('paralon')) hasil = "Pipa";
    else if (lower.includes('asbes') || lower.includes('gipsum') || lower.includes('gypsum') || lower.includes('kalsiboard')) hasil = "Asbes";
    else if (lower.includes('fitting') || lower.includes('gergaji') || lower.includes('cetok') || lower.includes('lem') || lower.includes('kuas') || lower.includes('engsel') || lower.includes('skrup') || lower.includes('terpal') || lower.includes('slot') || lower.includes('paku') || lower.includes('meteran')) hasil = "Barang Pelengkap";

    const daftarAktif = getKategori();
    const match = daftarAktif.find(k => k.nama.toLowerCase() === hasil.toLowerCase());
    if (match) return match.nama;
    return daftarAktif.length > 0 ? daftarAktif[0].nama : "Umum";
}

/**
 * Mendapatkan satuan barang yang sesuai.
 * @param {Object} barang 
 * @returns {string}
 */
function getSatuanBarang(barang) {
    if (barang && barang.satuan && String(barang.satuan).trim()) {
        return String(barang.satuan).trim();
    }
    const nama = (barang && barang.nama) ? String(barang.nama).toLowerCase() : '';
    if (nama.includes('semen') || nama.includes('mortar') || nama.includes('cornice') || nama.includes('calsium') || nama.includes('acian')) return 'sak';
    if (nama.includes('pickup')) return 'pickup';
    if (nama.includes('karung') || nama.includes('pasir') || nama.includes('split')) return 'karung';
    if (nama.includes('besi') || nama.includes('pipa') || nama.includes('kayu') || nama.includes('kaso') || nama.includes('hollow') || nama.includes('kanal') || nama.includes('reng')) return 'batang';
    if (nama.includes('keramik') || nama.includes('granit')) return 'dus';
    if (nama.includes('cat') || nama.includes('thinner')) return 'kaleng';
    if (nama.includes('paku') || nama.includes('per kg')) return 'kg';
    if (nama.includes('bata') || nama.includes('batako') || nama.includes('genteng') || nama.includes('cetok') || nama.includes('gergaji') || nama.includes('kuas') || nama.includes('slot') || nama.includes('meteran') || nama.includes('fitting')) return 'buah';
    if (nama.includes('seng') || nama.includes('asbes') || nama.includes('gipsum') || nama.includes('kalsiboard') || nama.includes('terpal') || nama.includes('papan')) return 'lembar';
    if (nama.includes('roll') || nama.includes('bendrat')) return 'roll';
    if (nama.includes('meter')) return 'meter';
    if (nama.includes('pasang') || nama.includes('engsel')) return 'pasang';
    if (nama.includes('kotak') || nama.includes('skrup')) return 'kotak';
    if (nama.includes('bungkus') || nama.includes('lem rajawali') || nama.includes('semen nat')) return 'bungkus';
    return 'pcs';
}

/**
 * Inisialisasi data awal barang di localStorage.
 */
function inisialisasiStokStore() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_BARANG);
        const versi = localStorage.getItem(STORAGE_KEY_VERSI);
        if (!raw || raw === '[]' || versi !== CURRENT_DATA_VERSION) {
            localStorage.setItem(STORAGE_KEY_BARANG, JSON.stringify(DEFAULT_BARANG));
            localStorage.setItem(STORAGE_KEY_VERSI, CURRENT_DATA_VERSION);
        }
    } catch (e) {
        console.error("Gagal inisialisasi stok store:", e);
    }
}

/**
 * Mengambil seluruh data barang dari localStorage.
 */
function getBarang() {
    inisialisasiStokStore();
    try {
        const raw = localStorage.getItem(STORAGE_KEY_BARANG);
        const data = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(data) || data.length === 0) {
            return DEFAULT_BARANG;
        }

        let updated = false;
        const normalized = data.map(item => {
            let itemUpdated = false;
            if (!item.satuan) {
                item.satuan = getSatuanBarang(item);
                itemUpdated = true;
            }
            if (!item.kategori) {
                item.kategori = tebakKategori(item.nama);
                itemUpdated = true;
            }
            if (itemUpdated) updated = true;
            return item;
        });

        if (updated) {
            simpanSemuaBarang(normalized);
        }

        return normalized;
    } catch (e) {
        console.error("Gagal membaca data dari localStorage:", e);
        return DEFAULT_BARANG;
    }
}

/**
 * Menyimpan array barang ke dalam localStorage.
 * @param {Array} daftarBarang 
 */
function simpanSemuaBarang(daftarBarang) {
    localStorage.setItem(STORAGE_KEY_BARANG, JSON.stringify(daftarBarang));
}

/**
 * Menambahkan barang baru ke dalam daftar.
 * @param {Object} data { nama, kategori, stok, stokMinimum, satuan, harga, gambar, pilihanWarna }
 * @returns {Object} Barang baru yang berhasil ditambahkan
 */
function tambahBarang(data) {
    const daftar = getBarang();
    const itemBaru = {
        id: Date.now(),
        nama: String(data.nama).trim(),
        kategori: String(data.kategori || tebakKategori(data.nama)).trim(),
        stok: parseInt(data.stok, 10) || 0,
        stokMinimum: parseInt(data.stokMinimum, 10) || 0,
        satuan: String(data.satuan || getSatuanBarang(data)).trim(),
        harga: parseInt(data.harga, 10) || 0,
        gambar: String(data.gambar || '').trim(),
        pilihanWarna: Array.isArray(data.pilihanWarna) ? data.pilihanWarna : []
    };

    daftar.push(itemBaru);
    simpanSemuaBarang(daftar);
    return itemBaru;
}

/**
 * Mengubah data barang berdasarkan ID.
 * @param {number|string} id 
 * @param {Object} data { nama, kategori, stok, stokMinimum, satuan, harga, gambar, pilihanWarna }
 * @returns {Object|null} Barang setelah diperbarui
 */
function ubahBarang(id, data) {
    const daftar = getBarang();
    const index = daftar.findIndex(b => String(b.id) === String(id));
    if (index === -1) return null;

    daftar[index] = {
        ...daftar[index],
        nama: data.nama !== undefined ? String(data.nama).trim() : daftar[index].nama,
        kategori: data.kategori !== undefined ? String(data.kategori).trim() : daftar[index].kategori,
        stok: data.stok !== undefined ? (parseInt(data.stok, 10) || 0) : daftar[index].stok,
        stokMinimum: data.stokMinimum !== undefined ? (parseInt(data.stokMinimum, 10) || 0) : daftar[index].stokMinimum,
        satuan: data.satuan !== undefined ? String(data.satuan || getSatuanBarang(data)).trim() : daftar[index].satuan,
        harga: data.harga !== undefined ? (parseInt(data.harga, 10) || 0) : daftar[index].harga,
        gambar: data.gambar !== undefined ? String(data.gambar || '').trim() : (daftar[index].gambar || '')
    };

    if (data.pilihanWarna !== undefined) {
        daftar[index].pilihanWarna = Array.isArray(data.pilihanWarna) ? data.pilihanWarna : [];
    }

    simpanSemuaBarang(daftar);
    return daftar[index];
}

/**
 * Menghapus barang dari daftar berdasarkan ID.
 * @param {number|string} id 
 * @returns {boolean} True jika berhasil dihapus
 */
function hapusBarang(id) {
    const daftar = getBarang();
    const sisa = daftar.filter(b => String(b.id) !== String(id));
    if (sisa.length === daftar.length) return false;

    simpanSemuaBarang(sisa);
    return true;
}

/**
 * Mengurangi jumlah stok barang di toko setelah proses pembelian/pemesanan berhasil.
 * @param {Array|Object} itemsDaftarPembelian
 * @returns {Array} Daftar barang yang stoknya berhasil dikurangi
 */
function kurangiStokPembelian(itemsDaftarPembelian) {
    if (!itemsDaftarPembelian) return [];
    const daftar = getBarang();
    const list = Array.isArray(itemsDaftarPembelian) ? itemsDaftarPembelian : [itemsDaftarPembelian];
    const barangTerkurang = [];

    list.forEach(item => {
        const idRaw = item.idMasterBarang !== undefined ? item.idMasterBarang : (item.idBarang !== undefined ? item.idBarang : item.id);
        const id = String(idRaw).split('_')[0];
        const qtyBeli = parseInt(item.jumlah, 10) || 0;
        if (!id || qtyBeli <= 0) return;

        let index = daftar.findIndex(b => String(b.id) === String(id));
        if (index === -1 && item.nama) {
            const namaClean = String(item.nama).replace(/\s*\([^)]*\)\s*$/, '').trim().toLowerCase();
            index = daftar.findIndex(b => b.nama.trim().toLowerCase() === namaClean);
        }

        if (index !== -1) {
            const stokLama = parseInt(daftar[index].stok, 10) || 0;
            const stokBaru = Math.max(0, stokLama - qtyBeli);
            daftar[index].stok = stokBaru;
            barangTerkurang.push({
                id: daftar[index].id,
                nama: daftar[index].nama,
                satuan: daftar[index].satuan,
                stokLama: stokLama,
                stokBaru: stokBaru,
                qtyBeli: qtyBeli
            });
        }
    });

    if (barangTerkurang.length > 0) {
        simpanSemuaBarang(daftar);
        try {
            window.dispatchEvent(new CustomEvent('stokDiperbarui', { detail: barangTerkurang }));
        } catch (e) {}
    }

    return barangTerkurang;
}

/**
 * Menghitung status stok barang secara otomatis.
 * @param {Object} barang 
 * @returns {"Habis" | "Menipis" | "Aman"}
 */
function hitungStatus(barang) {
    const stok = parseInt(barang.stok, 10) || 0;
    const stokMin = parseInt(barang.stokMinimum, 10) || 0;

    if (stok <= 0) {
        return "Habis";
    }
    if (stok <= stokMin) {
        return "Menipis";
    }
    return "Aman";
}

/**
 * Mengelompokkan seluruh barang berdasarkan kategori.
 * @returns {Object} { [namaKategori]: [barang1, barang2, ...] }
 */
function getBarangPerKategori() {
    const daftar = getBarang();
    const hasil = {};

    getKategori().forEach(kat => {
        const items = daftar.filter(b => (b.kategori || tebakKategori(b.nama)).toLowerCase() === kat.nama.toLowerCase());
        if (items.length > 0) {
            hasil[kat.nama] = items;
        }
    });

    return hasil;
}

/**
 * Menghitung jumlah barang untuk masing-masing kategori.
 * @returns {Object} { [namaKategori]: totalBarang }
 */
function hitungPerKategori() {
    const daftar = getBarang();
    const counts = {};

    getKategori().forEach(kat => {
        counts[kat.nama] = 0;
    });

    daftar.forEach(b => {
        const katNama = b.kategori || tebakKategori(b.nama);
        const matchKat = getKategori().find(k => k.nama.toLowerCase() === katNama.toLowerCase());
        const key = matchKat ? matchKat.nama : "Lainnya";
        counts[key] = (counts[key] || 0) + 1;
    });

    return counts;
}

/**
 * Memformat angka nominal ke dalam format mata uang Rupiah Indonesia.
 * @param {number} angka 
 * @returns {string}
 */
function formatRupiah(angka) {
    const nominal = parseInt(angka, 10) || 0;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(nominal).replace(/\s/g, ' ');
}

// Inisialisasi awal saat skrip dimuat
inisialisasiKategoriStore();
inisialisasiStokStore();
