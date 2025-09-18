import { PrismaClient, PropertyStatus, PropertyType, Role } from '@prisma/client';
const prisma = new PrismaClient();
function rand<T>(arr: T[]) { return arr[Math.floor(Math.random()*arr.length)]; }

async function main() {
  // admin
  const bcrypt = await import('bcryptjs');
  const hash = bcrypt.hashSync('admin123', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', passwordHash: hash, role: Role.ADMIN, isActive: true }
  });

  // 30 properties (สุ่มจังหวัด/ประเภท/ราคา)
  const provinces = ['Bangkok','Phuket','Chonburi','Rayong','Pattaya','Hua Hin'];
  for (let i=1; i<=30; i++){
    const slug = `demo-${i}`;
    await prisma.property.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        status: rand([PropertyStatus.AVAILABLE, PropertyStatus.RESERVED, PropertyStatus.SOLD]),
        type: rand([PropertyType.CONDO, PropertyType.HOUSE, PropertyType.LAND, PropertyType.COMMERCIAL]),
        price: Math.floor(Math.random() * (1_000_000_000 - 100_000)) + 100_000,
        area: Math.floor(Math.random()*200)+30,
        beds: rand([1,2,3,4]),
        baths: rand([1,2,3]),
        locationId: null,
        images: { create: [{ url: `https://placehold.co/960x640?text=Zomzom+${i}`, order: 0 }] },
        i18n: { create: [
          { locale: 'en', title: `Demo Property ${i}`, description: `Nice place in ${rand(provinces)}` },
          { locale: 'th', title: `อสังหาเดโม่ ${i}`, description: `ทำเลดี ${rand(provinces)}` },
          { locale: 'zh', title: `演示房源 ${i}`, description: `位置佳 ${rand(provinces)}` },
        ]},
      }
    });
  }

  console.log('Seed done.');
}
main().finally(()=>prisma.$disconnect());
