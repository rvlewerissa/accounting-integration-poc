import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const QB_TOKENS_FILE = path.join(__dirname, '..', 'qb-tokens.json');

// Load entire tokens file
function loadTokensFile() {
  try {
    if (fs.existsSync(QB_TOKENS_FILE)) {
      const data = JSON.parse(fs.readFileSync(QB_TOKENS_FILE, 'utf8'));

      // Handle new format with realms object
      if (data.realms) {
        return data;
      }

      // Migrate old single-token format to new format
      if (data.realmId) {
        const migrated = {
          realms: {
            [data.realmId]: data,
          },
        };
        // Save migrated format
        fs.writeFileSync(QB_TOKENS_FILE, JSON.stringify(migrated, null, 2));
        return migrated;
      }

      // Unknown format, return empty
      return { realms: {} };
    }
  } catch (err) {
    console.error('Error loading QB tokens:', err);
  }
  return { realms: {} };
}

// Save entire tokens file
function saveTokensFile(data) {
  fs.writeFileSync(QB_TOKENS_FILE, JSON.stringify(data, null, 2));
}

// Save tokens for a specific realm (add or update)
export function saveRealmTokens(realmId, tokenData) {
  const allTokens = loadTokensFile();
  allTokens.realms[realmId] = {
    ...tokenData,
    realmId,
  };
  saveTokensFile(allTokens);
}

// Load tokens for a specific realm
export function loadRealmTokens(realmId) {
  const allTokens = loadTokensFile();
  return allTokens.realms[realmId] || null;
}

// Load all realms
export function loadAllRealms() {
  const allTokens = loadTokensFile();
  return Object.values(allTokens.realms);
}

// Delete tokens for a specific realm
export function deleteRealmTokens(realmId) {
  const allTokens = loadTokensFile();
  delete allTokens.realms[realmId];
  saveTokensFile(allTokens);
}

// Delete all QB tokens
export function deleteAllQBTokens() {
  if (fs.existsSync(QB_TOKENS_FILE)) {
    fs.unlinkSync(QB_TOKENS_FILE);
  }
}

// Legacy functions for backward compatibility
export function saveQBTokens(data) {
  if (data.realmId) {
    saveRealmTokens(data.realmId, data);
  }
}

export function loadQBTokens() {
  const realms = loadAllRealms();
  return realms.length > 0 ? realms[0] : null;
}

export function deleteQBTokens() {
  deleteAllQBTokens();
}
