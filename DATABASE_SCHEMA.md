# Habit Tracker Production Schema (Proposed)

## Core Tables

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(120) NOT NULL,
  timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE habits (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(160) NOT NULL,
  icon VARCHAR(8) NOT NULL,
  color VARCHAR(16) NOT NULL,
  type VARCHAR(16) NOT NULL CHECK (type IN ('boolean', 'count', 'duration')),
  target_value NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit VARCHAR(30) NOT NULL DEFAULT 'times',
  goal_monthly INTEGER NOT NULL DEFAULT 20,
  frequency_per_week INTEGER NOT NULL DEFAULT 5,
  week_days SMALLINT[] NOT NULL,
  reminder_time TIME,
  difficulty VARCHAR(16) NOT NULL DEFAULT 'medium',
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE habit_entries (
  id UUID PRIMARY KEY,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  value NUMERIC(10,2) NOT NULL,
  note TEXT,
  source VARCHAR(30) NOT NULL DEFAULT 'manual',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (habit_id, entry_date)
);

CREATE TABLE mood_entries (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  mood SMALLINT NOT NULL CHECK (mood BETWEEN 1 AND 10),
  motivation SMALLINT NOT NULL CHECK (motivation BETWEEN 1 AND 10),
  note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, entry_date)
);

CREATE TABLE badges (
  id UUID PRIMARY KEY,
  code VARCHAR(80) UNIQUE NOT NULL,
  label VARCHAR(80) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(8) NOT NULL
);

CREATE TABLE user_badges (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  channel VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  scheduled_at TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  payload JSONB
);

CREATE TABLE integrations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(40) NOT NULL,
  status VARCHAR(20) NOT NULL,
  access_token_ref VARCHAR(255),
  refresh_token_ref VARCHAR(255),
  last_sync_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, provider)
);
```

## Performance Indexes

```sql
CREATE INDEX idx_habits_user_archived ON habits(user_id, archived);
CREATE INDEX idx_entries_habit_date ON habit_entries(habit_id, entry_date);
CREATE INDEX idx_entries_user_date ON habit_entries(user_id, entry_date);
CREATE INDEX idx_notifications_sched ON notifications(user_id, scheduled_at, status);
```

## Analytics Materialization

```sql
CREATE MATERIALIZED VIEW analytics_daily AS
SELECT
  he.user_id,
  he.entry_date AS day,
  COUNT(*) AS completions,
  AVG(he.value) AS avg_value
FROM habit_entries he
GROUP BY he.user_id, he.entry_date;
```

## Notes

- Add idempotency keys on completion APIs for offline sync safety.
- Use soft delete (`deleted_at`) for production recovery requirements.
- Keep domain events (`domain_events`) for audit trail and replay.
