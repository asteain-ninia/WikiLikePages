import { articles } from "./data/articles.js";
import { siteConfig } from "./data/site-config.js";
import {
  buildHomePageModel,
  findEntryById,
  pickRandomEntry,
  searchArticles,
  formatDisplayDate,
} from "./lib/home-page-model.js";
import {
  renderCategoryCards,
  renderFeaturedArticle,
  renderImplementationNotes,
  renderParticipationGuides,
  renderPreviewArticle,
  renderProcessSteps,
  renderSearchResults,
  renderSummaryList,
  renderUpdateList,
} from "./lib/renderers.js";

const homePageModel = buildHomePageModel({ articles, siteConfig });

const elements = {
  welcomeSummary: document.getElementById("welcome-summary"),
  featuredStatus: document.getElementById("featured-status"),
  previewStatus: document.getElementById("preview-status"),
  featuredArticle: document.getElementById("featured-article"),
  newArticles: document.getElementById("new-articles"),
  recentUpdates: document.getElementById("recent-updates"),
  participationList: document.getElementById("participation-list"),
  processList: document.getElementById("process-list"),
  categoryGrid: document.getElementById("category-grid"),
  implementationNotes: document.getElementById("implementation-notes"),
  previewArticle: document.getElementById("article-preview-card"),
  searchForm: document.getElementById("search-form"),
  searchInput: document.getElementById("search-input"),
  searchResults: document.getElementById("search-results"),
  randomButton: document.getElementById("random-button"),
};

const state = {
  featuredEntry: homePageModel.featuredEntry,
  previewEntry: homePageModel.previewEntry,
};

function renderWelcomeSummary() {
  const { articleCount, categoryCount, latestUpdatedDate } = homePageModel.stats;
  elements.welcomeSummary.textContent =
    `現在 ${articleCount} 本の記事と ${categoryCount} つの主要カテゴリを公開候補として整理しています。` +
    ` 最新更新日は ${formatDisplayDate(latestUpdatedDate)} です。`;
}

function renderFeaturedState() {
  elements.featuredArticle.innerHTML = renderFeaturedArticle(state.featuredEntry);
  elements.featuredStatus.textContent = `選り抜き記事として「${state.featuredEntry.title}」を表示しています。`;
}

function renderPreviewState() {
  elements.previewArticle.innerHTML = renderPreviewArticle(state.previewEntry);
  elements.previewStatus.textContent = `記事プレビューとして「${state.previewEntry.title}」を表示しています。`;
}

function renderStaticSections() {
  renderWelcomeSummary();
  renderFeaturedState();
  renderPreviewState();

  elements.newArticles.innerHTML = renderSummaryList(homePageModel.newArticles);
  elements.recentUpdates.innerHTML = renderUpdateList(homePageModel.recentUpdates);
  elements.participationList.innerHTML = renderParticipationGuides(homePageModel.participationGuides);
  elements.processList.innerHTML = renderProcessSteps(homePageModel.processSteps);
  elements.categoryGrid.innerHTML = renderCategoryCards(homePageModel.categoryCards);
  elements.implementationNotes.innerHTML = renderImplementationNotes(homePageModel.implementationNotes);
}

function clearSearchResults() {
  elements.searchResults.hidden = true;
  elements.searchResults.innerHTML = "";
}

function updateSearchResults(query) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    clearSearchResults();
    return;
  }

  const matches = searchArticles(articles, trimmedQuery);
  elements.searchResults.hidden = false;
  elements.searchResults.innerHTML = renderSearchResults(trimmedQuery, matches);
}

function setPreviewEntry(entry) {
  if (!entry) {
    return;
  }

  state.previewEntry = entry;
  renderPreviewState();
}

function setFeaturedEntry(entry) {
  if (!entry) {
    return;
  }

  state.featuredEntry = entry;
  renderFeaturedState();
}

function handleArticleNavigation(event) {
  const link = event.target.closest("[data-entry-id]");
  if (!link) {
    return;
  }

  const selectedEntry = findEntryById(articles, link.dataset.entryId);
  setPreviewEntry(selectedEntry);
}

function handleRandomButtonClick() {
  const randomEntry = pickRandomEntry(articles);
  setFeaturedEntry(randomEntry);
  setPreviewEntry(randomEntry);
}

function bindEvents() {
  elements.searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    updateSearchResults(elements.searchInput.value);
  });

  elements.searchInput.addEventListener("input", () => {
    updateSearchResults(elements.searchInput.value);
  });

  elements.randomButton.addEventListener("click", handleRandomButtonClick);
  document.addEventListener("click", handleArticleNavigation);
}

renderStaticSections();
clearSearchResults();
bindEvents();
