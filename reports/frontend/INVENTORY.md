# INVENTORY

**Repo**: zomzomproperty  |  **Version**: 0.1.0  |  **Type**: Frontend(Next.js)

## File type counts (top 20)
- `.json`: 327
- `.ttf`: 72
- `.ts`: 57
- `.tsx`: 56
- `.mdx`: 24
- `.js`: 17
- `.md`: 15
- `(noext)`: 7
- `.png`: 7
- `.xml`: 2
- `.yml`: 1
- `.ico`: 1
- `.jpg`: 1
- `.txt`: 1
- `.css`: 1

## Tree (depth=3)
```
├─ .github
│  └─ workflows
│     └─ ci.yml
├─ components
│  ├─ Header
│  │  └─ NavBar.tsx
│  ├─ AdminPreviewBanner.tsx
│  ├─ Footer.tsx
│  ├─ JsonLd.tsx
│  ├─ LanguageSwitcher.tsx
│  ├─ MegaMenu.tsx
│  ├─ MobileMenu.tsx
│  └─ ServiceJsonLd.tsx
├─ lib
│  ├─ seo.ts
│  ├─ siteUrl.js
│  ├─ url.ts
│  └─ watermarkText.ts
├─ locales
│  ├─ en
│  │  └─ common.json
│  ├─ th
│  │  └─ common.json
│  ├─ zh
│  │  └─ common.json
│  └─ README.md
├─ pages
│  ├─ [locale]
│  │  ├─ console
│  │  │  ├─ account.tsx
│  │  │  ├─ favorites.tsx
│  │  │  ├─ index.tsx
│  │  │  └─ posts.tsx
│  │  ├─ guides
│  │  │  ├─ [slug].tsx
│  │  │  └─ index.tsx
│  │  ├─ properties
│  │  │  └─ [id].tsx
│  │  └─ search
│  │     └─ index.tsx
│  ├─ adminmanager
│  │  └─ properties.tsx
│  ├─ api
│  │  ├─ admin
│  │  │  ├─ scheduler
│  │  │  ├─ users
│  │  │  ├─ backup.ts
│  │  │  ├─ build-index.ts
│  │  │  ├─ generate-demo.ts
│  │  │  ├─ login.ts
│  │  │  ├─ properties.ts
│  │  │  └─ upload.ts
│  │  ├─ search.ts
│  │  └─ suggest.ts
│  ├─ _app.tsx
│  ├─ _document.tsx
│  ├─ 404.tsx
│  ├─ 500.tsx
│  ├─ adminmanager.tsx
│  ├─ index.tsx
│  └─ properties.tsx
├─ public
│  ├─ data
│  │  ├─ articles
│  │  │  ├─ bangkok-condo-guide.en.mdx
│  │  │  ├─ bangkok-condo-guide.th.mdx
│  │  │  ├─ bangkok-condo-renovation.en.mdx
│  │  │  ├─ bangkok-condo-renovation.th.mdx
│  │  │  ├─ bangkok-tax-advice.en.mdx
│  │  │  ├─ bangkok-tax-advice.th.mdx
│  │  │  ├─ chiangmai-condo-rules.en.mdx
│  │  │  ├─ chiangmai-condo-rules.th.mdx
│  │  │  ├─ chiangmai-house-tips.en.mdx
│  │  │  ├─ chiangmai-house-tips.th.mdx
│  │  │  ├─ chiangmai-market-trends.en.mdx
│  │  │  ├─ chiangmai-market-trends.th.mdx
│  │  │  ├─ national-buying-process.en.mdx
│  │  │  ├─ national-buying-process.th.mdx
│  │  │  ├─ pattaya-townhouse-rental.en.mdx
│  │  │  ├─ pattaya-townhouse-rental.th.mdx
│  │  │  ├─ phuket-beachfront-plots.en.mdx
│  │  │  ├─ phuket-beachfront-plots.th.mdx
│  │  │  ├─ phuket-land-investment.en.mdx
│  │  │  ├─ phuket-land-investment.th.mdx
│  │  │  ├─ phuket-villa-maintenance.en.mdx
│  │  │  ├─ phuket-villa-maintenance.th.mdx
│  │  │  ├─ thailand-mortgage-basics.en.mdx
│  │  │  └─ thailand-mortgage-basics.th.mdx
│  │  ├─ index
│  │  │  ├─ .gitkeep
│  │  │  ├─ amnat-charoen-condo.json
│  │  │  ├─ amnat-charoen-house.json
│  │  │  ├─ amnat-charoen-land.json
│  │  │  ├─ amnat-charoen-townhouse.json
│  │  │  ├─ ang-thong-condo.json
│  │  │  ├─ ang-thong-house.json
│  │  │  ├─ ang-thong-land.json
│  │  │  ├─ ang-thong-townhouse.json
│  │  │  ├─ articles-en.json
│  │  │  ├─ articles-th.json
│  │  │  ├─ bangkok-condo.json
│  │  │  ├─ bangkok-house.json
│  │  │  ├─ bangkok-land.json
│  │  │  ├─ bangkok-townhouse.json
│  │  │  ├─ buogkan-condo.json
│  │  │  ├─ buogkan-house.json
│  │  │  ├─ buogkan-land.json
│  │  │  ├─ buogkan-townhouse.json
│  │  │  ├─ buri-ram-condo.json
│  │  │  ├─ buri-ram-house.json
│  │  │  ├─ buri-ram-land.json
│  │  │  ├─ buri-ram-townhouse.json
│  │  │  ├─ chachoengsao-condo.json
│  │  │  ├─ chachoengsao-house.json
│  │  │  ├─ chachoengsao-land.json
│  │  │  ├─ chachoengsao-townhouse.json
│  │  │  ├─ chai-nat-condo.json
│  │  │  ├─ chai-nat-house.json
│  │  │  ├─ chai-nat-land.json
│  │  │  ├─ chai-nat-townhouse.json
│  │  │  ├─ chaiyaphum-condo.json
│  │  │  ├─ chaiyaphum-house.json
│  │  │  ├─ chaiyaphum-land.json
│  │  │  ├─ chaiyaphum-townhouse.json
│  │  │  ├─ chanthaburi-condo.json
│  │  │  ├─ chanthaburi-house.json
│  │  │  ├─ chanthaburi-land.json
│  │  │  ├─ chanthaburi-townhouse.json
│  │  │  ├─ chiang-mai-condo.json
│  │  │  ├─ chiang-mai-house.json
│  │  │  ├─ chiang-mai-land.json
│  │  │  ├─ chiang-mai-townhouse.json
│  │  │  ├─ chiang-rai-condo.json
│  │  │  ├─ chiang-rai-house.json
│  │  │  ├─ chiang-rai-land.json
│  │  │  ├─ chiang-rai-townhouse.json
│  │  │  ├─ chon-buri-condo.json
│  │  │  ├─ chon-buri-house.json
│  │  │  ├─ chon-buri-land.json
│  │  │  ├─ chon-buri-townhouse.json
│  │  │  ├─ chumphon-condo.json
│  │  │  ├─ chumphon-house.json
│  │  │  ├─ chumphon-land.json
│  │  │  ├─ chumphon-townhouse.json
│  │  │  ├─ kalasin-condo.json
│  │  │  ├─ kalasin-house.json
│  │  │  ├─ kalasin-land.json
│  │  │  ├─ kalasin-townhouse.json
│  │  │  ├─ kamphaeng-phet-condo.json
│  │  │  ├─ kamphaeng-phet-house.json
│  │  │  ├─ kamphaeng-phet-land.json
│  │  │  ├─ kamphaeng-phet-townhouse.json
│  │  │  ├─ kanchanaburi-condo.json
│  │  │  ├─ kanchanaburi-house.json
│  │  │  ├─ kanchanaburi-land.json
│  │  │  ├─ kanchanaburi-townhouse.json
│  │  │  ├─ khon-kaen-condo.json
│  │  │  ├─ khon-kaen-house.json
│  │  │  ├─ khon-kaen-land.json
│  │  │  ├─ khon-kaen-townhouse.json
│  │  │  ├─ krabi-condo.json
│  │  │  ├─ krabi-house.json
│  │  │  ├─ krabi-land.json
│  │  │  ├─ krabi-townhouse.json
│  │  │  ├─ lampang-condo.json
│  │  │  ├─ lampang-house.json
│  │  │  ├─ lampang-land.json
│  │  │  ├─ lampang-townhouse.json
│  │  │  ├─ lamphun-condo.json
│  │  │  ├─ lamphun-house.json
│  │  │  ├─ lamphun-land.json
│  │  │  ├─ lamphun-townhouse.json
│  │  │  ├─ loburi-condo.json
│  │  │  ├─ loburi-house.json
│  │  │  ├─ loburi-land.json
│  │  │  ├─ loburi-townhouse.json
│  │  │  ├─ loei-condo.json
│  │  │  ├─ loei-house.json
│  │  │  ├─ loei-land.json
│  │  │  ├─ loei-townhouse.json
│  │  │  ├─ mae-hong-son-condo.json
│  │  │  ├─ mae-hong-son-house.json
│  │  │  ├─ mae-hong-son-land.json
│  │  │  ├─ mae-hong-son-townhouse.json
│  │  │  ├─ maha-sarakham-condo.json
│  │  │  ├─ maha-sarakham-house.json
│  │  │  ├─ maha-sarakham-land.json
│  │  │  ├─ maha-sarakham-townhouse.json
│  │  │  ├─ manifest.json
│  │  │  ├─ mukdahan-condo.json
│  │  │  ├─ mukdahan-house.json
│  │  │  ├─ mukdahan-land.json
│  │  │  ├─ mukdahan-townhouse.json
│  │  │  ├─ nakhon-nayok-condo.json
│  │  │  ├─ nakhon-nayok-house.json
│  │  │  ├─ nakhon-nayok-land.json
│  │  │  ├─ nakhon-nayok-townhouse.json
│  │  │  ├─ nakhon-pathom-condo.json
│  │  │  ├─ nakhon-pathom-house.json
│  │  │  ├─ nakhon-pathom-land.json
│  │  │  ├─ nakhon-pathom-townhouse.json
│  │  │  ├─ nakhon-phanom-condo.json
│  │  │  ├─ nakhon-phanom-house.json
│  │  │  ├─ nakhon-phanom-land.json
│  │  │  ├─ nakhon-phanom-townhouse.json
│  │  │  ├─ nakhon-ratchasima-condo.json
│  │  │  ├─ nakhon-ratchasima-house.json
│  │  │  ├─ nakhon-ratchasima-land.json
│  │  │  ├─ nakhon-ratchasima-townhouse.json
│  │  │  ├─ nakhon-sawan-condo.json
│  │  │  ├─ nakhon-sawan-house.json
│  │  │  ├─ nakhon-sawan-land.json
│  │  │  ├─ nakhon-sawan-townhouse.json
│  │  │  ├─ nakhon-si-thammarat-condo.json
│  │  │  ├─ nakhon-si-thammarat-house.json
│  │  │  ├─ nakhon-si-thammarat-land.json
│  │  │  ├─ nakhon-si-thammarat-townhouse.json
│  │  │  ├─ nan-condo.json
│  │  │  ├─ nan-house.json
│  │  │  ├─ nan-land.json
│  │  │  ├─ nan-townhouse.json
│  │  │  ├─ narathiwat-condo.json
│  │  │  ├─ narathiwat-house.json
│  │  │  ├─ narathiwat-land.json
│  │  │  ├─ narathiwat-townhouse.json
│  │  │  ├─ nong-bua-lam-phu-condo.json
│  │  │  ├─ nong-bua-lam-phu-house.json
│  │  │  ├─ nong-bua-lam-phu-land.json
│  │  │  ├─ nong-bua-lam-phu-townhouse.json
│  │  │  ├─ nong-khai-condo.json
│  │  │  ├─ nong-khai-house.json
│  │  │  ├─ nong-khai-land.json
│  │  │  ├─ nong-khai-townhouse.json
│  │  │  ├─ nonthaburi-condo.json
│  │  │  ├─ nonthaburi-house.json
│  │  │  ├─ nonthaburi-land.json
│  │  │  ├─ nonthaburi-townhouse.json
│  │  │  ├─ pathum-thani-condo.json
│  │  │  ├─ pathum-thani-house.json
│  │  │  ├─ pathum-thani-land.json
│  │  │  ├─ pathum-thani-townhouse.json
│  │  │  ├─ pattani-condo.json
│  │  │  ├─ pattani-house.json
│  │  │  ├─ pattani-land.json
│  │  │  ├─ pattani-townhouse.json
│  │  │  ├─ phangnga-condo.json
│  │  │  ├─ phangnga-house.json
│  │  │  ├─ phangnga-land.json
│  │  │  ├─ phangnga-townhouse.json
│  │  │  ├─ phatthalung-condo.json
│  │  │  ├─ phatthalung-house.json
│  │  │  ├─ phatthalung-land.json
│  │  │  ├─ phatthalung-townhouse.json
│  │  │  ├─ phayao-condo.json
│  │  │  ├─ phayao-house.json
│  │  │  ├─ phayao-land.json
│  │  │  ├─ phayao-townhouse.json
│  │  │  ├─ phetchabun-condo.json
│  │  │  ├─ phetchabun-house.json
│  │  │  ├─ phetchabun-land.json
│  │  │  ├─ phetchabun-townhouse.json
│  │  │  ├─ phetchaburi-condo.json
│  │  │  ├─ phetchaburi-house.json
│  │  │  ├─ phetchaburi-land.json
│  │  │  ├─ phetchaburi-townhouse.json
│  │  │  ├─ phichit-condo.json
│  │  │  ├─ phichit-house.json
│  │  │  ├─ phichit-land.json
│  │  │  ├─ phichit-townhouse.json
│  │  │  ├─ phitsanulok-condo.json
│  │  │  ├─ phitsanulok-house.json
│  │  │  ├─ phitsanulok-land.json
│  │  │  ├─ phitsanulok-townhouse.json
│  │  │  ├─ phra-nakhon-si-ayutthaya-condo.json
│  │  │  ├─ phra-nakhon-si-ayutthaya-house.json
│  │  │  ├─ phra-nakhon-si-ayutthaya-land.json
│  │  │  ├─ phra-nakhon-si-ayutthaya-townhouse.json
│  │  │  ├─ phrae-condo.json
│  │  │  ├─ phrae-house.json
│  │  │  ├─ phrae-land.json
│  │  │  ├─ phrae-townhouse.json
│  │  │  ├─ phuket-condo.json
│  │  │  ├─ phuket-house.json
│  │  │  ├─ phuket-land.json
│  │  │  ├─ phuket-townhouse.json
│  │  │  ├─ prachin-buri-condo.json
│  │  │  ├─ prachin-buri-house.json
│  │  │  ├─ prachin-buri-land.json
│  │  │  ├─ prachin-buri-townhouse.json
│  │  │  ├─ prachuap-khiri-khan-condo.json
│  │  │  ├─ prachuap-khiri-khan-house.json
│  │  │  ├─ prachuap-khiri-khan-land.json
│  │  │  ├─ prachuap-khiri-khan-townhouse.json
│  │  │  ├─ ranong-condo.json
│  │  │  ├─ ranong-house.json
│  │  │  ├─ ranong-land.json
│  │  │  ├─ ranong-townhouse.json
│  │  │  ├─ ratchaburi-condo.json
│  │  │  ├─ ratchaburi-house.json
│  │  │  ├─ ratchaburi-land.json
│  │  │  ├─ ratchaburi-townhouse.json
│  │  │  ├─ rayong-condo.json
│  │  │  ├─ rayong-house.json
│  │  │  ├─ rayong-land.json
│  │  │  ├─ rayong-townhouse.json
│  │  │  ├─ roi-et-condo.json
│  │  │  ├─ roi-et-house.json
│  │  │  ├─ roi-et-land.json
│  │  │  ├─ roi-et-townhouse.json
│  │  │  ├─ sa-kaeo-condo.json
│  │  │  ├─ sa-kaeo-house.json
│  │  │  ├─ sa-kaeo-land.json
│  │  │  ├─ sa-kaeo-townhouse.json
│  │  │  ├─ sakon-nakhon-condo.json
│  │  │  ├─ sakon-nakhon-house.json
│  │  │  ├─ sakon-nakhon-land.json
│  │  │  ├─ sakon-nakhon-townhouse.json
│  │  │  ├─ samut-prakan-condo.json
│  │  │  ├─ samut-prakan-house.json
│  │  │  ├─ samut-prakan-land.json
│  │  │  ├─ samut-prakan-townhouse.json
│  │  │  ├─ samut-sakhon-condo.json
│  │  │  ├─ samut-sakhon-house.json
│  │  │  ├─ samut-sakhon-land.json
│  │  │  ├─ samut-sakhon-townhouse.json
│  │  │  ├─ samut-songkhram-condo.json
│  │  │  ├─ samut-songkhram-house.json
│  │  │  ├─ samut-songkhram-land.json
│  │  │  ├─ samut-songkhram-townhouse.json
│  │  │  ├─ saraburi-condo.json
│  │  │  ├─ saraburi-house.json
│  │  │  ├─ saraburi-land.json
│  │  │  ├─ saraburi-townhouse.json
│  │  │  ├─ satun-condo.json
│  │  │  ├─ satun-house.json
│  │  │  ├─ satun-land.json
│  │  │  ├─ satun-townhouse.json
│  │  │  ├─ si-sa-ket-condo.json
│  │  │  ├─ si-sa-ket-house.json
│  │  │  ├─ si-sa-ket-land.json
│  │  │  ├─ si-sa-ket-townhouse.json
│  │  │  ├─ sing-buri-condo.json
│  │  │  ├─ sing-buri-house.json
│  │  │  ├─ sing-buri-land.json
│  │  │  ├─ sing-buri-townhouse.json
│  │  │  ├─ songkhla-condo.json
│  │  │  ├─ songkhla-house.json
│  │  │  ├─ songkhla-land.json
│  │  │  ├─ songkhla-townhouse.json
│  │  │  ├─ suggest.json
│  │  │  ├─ sukhothai-condo.json
│  │  │  ├─ sukhothai-house.json
│  │  │  ├─ sukhothai-land.json
│  │  │  ├─ sukhothai-townhouse.json
│  │  │  ├─ suphan-buri-condo.json
│  │  │  ├─ suphan-buri-house.json
│  │  │  ├─ suphan-buri-land.json
│  │  │  ├─ suphan-buri-townhouse.json
│  │  │  ├─ surat-thani-condo.json
│  │  │  ├─ surat-thani-house.json
│  │  │  ├─ surat-thani-land.json
│  │  │  ├─ surat-thani-townhouse.json
│  │  │  ├─ surin-condo.json
│  │  │  ├─ surin-house.json
│  │  │  ├─ surin-land.json
│  │  │  ├─ surin-townhouse.json
│  │  │  ├─ tak-condo.json
│  │  │  ├─ tak-house.json
│  │  │  ├─ tak-land.json
│  │  │  ├─ tak-townhouse.json
│  │  │  ├─ trang-condo.json
│  │  │  ├─ trang-house.json
│  │  │  ├─ trang-land.json
│  │  │  ├─ trang-townhouse.json
│  │  │  ├─ trat-condo.json
│  │  │  ├─ trat-house.json
│  │  │  ├─ trat-land.json
│  │  │  ├─ trat-townhouse.json
│  │  │  ├─ ubon-ratchathani-condo.json
│  │  │  ├─ ubon-ratchathani-house.json
│  │  │  ├─ ubon-ratchathani-land.json
│  │  │  ├─ ubon-ratchathani-townhouse.json
│  │  │  ├─ udon-thani-condo.json
│  │  │  ├─ udon-thani-house.json
│  │  │  ├─ udon-thani-land.json
│  │  │  ├─ udon-thani-townhouse.json
│  │  │  ├─ uthai-thani-condo.json
│  │  │  ├─ uthai-thani-house.json
│  │  │  ├─ uthai-thani-land.json
│  │  │  ├─ uthai-thani-townhouse.json
│  │  │  ├─ uttaradit-condo.json
│  │  │  ├─ uttaradit-house.json
│  │  │  ├─ uttaradit-land.json
│  │  │  ├─ uttaradit-townhouse.json
│  │  │  ├─ yala-condo.json
│  │  │  ├─ yala-house.json
│  │  │  ├─ yala-land.json
│  │  │  ├─ yala-townhouse.json
│  │  │  ├─ yasothon-condo.json
│  │  │  ├─ yasothon-house.json
│  │  │  ├─ yasothon-land.json
│  │  │  └─ yasothon-townhouse.json
│  │  ├─ amenities.json
│  │  ├─ articles.json
│  │  ├─ geo-th-lite.json
│  │  ├─ properties.json
│  │  ├─ rates.json
│  │  └─ transit-bkk.json
│  ├─ fonts
│  │  ├─ Inter
│  │  │  ├─ Inter_18pt-Black.ttf
│  │  │  ├─ Inter_18pt-BlackItalic.ttf
│  │  │  ├─ Inter_18pt-Bold.ttf
│  │  │  ├─ Inter_18pt-BoldItalic.ttf
│  │  │  ├─ Inter_18pt-ExtraBold.ttf
│  │  │  ├─ Inter_18pt-ExtraBoldItalic.ttf
│  │  │  ├─ Inter_18pt-ExtraLight.ttf
│  │  │  ├─ Inter_18pt-ExtraLightItalic.ttf
│  │  │  ├─ Inter_18pt-Italic.ttf
│  │  │  ├─ Inter_18pt-Light.ttf
│  │  │  ├─ Inter_18pt-LightItalic.ttf
│  │  │  ├─ Inter_18pt-Medium.ttf
│  │  │  ├─ Inter_18pt-MediumItalic.ttf
│  │  │  ├─ Inter_18pt-Regular.ttf
│  │  │  ├─ Inter_18pt-SemiBold.ttf
│  │  │  ├─ Inter_18pt-SemiBoldItalic.ttf
│  │  │  ├─ Inter_18pt-Thin.ttf
│  │  │  ├─ Inter_18pt-ThinItalic.ttf
│  │  │  ├─ Inter_24pt-Black.ttf
│  │  │  ├─ Inter_24pt-BlackItalic.ttf
│  │  │  ├─ Inter_24pt-Bold.ttf
│  │  │  ├─ Inter_24pt-BoldItalic.ttf
│  │  │  ├─ Inter_24pt-ExtraBold.ttf
│  │  │  ├─ Inter_24pt-ExtraBoldItalic.ttf
│  │  │  ├─ Inter_24pt-ExtraLight.ttf
│  │  │  ├─ Inter_24pt-ExtraLightItalic.ttf
│  │  │  ├─ Inter_24pt-Italic.ttf
│  │  │  ├─ Inter_24pt-Light.ttf
│  │  │  ├─ Inter_24pt-LightItalic.ttf
│  │  │  ├─ Inter_24pt-Medium.ttf
│  │  │  ├─ Inter_24pt-MediumItalic.ttf
│  │  │  ├─ Inter_24pt-Regular.ttf
│  │  │  ├─ Inter_24pt-SemiBold.ttf
│  │  │  ├─ Inter_24pt-SemiBoldItalic.ttf
│  │  │  ├─ Inter_24pt-Thin.ttf
│  │  │  ├─ Inter_24pt-ThinItalic.ttf
│  │  │  ├─ Inter_28pt-Black.ttf
│  │  │  ├─ Inter_28pt-BlackItalic.ttf
│  │  │  ├─ Inter_28pt-Bold.ttf
│  │  │  ├─ Inter_28pt-BoldItalic.ttf
│  │  │  ├─ Inter_28pt-ExtraBold.ttf
│  │  │  ├─ Inter_28pt-ExtraBoldItalic.ttf
│  │  │  ├─ Inter_28pt-ExtraLight.ttf
│  │  │  ├─ Inter_28pt-ExtraLightItalic.ttf
│  │  │  ├─ Inter_28pt-Italic.ttf
│  │  │  ├─ Inter_28pt-Light.ttf
│  │  │  ├─ Inter_28pt-LightItalic.ttf
│  │  │  ├─ Inter_28pt-Medium.ttf
│  │  │  ├─ Inter_28pt-MediumItalic.ttf
│  │  │  ├─ Inter_28pt-Regular.ttf
│  │  │  ├─ Inter_28pt-SemiBold.ttf
│  │  │  ├─ Inter_28pt-SemiBoldItalic.ttf
│  │  │  ├─ Inter_28pt-Thin.ttf
│  │  │  └─ Inter_28pt-ThinItalic.ttf
│  │  └─ Prompt
│  │     ├─ Prompt-Black.ttf
│  │     ├─ Prompt-BlackItalic.ttf
│  │     ├─ Prompt-Bold.ttf
│  │     ├─ Prompt-BoldItalic.ttf
│  │     ├─ Prompt-ExtraBold.ttf
│  │     ├─ Prompt-ExtraBoldItalic.ttf
│  │     ├─ Prompt-ExtraLight.ttf
│  │     ├─ Prompt-ExtraLightItalic.ttf
│  │     ├─ Prompt-Italic.ttf
│  │     ├─ Prompt-Light.ttf
│  │     ├─ Prompt-LightItalic.ttf
│  │     ├─ Prompt-Medium.ttf
│  │     ├─ Prompt-MediumItalic.ttf
│  │     ├─ Prompt-Regular.ttf
│  │     ├─ Prompt-SemiBold.ttf
│  │     ├─ Prompt-SemiBoldItalic.ttf
│  │     ├─ Prompt-Thin.ttf
│  │     └─ Prompt-ThinItalic.ttf
│  ├─ images
│  │  └─ placeholder.jpg
│  ├─ uploads
│  │  ├─ processed
│  │  │  └─ .gitkeep
│  │  └─ .gitkeep
│  ├─ favicon.ico
│  ├─ logo.png
│  ├─ og-blog.png
│  ├─ og-home.png
│  ├─ og-image.png
│  ├─ og-service.png
│  ├─ robots.txt
│  ├─ sitemap-0.xml
│  ├─ sitemap.xml
│  ├─ web-app-manifest-192x192.png
│  └─ web-app-manifest-512x512.png
├─ reports
│  ├─ frontend
│  │  ├─ ADMIN.md
│  │  ├─ BUILD.json
│  │  ├─ ENV.md
│  │  ├─ I18N.md
│  │  ├─ INVENTORY.md
│  │  ├─ PERFORMANCE.md
│  │  ├─ PRISMA.md
│  │  ├─ ROUTES.md
│  │  ├─ SECURITY.md
│  │  └─ SEO.md
│  ├─ ENV.md
│  └─ INVENTORY.md
├─ scripts
│  ├─ buildArticleIndex.js
│  ├─ generateProperties.ts
│  ├─ i18n-check.ts
│  ├─ provinces.json
│  ├─ purge-nonre.ts
│  ├─ update-rates.ts
│  └─ xray-lite.js
├─ src
│  ├─ components
│  │  ├─ admin
│  │  │  └─ AdminLoginForm.tsx
│  │  ├─ JsonLd
│  │  │  └─ BreadcrumbJsonLd.tsx
│  │  ├─ search
│  │  │  └─ SearchPanel.tsx
│  │  ├─ Breadcrumbs.tsx
│  │  ├─ ContactIcons.tsx
│  │  ├─ CurrencySwitcher.tsx
│  │  ├─ FloatingContacts.tsx
│  │  ├─ PropertyCard.tsx
│  │  ├─ PropertyFilters.tsx
│  │  ├─ PropertyImage.tsx
│  │  └─ PropertyPrice.tsx
│  ├─ config
│  │  ├─ contact.ts
│  │  └─ nav.ts
│  ├─ context
│  │  ├─ AdminAuthContext.tsx
│  │  ├─ AdminPreviewContext.tsx
│  │  ├─ ConsoleUserContext.tsx
│  │  └─ CurrencyContext.tsx
│  ├─ hooks
│  │  ├─ useCachedFetch.ts
│  │  ├─ useConsolePaywall.ts
│  │  └─ useFavoritesQuota.ts
│  ├─ lib
│  │  ├─ admin
│  │  │  ├─ apiAuth.ts
│  │  │  └─ userUtils.ts
│  │  ├─ auth
│  │  │  ├─ consoleSession.ts
│  │  │  └─ session.ts
│  │  ├─ filters
│  │  │  └─ price.ts
│  │  ├─ fx
│  │  │  ├─ convert.ts
│  │  │  └─ updateRates.ts
│  │  ├─ http
│  │  │  └─ cookies.ts
│  │  ├─ image
│  │  │  └─ watermark.ts
│  │  ├─ logging
│  │  │  └─ audit.ts
│  │  ├─ nav
│  │  │  └─ crumbs.ts
│  │  ├─ scheduler
│  │  │  └─ schedule.ts
│  │  ├─ search
│  │  │  ├─ indexBuilder.ts
│  │  │  └─ shared.ts
│  │  ├─ security
│  │  │  ├─ adminCsrf.ts
│  │  │  ├─ csrf.ts
│  │  │  ├─ csrfConstants.ts
│  │  │  └─ rateLimit.ts
│  │  ├─ validation
│  │  │  └─ search.ts
│  │  ├─ api.ts
│  │  ├─ config.ts
│  │  ├─ prisma.ts
│  │  └─ seo.ts
│  ├─ styles
│  │  └─ fonts.ts
│  ├─ views
│  │  ├─ adminmanager
│  │  │  └─ AdminImageManager.tsx
│  │  ├─ console
│  │  │  ├─ ConsoleAccountView.tsx
│  │  │  ├─ ConsoleFavoritesView.tsx
│  │  │  ├─ ConsoleLayout.tsx
│  │  │  ├─ ConsoleOverviewView.tsx
│  │  │  ├─ ConsolePostsView.tsx
│  │  │  ├─ consoleServer.ts
│  │  │  └─ types.ts
│  │  ├─ guides
│  │  │  ├─ GuideDetailPageContent.tsx
│  │  │  ├─ guideDetailView.tsx
│  │  │  ├─ guidesListView.tsx
│  │  │  └─ GuidesPageContent.tsx
│  │  ├─ home
│  │  │  ├─ HomePageContent.tsx
│  │  │  └─ homeView.tsx
│  │  ├─ properties
│  │  │  ├─ PropertyDetailPageContent.tsx
│  │  │  ├─ propertyDetailView.tsx
│  │  │  └─ propertySearchView.tsx
│  │  ├─ search
│  │  │  ├─ SearchPageContent.tsx
│  │  │  └─ searchView.tsx
│  │  └─ shared
│  │     └─ loadCommonTranslation.ts
│  ├─ workers
│  │  └─ search.worker.ts
│  └─ env.ts
├─ styles
│  └─ globals.css
├─ test
│  ├─ middleware
│  │  └─ middleware.test.js
│  ├─ example.test.js
│  ├─ jsonld.test.js
│  ├─ LanguageSwitcher.test.js
│  ├─ MegaMenu.test.js
│  ├─ MobileMenu.test.js
│  └─ SearchPanel.test.js
├─ workspace
│  └─ multi-lang-virintira
│     └─ test
├─ .env
├─ .eslintrc.json
├─ .gitattributes
├─ .gitignore
├─ ADMIN_GUIDE.md
├─ archiver.d.ts
├─ FONT_SETUP.md
├─ LICENSE
├─ middleware.ts
├─ minisearch.d.ts
├─ next-env.d.ts
├─ next-i18next.config.js
├─ next-seo.config.js
├─ next-sitemap.config.js
├─ next.config.js
├─ package-lock.json
├─ package.json
├─ postcss.config.js
├─ README.md
├─ server.js
├─ tailwind.config.js
└─ tsconfig.json

```