import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';

export interface AttemptAnswer {
  attemptId: string;
  questionId: string;
  answer: any;
  timestamp: number;
  synced: boolean;
}

export interface AttemptSnapshot {
  attemptId: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class OfflineStorageService extends Dexie {
  answers!: Table<AttemptAnswer, string>;
  snapshots!: Table<AttemptSnapshot, string>;

  constructor() {
    super('UAMPOfflineDB');
    this.version(1).stores({
      answers: '++id, attemptId, questionId, timestamp, synced',
      snapshots: '++id, attemptId, timestamp, synced'
    });
  }

  async saveAnswer(attemptId: string, questionId: string, answer: any): Promise<void> {
    const timestamp = Date.now();
    await this.answers.put({
      attemptId,
      questionId,
      answer,
      timestamp,
      synced: false
    });
  }

  async getAnswers(attemptId: string): Promise<AttemptAnswer[]> {
    return await this.answers
      .where('attemptId')
      .equals(attemptId)
      .toArray();
  }

  async getUnsyncedAnswers(attemptId: string): Promise<AttemptAnswer[]> {
    return await this.answers
      .where('attemptId')
      .equals(attemptId)
      .and(answer => !answer.synced)
      .toArray();
  }

  async markAnswersSynced(attemptId: string): Promise<void> {
    const unsyncedAnswers = await this.getUnsyncedAnswers(attemptId);
    for (const answer of unsyncedAnswers) {
      await this.answers.update(answer, { synced: true });
    }
  }

  async saveAttemptSnapshot(attemptId: string, data: any): Promise<void> {
    const timestamp = Date.now();
    await this.snapshots.put({
      attemptId,
      data,
      timestamp,
      synced: false
    });
  }

  async getLatestSnapshot(attemptId: string): Promise<AttemptSnapshot | undefined> {
    return await this.snapshots
      .where('attemptId')
      .equals(attemptId)
      .last();
  }

  async clearAttemptData(attemptId: string): Promise<void> {
    await this.answers.where('attemptId').equals(attemptId).delete();
    await this.snapshots.where('attemptId').equals(attemptId).delete();
  }

  async getAllUnsyncedData(): Promise<{ answers: AttemptAnswer[], snapshots: AttemptSnapshot[] }> {
    const answers = await this.answers.filter(answer => !answer.synced).toArray();
    const snapshots = await this.snapshots.filter(snapshot => !snapshot.synced).toArray();
    return { answers, snapshots };
  }

  async syncToServer(attemptId: string, syncFunction: (data: any) => Promise<void>): Promise<void> {
    const unsyncedAnswers = await this.getUnsyncedAnswers(attemptId);
    const latestSnapshot = await this.getLatestSnapshot(attemptId);

    try {
      // Sync answers
      for (const answer of unsyncedAnswers) {
        await syncFunction({
          type: 'answer',
          data: answer
        });
      }

      // Mark as synced
      await this.markAnswersSynced(attemptId);
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }

  async encryptData(data: any, key: string): Promise<string> {
    // Simple encryption - in production, use WebCrypto API
    const dataString = JSON.stringify(data);
    const encrypted = btoa(dataString + key); // Basic obfuscation
    return encrypted;
  }

  async decryptData(encrypted: string, key: string): Promise<any> {
    try {
      const decrypted = atob(encrypted);
      const dataString = decrypted.replace(key, '');
      return JSON.parse(dataString);
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  async clearAll(): Promise<void> {
    await this.answers.clear();
    await this.snapshots.clear();
  }
}