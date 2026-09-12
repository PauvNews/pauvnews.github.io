# Weazel News Pages V2.4

Premium public Weazel News site prepared for GitHub Pages.

## V2.4
- Dark theme remains default.
- WEAZEL LIVE ticker rebuilt as a measured, seamless loop: no dead-air gap between copies and no delayed second strip.
- Custom Weazel scrollbar.
- Footer redesigned as an editorial footer; phone support wording added.
- Homepage gained the satirical “Weazel Editorial Standards” block.
- Reader is now button-only: no mouse drag.
- Page transition animation remains, but phantom/drag pages were removed.
- Interior newspaper pages render edge-to-edge with a tight spine.
- Hero side card bottom clipping was given extra space.

Content is still driven from `data/content.json`.


## GitHub Pages kurulumu
1. GitHub hesabında `KULLANICIADIN.github.io` isimli public repository oluştur.
2. Bu paketin ZIP içeriğini repository köküne yükle. ZIP dosyasını doğrudan yükleme.
3. `Settings > Pages` ekranına gir.
4. `Source` olarak `Deploy from a branch` seç.
5. Branch: `main`, Folder: `/(root)` ve Save.
6. Yayın adresi `https://KULLANICIADIN.github.io/` olur. İlk yayın birkaç dakika sürebilir.

### DevTools uyarısı
`assets/guard.js` sağ tık, F12 ve yaygın geliştirici aracı kısayollarını engelleyen bir caydırıcı katman içerir. Public bir web sitesinde geliştirici araçlarını veya kaynak kod erişimini tamamen engellemek teknik olarak mümkün değildir.
