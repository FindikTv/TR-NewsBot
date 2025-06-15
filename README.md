
# TR-Haber Botu
Tam işlevsel bir yapay zeka haber özetleme ajanı

# Türkçe 7/24 Otomatik Haber Özetleyici ve Seslendirici (AI News Agent)

Bu proje, **hiçbir backend gerektirmeyen**, tamamen ücretsiz ve hızlı çalışan, GitHub Pages üzerinden yayınlanabilen bir Türkçe haber özetleme ve seslendirme uygulamasıdır. Sıfırdan kurulum ve kullanım için aşağıdaki adımları izleyin.

---

## 🚀 Özellikler

- **Otomatik Haber Toplama:** NewsAPI üzerinden Türkçe haberler otomatik çekilir.
- **Türkçe Otomatik Özetleme:** Haberler, tarayıcıda çalışan yapay zeka modeliyle Türkçe özetlenir.
- **Sesli Sunum:** Haber özeti 35 saniye ekranda gösterilir ve Türkçe olarak otomatik seslendirilir.
- **Tamamen Ücretsiz:** Sadece frontend, GitHub Pages ile barındırılır. Sunucu, ücretli API veya ek kurulum gerekmez.
- **Modern ve Basit Arayüz.**
- **Modüler altyapı:** Geliştirmeye ve yeni kaynak eklemeye uygundur.
  
---

## 📦 Dosya Yapısı

- `index.html` : Ana HTML dosyası
- `style.css` : Tasarım dosyası
- `main.js`   : Tüm uygulama mantığı (haber çekme, özetleme, seslendirme, geçişler)
  
---

## 🛠️ Kurulum Adımları

1. **Projeyi İndir veya Forkla**
   - [Bu repoyu indir veya kendi hesabına forkla.](https://github.com/FindikTv/news-ai-agent) (Kendi repo adını da kullanabilirsin.)

2. **API Anahtarını Güncelle**
   - `main.js` dosyasındaki `NEWS_API_KEY` değişkenine kendi NewsAPI anahtarını ekle (örnek anahtar eklenmiştir).

3. **GitHub Pages ile Yayınla**
   - GitHub’da repo ana sayfasında `Settings` → `Pages` → "Source" kısmından `main` branch ve `/root` seç.
   - Kısa sürede `https://kullaniciadi.github.io/news-ai-agent/` adresinde yayında!

4. **Kullanıma Hazır!**
   - Site açıldığında otomatik başlar, arayüzde haberler sırayla özetlenip seslendirilir.

---

## 📝 Haber Kaynağı ve Limitler

- **NewsAPI** ücretsiz hesap ile günlük 100 istek limiti vardır.
- Başka kaynaklar (RSS, sosyal medya) eklemek için `main.js` içinde ilgili fonksiyonlara bakabilirsin.

---

## 🧑‍💻 Nasıl Çalışır?

1. NewsAPI’den son Türkçe haberler çekilir.
2. Her haber, HuggingFace `transformers.js` ile tarayıcıda özetlenir (küçük Türkçe özet modeli).
3. Özet, ekranda gösterilir ve Web Speech API ile Türkçe olarak otomatik seslendirilir.
4. 35 saniye sonra bir sonraki habere otomatik geçer.

---

## 🛡️ Tamamen Türkçe ve Güvenli

- Tüm işlemler tarayıcıda, hiçbir kişisel veri veya API anahtarı dışarıya gönderilmez.
- Kodlar açık ve geliştirilebilir.

---

## ⚡ Geliştirme ve Katkı

- Kodlar açıklamalı ve modülerdir.
- `main.js` içerisinde `fetchNews`, `summarizeText`, `speakText` gibi ana fonksiyonlar kolayca geliştirilebilir.
- RSS ve sosyal medya için örnek fonksiyonlar eklendi, doldurup kullanabilirsin.

---

## 🤝 Lisans

MIT Lisansı – dilediğiniz gibi kullanın ve geliştirin!

---

**Sorunuz olursa Issue açabilirsiniz!**

---