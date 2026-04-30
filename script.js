const LESSONS = [
  {
    id: "chapter-1",
    chapter: 1,
    title: "الفصل الأول: الكميات الفيزيائية وطرق القياس",
    subtitle: "أساسيات القياس والدقة والوحدات",
    youtubeId: "nE2D7phXf6Q",
  },
  {
    id: "chapter-2",
    chapter: 2,
    title: "الفصل الثاني: الحركة الخطية",
    subtitle: "السرعة والعجلة والحركة في خط مستقيم",
    youtubeId: "hgUs7yZmW00",
  },
  {
    id: "chapter-3",
    chapter: 3,
    title: "الفصل الثالث: قوانين نيوتن",
    subtitle: "القوى والحركة وتطبيقات نيوتن",
    youtubeId: "cd0kiswwh-A",
  },
  {
    id: "chapter-4",
    chapter: 4,
    title: "الفصل الرابع: الشغل والطاقة",
    subtitle: "الطاقة والتحول والقدرة",
    youtubeId: "cEhkuWwFQLE",
  },
];

const STORAGE = {
  active: "rami_active",
  fav: "rami_fav",
  recent: "rami_recent",
  views: "rami_views",
  progress: "rami_progress",
  time: "rami_time",
};

const $ = (id) => document.getElementById(id);

const els = {
  grid: $("lessonsGrid"),
  favGrid: $("favoritesGrid"),
  recent: $("recentlyWatched"),
  mostViewed: $("mostViewed"),
  recommendations: $("recommendations"),
  search: $("lessonSearch"),
  frame: $("lessonFrame"),
  title: $("playerTitle"),
  meta: $("playerMeta"),
  progressFill: $("progressFill"),
  progressLabel: $("progressLabel"),
  favBtn: $("favoriteActiveBtn"),
};

const state = {
  active: null,
  fav: new Set(),
  recent: [],
  views: {},
  progress: {},
  time: {},
};

function save() {
  localStorage.setItem(STORAGE.active, state.active);
  localStorage.setItem(STORAGE.fav, JSON.stringify([...state.fav]));
  localStorage.setItem(STORAGE.recent, JSON.stringify(state.recent));
  localStorage.setItem(STORAGE.views, JSON.stringify(state.views));
  localStorage.setItem(STORAGE.progress, JSON.stringify(state.progress));
  localStorage.setItem(STORAGE.time, JSON.stringify(state.time));
}

function load() {
  state.active =
    localStorage.getItem(STORAGE.active) || LESSONS[0].id;

  state.fav = new Set(JSON.parse(localStorage.getItem(STORAGE.fav) || "[]"));
  state.recent = JSON.parse(localStorage.getItem(STORAGE.recent) || "[]");
  state.views = JSON.parse(localStorage.getItem(STORAGE.views) || "{}");
  state.progress = JSON.parse(localStorage.getItem(STORAGE.progress) || "{}");
  state.time = JSON.parse(localStorage.getItem(STORAGE.time) || "{}");
}

function getLesson(id) {
  return LESSONS.find((l) => l.id === id);
}

function embed(id) {
  return `https://www.youtube-nocookie.com/embed/${id}?enablejsapi=1`;
}

/* ---------------- ACTIVE LESSON ---------------- */

function setActive(id) {
  const lesson = getLesson(id);
  if (!lesson) return;

  state.active = id;

  state.views[id] = (state.views[id] || 0) + 1;

  state.recent = [id, ...state.recent.filter((x) => x !== id)].slice(0, 6);

  els.frame.src = embed(lesson.youtubeId);
  els.title.textContent = lesson.title;
  els.meta.textContent = lesson.subtitle;

  save();
  render();
}

/* ---------------- FAVORITES ---------------- */

function toggleFav(id) {
  if (state.fav.has(id)) state.fav.delete(id);
  else state.fav.add(id);

  save();
  render();
}

/* ---------------- PROGRESS (frontend simulation) ---------------- */

function updateProgress() {
  const id = state.active;
  const t = state.time[id] || 0;

  const percent = Math.min(100, Math.floor((t / 120) * 100));

  state.progress[id] = percent;

  els.progressFill.style.width = percent + "%";
  els.progressLabel.textContent = percent + "%";
}

/* simulate watch time */
setInterval(() => {
  const id = state.active;
  state.time[id] = (state.time[id] || 0) + 1;
  updateProgress();
  save();
}, 1000);

/* ---------------- RECOMMENDATION ENGINE (lightweight) ---------------- */

function getRecommendations() {
  const current = getLesson(state.active);

  return [...LESSONS]
    .filter((l) => l.id !== state.active)
    .sort((a, b) => {
      const scoreA =
        (state.views[a.id] || 0) +
        (state.progress[a.id] || 0) * 0.3 +
        (a.chapter === current.chapter ? 2 : 0);

      const scoreB =
        (state.views[b.id] || 0) +
        (state.progress[b.id] || 0) * 0.3 +
        (b.chapter === current.chapter ? 2 : 0);

      return scoreB - scoreA;
    })
    .slice(0, 3);
}

/* ---------------- RENDER ---------------- */

function renderLessons(list = LESSONS) {
  els.grid.innerHTML = list
    .map(
      (l) => `
    <div class="card" onclick="setActive('${l.id}')">
      <h3>${l.title}</h3>
      <p>${l.subtitle}</p>
      <div class="actions">
        <button>تشغيل</button>
        <button onclick="event.stopPropagation();toggleFav('${l.id}')">
          ${state.fav.has(l.id) ? "★" : "☆"}
        </button>
      </div>
    </div>
  `
    )
    .join("");
}

function renderFav() {
  const fav = [...state.fav]
    .map(getLesson)
    .filter(Boolean);

  els.favGrid.innerHTML = fav.length
    ? fav.map((l) => `<div class="card small">${l.title}</div>`).join("")
    : "<p>لا توجد مفضلة</p>";
}

function renderRecent() {
  els.recent.innerHTML = state.recent
    .map(getLesson)
    .filter(Boolean)
    .map((l) => `<div class="card small">${l.title}</div>`)
    .join("");
}

function renderMostViewed() {
  els.mostViewed.innerHTML = [...LESSONS]
    .sort((a, b) => (state.views[b.id] || 0) - (state.views[a.id] || 0))
    .slice(0, 3)
    .map((l) => `<div class="card small">${l.title}</div>`)
    .join("");
}

function renderRecommendations() {
  els.recommendations.innerHTML = getRecommendations()
    .map((l) => `<div class="card small">${l.title}</div>`)
    .join("");
}

function renderProgress() {
  const p = state.progress[state.active] || 0;
  els.progressFill.style.width = p + "%";
  els.progressLabel.textContent = p + "%";
}

function render() {
  renderLessons();
  renderFav();
  renderRecent();
  renderMostViewed();
  renderRecommendations();
  renderProgress();
}

/* ---------------- SEARCH ---------------- */

els.search?.addEventListener("input", (e) => {
  const q = e.target.value.trim();

  const filtered = LESSONS.filter(
    (l) =>
      l.title.includes(q) ||
      l.subtitle.includes(q)
  );

  renderLessons(filtered);
});

/* ---------------- FAVORITE BUTTON ---------------- */

els.favBtn?.addEventListener("click", () => {
  toggleFav(state.active);
});

/* ---------------- INIT ---------------- */

window.setActive = setActive;
window.toggleFav = toggleFav;

load();
setActive(state.active);
render();
