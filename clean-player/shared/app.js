(function () {
  'use strict';

  var APP_VERSION = '0.1.0';
  var STORE_KEY = 'clean-player-state-v1';
  var LOCAL_SOURCE = {
    id: 'local-sample',
    name: 'Локальный пример',
    url: 'sample-catalog.json',
    builtin: true,
    enabled: true
  };

  var dom = {};
  var state = {
    activeView: 'catalog',
    query: '',
    sourceFilter: 'all',
    sources: [LOCAL_SOURCE],
    items: [],
    favorites: {},
    networkLog: [],
    allowedOrigins: {}
  };
  var selectedItem = null;

  function init() {
    bindDom();
    loadState();
    dom.versionLabel.textContent = 'v' + APP_VERSION;
    bindEvents();
    renderSources();
    renderSourceFilter();
    loadSource(LOCAL_SOURCE, true);
    pollNativeLog();
    setInterval(pollNativeLog, 2500);
  }

  function bindDom() {
    dom.versionLabel = document.getElementById('versionLabel');
    dom.tabs = Array.prototype.slice.call(document.querySelectorAll('[data-view]'));
    dom.views = Array.prototype.slice.call(document.querySelectorAll('[data-view-panel]'));
    dom.searchInput = document.getElementById('searchInput');
    dom.refreshButton = document.getElementById('refreshButton');
    dom.sourceFilter = document.getElementById('sourceFilter');
    dom.catalogGrid = document.getElementById('catalogGrid');
    dom.favoritesGrid = document.getElementById('favoritesGrid');
    dom.catalogCount = document.getElementById('catalogCount');
    dom.favoritesCount = document.getElementById('favoritesCount');
    dom.sourceForm = document.getElementById('sourceForm');
    dom.sourceName = document.getElementById('sourceName');
    dom.sourceUrl = document.getElementById('sourceUrl');
    dom.sourceList = document.getElementById('sourceList');
    dom.networkCount = document.getElementById('networkCount');
    dom.allowedOrigins = document.getElementById('allowedOrigins');
    dom.networkLog = document.getElementById('networkLog');
    dom.clearNetworkButton = document.getElementById('clearNetworkButton');
    dom.detailsModal = document.getElementById('detailsModal');
    dom.detailsPoster = document.getElementById('detailsPoster');
    dom.detailsMeta = document.getElementById('detailsMeta');
    dom.detailsTitle = document.getElementById('detailsTitle');
    dom.detailsDescription = document.getElementById('detailsDescription');
    dom.playButton = document.getElementById('playButton');
    dom.favoriteButton = document.getElementById('favoriteButton');
    dom.playerModal = document.getElementById('playerModal');
    dom.playerTitle = document.getElementById('playerTitle');
    dom.videoPlayer = document.getElementById('videoPlayer');
    dom.directPlayForm = document.getElementById('directPlayForm');
    dom.directVideoUrl = document.getElementById('directVideoUrl');
  }

  function bindEvents() {
    dom.tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        setView(tab.dataset.view);
      });
    });

    dom.searchInput.addEventListener('input', function () {
      state.query = dom.searchInput.value.trim();
      renderCatalog();
      renderFavorites();
    });

    dom.refreshButton.addEventListener('click', function () {
      refreshUserSources();
    });

    dom.sourceFilter.addEventListener('change', function () {
      state.sourceFilter = dom.sourceFilter.value;
      saveState();
      renderCatalog();
    });

    dom.sourceForm.addEventListener('submit', function (event) {
      event.preventDefault();
      addSource();
    });

    dom.clearNetworkButton.addEventListener('click', function () {
      state.networkLog = [];
      saveState();
      renderNetwork();
    });

    dom.playButton.addEventListener('click', function () {
      if (selectedItem) openPlayer(selectedItem);
    });

    dom.favoriteButton.addEventListener('click', function () {
      if (selectedItem) toggleFavorite(selectedItem);
    });

    document.querySelectorAll('[data-close-modal]').forEach(function (button) {
      button.addEventListener('click', closeDetails);
    });

    document.querySelectorAll('[data-close-player]').forEach(function (button) {
      button.addEventListener('click', closePlayer);
    });

    dom.directPlayForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var url = dom.directVideoUrl.value.trim();
      if (!url) return;
      playUrl(url, 'Прямая ссылка');
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' || event.key === 'Backspace') {
        if (back()) event.preventDefault();
      }
    });
  }

  function loadState() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      if (Array.isArray(saved.sources)) {
        state.sources = mergeLocalSource(saved.sources);
      }
      if (saved.favorites && typeof saved.favorites === 'object') state.favorites = saved.favorites;
      if (saved.allowedOrigins && typeof saved.allowedOrigins === 'object') state.allowedOrigins = saved.allowedOrigins;
      if (Array.isArray(saved.networkLog)) state.networkLog = saved.networkLog.slice(-80);
      if (typeof saved.sourceFilter === 'string') state.sourceFilter = saved.sourceFilter;
    } catch (error) {
      state.sources = [LOCAL_SOURCE];
    }
  }

  function saveState() {
    var payload = {
      sources: state.sources,
      favorites: state.favorites,
      allowedOrigins: state.allowedOrigins,
      networkLog: state.networkLog.slice(-80),
      sourceFilter: state.sourceFilter
    };
    localStorage.setItem(STORE_KEY, JSON.stringify(payload));
  }

  function mergeLocalSource(sources) {
    var clean = sources.filter(function (source) {
      return source && source.id !== LOCAL_SOURCE.id;
    });
    return [LOCAL_SOURCE].concat(clean);
  }

  function setView(view) {
    state.activeView = view;
    dom.tabs.forEach(function (tab) {
      tab.classList.toggle('active', tab.dataset.view === view);
    });
    dom.views.forEach(function (panel) {
      panel.classList.toggle('active', panel.dataset.viewPanel === view);
    });
    if (view === 'network') renderNetwork();
  }

  function refreshUserSources() {
    var sources = state.sources.filter(function (source) {
      return source.enabled !== false;
    });
    state.items = [];
    renderCatalog();
    Promise.all(sources.map(function (source) {
      return loadSource(source, false);
    })).then(function () {
      renderSourceFilter();
      renderCatalog();
      renderFavorites();
    });
  }

  function loadSource(source, silent) {
    if (!source || !source.url) return Promise.resolve();
    var url = absolutize(source.url);
    registerExternalUrl(url, 'source');
    return guardedFetch(url, { cache: 'no-store' })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        var items = normalizeCatalog(data, source);
        state.items = state.items.filter(function (item) {
          return item.sourceId !== source.id;
        }).concat(items);
        registerItemUrls(items);
        renderCatalog();
        renderFavorites();
        if (!silent) logNetwork('source', url, 'loaded');
      })
      .catch(function (error) {
        logNetwork('source', url, 'error: ' + error.message, true);
        renderNetwork();
      });
  }

  function guardedFetch(url, options) {
    var absolute = absolutize(url);
    logNetwork('fetch', absolute, 'start');
    return fetch(absolute, options || {}).then(function (response) {
      logNetwork('fetch', absolute, String(response.status));
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response;
    });
  }

  function normalizeCatalog(data, source) {
    var rawItems = Array.isArray(data) ? data : data && Array.isArray(data.items) ? data.items : [];
    return rawItems.map(function (raw, index) {
      var id = String(raw.id || source.id + '-' + index);
      var title = String(raw.title || raw.name || 'Без названия');
      return {
        id: source.id + ':' + id,
        localId: id,
        sourceId: source.id,
        sourceName: source.name,
        title: title,
        type: String(raw.type || raw.category || 'media'),
        year: raw.year ? String(raw.year) : '',
        genres: Array.isArray(raw.genres) ? raw.genres.slice(0, 4) : [],
        poster: raw.poster || raw.img || raw.image || raw.cover || '',
        description: raw.description || raw.overview || '',
        video: raw.video || raw.stream || raw.url || '',
        trailer: raw.trailer || ''
      };
    });
  }

  function registerItemUrls(items) {
    items.forEach(function (item) {
      [item.poster, item.video, item.trailer].forEach(function (url) {
        if (url) registerExternalUrl(url, 'catalog');
      });
    });
  }

  function addSource() {
    var name = dom.sourceName.value.trim();
    var url = dom.sourceUrl.value.trim();
    if (!name || !url) return;
    var absolute = absolutize(url);
    var source = {
      id: 'source-' + Date.now().toString(36),
      name: name,
      url: absolute,
      builtin: false,
      enabled: true
    };
    state.sources.push(source);
    saveState();
    dom.sourceForm.reset();
    renderSources();
    renderSourceFilter();
    loadSource(source, false);
  }

  function removeSource(id) {
    state.sources = state.sources.filter(function (source) {
      return source.builtin || source.id !== id;
    });
    state.items = state.items.filter(function (item) {
      return item.sourceId !== id;
    });
    if (state.sourceFilter === id) state.sourceFilter = 'all';
    saveState();
    renderSources();
    renderSourceFilter();
    renderCatalog();
    renderFavorites();
  }

  function toggleSource(id) {
    state.sources.forEach(function (source) {
      if (source.id === id && !source.builtin) source.enabled = source.enabled === false;
    });
    saveState();
    renderSources();
  }

  function filteredItems(onlyFavorites) {
    var query = state.query.toLowerCase();
    return state.items.filter(function (item) {
      if (onlyFavorites && !state.favorites[item.id]) return false;
      if (state.sourceFilter !== 'all' && item.sourceId !== state.sourceFilter && !onlyFavorites) return false;
      if (!query) return true;
      return [item.title, item.sourceName, item.year, item.genres.join(' ')].join(' ').toLowerCase().indexOf(query) !== -1;
    });
  }

  function renderCatalog() {
    var items = filteredItems(false);
    dom.catalogCount.textContent = String(items.length);
    renderGrid(dom.catalogGrid, items);
  }

  function renderFavorites() {
    var items = filteredItems(true);
    dom.favoritesCount.textContent = String(items.length);
    renderGrid(dom.favoritesGrid, items);
  }

  function renderGrid(node, items) {
    node.innerHTML = '';
    if (!items.length) {
      node.appendChild(emptyNode('Пусто'));
      return;
    }
    items.forEach(function (item) {
      node.appendChild(cardNode(item));
    });
  }

  function cardNode(item) {
    var card = document.createElement('article');
    card.className = 'media-card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');

    var poster = document.createElement('div');
    poster.className = 'poster';
    poster.appendChild(posterNode(item));

    var body = document.createElement('div');
    body.className = 'card-body';

    var title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = item.title;

    var meta = document.createElement('div');
    meta.className = 'card-meta';
    meta.textContent = [item.year, item.sourceName].filter(Boolean).join(' · ');

    body.appendChild(title);
    body.appendChild(meta);
    card.appendChild(poster);
    card.appendChild(body);

    card.addEventListener('click', function () {
      openDetails(item);
    });
    card.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openDetails(item);
      }
    });

    return card;
  }

  function posterNode(item) {
    if (item.poster) {
      var img = document.createElement('img');
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = absolutize(item.poster);
      img.onerror = function () {
        img.replaceWith(fallbackNode(item));
      };
      return img;
    }
    return fallbackNode(item);
  }

  function fallbackNode(item) {
    var fallback = document.createElement('div');
    fallback.className = 'poster-fallback';
    fallback.textContent = initials(item.title);
    return fallback;
  }

  function openDetails(item) {
    selectedItem = item;
    dom.detailsPoster.innerHTML = '';
    dom.detailsPoster.appendChild(posterNode(item));
    dom.detailsMeta.textContent = [item.type, item.year, item.genres.join(', ')].filter(Boolean).join(' · ');
    dom.detailsTitle.textContent = item.title;
    dom.detailsDescription.textContent = item.description || 'Описание отсутствует.';
    dom.favoriteButton.textContent = state.favorites[item.id] ? 'Убрать' : 'В избранное';
    dom.detailsModal.classList.remove('hidden');
    dom.playButton.focus();
  }

  function closeDetails() {
    selectedItem = null;
    dom.detailsModal.classList.add('hidden');
  }

  function openPlayer(item) {
    if (!item.video) {
      dom.directVideoUrl.focus();
      return;
    }
    playUrl(item.video, item.title);
  }

  function playUrl(url, title) {
    var absolute = absolutize(url);
    registerExternalUrl(absolute, 'play');
    logNetwork('media', absolute, 'open');
    dom.playerTitle.textContent = title || 'Плеер';
    dom.videoPlayer.src = absolute;
    dom.playerModal.classList.remove('hidden');
    dom.videoPlayer.play().catch(function () {});
  }

  function closePlayer() {
    dom.videoPlayer.pause();
    dom.videoPlayer.removeAttribute('src');
    dom.videoPlayer.load();
    dom.playerModal.classList.add('hidden');
  }

  function toggleFavorite(item) {
    if (state.favorites[item.id]) {
      delete state.favorites[item.id];
    } else {
      state.favorites[item.id] = true;
    }
    saveState();
    dom.favoriteButton.textContent = state.favorites[item.id] ? 'Убрать' : 'В избранное';
    renderFavorites();
  }

  function renderSources() {
    dom.sourceList.innerHTML = '';
    state.sources.forEach(function (source) {
      var row = document.createElement('div');
      row.className = 'source-row';

      var info = document.createElement('div');
      var name = document.createElement('div');
      name.className = 'source-name';
      name.textContent = source.name;
      var url = document.createElement('div');
      url.className = 'source-url';
      url.textContent = source.url;
      info.appendChild(name);
      info.appendChild(url);

      var load = document.createElement('button');
      load.type = 'button';
      load.textContent = 'Загрузить';
      load.addEventListener('click', function () {
        loadSource(source, false);
      });

      var action = document.createElement('button');
      action.type = 'button';
      if (source.builtin) {
        action.textContent = 'Локальный';
        action.disabled = true;
      } else {
        action.textContent = source.enabled === false ? 'Вкл' : 'Удалить';
        action.addEventListener('click', function () {
          if (source.enabled === false) toggleSource(source.id);
          else removeSource(source.id);
        });
      }

      row.appendChild(info);
      row.appendChild(load);
      row.appendChild(action);
      dom.sourceList.appendChild(row);
    });
  }

  function renderSourceFilter() {
    var previous = state.sourceFilter || 'all';
    dom.sourceFilter.innerHTML = '';
    var all = document.createElement('option');
    all.value = 'all';
    all.textContent = 'Все источники';
    dom.sourceFilter.appendChild(all);
    state.sources.forEach(function (source) {
      var option = document.createElement('option');
      option.value = source.id;
      option.textContent = source.name;
      dom.sourceFilter.appendChild(option);
    });
    dom.sourceFilter.value = state.sources.some(function (source) {
      return source.id === previous;
    }) ? previous : 'all';
    state.sourceFilter = dom.sourceFilter.value;
  }

  function renderNetwork() {
    var origins = Object.keys(state.allowedOrigins).sort();
    dom.allowedOrigins.innerHTML = '';
    if (!origins.length) dom.allowedOrigins.appendChild(emptyNode('Пусто'));
    origins.forEach(function (origin) {
      var token = document.createElement('div');
      token.className = 'token';
      token.textContent = origin;
      dom.allowedOrigins.appendChild(token);
    });

    dom.networkLog.innerHTML = '';
    dom.networkCount.textContent = String(state.networkLog.length);
    if (!state.networkLog.length) {
      dom.networkLog.appendChild(emptyNode('Пусто'));
      return;
    }
    state.networkLog.slice().reverse().forEach(function (entry) {
      var node = document.createElement('div');
      node.className = 'log-entry';
      var kind = document.createElement('div');
      kind.className = 'log-kind';
      kind.textContent = entry.kind + ' · ' + entry.time;
      var url = document.createElement('div');
      url.className = 'log-url';
      url.textContent = entry.url;
      var status = document.createElement('div');
      status.className = 'log-status' + (entry.blocked ? ' blocked' : '');
      status.textContent = entry.status;
      node.appendChild(kind);
      node.appendChild(url);
      node.appendChild(status);
      dom.networkLog.appendChild(node);
    });
  }

  function emptyNode(text) {
    var node = document.createElement('div');
    node.className = 'empty';
    node.textContent = text;
    return node;
  }

  function registerExternalUrl(rawUrl, reason) {
    var absolute = absolutize(rawUrl);
    var origin = externalOrigin(absolute);
    if (!origin) return;
    state.allowedOrigins[origin] = {
      reason: reason || 'user',
      time: now()
    };
    if (window.CleanBridge && typeof window.CleanBridge.allowUrl === 'function') {
      try {
        window.CleanBridge.allowUrl(absolute);
      } catch (error) {}
    }
    saveState();
  }

  function logNetwork(kind, url, status, blocked) {
    var origin = externalOrigin(url);
    if (!origin && !/^https?:\/\//i.test(url)) return;
    state.networkLog.push({
      kind: kind,
      url: url,
      status: status,
      blocked: !!blocked,
      time: now()
    });
    state.networkLog = state.networkLog.slice(-80);
    saveState();
    if (state.activeView === 'network') renderNetwork();
  }

  function pollNativeLog() {
    if (!window.CleanBridge || typeof window.CleanBridge.consumeNativeLogJson !== 'function') return;
    try {
      var raw = window.CleanBridge.consumeNativeLogJson();
      var entries = raw ? JSON.parse(raw) : [];
      entries.forEach(function (entry) {
        logNetwork(entry.kind || 'native', entry.url || '', entry.status || '', !!entry.blocked);
      });
    } catch (error) {}
  }

  function absolutize(url) {
    try {
      return new URL(url, window.location.href).href;
    } catch (error) {
      return String(url || '');
    }
  }

  function externalOrigin(url) {
    try {
      var parsed = new URL(url, window.location.href);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
      return parsed.origin;
    } catch (error) {
      return '';
    }
  }

  function initials(text) {
    return String(text || 'CP')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(function (part) {
        return part.charAt(0).toUpperCase();
      })
      .join('') || 'CP';
  }

  function now() {
    var date = new Date();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function back() {
    if (!dom.playerModal.classList.contains('hidden')) {
      closePlayer();
      return true;
    }
    if (!dom.detailsModal.classList.contains('hidden')) {
      closeDetails();
      return true;
    }
    if (state.activeView !== 'catalog') {
      setView('catalog');
      return true;
    }
    return false;
  }

  window.CleanPlayer = {
    back: back
  };

  document.addEventListener('DOMContentLoaded', init);
})();
