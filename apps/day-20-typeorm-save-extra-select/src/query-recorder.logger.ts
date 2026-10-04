import { Logger } from 'typeorm';

export class QueryRecorderLogger implements Logger {
  private isRecording = false;
  private recordedQueries: string[] = [];

  startRecording(): void {
    this.recordedQueries = [];
    this.isRecording = true;
  }

  stopRecording(): string[] {
    this.isRecording = false;
    return [...this.recordedQueries];
  }

  logQuery(query: string, parameters?: unknown[]): void {
    if (this.isRecording) {
      this.recordedQueries.push(query);
    }

    const suffix = parameters?.length
      ? ` -- PARAMETERS: ${JSON.stringify(parameters)}`
      : '';
    console.log(`query: ${query}${suffix}`);
  }

  logQueryError(error: string | Error, query: string): void {
    console.error(`query failed: ${query}`, error);
  }

  logQuerySlow(time: number, query: string): void {
    console.warn(`query is slow (${time} ms): ${query}`);
  }

  logSchemaBuild(message: string): void {
    console.log(`schema: ${message}`);
  }

  logMigration(message: string): void {
    console.log(`migration: ${message}`);
  }

  log(level: 'log' | 'info' | 'warn', message: unknown): void {
    if (level === 'warn') {
      console.warn(message);
      return;
    }

    console.log(message);
  }
}

export const day20QueryRecorder = new QueryRecorderLogger();
