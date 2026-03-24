declare module "sql.js" {
  export interface SqlJsConfig {
    locateFile?: (file: string) => string;
  }

  export interface SqlJsStatement {
    bind(values: unknown[] | Record<string, unknown>): void;
    step(): boolean;
    getAsObject(values?: unknown[] | Record<string, unknown>): Record<string, unknown>;
    free(): void;
  }

  export class Database {
    constructor(data?: ArrayLike<number> | Uint8Array);
    run(sql: string, values?: unknown[] | Record<string, unknown>): void;
    prepare(sql: string, values?: unknown[] | Record<string, unknown>): SqlJsStatement;
    export(): Uint8Array;
  }

  export interface SqlJsStatic {
    Database: typeof Database;
  }

  export default function initSqlJs(config?: SqlJsConfig): Promise<SqlJsStatic>;
}
