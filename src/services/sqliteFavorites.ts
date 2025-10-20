import initSqlJs, { Database, SqlJsStatic } from "sql.js";
import type { NormalizedQuestion } from "../composables/useExamPaper";
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";

const STORAGE_KEY = "exam-favorites-db";

let sqlInstancePromise: Promise<SqlJsStatic> | null = null;
let databaseInstance: Database | null = null;
let initPromise: Promise<void> | null = null;

export interface FavoriteSnapshot {
  answerKey: string;
  number?: number | null;
  paperTitle?: string;
  typeName?: string;
  title?: string;
  content?: string;
  raw?: string;
  createdAt?: string;
}

export interface FavoriteRecord extends FavoriteSnapshot {
  question?: unknown;
}

export function snapshotFromQuestion(question: NormalizedQuestion, paperTitle?: string): FavoriteSnapshot {
  return {
    answerKey: question.answerKey,
    number: typeof question.number === "number" ? question.number : null,
    paperTitle,
    typeName: question.testTypeName ?? "",
    title: question.title ?? "",
    content: question.content ?? "",
    raw: safeStringify(question),
    createdAt: new Date().toISOString(),
  };
}

export async function initFavoritesDb(): Promise<void> {
  if (!canUseBrowserApis()) return;
  if (!initPromise) {
    initPromise = (async () => {
      try {
        const db = await getDatabase();
        ensureFavoritesTable(db);
        persistDatabase(db);
      } catch (error) {
        initPromise = null;
        throw error;
      }
    })();
  }
  await initPromise;
}

export async function getFavoriteKeys(): Promise<Set<string>> {
  if (!canUseBrowserApis()) return new Set();
  await initFavoritesDb();
  const db = await getDatabase();
  const keys = new Set<string>();
  const stmt = db.prepare("SELECT answerKey FROM favorites");
  try {
    while (stmt.step()) {
      const value = stmt.getAsObject().answerKey;
      if (typeof value === "string") {
        keys.add(value);
      }
    }
  } finally {
    stmt.free();
  }
  return keys;
}

export async function isFavorite(answerKey: string): Promise<boolean> {
  if (!canUseBrowserApis()) return false;
  await initFavoritesDb();
  const db = await getDatabase();
  const stmt = db.prepare("SELECT 1 FROM favorites WHERE answerKey = ? LIMIT 1");
  try {
    stmt.bind([answerKey]);
    return stmt.step();
  } finally {
    stmt.free();
  }
}

export async function saveFavorite(snapshot: FavoriteSnapshot): Promise<void> {
  if (!canUseBrowserApis()) return;
  if (!snapshot.answerKey) return;
  await initFavoritesDb();
  const db = await getDatabase();
  const stmt = db.prepare(
    `INSERT OR REPLACE INTO favorites
      (answerKey, number, paperTitle, typeName, title, content, raw, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  try {
    stmt.bind([
      snapshot.answerKey,
      typeof snapshot.number === "number" ? snapshot.number : null,
      snapshot.paperTitle ?? "",
      snapshot.typeName ?? "",
      snapshot.title ?? "",
      snapshot.content ?? "",
      snapshot.raw ?? "",
      snapshot.createdAt ?? new Date().toISOString(),
    ]);
    stmt.step();
  } finally {
    stmt.free();
  }
  persistDatabase(db);
}

export async function deleteFavorite(answerKey: string): Promise<void> {
  if (!canUseBrowserApis()) return;
  await initFavoritesDb();
  const db = await getDatabase();
  const stmt = db.prepare("DELETE FROM favorites WHERE answerKey = ?");
  try {
    stmt.bind([answerKey]);
    stmt.step();
  } finally {
    stmt.free();
  }
  persistDatabase(db);
}

export async function getFavoriteRecords(): Promise<FavoriteRecord[]> {
  if (!canUseBrowserApis()) return [];
  await initFavoritesDb();
  const db = await getDatabase();
  const stmt = db.prepare(
    `SELECT answerKey, number, paperTitle, typeName, title, content, raw, createdAt
     FROM favorites
     ORDER BY paperTitle COLLATE NOCASE ASC,
              typeName COLLATE NOCASE ASC,
              number ASC,
              datetime(createdAt) DESC`,
  );
  const records: FavoriteRecord[] = [];
  try {
    while (stmt.step()) {
      const row = stmt.getAsObject();
      const raw = typeof row.raw === "string" ? row.raw : "";
      const numericValue =
        typeof row.number === "number"
          ? row.number
          : Number.isFinite(Number(row.number))
            ? Number(row.number)
            : undefined;
      records.push({
        answerKey: String(row.answerKey ?? ""),
        number: typeof numericValue === "number" && Number.isFinite(numericValue)
          ? numericValue
          : undefined,
        paperTitle: typeof row.paperTitle === "string" ? row.paperTitle : "",
        typeName: typeof row.typeName === "string" ? row.typeName : "",
        title: typeof row.title === "string" ? row.title : "",
        content: typeof row.content === "string" ? row.content : "",
        raw,
        createdAt: typeof row.createdAt === "string" ? row.createdAt : "",
        question: parseRawQuestion(raw),
      });
    }
  } finally {
    stmt.free();
  }
  return records;
}

async function getDatabase(): Promise<Database> {
  if (databaseInstance) return databaseInstance;
  const SQL = await getSqlInstance();
  const stored = readFromStorage();
  if (stored) {
    const bytes = base64ToUint8Array(stored);
    databaseInstance = new SQL.Database(bytes);
  } else {
    databaseInstance = new SQL.Database();
  }
  return databaseInstance;
}

async function getSqlInstance(): Promise<SqlJsStatic> {
  if (!sqlInstancePromise) {
    sqlInstancePromise = initSqlJs({
      locateFile: () => sqlWasmUrl,
    });
  }
  return sqlInstancePromise;
}

function ensureFavoritesTable(db: Database) {
  db.run(
    `CREATE TABLE IF NOT EXISTS favorites (
      answerKey TEXT PRIMARY KEY,
      number INTEGER,
      paperTitle TEXT,
      typeName TEXT,
      title TEXT,
      content TEXT,
      raw TEXT,
      createdAt TEXT
    )`
  );
}

function persistDatabase(db: Database) {
  if (!canUseBrowserApis()) return;
  try {
    const exported = db.export();
    writeToStorage(uint8ArrayToBase64(exported));
  } catch (error) {
    console.warn("[favorites] persist failure", error);
  }
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

function parseRawQuestion(raw: string): unknown | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn("[favorites] parse failure", error);
    return undefined;
  }
}

function canUseBrowserApis(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readFromStorage(): string | null {
  if (!canUseBrowserApis()) return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.warn("[favorites] read failure", error);
    return null;
  }
}

function writeToStorage(value: string) {
  if (!canUseBrowserApis()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch (error) {
    console.warn("[favorites] write failure", error);
  }
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
