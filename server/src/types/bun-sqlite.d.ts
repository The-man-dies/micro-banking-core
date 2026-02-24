declare module "bun:sqlite" {
  export default class Database {
    constructor(filename?: string);
    run(sql: string): void;
    query(sql: string): {
      get(...params: unknown[]): unknown;
      run(...params: unknown[]): void;
    };
    close(): void;
  }
}
