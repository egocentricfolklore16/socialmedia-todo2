/**
 * Simple file-based in-memory store.
 * In production, replace this with a real database (MongoDB, PostgreSQL, etc.)
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const TOKENS_FILE = path.join(DATA_DIR, 'tokens.json');
const SUBSCRIPTIONS_FILE = path.join(DATA_DIR, 'subscriptions.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

const DEFAULT_SETTINGS = {
  defaultPlatform: 'instagram',
  timezone: 'UTC',
  notificationPreferences: {
    holidayAlerts: true,
    taskReminders: true,
  },
};

// ── Helpers ─────────────────────────────────────────────────────────────────
function readJSON(file, fallback = {}) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return fallback;
  }
}

function writeJSON(file, data) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

// ── Tasks ────────────────────────────────────────────────────────────────────
function getTasks() {
  return readJSON(TASKS_FILE, []);
}

function saveTasks(tasks) {
  writeJSON(TASKS_FILE, tasks);
}

// ── Google Tokens ────────────────────────────────────────────────────────────
function getTokens() {
  return readJSON(TOKENS_FILE, null);
}

function saveTokens(tokens) {
  writeJSON(TOKENS_FILE, tokens);
}

function clearTokens() {
  if (fs.existsSync(TOKENS_FILE)) fs.unlinkSync(TOKENS_FILE);
}

// ── Push Subscriptions ───────────────────────────────────────────────────────
function getSubscriptions() {
  return readJSON(SUBSCRIPTIONS_FILE, []);
}

function addSubscription(sub) {
  const subs = getSubscriptions();
  // Deduplicate by endpoint
  const exists = subs.find(s => s.endpoint === sub.endpoint);
  if (!exists) {
    subs.push(sub);
    writeJSON(SUBSCRIPTIONS_FILE, subs);
  }
}

function removeSubscription(endpoint) {
  const subs = getSubscriptions().filter(s => s.endpoint !== endpoint);
  writeJSON(SUBSCRIPTIONS_FILE, subs);
}

// ── Settings ─────────────────────────────────────────────────────────────────
function getSettings() {
  const settings = readJSON(SETTINGS_FILE, DEFAULT_SETTINGS);
  return { ...DEFAULT_SETTINGS, ...settings };
}

function saveSettings(settings) {
  const current = getSettings();
  const updated = { ...current, ...settings };
  writeJSON(SETTINGS_FILE, updated);
  return updated;
}

module.exports = {
  getTasks, saveTasks,
  getTokens, saveTokens, clearTokens,
  getSubscriptions, addSubscription, removeSubscription,
  getSettings, saveSettings,
};
