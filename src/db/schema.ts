import {
  pgTable,
  date,
  integer,
  text,
  boolean,
  timestamp,
  primaryKey,
} from 'drizzle-orm/pg-core';

export const rolls = pgTable(
  'rolls',
  {
    date:      date('date').notNull(),
    userId:    text('user_id').notNull(),
    value:     integer('value').notNull(),
    mode:      text('mode', { enum: ['normal', 'anarchy'] }).notNull(),
    finalized: boolean('finalized').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.date, t.userId] })],
);

export const tiebreaks = pgTable(
  'tiebreaks',
  {
    date:      date('date').notNull(),
    round:     integer('round').notNull(),
    userId:    text('user_id').notNull(),
    value:     integer('value').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.date, t.round, t.userId] })],
);

export const meta = pgTable('meta', {
  key:   text('key').primaryKey(),
  value: text('value'),
});

// Роли Discord-сервера, настраиваемые через !setrole
export const serverRoles = pgTable('server_roles', {
  roleType: text('role_type', { enum: ['arbuz', 'tykvenets'] }).primaryKey(),
  roleId:   text('role_id').notNull(),
});

// Удобные типы для использования в коде
export type Roll       = typeof rolls.$inferSelect;
export type Tiebreak   = typeof tiebreaks.$inferSelect;
export type MetaRow    = typeof meta.$inferSelect;
export type ServerRole = typeof serverRoles.$inferSelect;
export type RoleType   = ServerRole['roleType'];
