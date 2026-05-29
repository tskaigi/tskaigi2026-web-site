import { consola } from "consola";

/**
 * スクリプト群共通のロガー。
 * 直接 console.* を使う代わりにこちらを通すことで色付き出力に統一する。
 * ループ内の進捗表示には scripts/utils/progress.ts を使う。
 */
export const logger = consola;
