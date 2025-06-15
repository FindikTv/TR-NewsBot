// Türkçe AI Haber Özetleyici & Seslendirici
// Tüm mantık burada!

// 1. NewsAPI anahtarını buraya gir (kendi anahtarın veya örnek anahtar ile devam edebilirsin)
const NEWS_API_KEY = "3f26e43147d34e7b975742c3657f1ff5"; // Değiştirilebilir

// 2. Haberleri buradan çekiyoruz
const NEWS_URL = `https://newsapi.org/v2/top-headlines?country=tr&pageSize=20&apiKey=${NEWS_API_KEY}`;

// 3. Türkçe özetleme için HuggingFace Transformers.js veya örnek bir client-side özetleyici kullanılabilir
//     (Burada örnek olarak basit bir özetleyici fonksiyon eklenmiştir. Daha iyisi için HuggingFace entegrasyonu README'de anlatıldı.)

const SUMMARY_MAX_LENGTH = 240; // karakter

// 4. Her haberin ekranda kalma süresi (saniye)
const DISPLAY_TIME = 35;

// 5. Haber/özete geçişteki kitap sayfası efekti için zaman (ms)
const PAGE_TRANSITION_MS = 400;

// --- DOM referansları ---
const titleEl = document.getElementById('news-title');
const summaryEl = document.getElementById('news-summary');
const linkEl = document.getElementById('news-link');
const statusEl = document.getElementById('status');
const progressBar = document.getElementById('progress');

let newsList = [];
let currentIdx = 0;
let timer = null;
let synth = window.speechSynthesis;

// --- Ana akış başlar ---
window.onload = async function() {
  showStatus("Haberler yükleniyor...");
  newsList = await fetchNews();
  if (!newsList.length) {
    showStatus("Hiç haber bulunamadı. API anahtarınızı veya bağlantınızı kontrol edin.");
    titleEl.textContent = "Haber bulunamadı.";
    summaryEl.textContent = "";
    return;
  }
  showStatus("");
  currentIdx = 0;
  showNews(newsList[currentIdx]);
  startLoop();
};

// --- Haberleri NewsAPI'dan çek ---
async function fetchNews() {
  try {
    const resp = await fetch(NEWS_URL);
    if (!resp.ok) throw new Error("API hatası!");
    const data = await resp.json();
    if (data.status !== "ok" || !data.articles) return [];
    return data.articles.filter(x => x.title && x.description);
  } catch (e) {
    showStatus("API bağlantı hatası: " + e.message);
    return [];
  }
}

// --- Haber özetini hazırla (örnek: basit özetleme) ---
async function summarizeText(text) {
  // Basit kural: çok uzun cümleleri kısalt
  if (!text) return '';
  if (text.length <= SUMMARY_MAX_LENGTH) return text;
  // Noktadan bölerek ilk 2 cümleyi al
  let sentences = text.split(/[.!?]/g).map(s => s.trim()).filter(Boolean);
  let summary = '';
  for (let s of sentences) {
    if ((summary + s).length > SUMMARY_MAX_LENGTH) break;
    summary += s + '. ';
  }
  if (!summary) summary = text.slice(0, SUMMARY_MAX_LENGTH) + '...';
  return summary.trim();
  // Daha gelişmiş özet için HuggingFace Transformers.js entegrasyonu ekleyebilirsiniz.
}

// --- Türkçe metni seslendir ---
function speakText(text) {
  if (!synth) return;
  synth.cancel(); // O anda okunanı durdur
  let utter = new window.SpeechSynthesisUtterance(text);
  utter.lang = "tr-TR";
  utter.rate = 1.03;
  utter.pitch = 1;
  utter.volume = 1;
  // Türkçe ses önceliği
  let voices = synth.getVoices().filter(v => v.lang.startsWith('tr'));
  if (voices.length) utter.voice = voices[0];
  synth.speak(utter);
}

// --- Haber ve özetini ekrana getir ---
async function showNews(article) {
  titleEl.textContent = article.title;
  let summary = await summarizeText(article.description || article.content || article.title);
  summaryEl.textContent = summary;
  linkEl.href = article.url || "#";
  linkEl.style.display = article.url ? "inline-block" : "none";
  linkEl.textContent = article.source?.name ? `Kaynak: ${article.source.name}` : "Haberi Kaynağında Oku";
  // Seslendir
  speakText(summary);
  // Progress bar sıfırla
  progressBar.style.width = "0%";
  animateProgressBar(DISPLAY_TIME);
}

// --- Sonraki habere geç ---
async function nextNews() {
  currentIdx = (currentIdx + 1) % newsList.length;
  // Kitap sayfa efekti için
  summaryEl.parentElement.style.opacity = 0.2;
  setTimeout(() => {
    summaryEl.parentElement.style.opacity = 1;
    showNews(newsList[currentIdx]);
  }, PAGE_TRANSITION_MS);
}

// --- Sürekli döngü ---
function startLoop() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    nextNews();
    startLoop();
  }, DISPLAY_TIME * 1000);
}

// --- Progress bar animasyonu ---
function animateProgressBar(seconds) {
  progressBar.style.transition = "none";
  progressBar.style.width = "0%";
  setTimeout(() => {
    progressBar.style.transition = `width ${seconds}s linear`;
    progressBar.style.width = "100%";
  }, 50);
}

// --- Durum mesajı göster ---
function showStatus(msg) {
  statusEl.textContent = msg || '';
}

// --- (Ekstra) Gelişmiş özetleme için örnek HuggingFace entegrasyonu: ---
//   (Küçük Türkçe özet modeli için transformers.js ve model dosyası yüklemeniz gerekir.)
//   README'de detaylı anlatılmıştır.

// --- (Ekstra) RSS ve sosyal medya eklemek için örnek fonksiyonlar: ---
/*
async function fetchRSS(url) {
  // RSS feed'den haber çekmek için (örneğin, rss2json.com veya ücretsiz bir proxy ile kullanılabilir)
}
async function fetchFromSocialMedia() {
  // Instagram/Facebook/X için public API veya scraping ile çekilebilir (geliştirmeye açık)
}
*/

// --- Kullanıcıdan başka bir şey istemez, her şey otomatik başlar! ---