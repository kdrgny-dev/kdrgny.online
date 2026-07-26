# kdrgny.online

Kadir Günay'ın kişisel CV sitesi — [cv.kdrgny.com](https://cv.kdrgny.com)

Astro + Tailwind + three.js. İçerik **JustJSON** ile düzenlenir; sunucu, veritabanı,
hesap yok — her şey bu repoda düz JSON olarak durur.

## İçeriği düzenlemek

```bash
npx @kdrgny/justjson
```

Tarayıcıda editör açılır, `content/` altındaki JSON'ları düzenlersin. Kaydettikten sonra:

```bash
git add content && git commit -m "content: …" && git push
```

Vercel otomatik yeniden yayınlar.

```
content/
  _schema.json          ← içerik şeması (editörden yönetilir)
  home.json             ← ad, unvan, foto, konum, özet
  experience/*.json     ← iş deneyimi
  projects/*.json       ← projeler
  skills/*.json         ← yetenekler
  certificates/*.json   ← sertifikalar
  urls/*.json           ← sosyal bağlantılar
```

## Geliştirme

Node 22 gerekir (`.nvmrc` mevcut):

```bash
nvm use
npm install
npm run dev
```

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | `dist/` üretir |
| `npm run preview` | Build çıktısını yerelde servis eder |
| `npx @kdrgny/justjson` | İçerik editörünü açar |

## Yapı

- `src/components/Horizon.astro` + `src/scripts/horizon.ts` — WebGL ufuk sahnesi
  (deniz + gökyüzü; scroll ilerledikçe günün saati, dolayısıyla kariyer yayı ilerler)
- `src/lib/cv.ts` — `content/` içindeki JSON'u build anında okuyan veri katmanı
- `docs/scene-contract.md` — sahne ile içerik arasındaki `data-era` sözleşmesi

Eski Next.js sürümü: `v1-nextjs` tag'i ve `archive/nextjs` dalında duruyor.
