import fs from 'fs';
import path from 'path';

interface Province {
  id: number;
  name_th: string;
  name_en: string;
}

const provinces: Province[] = JSON.parse(fs.readFileSync(path.join(__dirname, 'provinces.json'), 'utf-8'));

const types = [
  { en: 'condo', th: 'คอนโด' },
  { en: 'house', th: 'บ้าน' },
  { en: 'land', th: 'ที่ดิน' },
  { en: 'townhouse', th: 'ทาวน์เฮ้าส์' }
];

const amenities = ['pool', 'gym', 'parking', 'security', 'garden', 'wifi'];

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomAmenities() {
  const shuffled = [...amenities].sort(() => 0.5 - Math.random());
  const count = Math.floor(Math.random() * amenities.length) + 1;
  return shuffled.slice(0, count);
}

function priceBucket(price: number): string {
  if (price < 1_000_000) return '0-1M';
  if (price < 3_000_000) return '1-3M';
  if (price < 5_000_000) return '3-5M';
  if (price < 10_000_000) return '5-10M';
  return '10M+';
}

const properties = [] as any[];
let id = 1;

for (const province of provinces) {
  for (let i = 0; i < 16; i++) {
    const type = types[i % types.length];
    const price = Math.floor(Math.random() * 20_000_000) + 500_000;
    const createdAt = randomDate(new Date(2019, 0, 1), new Date());
    const updatedAt = randomDate(createdAt, new Date());
    properties.push({
      id: id++,
      province: { en: province.name_en, th: province.name_th },
      type: type.en,
      title: {
        en: `${type.en} in ${province.name_en} #${i + 1}`,
        th: `${type.th} ใน${province.name_th} #${i + 1}`
      },
      description: {
        en: `Lovely ${type.en} located in ${province.name_en}.`,
        th: `${type.th}ตั้งอยู่ใน${province.name_th}`
      },
      price,
      priceBucket: priceBucket(price),
      amenities: randomAmenities(),
      images: [
        `https://placehold.co/600x400?text=${encodeURIComponent(type.en)}+${id}`
      ],
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString()
    });
  }
}

const outDir = path.join(__dirname, '..', 'public', 'data');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'properties.json'), JSON.stringify(properties, null, 2));

console.log(`Generated ${properties.length} properties.`);
