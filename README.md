# Weazel News — GitHub Pages Live

Bu sürüm demo içerik içermez. `data/content.json` ilk kurulumda boştur ve `vf-weazelapp` içindeki GitHub senkronu tarafından otomatik güncellenmek üzere hazırlanmıştır.

GitHub Pages ayarı:
- Source: Deploy from a branch
- Branch: `main`
- Folder: `/(root)`

FiveM tarafı yayın akışı:
- Telefon uygulamasında Grade 6+ son onay verir.
- İçerik SQL'de `published` olur.
- `vf-weazelapp` GitHub Contents API ile bu repodaki `data/content.json` dosyasını günceller.
- GitHub Pages yeni commit'i otomatik yayınlar.

Bu site `featured`, `articles` ve `issues` alanlarını `data/content.json` üzerinden okur. İçerik yokken boş/dummy demo göstermeden canlı boş durum ekranları gösterir.
