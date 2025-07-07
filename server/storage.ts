// This file is not used in the current implementation
// All data storage is handled by the pure Node.js backend on port 8000
// The frontend communicates with the backend via HTTP API calls

export interface IStorage {}

export class MemStorage implements IStorage {
  // Placeholder - not used
}

export const storage = new MemStorage();
