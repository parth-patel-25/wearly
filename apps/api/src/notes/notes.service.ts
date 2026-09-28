import { randomUUID } from "node:crypto";
import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  CreateNoteInput,
  ListNotesQuery,
  ListNotesResponse,
  Note,
  UpdateNoteInput,
} from "@wearly/shared/api/types";

/**
 * In-memory store. Deliberately temporary: no database has been chosen yet, so
 * this exists to exercise the shared contract end to end. Swap the body of these
 * methods for Drizzle queries once the ORM and Postgres are wired up.
 */
@Injectable()
export class NotesService {
  private readonly notes = new Map<string, Note>();

  list(query: ListNotesQuery): ListNotesResponse {
    const all = [...this.notes.values()].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt)
    );

    return {
      items: all.slice(query.offset, query.offset + query.limit),
      total: all.length,
    };
  }

  get(id: string): Note {
    const note = this.notes.get(id);

    if (!note) {
      throw new NotFoundException(`Note ${id} not found`);
    }

    return note;
  }

  create(input: CreateNoteInput): Note {
    const note: Note = {
      body: input.body,
      createdAt: new Date().toISOString(),
      id: randomUUID(),
      title: input.title,
    };

    this.notes.set(note.id, note);

    return note;
  }

  update(id: string, input: UpdateNoteInput): Note {
    const existing = this.get(id);
    const updated: Note = {
      ...existing,
      ...(input.title === undefined ? {} : { title: input.title }),
      ...(input.body === undefined ? {} : { body: input.body }),
    };

    this.notes.set(id, updated);

    return updated;
  }

  remove(id: string): void {
    this.get(id);
    this.notes.delete(id);
  }
}
