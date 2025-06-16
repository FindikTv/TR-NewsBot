// main.js - TR-NewsBot (Güncellenmiş sürüm)

// --- 1. Ayarlar ---
const NEWS_API_KEY = "3f26e43147d34e7b975742c3657f1ff5"; // Mevcut NewsAPI anahtarın
const PROXY = "https://corsproxy.io/?"; // CORS için geçici çözüm
const NEWS_URL = `${PROXY}https://newsapi.org/v2/top-headlines?country=tr&pageSize=20&apiKey=${NEWS_API_KEY}`;
const SUMMARY_MAX_LENGTH = 240;
const DISPLAY_TIME = 35; // saniye
const PAGE_TRANSITION_MS = 400;

// --- 2. DOM referansları ---
const titleEl = document.getElementById('news-title');
const summaryEl = document.getElementById('news-summary');
const linkEl = document.getElementById('news-link');
const statusEl = document.getElementById('status');
const progressBar = document.getElementById('progress');

let newsList = [];
let currentIdx = 0;
let timer = null;
let synth = window.speechSynthesis;

// --- 3. Başlangıç ---
window.onload = async function() {
  showStatus("Haberler yükleniyor...");
  newsList = await fetchNews();
  if (!newsList.length) {
    showStatus("Hiç haber bulunamadı. API anahtarınızı veya bağlantınızı kontrol edin.");
    titleEl.textContent = "Haber alınamadı.";
    summaryEl.textContent = "Sunucu, CORS veya API anahtarı hatası olabilir.";
    return;
  }
  showStatus("");
  currentIdx = 0;
  showNews(newsList[currentIdx]);
  startLoop();
};

// --- 4. Haberleri API'dan çek ---
async function fetchNews() {
  try {
    const resp = await fetch(NEWS_URL);
    const text = await resp.text();
    console.log("HAM YANIT:", text);
    const data = JSON.parse(text);
    if (data.status !== "ok" || !data.articles || data.articles.length === 0) {
      throw new Error("NewsAPI 'ok' dönmedi veya haber yok.");
    }
    return data.articles.filter(x => x.title && x.description);
  } catch (e) {
    showStatus("API bağlantı hatası: " + e.message);
    titleEl.textContent = "Haber alınamadı.";
    summaryEl.textContent = "Sunucu, CORS veya API anahtarı hatası olabilir.";
    return [];
  }
}

// --- 5. Özetleme fonksiyonu ---
async function summarizeText(text) {
  if (!text) return '';
  if (text.length <= SUMMARY_MAX_LENGTH) return text;
  let sentences = text.split(/[.!?]/g).map(s => s.trim()).filter(Boolean);
  let summary = '';
  for (let s of sentences) {
    if ((summary + s).length > SUMMARY_MAX_LENGTH) break;
    summary += s + '. ';
  }
  return summary.trim() || text.slice(0, SUMMARY_MAX_LENGTH) + '...';
}

// --- 6. Sesli okuma ---
function speakText(text) {
  if (!synth) return;
  synth.cancel();
  let utter = new window.SpeechSynthesisUtterance(text);
  utter.lang = "tr-TR";
  utter.rate = 1.03;
  utter.pitch = 1;
  utter.volume = 1;
  let voices = synth.getVoices().filter(v => v.lang.startsWith('tr'));
  if (voices.length) utter.voice = voices[0];
  synth.speak(utter);
}

// --- 7. Haberi göster ---
async function showNews(article) {
  titleEl.textContent = article.title;
  let summary = await summarizeText(article.description || article.content || article.title);
  summaryEl.textContent = summary;
  linkEl.href = article.url || "#";
  linkEl.style.display = article.url ? "inline-block" : "none";
  linkEl.textContent = article.source?.name ? `Kaynak: ${article.source.name}` : "Haberi Kaynağında Oku";
  speakText(summary);
  progressBar.style.width = "0%";
  animateProgressBar(DISPLAY_TIME);
}

// --- 8. Bir sonraki habere geç ---
async function nextNews() {
  currentIdx = (currentIdx + 1) % newsList.length;
  summaryEl.parentElement.style.opacity = 0.2;
  setTimeout(() => {
    summaryEl.parentElement.style.opacity = 1;
    showNews(newsList[currentIdx]);
  }, PAGE_TRANSITION_MS);
}

// --- 9. Otomatik döngü ---
function startLoop() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    nextNews();
    startLoop();
  }, DISPLAY_TIME * 1000);
}

// --- 10. Progress bar animasyonu ---
function animateProgressBar(seconds) {
  progressBar.style.transition = "none";
  progressBar.style.width = "0%";
  setTimeout(() => {
    progressBar.style.transition = `width ${seconds}s linear`;
    progressBar.style.width = "100%";
  }, 50);
}

// --- 11. Durum mesajı ---
function showStatus(msg) {
  statusEl.textContent = msg || '';
}
