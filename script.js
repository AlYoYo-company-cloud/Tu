const LESSONS = [
  {
    id: "chapter-1",
    chapter: 1,
    title: "الفصل الأول: الكميات الفيزيائية وطرق القياس",
    subtitle: "أساسيات القياس، الوحدات، والدقة العلمية.",
    youtubeId: "nE2D7phXf6Q",
  },
  {
    id: "chapter-2",
    chapter: 2,
    title: "الفصل الثاني: الحركة الخطية",
    subtitle: "الإزاحة، السرعة، والعجلة بأسلوب مبسط.",
    youtubeId: "hgUs7yZmW00",
  },
  {
    id: "chapter-3",
    chapter: 3,
    title: "الفصل الثالث: قوانين نيوتن",
    subtitle: "القوى والاحتكاك والحركة.",
    youtubeId: "cd0kiswwh-A",
  },
  {
    id: "chapter-4",
    chapter: 4,
    title: "الفصل الرابع: الشغل والطاقة",
    subtitle: "الشغل، الطاقة، والقدرة.",
    youtubeId: "cEhkuWwFQLE",
  },
];

const STORAGE_KEYS = {
  active: "rami_active",
  fav: "rami_fav",
  recent: "rami_recent",
  views: "rami_views",
  progress: "rami_progress",
};

const els = {
  grid: document.getElementById("lessonsGrid"),
  favGrid: document.getElementById("favoritesGrid"),
  playlist: document.getElementById("playlist"),
  recommendations: document.getElementById("recommendations"),
  recent: document.getElementById("recentlyWatched"),
  continueWatching: document.getElementById("continueWatching"),
  mostViewed: document.getElementById("mostViewed"),
  search: document.getElementById("lessonSearch"),
  playerTitle: document.getElementById("playerTitle"),
  playerMeta: document.getElementById("playerMeta"),
  frame: document.getElementById("lessonFrame"),
  favBtn: document.getElementById("favoriteActiveBtn"),
  prevBtn: document.getElementById("prevLessonBtn"),
  nextBtn: document.getElementById("nextLessonBtn"),
  progressFill: document.getElementById("progressFill"),
  progressLabel: document.getElementById("progressLabel"),
  toast: document.getElementById("toastRoot"),
};

const state = {
  active: null,
  fav: new Set(),
  recent: [],
  views: {},
  progress: {},
};

function save() {
  localStorage.setItem(STORAGE_KEYS.active, state.active);
  localStorage.setItem(STORAGE_KEYS.fav, JSON.stringify([...state.fav]));
  localStorage.setItem(STORAGE_KEYS.recent, JSON.stringify(state.recent));
  localStorage.setItem(STORAGE_KEYS.views, JSON.stringify(state.views));
  localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(state.progress));
}

function load() {
  state.active = localStorage.getItem(STORAGE_KEYS.active) || LESSONS[0].id;
  state.fav = new Set(JSON.parse(localStorage.getItem(STORAGE_KEYS.fav) || "[]"));
  state.recent = JSON.parse(localStorage.getItem(STORAGE_KEYS.recent) || "[]");
  state.views = JSON.parse(localStorage.getItem(STORAGE_KEYS.views) || "{}");
  state.progress = JSON.parse(localStorage.getItem(STORAGE_KEYS.progress) || "{}");
}

function getLesson(id) {
  return LESSONS.find(l => l.id === id);
}

function embed(id) {
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

function toast(msg) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  els.toast.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

function setActive(id) {
  const lesson = getLesson(id);
  if (!lesson) return;

  state.active = id;
  state.views[id] = (state.views[id] || 0) + 1;

  els.frame.src = embed(lesson.youtubeId);
  els.playerTitle.textContent = lesson.title;
  els.playerMeta.textContent = lesson.subtitle;

  state.recent = [id, ...state.recent.filter(x => x !== id)].slice(0, 8);

  save();
  render();
  toast("تم تشغيل الدرس");
}

function toggleFav(id) {
  if (state.fav.has(id)) {
    state.fav.delete(id);
    toast("تم الحذف من المفضلة");
  } else {
    state.fav.add(id);
    toast("تمت الإضافة إلى المفضلة");
  }
  save();
  render();
}

function renderLessons(list = LESSONS) {
  els.grid.innerHTML = list.map(l => `
    <div class="card">
      <h3>${l.title}</h3>
      <p>${l.subtitle}</p>
      <button onclick="setActive('${l.id}')">تشغيل</button>
      <button onclick="toggleFav('${l.id}')">★</button>
    </div>
  `).join("");
}

function renderFav() {
  const favLessons = [...state.fav].map(getLesson).filter(Boolean);

  els.favGrid.innerHTML = favLessons.length
    ? favLessons.map(l => `<div class="card">${l.title}</div>`).join("")
    : "<p>لا توجد دروس مفضلة</p>";
}

function renderRecent() {
  els.recent.innerHTML = state.recent.map(getLesson).filter(Boolean)
    .map(l => `<div class="card small">${l.title}</div>`).join("");
}

function renderMostViewed() {
  const sorted = [...LESSONS]
    .sort((a, b) => (state.views[b.id] || 0) - (state.views[a.id] || 0))
    .slice(0, 3);

  els.mostViewed.innerHTML = sorted.map(l =>
    `<div class="card small">${l.title}</div>`
  ).join("");
}

function renderRecommendations() {
  const active = getLesson(state.active);
  const rec = LESSONS.filter(l =>
    l.id !== state.active && l.chapter === active.chapter
  );

  els.recommendations.innerHTML = rec.map(l =>
    `<div class="card small">${l.title}</div>`
  ).join("");
}

function renderProgress() {
  const p = state.progress[state.active] || 0;
  els.progressFill.style.width = p + "%";
  els.progressLabel.textContent = p + "%";
}

function searchLessons(q) {
  const filtered = LESSONS.filter(l =>
    l.title.includes(q) || l.subtitle.includes(q)
  );
  renderLessons(filtered);
}

function bindEvents() {
  els.search.addEventListener("input", e => {
    searchLessons(e.target.value);
  });

  els.favBtn?.addEventListener("click", () => toggleFav(state.active));

  els.prevBtn?.addEventListener("click", () => {
    const i = LESSONS.findIndex(l => l.id === state.active);
    if (i > 0) setActive(LESSONS[i - 1].id);
  });

  els.nextBtn?.addEventListener("click", () => {
    const i = LESSONS.findIndex(l => l.id === state.active);
    if (i < LESSONS.length - 1) setActive(LESSONS[i + 1].id);
  });
}

function render() {
  renderLessons();
  renderFav();
  renderRecent();
  renderMostViewed();
  renderRecommendations();
  renderProgress();
}

window.setActive = setActive;
window.toggleFav = toggleFav;

load();
bindEvents();
setActive(state.active);
render();
