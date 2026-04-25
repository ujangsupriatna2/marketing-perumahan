import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@brr.co.id' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@brr.co.id',
      password: hashedPassword,
      role: 'superadmin',
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // Create settings
  const settingsData = [
    { key: 'company_name', value: 'Bandung Raya Residence', label: 'Nama Perusahaan', group: 'general' },
    { key: 'company_legal_name', value: 'PT Bumi Sanggar Meubel', label: 'Nama Legal', group: 'general' },
    { key: 'total_units_sold', value: '150+', label: 'Total Unit Terjual', group: 'general' },
    { key: 'contact_phone', value: '+62 812-3456-7890', label: 'Telepon', group: 'contact' },
    { key: 'contact_email', value: 'info@bandungrayaresidence.com', label: 'Email', group: 'contact' },
    { key: 'contact_wa', value: '6281234567890', label: 'WhatsApp', group: 'contact' },
    { key: 'contact_address', value: 'Jl. Raya Bandung-Sumedang, Kec. Cileunyi, Kabupaten Bandung, Jawa Barat 40393', label: 'Alamat', group: 'contact' },
    { key: 'contact_person', value: 'Marketing BRR', label: 'Contact Person', group: 'contact' },
    { key: 'map_latitude', value: '-6.9278', label: 'Latitude', group: 'map' },
    { key: 'map_longitude', value: '107.6340', label: 'Longitude', group: 'map' },
    { key: 'social_instagram', value: 'https://instagram.com/bandungrayaresidence', label: 'Instagram', group: 'social' },
    { key: 'social_facebook', value: 'https://facebook.com/bandungrayaresidence', label: 'Facebook', group: 'social' },
    { key: 'social_youtube', value: 'https://youtube.com/@bandungrayaresidence', label: 'YouTube', group: 'social' },
    { key: 'social_tiktok', value: 'https://tiktok.com/@bandungrayaresidence', label: 'TikTok', group: 'social' },
  ];

  for (const s of settingsData) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log(`✅ Settings created: ${settingsData.length}`);

  // Create properties
  const properties = [
    {
      name: 'Tipe Majapahit 21/50',
      slug: 'tipe-majapahit-21-50',
      type: '21/50',
      category: 'siap_huni',
      price: 226,
      location: 'Bandung Raya Residence',
      bedrooms: 1,
      bathrooms: 1,
      landArea: 50,
      buildingArea: 21,
      description: 'Rumah mungil dan minimalis dengan desain modern. Cocok untuk pasangan muda atau investasi. Dilengkapi dengan 1 kamar tidur dan 1 kamar mandi.',
      features: JSON.stringify(['Carport', 'Taman Depan', 'Listrik 1300W', 'Air PDAM']),
      images: JSON.stringify(['/images/properties/type-21.png']),
      tag: 'Best Seller',
      installment: 'Mulai Rp 3jt/bln',
      financingTypes: JSON.stringify(['syariah', 'kpr']),
      dpOptions: JSON.stringify([30, 35, 40, 45, 50]),
      tenorOptions: JSON.stringify([1, 2, 3, 4, 5]),
      installments: JSON.stringify({ '30': { '1': 5.3, '2': 2.8, '3': 2.0, '4': 1.5, '5': 1.3 }, '35': { '1': 4.9, '2': 2.6, '3': 1.9, '4': 1.4, '5': 1.2 }, '40': { '1': 4.5, '2': 2.4, '3': 1.7, '4': 1.3, '5': 1.1 }, '45': { '1': 4.2, '2': 2.2, '3': 1.6, '4': 1.2, '5': 1.0 }, '50': { '1': 3.8, '2': 2.0, '3': 1.5, '4': 1.1, '5': 0.9 } }),
      syariahMargin: 15,
      kprDpOptions: JSON.stringify([0, 10, 15, 20, 25, 30]),
      kprTenorOptions: JSON.stringify([5, 10, 15, 20, 25]),
      kprInstallments: JSON.stringify({ '0': { '5': 5.2, '10': 2.9, '15': 2.1, '20': 1.7, '25': 1.5 }, '10': { '5': 4.7, '10': 2.6, '15': 1.9, '20': 1.5, '25': 1.3 }, '15': { '5': 4.2, '10': 2.3, '15': 1.7, '20': 1.4, '25': 1.2 }, '20': { '5': 3.7, '10': 2.1, '15': 1.5, '20': 1.2, '25': 1.0 }, '25': { '5': 3.3, '10': 1.8, '15': 1.3, '20': 1.1, '25': 0.9 }, '30': { '5': 2.8, '10': 1.6, '15': 1.1, '20': 0.9, '25': 0.8 } }),
      isFeatured: true,
      status: 'available',
    },
    {
      name: 'Tipe E9 28/60',
      slug: 'tipe-e9-28-60',
      type: '28/60',
      category: 'siap_huni',
      price: 290,
      location: 'Bandung Raya Residence',
      bedrooms: 2,
      bathrooms: 1,
      landArea: 60,
      buildingArea: 28,
      description: 'Rumah tipe 28 dengan 2 kamar tidur yang luas. Desain modern dengan taman depan dan carport. Ideal untuk keluarga kecil.',
      features: JSON.stringify(['2 Kamar Tidur', 'Carport', 'Taman Depan', 'Listrik 1300W', 'Air PDAM', 'Dapur']),
      images: JSON.stringify(['/images/properties/e9.png']),
      tag: 'Populer',
      installment: 'Mulai Rp 4jt/bln',
      financingTypes: JSON.stringify(['syariah', 'kpr']),
      dpOptions: JSON.stringify([30, 35, 40, 45, 50]),
      tenorOptions: JSON.stringify([1, 2, 3, 4, 5]),
      installments: JSON.stringify({ '30': { '1': 6.8, '2': 3.6, '3': 2.5, '4': 1.9, '5': 1.6 }, '35': { '1': 6.3, '2': 3.3, '3': 2.3, '4': 1.8, '5': 1.5 }, '40': { '1': 5.8, '2': 3.1, '3': 2.2, '4': 1.6, '5': 1.4 }, '45': { '1': 5.4, '2': 2.8, '3': 2.0, '4': 1.5, '5': 1.3 }, '50': { '1': 4.9, '2': 2.6, '3': 1.9, '4': 1.4, '5': 1.2 } }),
      syariahMargin: 15,
      kprDpOptions: JSON.stringify([0, 10, 15, 20, 25, 30]),
      kprTenorOptions: JSON.stringify([5, 10, 15, 20, 25]),
      kprInstallments: JSON.stringify({ '0': { '5': 6.7, '10': 3.7, '15': 2.7, '20': 2.2, '25': 1.9 }, '10': { '5': 6.0, '10': 3.3, '15': 2.4, '20': 2.0, '25': 1.7 }, '15': { '5': 5.4, '10': 3.0, '15': 2.2, '20': 1.8, '25': 1.5 }, '20': { '5': 4.7, '10': 2.6, '15': 1.9, '20': 1.5, '25': 1.3 }, '25': { '5': 4.1, '10': 2.3, '15': 1.7, '20': 1.3, '25': 1.2 }, '30': { '5': 3.6, '10': 2.0, '15': 1.5, '20': 1.2, '25': 1.0 } }),
      isFeatured: true,
      status: 'available',
    },
    {
      name: 'Tipe TBA7 30/72',
      slug: 'tipe-tba7-30-72',
      type: '30/72',
      category: 'siap_huni',
      price: 345,
      location: 'Bandung Raya Residence',
      bedrooms: 2,
      bathrooms: 1,
      landArea: 72,
      buildingArea: 30,
      description: 'Rumah tipe 30 dengan lahan yang lebih luas. Cocok untuk keluarga yang membutuhkan ruang tambahan untuk parkir atau kebun.',
      features: JSON.stringify(['2 Kamar Tidur', 'Carport 1 Mobil', 'Taman Depan & Belakang', 'Listrik 1300W', 'Air PDAM', 'Dapur']),
      images: JSON.stringify(['/images/properties/tba7.png']),
      tag: null,
      installment: 'Mulai Rp 5jt/bln',
      financingTypes: JSON.stringify(['syariah', 'kpr']),
      dpOptions: JSON.stringify([30, 35, 40, 45, 50]),
      tenorOptions: JSON.stringify([1, 2, 3, 4, 5]),
      installments: JSON.stringify({ '30': { '1': 8.1, '2': 4.3, '3': 3.0, '4': 2.3, '5': 1.9 }, '35': { '1': 7.5, '2': 4.0, '3': 2.8, '4': 2.1, '5': 1.8 }, '40': { '1': 6.9, '2': 3.7, '3': 2.6, '4': 2.0, '5': 1.6 }, '45': { '1': 6.4, '2': 3.4, '3': 2.4, '4': 1.8, '5': 1.5 }, '50': { '1': 5.8, '2': 3.1, '3': 2.2, '4': 1.7, '5': 1.4 } }),
      syariahMargin: 15,
      kprDpOptions: JSON.stringify([0, 10, 15, 20, 25, 30]),
      kprTenorOptions: JSON.stringify([5, 10, 15, 20, 25]),
      kprInstallments: JSON.stringify({ '0': { '5': 7.9, '10': 4.4, '15': 3.2, '20': 2.6, '25': 2.3 }, '10': { '5': 7.1, '10': 4.0, '15': 2.9, '20': 2.3, '25': 2.0 }, '15': { '5': 6.4, '10': 3.6, '15': 2.6, '20': 2.1, '25': 1.8 }, '20': { '5': 5.6, '10': 3.1, '15': 2.3, '20': 1.8, '25': 1.6 }, '25': { '5': 4.9, '10': 2.7, '15': 2.0, '20': 1.6, '25': 1.4 }, '30': { '5': 4.2, '10': 2.3, '15': 1.7, '20': 1.4, '25': 1.2 } }),
      isFeatured: false,
      status: 'available',
    },
    {
      name: 'Tipe Manjah 36/78',
      slug: 'tipe-manjah-36-78',
      type: '36/78',
      category: 'siap_huni',
      price: 385,
      location: 'Bandung Raya Residence',
      bedrooms: 2,
      bathrooms: 1,
      landArea: 78,
      buildingArea: 36,
      description: 'Rumah tipe 36 dengan desain tropis modern. Dilengkapi 2 kamar tidur luas, dapur, dan area carport. Lingkungan asri dan nyaman.',
      features: JSON.stringify(['2 Kamar Tidur', '1 Kamar Mandi', 'Carport', 'Taman', 'Dapur', 'Listrik 2200W', 'Air PDAM']),
      images: JSON.stringify(['/images/properties/manjah.png']),
      tag: 'Best Seller',
      installment: 'Mulai Rp 5.5jt/bln',
      financingTypes: JSON.stringify(['syariah', 'kpr']),
      dpOptions: JSON.stringify([30, 35, 40, 45, 50]),
      tenorOptions: JSON.stringify([1, 2, 3, 4, 5]),
      installments: JSON.stringify({ '30': { '1': 9.0, '2': 4.8, '3': 3.3, '4': 2.5, '5': 2.1 }, '35': { '1': 8.4, '2': 4.4, '3': 3.1, '4': 2.3, '5': 2.0 }, '40': { '1': 7.7, '2': 4.1, '3': 2.9, '4': 2.2, '5': 1.8 }, '45': { '1': 7.1, '2': 3.7, '3': 2.6, '4': 2.0, '5': 1.7 }, '50': { '1': 6.5, '2': 3.4, '3': 2.4, '4': 1.9, '5': 1.6 } }),
      syariahMargin: 15,
      kprDpOptions: JSON.stringify([0, 10, 15, 20, 25, 30]),
      kprTenorOptions: JSON.stringify([5, 10, 15, 20, 25]),
      kprInstallments: JSON.stringify({ '0': { '5': 8.9, '10': 4.9, '15': 3.6, '20': 2.9, '25': 2.5 }, '10': { '5': 8.0, '10': 4.4, '15': 3.2, '20': 2.6, '25': 2.3 }, '15': { '5': 7.1, '10': 3.9, '15': 2.9, '20': 2.3, '25': 2.0 }, '20': { '5': 6.3, '10': 3.5, '15': 2.5, '20': 2.1, '25': 1.8 }, '25': { '5': 5.5, '10': 3.0, '15': 2.2, '20': 1.8, '25': 1.6 }, '30': { '5': 4.7, '10': 2.6, '15': 1.9, '20': 1.5, '25': 1.3 } }),
      isFeatured: true,
      status: 'available',
    },
    {
      name: 'Tipe Classic Belanda 40/90',
      slug: 'tipe-classic-belanda-40-90',
      type: '40/90',
      category: 'siap_huni',
      price: 450,
      location: 'Bandung Raya Residence',
      bedrooms: 2,
      bathrooms: 2,
      landArea: 90,
      buildingArea: 40,
      description: 'Rumah bergaya Classic Belanda dengan desain yang elegan dan timeless. 2 kamar mandi, dapur luas, dan taman yang asri. Pilihan tepat untuk keluarga yang menghargai estetika.',
      features: JSON.stringify(['2 Kamar Tidur', '2 Kamar Mandi', 'Carport 2 Mobil', 'Taman Depan & Belakang', 'Dapur Luas', 'Ruang Tamu', 'Listrik 2200W', 'Air PDAM']),
      images: JSON.stringify(['/images/properties/belanda.png']),
      tag: 'Premium',
      installment: 'Mulai Rp 6.5jt/bln',
      financingTypes: JSON.stringify(['syariah', 'kpr']),
      dpOptions: JSON.stringify([30, 35, 40, 45, 50]),
      tenorOptions: JSON.stringify([1, 2, 3, 4, 5]),
      installments: JSON.stringify({ '30': { '1': 10.6, '2': 5.6, '3': 3.9, '4': 3.0, '5': 2.5 }, '35': { '1': 9.8, '2': 5.2, '3': 3.6, '4': 2.8, '5': 2.3 }, '40': { '1': 9.0, '2': 4.8, '3': 3.3, '4': 2.6, '5': 2.1 }, '45': { '1': 8.3, '2': 4.4, '3': 3.1, '4': 2.4, '5': 2.0 }, '50': { '1': 7.6, '2': 4.0, '3': 2.8, '4': 2.2, '5': 1.8 } }),
      syariahMargin: 15,
      kprDpOptions: JSON.stringify([0, 10, 15, 20, 25, 30]),
      kprTenorOptions: JSON.stringify([5, 10, 15, 20, 25]),
      kprInstallments: JSON.stringify({ '0': { '5': 10.4, '10': 5.7, '15': 4.2, '20': 3.4, '25': 2.9 }, '10': { '5': 9.3, '10': 5.2, '15': 3.8, '20': 3.1, '25': 2.6 }, '15': { '5': 8.3, '10': 4.6, '15': 3.4, '20': 2.7, '25': 2.4 }, '20': { '5': 7.3, '10': 4.0, '15': 3.0, '20': 2.4, '25': 2.1 }, '25': { '5': 6.4, '10': 3.5, '15': 2.6, '20': 2.1, '25': 1.8 }, '30': { '5': 5.5, '10': 3.0, '15': 2.2, '20': 1.8, '25': 1.6 } }),
      isFeatured: true,
      status: 'available',
    },
    {
      name: 'Tipe D39 36/84',
      slug: 'tipe-d39-36-84',
      type: '36/84',
      category: 'inden',
      price: 425,
      location: 'Bandung Raya Residence',
      bedrooms: 2,
      bathrooms: 1,
      landArea: 84,
      buildingArea: 36,
      description: 'Rumah inden tipe 36 dengan lahan luas 84m². Desain modern minimalis dengan plafon tinggi. Bisa custom sesuai keinginan.',
      features: JSON.stringify(['2 Kamar Tidur', '1 Kamar Mandi', 'Carport', 'Taman', 'Dapur', 'Listrik 2200W', 'Air PDAM', 'Custom Interior']),
      images: JSON.stringify(['/images/properties/d39.png']),
      tag: null,
      installment: 'Mulai Rp 6jt/bln',
      financingTypes: JSON.stringify(['syariah', 'kpr']),
      dpOptions: JSON.stringify([30, 35, 40, 45, 50]),
      tenorOptions: JSON.stringify([1, 2, 3, 4, 5]),
      installments: JSON.stringify({ '30': { '1': 10.0, '2': 5.3, '3': 3.7, '4': 2.8, '5': 2.3 }, '35': { '1': 9.3, '2': 4.9, '3': 3.4, '4': 2.6, '5': 2.2 }, '40': { '1': 8.5, '2': 4.5, '3': 3.2, '4': 2.4, '5': 2.0 }, '45': { '1': 7.8, '2': 4.2, '3': 2.9, '4': 2.2, '5': 1.9 }, '50': { '1': 7.1, '2': 3.8, '3': 2.7, '4': 2.0, '5': 1.7 } }),
      syariahMargin: 15,
      kprDpOptions: JSON.stringify([0, 10, 15, 20, 25, 30]),
      kprTenorOptions: JSON.stringify([5, 10, 15, 20, 25]),
      kprInstallments: JSON.stringify({ '0': { '5': 9.8, '10': 5.4, '15': 4.0, '20': 3.2, '25': 2.8 }, '10': { '5': 8.8, '10': 4.9, '15': 3.6, '20': 2.9, '25': 2.5 }, '15': { '5': 7.9, '10': 4.4, '15': 3.2, '20': 2.6, '25': 2.2 }, '20': { '5': 6.9, '10': 3.8, '15': 2.8, '20': 2.3, '25': 2.0 }, '25': { '5': 6.0, '10': 3.3, '15': 2.5, '20': 2.0, '25': 1.7 }, '30': { '5': 5.2, '10': 2.9, '15': 2.1, '20': 1.7, '25': 1.5 } }),
      isFeatured: false,
      status: 'available',
    },
    {
      name: 'Tipe 45/127',
      slug: 'tipe-45-127',
      type: '45/127',
      category: 'kavling',
      price: 650,
      location: 'Bandung Raya Residence',
      bedrooms: 3,
      bathrooms: 2,
      landArea: 127,
      buildingArea: 45,
      description: 'Rumah mewah tipe 45 dengan kavling terluas. 3 kamar tidur, 2 kamar mandi, dan taman yang luas. Investasi properti terbaik di Bandung Timur.',
      features: JSON.stringify(['3 Kamar Tidur', '2 Kamar Mandi', 'Carport 2 Mobil', 'Taman Luas', 'Dapur Luas', 'Ruang Keluarga', 'Listrik 3500W', 'Air PDAM', 'Smart Home Ready']),
      images: JSON.stringify(['/images/properties/type45.png']),
      tag: 'Premium',
      installment: 'Mulai Rp 9jt/bln',
      financingTypes: JSON.stringify(['syariah', 'kpr']),
      dpOptions: JSON.stringify([30, 35, 40, 45, 50]),
      tenorOptions: JSON.stringify([1, 2, 3, 4, 5]),
      installments: JSON.stringify({ '30': { '1': 15.3, '2': 8.1, '3': 5.6, '4': 4.3, '5': 3.6 }, '35': { '1': 14.2, '2': 7.5, '3': 5.2, '4': 4.0, '5': 3.3 }, '40': { '1': 13.0, '2': 6.9, '3': 4.8, '4': 3.7, '5': 3.0 }, '45': { '1': 11.9, '2': 6.3, '3': 4.4, '4': 3.4, '5': 2.8 }, '50': { '1': 10.8, '2': 5.7, '3': 4.0, '4': 3.1, '5': 2.6 } }),
      syariahMargin: 15,
      kprDpOptions: JSON.stringify([0, 10, 15, 20, 25, 30]),
      kprTenorOptions: JSON.stringify([5, 10, 15, 20, 25]),
      kprInstallments: JSON.stringify({ '0': { '5': 15.0, '10': 8.3, '15': 6.1, '20': 4.9, '25': 4.2 }, '10': { '5': 13.5, '10': 7.5, '15': 5.5, '20': 4.4, '25': 3.8 }, '15': { '5': 12.1, '10': 6.7, '15': 4.9, '20': 4.0, '25': 3.4 }, '20': { '5': 10.6, '10': 5.9, '15': 4.3, '20': 3.5, '25': 3.0 }, '25': { '5': 9.2, '10': 5.1, '15': 3.8, '20': 3.0, '25': 2.7 }, '30': { '5': 7.8, '10': 4.3, '15': 3.2, '20': 2.6, '25': 2.3 } }),
      isFeatured: true,
      status: 'available',
    },
    {
      name: 'Sentul D33 36/72',
      slug: 'sentul-d33-36-72',
      type: '36/72',
      category: 'siap_huni',
      price: 520,
      location: 'Sentul',
      bedrooms: 2,
      bathrooms: 1,
      landArea: 72,
      buildingArea: 36,
      description: 'Rumah di kawasan Sentul dengan akses mudah ke Jakarta. Lingkungan asri dengan view pegunungan. Desain modern tropis.',
      features: JSON.stringify(['2 Kamar Tidur', '1 Kamar Mandi', 'Carport', 'Taman', 'Dapur', 'Listrik 2200W', 'Air PDAM']),
      images: JSON.stringify(['/images/properties/sentul_d33.png']),
      tag: 'Baru',
      installment: 'Mulai Rp 7.5jt/bln',
      financingTypes: JSON.stringify(['syariah', 'kpr']),
      dpOptions: JSON.stringify([30, 35, 40, 45, 50]),
      tenorOptions: JSON.stringify([1, 2, 3, 4, 5]),
      installments: JSON.stringify({ '30': { '1': 12.2, '2': 6.5, '3': 4.5, '4': 3.4, '5': 2.8 }, '35': { '1': 11.3, '2': 6.0, '3': 4.2, '4': 3.2, '5': 2.6 }, '40': { '1': 10.4, '2': 5.5, '3': 3.9, '4': 2.9, '5': 2.5 }, '45': { '1': 9.5, '2': 5.0, '3': 3.5, '4': 2.7, '5': 2.2 }, '50': { '1': 8.6, '2': 4.6, '3': 3.2, '4': 2.5, '5': 2.0 } }),
      syariahMargin: 15,
      kprDpOptions: JSON.stringify([0, 10, 15, 20, 25, 30]),
      kprTenorOptions: JSON.stringify([5, 10, 15, 20, 25]),
      kprInstallments: JSON.stringify({ '0': { '5': 12.0, '10': 6.6, '15': 4.8, '20': 3.9, '25': 3.4 }, '10': { '5': 10.8, '10': 6.0, '15': 4.4, '20': 3.5, '25': 3.0 }, '15': { '5': 9.6, '10': 5.3, '15': 3.9, '20': 3.1, '25': 2.7 }, '20': { '5': 8.4, '10': 4.7, '15': 3.4, '20': 2.8, '25': 2.4 }, '25': { '5': 7.3, '10': 4.0, '15': 3.0, '20': 2.4, '25': 2.1 }, '30': { '5': 6.2, '10': 3.4, '15': 2.5, '20': 2.1, '25': 1.8 } }),
      isFeatured: true,
      status: 'available',
    },
    {
      name: 'Sentul B2 36/60',
      slug: 'sentul-b2-36-60',
      type: '36/60',
      category: 'inden',
      price: 480,
      location: 'Sentul',
      bedrooms: 2,
      bathrooms: 1,
      landArea: 60,
      buildingArea: 36,
      description: 'Perumahan premium di kawasan Sentul Bogor. Akses tol Jagorani langsung. Dekat dengan pusat perbelanjaan dan sekolah internasional.',
      features: JSON.stringify(['2 Kamar Tidur', '1 Kamar Mandi', 'Carport', 'Taman', 'Dapur', 'Listrik 2200W', 'Air PDAM']),
      images: JSON.stringify(['/images/properties/sentul_b2.png']),
      tag: null,
      installment: 'Mulai Rp 7jt/bln',
      financingTypes: JSON.stringify(['syariah', 'kpr']),
      dpOptions: JSON.stringify([30, 35, 40, 45, 50]),
      tenorOptions: JSON.stringify([1, 2, 3, 4, 5]),
      installments: JSON.stringify({ '30': { '1': 11.3, '2': 6.0, '3': 4.2, '4': 3.2, '5': 2.6 }, '35': { '1': 10.5, '2': 5.5, '3': 3.9, '4': 3.0, '5': 2.4 }, '40': { '1': 9.6, '2': 5.1, '3': 3.6, '4': 2.7, '5': 2.3 }, '45': { '1': 8.8, '2': 4.7, '3': 3.3, '4': 2.5, '5': 2.1 }, '50': { '1': 8.0, '2': 4.2, '3': 3.0, '4': 2.3, '5': 1.9 } }),
      syariahMargin: 15,
      kprDpOptions: JSON.stringify([0, 10, 15, 20, 25, 30]),
      kprTenorOptions: JSON.stringify([5, 10, 15, 20, 25]),
      kprInstallments: JSON.stringify({ '0': { '5': 11.1, '10': 6.1, '15': 4.5, '20': 3.6, '25': 3.1 }, '10': { '5': 10.0, '10': 5.5, '15': 4.0, '20': 3.3, '25': 2.8 }, '15': { '5': 8.9, '10': 4.9, '15': 3.6, '20': 2.9, '25': 2.5 }, '20': { '5': 7.8, '10': 4.3, '15': 3.2, '20': 2.6, '25': 2.2 }, '25': { '5': 6.7, '10': 3.7, '15': 2.8, '20': 2.2, '25': 1.9 }, '30': { '5': 5.7, '10': 3.1, '15': 2.3, '20': 1.9, '25': 1.6 } }),
      isFeatured: false,
      status: 'available',
    },
  ];

  for (const prop of properties) {
    await prisma.property.upsert({
      where: { slug: prop.slug },
      update: {},
      create: prop,
    });
  }
  console.log(`✅ Properties created: ${properties.length}`);

  // Create testimonials
  const testimonials = [
    { name: 'Budi Santoso', role: 'Penghuni Tipe Majapahit A1', text: 'Sangat puas dengan rumah di Bandung Raya Residence. Lingkungannya asri, aman, dan nyaman untuk keluarga. Proses pembelian dengan skema syariah sangat mudah dan transparan.', rating: 5, featured: true },
    { name: 'Siti Nurhaliza', role: 'Penghuni Tipe Manjah B3', text: 'Rumahnya bagus, desainnya modern. Akses jalan juga strategis, dekat dengan pusat kota Bandung. Recommended banget!', rating: 5, featured: true },
    { name: 'Ahmad Fauzi', role: 'Penghuni Tipe E9 C2', text: 'Investasi properti terbaik yang pernah saya lakukan. Harga naik terus dan lingkungan semakin baik. Tim marketing-nya juga sangat responsif.', rating: 5, featured: true },
    { name: 'Dewi Rahmawati', role: 'Penghuni Tipe Belanda D1', text: 'Desain rumah Classic Belanda sangat elegan. Saya suka dengan detail arsitekturnya. Tetangga juga ramah-ramah.', rating: 4, featured: false },
    { name: 'Rizky Pratama', role: 'Penghuni Tipe 45 E5', text: 'Kavling yang luas, cocok untuk keluarga besar. Fasilitas lingkungan lengkap dan keamanan 24 jam.', rating: 5, featured: true },
    { name: 'Nur Hidayah', role: 'Penghuni Tipe TBA7 F2', text: 'Proses KPR-nya dibantu sampai tuntas. Tidak ribet dan transparan. Terima kasih BRR!', rating: 4, featured: false },
    { name: 'Agus Setiawan', role: 'Penghuni Tipe D39 G1', text: 'Lokasinya strategis, dekat dengan akses tol. Cocok untuk yang kerja di Bandung atau Jakarta.', rating: 5, featured: true },
    { name: 'Rina Wulandari', role: 'Penghuni Tipe Sentul D33', text: 'Perumahan di Sentul sangat nyaman, view pegunungannya indah. Udara segar setiap hari.', rating: 5, featured: false },
    { name: 'Hendra Wijaya', role: 'Penghuni Tipe Manjah A5', text: 'Sudah 2 tahun tinggal di sini dan sangat betah. Komunitasnya bagus, ada banyak kegiatan warga.', rating: 4, featured: false },
    { name: 'Lisa Permata', role: 'Penghuni Tipe E9 B1', text: 'Rumah pertama saya dan saya sangat senang memilih BRR. Kualitas bangunan baik dan harga masih terjangkau.', rating: 5, featured: true },
  ];

  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }
  console.log(`✅ Testimonials created: ${testimonials.length}`);

  // Create banks
  const banks = [
    { name: 'BSI (Bank Syariah Indonesia)', description: 'Bank syariah terbesar di Indonesia. Menyediakan pembiayaan KPR syariah dengan margin kompetitif.', sortOrder: 1, isActive: true },
    { name: 'Bank Muamalat', description: 'Bank syariah pertama di Indonesia. Pembiayaan rumah dengan akad murabahah.', sortOrder: 2, isActive: true },
    { name: 'BTN Syariah', description: 'Bank Tabungan Negara syariah. Spesialis KPR dengan proses cepat.', sortOrder: 3, isActive: true },
    { name: 'Bank Mega Syariah', description: 'Pembiayaan KPR syariah dengan cicilan tetap sepanjang tenor.', sortOrder: 4, isActive: true },
    { name: 'Bank BCA', description: 'Bank swasta terbesar di Indonesia. KPR konvensional dengan suku bunga kompetitif.', sortOrder: 5, isActive: true },
    { name: 'Bank Mandiri', description: 'KPR Mandiri dengan berbagai pilihan tenor dan DP yang fleksibel.', sortOrder: 6, isActive: true },
  ];

  for (const b of banks) {
    await prisma.bank.create({ data: b });
  }
  console.log(`✅ Banks created: ${banks.length}`);

  // Create blog posts
  const blogs = [
    {
      title: 'Panduan Lengkap KPR Syariah untuk Rumah Pertama',
      slug: 'panduan-lengkap-kpr-syariah',
      excerpt: 'Simak panduan lengkap cara mengajukan KPR syariah untuk membeli rumah pertama Anda. Dari persyaratan hingga tips agar disetujui.',
      content: '<h2>Apa itu KPR Syariah?</h2><p>KPR Syariah adalah skema pembiayaan rumah berbasis prinsip syariah Islam. Berbeda dengan KPR konvensional yang menggunakan bunga, KPR syariah menggunakan akad jual-beli (murabahah) atau sewa-menyewa (ijarah).</p><h2>Keunggulan KPR Syariah</h2><ul><li>Tanpa bunga (riba)</li><li>Cicilan tetap sepanjang tenor</li><li>Proses lebih transparan</li><li>Tidak ada denda pelunasan dini</li></ul><h2>Persyaratan Umum</h2><p>Berikut persyaratan yang umumnya dibutuhkan untuk mengajukan KPR syariah:</p><ol><li>KTP dan KK</li><li>Slip gaji 3 bulan terakhir</li><li>NPWP</li><li>Rekening koran 3 bulan terakhir</li><li>Surat keterangan kerja</li></ol><h2>Tips Agar KPR Syariah Disetujui</h2><p>Pastikan riwayat kredit Anda baik, siapkan dokumen dengan lengkap, dan pilih rumah yang sesuai dengan kemampuan finansial Anda.</p>',
      category: 'Panduan',
      author: 'Admin BRR',
      image: '',
      published: true,
      readTime: '8 menit',
    },
    {
      title: 'Tips Memilih Lokasi Perumahan yang Strategis',
      slug: 'tips-memilih-lokasi-perumahan',
      excerpt: 'Lokasi adalah faktor terpenting saat membeli rumah. Pelajari tips memilih lokasi perumahan yang strategis untuk investasi jangka panjang.',
      content: '<h2>Mengapa Lokasi Sangat Penting?</h2><p>Lokasi menentukan nilai investasi properti Anda dalam jangka panjang. Rumah di lokasi strategis akan terus mengalami kenaikan nilai.</p><h2>Faktor yang Perlu Dipertimbangkan</h2><ul><li>Aksesibilitas ke jalan tol dan transportasi umum</li><li>Jarak ke tempat kerja dan sekolah</li><li>Ketersediaan fasilitas umum (rumah sakit, pasar, mall)</li><li>Keamanan lingkungan</li><li>Potensi pengembangan area</li></ul><h2>Keunggulan Lokasi Bandung Timur</h2><p>Bandung Timur, khususnya kawasan Cileunyi, merupakan lokasi yang sedang berkembang pesat. Akses tol langsung ke Jakarta dan kota-kota lain menjadikan area ini sangat strategis.</p>',
      category: 'Tips',
      author: 'Admin BRR',
      image: '',
      published: true,
      readTime: '6 menit',
    },
    {
      title: 'Mengapa Investasi Properti di Bandung Masih Menjanjikan',
      slug: 'investasi-properti-bandung',
      excerpt: 'Bandung terus menjadi magnet bagi investor properti. Simak alasan mengapa investasi properti di Bandung masih sangat menjanjikan.',
      content: '<h2>Pertumbuhan Properti Bandung</h2><p>Kota Bandung terus mengalami pertumbuhan yang pesat. Populasi yang meningkat dan pembangunan infrastruktur menjadi pendorong utama.</p><h2>Faktor Pendukung</h2><ul><li>Kota pendidikan dengan populasi muda yang besar</li><li>Pariwisata yang terus berkembang</li><li>Infrastruktur baru (tol, kereta cepat, bandara)</li><li>Harga tanah yang masih relatif terjangkau dibanding Jakarta</li><li>Kualitas hidup yang baik</li></ul><h2>ROI Properti di Bandung</h2><p>Rata-rata kenaikan harga properti di Bandung mencapai 10-15% per tahun, menjadikannya salah satu kota dengan ROI tertinggi di Indonesia.</p>',
      category: 'Keuangan',
      author: 'Admin BRR',
      image: '',
      published: true,
      readTime: '7 menit',
    },
    {
      title: 'Fasilitas Lengkap di Bandung Raya Residence',
      slug: 'fasilitas-bandung-raya-residence',
      excerpt: 'Bandung Raya Residence menyediakan berbagai fasilitas lengkap untuk kenyamanan penghuni. Dari keamanan 24 jam hingga area hijau.',
      content: '<h2>Fasilitas Keamanan</h2><ul><li>Security 24 jam</li><li>CCTV di area publik</li><li>One gate system</li></ul><h2>Fasilitas Sosial</h2><ul><li>Masjid</li><li>Area bermain anak</li><li>Taman dan area hijau</li><li>Lapangan olahraga</li></ul><h2>Infrastruktur</h2><ul><li>Jalan lingkungan yang lebar</li><li>Drainase yang baik</li><li>Listrik dan air bersih</li><li>Akses internet fiber optic</li></ul>',
      category: 'Info',
      author: 'Admin BRR',
      image: '',
      published: true,
      readTime: '5 menit',
    },
    {
      title: 'Program DP Ringan dan Cicilan Fleksibel',
      slug: 'dp-ringan-cicilan-fleksibel',
      excerpt: 'BRR menawarkan program DP ringan mulai 0% dan cicilan fleksibel hingga 25 tahun. Simak penjelasan lengkapnya.',
      content: '<h2>Program DP Ringan</h2><p>Bandung Raya Residence bekerja sama dengan berbagai bank syariah dan konvensional untuk memberikan program DP ringan bagi pembeli rumah pertama.</p><h2>Pilihan Skema Pembiayaan</h2><ul><li><strong>Syariah:</strong> DP mulai 30%, tenor hingga 5 tahun, margin tetap</li><li><strong>KPR:</strong> DP mulai 0%, tenor hingga 25 tahun, bunga kompetitif</li></ul><h2>Cara Menghitung Cicilan</h2><p>Gunakan kalkulator cicilan kami untuk menghitung estimasi cicilan bulanan sesuai dengan DP dan tenor yang Anda inginkan.</p>',
      category: 'Promo',
      author: 'Admin BRR',
      image: '',
      published: true,
      readTime: '4 menit',
    },
    {
      title: 'Perbandingan Skema Syariah vs KPR Konvensional',
      slug: 'syariah-vs-kpr-konvensional',
      excerpt: 'Bingung memilih antara KPR syariah dan konvensional? Berikut perbandingan lengkap untuk membantu Anda memutuskan.',
      content: '<h2>KPR Syariah</h2><ul><li>Tanpa bunga</li><li>Cicilan tetap</li><li>Tidak ada denda pelunasan dini</li><li>Akad sesuai syariah</li><li>Margin 10-15%</li></ul><h2>KPR Konvensional</h2><ul><li>Menggunakan suku bunga</li><li>Cicilan bisa berubah (floating)</li><li>Ada denda pelunasan dini</li><li>DP bisa mulai 0%</li><li>Bunga 7-12% per tahun</li></ul><h2>Kesimpulan</h2><p>Kedua skema memiliki keunggulan masing-masing. Pilih yang sesuai dengan kebutuhan dan keyakinan Anda. Bandung Raya Residence menyediakan keduanya untuk kenyamanan Anda.</p>',
      category: 'Panduan',
      author: 'Admin BRR',
      image: '',
      published: true,
      readTime: '6 menit',
    },
  ];

  for (const b of blogs) {
    await prisma.blogPost.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    });
  }
  console.log(`✅ Blog posts created: ${blogs.length}`);

  // Create gallery items
  const galleryItems = [
    { title: 'Gerbang Utama BRR', category: 'lingkungan', description: 'Gerbang utama Bandung Raya Residence yang megah dan modern', sortOrder: 1 },
    { title: 'Taman Lingkungan', category: 'lingkungan', description: 'Taman hijau yang asri untuk bersantai bersama keluarga', sortOrder: 2 },
    { title: 'Jalan Lingkungan', category: 'lingkungan', description: 'Jalan lingkungan yang lebar dan tertata rapi', sortOrder: 3 },
    { title: 'Tipe Majapahit - Tampak Depan', category: 'siap_huni', description: 'Tampilan depan rumah tipe Majapahit yang minimalis', sortOrder: 4 },
    { title: 'Tipe Majapahit - Interior', category: 'siap_huni', description: 'Interior rumah tipe Majapahit yang modern dan fungsional', sortOrder: 5 },
    { title: 'Tipe Manjah - Tampak Depan', category: 'siap_huni', description: 'Desain tropis modern tipe Manjah', sortOrder: 6 },
    { title: 'Tipe Classic Belanda', category: 'siap_huni', description: 'Desain Classic Belanda yang elegan dan timeless', sortOrder: 7 },
    { title: 'Proses Pembangunan Unit Baru', category: 'proses_bangun', description: 'Progress pembangunan unit terbaru', sortOrder: 8 },
    { title: 'Proses Finishing', category: 'proses_bangun', description: 'Tahap finishing rumah yang teliti', sortOrder: 9 },
    { title: 'Kavling Siap Bangun', category: 'kavling', description: 'Kavling dengan pemandangan yang indah', sortOrder: 10 },
    { title: 'Sentul D33 - Eksterior', category: 'siap_huni', description: 'Eksterior rumah Sentul D33 dengan view pegunungan', sortOrder: 11 },
    { title: 'Masjid Komplek', category: 'lingkungan', description: 'Masjid yang nyaman untuk ibadah', sortOrder: 12 },
  ];

  for (const g of galleryItems) {
    await prisma.galleryItem.create({ data: g });
  }
  console.log(`✅ Gallery items created: ${galleryItems.length}`);

  console.log('\n🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
