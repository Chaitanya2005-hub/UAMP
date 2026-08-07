import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { LocalEncryptionService } from './local-encryption.service';

export interface LocalExamPayload {
  submissionId: string;
  examId: string;
  encryptedBlob: string;
  iv: string;
  updatedAt: number;
  synced: boolean;
}

class ExamDexieDb extends Dexie {
  examPayloads!: Table<LocalExamPayload, string>;

  constructor() {
    super('uamp_exam_store');
    this.version(1).stores({
      examPayloads: 'submissionId, examId, synced, updatedAt',
    });
  }
}

@Injectable({ providedIn: 'root' })
export class IndexedDbExamStoreService {
  private db = new ExamDexieDb();

  constructor(private encryption: LocalEncryptionService) {}

  /** Called every N seconds by ExamRunnerComponent's autosave timer */
  async saveAnswers(submissionId: string, examId: string, answers: Record<string, unknown>): Promise<void> {
    const { ciphertext, iv } = await this.encryption.encrypt(JSON.stringify(answers));
    await this.db.examPayloads.put({
      submissionId,
      examId,
      encryptedBlob: ciphertext,
      iv,
      updatedAt: Date.now(),
      synced: false,
    });
  }

  async loadAnswers(submissionId: string): Promise<Record<string, unknown> | null> {
    const row = await this.db.examPayloads.get(submissionId);
    if (!row) return null;
    const plaintext = await this.encryption.decrypt(row.encryptedBlob, row.iv);
    return JSON.parse(plaintext);
  }

  async markSynced(submissionId: string): Promise<void> {
    await this.db.examPayloads.update(submissionId, { synced: true });
  }

  /** Recovery path: on app relaunch mid-exam, resume from last local snapshot */
  async getUnsyncedPayloads(): Promise<LocalExamPayload[]> {
    return this.db.examPayloads.filter(payload => !payload.synced).toArray();
  }
}
