// TR-NewsBot 24/7 - Bulut Tabanlı Tam Sürüm
// ===========================================

// --- 1. KONFİGÜRASYON ---
const CONFIG = {
  NEWS_API_KEY: "3f26e43147d34e7b975742c3657f1ff5", // Kendi anahtarınızı girin
  HF_API_KEY: "YOUR_HUGGINGFACE_KEY", // HuggingFace'den ücretsiz alın
  RSS_SOURCES: [
    "https://www.ntv.com.tr/son-dakika.rss",
    "https://www.cnnturk.com/feed/rss/news"
  ],
  DISPLAY_TIME: 35, // saniye
  PROXY: "https://api.allorigins.win/raw?url=",
  USE_AI_SUMMARY: true, // HuggingFace aktif
  USE_AWS_POLLY: false // Web Speech kullan
};

// --- 2. DOM ELEMENTLERİ ---
const elements = {
  title: document.getElementById('news-title'),
  summary: document.getElementById('news-summary'),
  link: document.getElementById('news-link'),
  status: document.getElementById('status'),
  progress: document.getElementById('progress')
};

// --- 3. DEĞİŞKENLER ---
let newsData = [];
let currentIndex = 0;
let speechSynth = window.speechSynthesis;

// --- 4. UYGULAMA BAŞLATMA ---
document.addEventListener('DOMContentLoaded', async () => {
  showStatus("⏳ Haberler yükleniyor...");
  
  try {
    newsData = await loadNews();
    if (newsData.length === 0) throw new Error("Haber bulunamadı");
    
    showStatus("");
    showNewsItem(0);
    startNewsCycle();
    
  } catch (error) {
    showError(error);
  }
});

// --- 5. HABER YÜKLEME FONKSİYONLARI ---
async function loadNews() {
  // Önce localStorage kontrolü
  const cachedNews = getCachedNews();
  if (cachedNews) return cachedNews;

  // Çoklu kaynaktan veri çekme
  const [apiNews, rssNews] = await Promise.all([
    fetchNewsAPI(),
    fetchRSSFeeds()
  ]);

  const allNews = [...apiNews, ...rssNews]
    .filter(item => item.title && item.description)
    .slice(0, 20); // Maksimum 20 haber

  // Önbelleğe al
  cacheNews(allNews);
  return allNews;
}

async function fetchNewsAPI() {
  const url = `${CONFIG.PROXY}https://newsapi.org/v2/top-headlines?country=tr&apiKey=${CONFIG.NEWS_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.articles || [];
}

async function fetchRSSFeeds() {
  const allItems = [];
  
  for (const rssUrl of CONFIG.RSS_SOURCES) {
    try {
      const response = await fetch(`${CONFIG.PROXY}${rssUrl}`);
      const text = await response.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, "text/xml");
      
      Array.from(xml.querySelectorAll('item')).forEach(item => {
        allItems.push({
          title: item.querySelector('title')?.textContent,
          description: item.querySelector('description')?.textContent,
          url: item.querySelector('link')?.textContent,
          source: { name: "RSS" }
        });
      });
    } catch (error) {
      console.error(`RSS hatası (${rssUrl}):`, error);
    }
  }
  
  return allItems;
}

// --- 6. ÖZETLEME FONKSİYONLARI ---
async function summarizeContent(text) {
  if (!CONFIG.USE_AI_SUMMARY || text.length < 150) return text;

  try {
    const response = await fetch("https://api-inference.huggingface.co/models/csebuetnlp/mT5_multilingual_XLSum", {
      method: "POST",
      headers: { "Authorization": `Bearer ${CONFIG.HF_API_KEY}` },
      body: JSON.stringify({ 
        inputs: text,
        parameters: { max_length: 80, min_length: 30 }
      })
    });
    
    const result = await response.json();
    return result[0]?.summary_text || text;
  } catch (error) {
    console.error("AI özetleme hatası:", error);
    return text.slice(0, 200) + (text.length > 200 ? "..." : "");
  }
}

// --- 7. SESLENDİRME FONKSİYONLARI ---
function speakText(text) {
  if (!text) return;
  
  // Mevcut sesi durdur
  speechSynth.cancel();

  // Web Speech API ile seslendirme
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'tr-TR';
  utterance.rate = 1.0;
  
  // Türkçe ses bulunmazsa varsayılan ses
  const turkishVoice = speechSynth.getVoices().find(v => v.lang.startsWith('tr'));
  if (turkishVoice) utterance.voice = turkishVoice;
  
  speechSynth.speak(utterance);
}

// --- 8. GÖSTERİM FONKSİYONLARI ---
async function showNewsItem(index) {
  if (!newsData[index]) return;
  
  const item = newsData[index];
  elements.title.textContent = item.title;
  
  // Özetleme
  const rawText = item.description || item.content || item.title;
  elements.summary.textContent = await summarizeContent(rawText);
  
  // Link ayarları
  elements.link.href = item.url || "#";
  elements.link.textContent = item.source?.name ? `Kaynak: ${item.source.name}` : "Devamı";
  elements.link.style.display = item.url ? "inline-block" : "none";
  
  // Seslendirme
  speakText(elements.summary.textContent);
  
  // Progress bar animasyonu
  animateProgressBar();
}

function animateProgressBar() {
  elements.progress.style.transition = 'none';
  elements.progress.style.width = '0%';
  
  setTimeout(() => {
    elements.progress.style.transition = `width ${CONFIG.DISPLAY_TIME}s linear`;
    elements.progress.style.width = '100%';
  }, 50);
}

function startNewsCycle() {
  setInterval(() => {
    currentIndex = (currentIndex + 1) % newsData.length;
    showNewsItem(currentIndex);
  }, CONFIG.DISPLAY_TIME * 1000);
}

// --- 9. YARDIMCI FONKSİYONLAR ---
function cacheNews(data) {
  if (!data || !data.length) return;
  localStorage.setItem('cachedNews', JSON.stringify({
    data: data,
    timestamp: Date.now()
  }));
}

function getCachedNews() {
  const cache = localStorage.getItem('cachedNews');
  if (!cache) return null;
  
  const { data, timestamp } = JSON.parse(cache);
  const isExpired = (Date.now() - timestamp) > 3600000; // 1 saat önbellek
  
  return isExpired ? null : data;
}

function showStatus(message) {
  elements.status.textContent = message || '';
}

function showError(error) {
  console.error(error);
  elements.title.textContent = "Hata Oluştu";
  elements.summary.textContent = error.message || "Teknik bir sorun var";
  elements.link.style.display = "none";
  showStatus("❌ " + (error.message || "Lütfen daha sonra tekrar deneyin"));
}

// --- 10. TARAYICI DESTEK KONTROLÜ ---
if (!('speechSynthesis' in window)) {
  showError(new Error("Tarayıcınız seslendirmeyi desteklemiyor"));
}