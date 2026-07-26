# kdrgny.online — çalışma notları

Kadir Günay'ın kişisel CV sitesi (cv.kdrgny.com). Astro 7 + Tailwind + three.js.

## Node

**Node 22 zorunlu** (Astro 7 + `engines`). Varsayılan node bu makinede v20 ve build'i kırar:

```bash
export PATH="$HOME/.nvm/versions/node/v22.23.1/bin:$PATH"
```

`.nvmrc` mevcut → `nvm use` de yeterli.

## Mimari

- `content/` — **içerik burada, düz JSON**. JustJSON ile düzenlenir (`npx @kdrgny/justjson`).
  Elle düzenlenebilir ama şema `content/_schema.json`'da; editör onu kullanır.
- `src/lib/cv.ts` — `content/`'i build anında okur, sıralar ve tipli olarak dışa verir.
  **İçeriği okuyan tek yer burası.** Bileşenler `content/`'e doğrudan dokunmaz.
- `src/scripts/horizon.ts` + `shaders/` — kalıcı WebGL ufuk sahnesi (deniz + gökyüzü).
- `src/scripts/horizon-eras.ts` — altı dönemin paleti. Sahnenin tüm sanat yönetimi burada.
- `docs/scene-contract.md` — sahne ile içerik arasındaki `data-era` sözleşmesi. **Önce bunu oku.**

Sayfa, scroll ilerledikçe günün saatini ilerleten tek bir sahne üstünde akar; bu aynı zamanda
kariyer yayıdır: `dawn → media → food → health → igaming → night`.

## Türkçe metin kuralı (dikkat)

Sayfa `lang="en"`. `text-transform: uppercase` **locale duyarlıdır**: İngilizce kuralıyla
`Kadir → KADIR` olur, doğrusu `KADİR`'dir. Büyük harfe çevrilen **Türkçe özel adlara**
(`Kadir`, `Nişantaşı`, `Doğuş`, `Acıbadem`…) mutlaka `lang="tr"` verin.

## Doğrulama

```bash
export PATH="$HOME/.nvm/versions/node/v22.23.1/bin:$PATH"
npm run build
npx --yes serve dist -p 4321
```

**Build'in geçmesi yeterli değildir.** Sahne bir shader derleme hatasında düz gri render eder
ve build yine de yeşil görünür. Değişiklikten sonra sayfayı tarayıcıda açıp **konsolu okuyun**;
`#horizon` üzerinde `data-state="ready"` olmalı.

## Yayın

Repo Vercel'e git-bağlı: `main`'e push → ~10 sn'de canlı. `vercel.json` Astro preset'ini sabitler.

İçerik değişikliği akışı: `npx @kdrgny/justjson` → düzenle → `git add content && git commit && git push`.

## Kod tarzı

- Gereksiz yorum yok; yorum "neden"i açıklar, "ne"yi değil.
- Erişilebilirlik pazarlık konusu değil: landmark'lar, tek `h1`, görünür focus, `prefers-reduced-motion`.
- Her animasyon `prefers-reduced-motion: reduce` altında durmalı.
- `@media print` çalışır durumda tutulmalı — bu bir CV; basılıyor.

## Eski sürüm

Next.js 12 hâli `v1-nextjs` tag'inde ve `archive/nextjs` dalında.
