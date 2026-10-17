import { create, getAll, getById, remove, update } from "@/lib/json-db";
import type { NoteRecord } from "@data/_schema/note.schema";

export function listNotes() {
  return getAll<NoteRecord>("note", { limit: 100, sortBy: "updatedAt", sortOrder: "desc" });
}

export function getNote(id: string) {
  return getById<NoteRecord>("note", id);
}

export function createNote(input: Omit<NoteRecord, "id" | "createdAt" | "updatedAt">) {
  return create<NoteRecord>("note", input);
}

export function updateNote(id: string, input: Partial<Omit<NoteRecord, "id" | "createdAt" | "updatedAt">>) {
  return update<NoteRecord>("note", id, input);
}

export function deleteNote(id: string) {
  return remove("note", id);
}
