-- Database schema for Interactive Book Engine

CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chapters (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS nodes (
  id TEXT PRIMARY KEY,
  chapter_id TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS interactions (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chapters_book_id ON chapters(book_id);
CREATE INDEX IF NOT EXISTS idx_nodes_chapter_id ON nodes(chapter_id);

-- Seed data
INSERT INTO books (id, data) VALUES (
  'test-book',
  '{
    "title": "Test Book",
    "chapters": ["chapter_1"],
    "arcs": {
      "test_arc": {
        "pacing": {
          "frameDelay": 500,
          "suspense": "low"
        }
      }
    }
  }'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO chapters (id, book_id, data) VALUES (
  'chapter_1',
  'test-book',
  '{
    "id": "chapter_1",
    "title": "Test Chapter",
    "arc": "test_arc",
    "nodes": ["node_1"],
    "context": {}
  }'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO nodes (id, chapter_id, data) VALUES (
  'node_1',
  'chapter_1',
  '{
    "id": "node_1",
    "content": [
      {"type": "text", "value": "Test content"}
    ],
    "choices": [
      {"text": "Continue", "goto": "node_1"}
    ]
  }'
) ON CONFLICT (id) DO NOTHING;
