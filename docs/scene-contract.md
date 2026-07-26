# Sahne ↔ içerik kontratı

Site tek bir kalıcı WebGL sahnesi (ufuk: deniz + gökyüzü + ışık) üzerine kurulu.
Sahne arkada sabit durur, içerik üstünde akar. Scroll ilerledikçe **günün saati
ilerler**; bu, kariyerin 10 yıllık yayını.

## Dönemler (era)

Sayfa yukarıdan aşağıya şu dönemleri sırayla geçer. Her içerik bölümü kök
elemanına `data-era` koyar:

| `data-era` | Anlatı | Işık |
|---|---|---|
| `dawn` | Açılış / hero — Ayvalık, kim olduğu | şafak, düşük güneş, pus |
| `media` | Doğuş Media Group, NTV projeleri | sabah, berrak, yatay ritim |
| `food` | TFI TAB Food Investments, tiklagelsin | öğle, sıcak, yüksek güneş |
| `health` | Acıbadem Technology | ikindi, sakin, düzenli nabız |
| `igaming` | Balina | altın saat → alacakaranlık |
| `night` | Yetenekler / sertifikalar / iletişim | gece, suda parıltı |

Örnek:

```astro
<section data-era="media" id="experience"> … </section>
```

## Sahne tarafının sorumluluğu

- `src/components/Horizon.astro` canvas'ı basar ve `src/scripts/horizon.ts`'i yükler.
- Script kendi scroll dinlemesini yapar; içerik tarafından çağrılmaz.
- İlerlemeyi `[data-era]` elemanlarının viewport'a göre konumundan hesaplar ve
  dönemler arasında **yumuşak geçiş** yapar (sert kesme yok).
- Canvas `position: fixed; inset: 0; z-index: 0;` ve `pointer-events: none`.
  İçerik `position: relative; z-index: 1`.

## İçerik tarafının sorumluluğu

- Her ana bölüme yukarıdaki `data-era` değerlerinden birini verir.
- Sahnenin üstünde okunabilirlik: metin blokları kendi zeminini taşır
  (backdrop-blur / yarı saydam panel / güçlü kontrast). Sahne asla metni yutmamalı.
- `<Horizon />` bileşenini `Layout.astro` içinde, içerikten **önce** basar.

## Ortak kurallar

- `prefers-reduced-motion: reduce` → sahne animasyonu durur, statik bir degrade kalır.
- Mobilde daha düşük çözünürlük/segment; `devicePixelRatio` sınırlanır (≤2).
- Sekme görünmezken (`document.hidden`) render döngüsü durur.
- WebGL yoksa/başarısızsa CSS degrade fallback görünür, site tam çalışır.
