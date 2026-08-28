import { pgTable, uuid, text, timestamp, integer, boolean, pgEnum, primaryKey } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

/* ==================== USERS ==================== */
export const roleEnum = pgEnum('role', ['admin', 'editor', 'viewer'])

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name'),
  role: roleEnum('role').notNull().default('viewer'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

/* ==================== WORKSTREAMS ==================== */
export const blockEnum = pgEnum('block', ['bertahan', 'stabilkan', 'bertumbuh'])
export const priorityEnum = pgEnum('priority', ['P1', 'P2', 'P3'])
export const statusEnum = pgEnum('status', ['todo', 'jalan', 'tunggu', 'risiko', 'beres'])

export const workstreams = pgTable('workstreams', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  block: blockEnum('block').notNull(),
  priority: priorityEnum('priority').notNull(),
  pic: text('pic').notNull(),
  output: text('output').notNull(),
  due: text('due').notNull(),
  context: text('context').notNull().default(''),
  nextAction: text('next_action').notNull().default(''),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  updatedBy: uuid('updated_by').references(() => users.id),
})

export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  workstreamId: uuid('workstream_id').notNull().references(() => workstreams.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  pic: text('pic'),
  due: text('due'),
  status: statusEnum('status').notNull().default('todo'),
  ord: integer('ord').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  updatedBy: uuid('updated_by').references(() => users.id),
})

export const workstreamsRelations = relations(workstreams, ({ many }) => ({
  tasks: many(tasks),
}))
export const tasksRelations = relations(tasks, ({ one }) => ({
  workstream: one(workstreams, { fields: [tasks.workstreamId], references: [workstreams.id] }),
}))

/* ==================== AUDIT LOG ==================== */
export const auditLog = pgTable('audit_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  actor: uuid('actor').references(() => users.id),
  entity: text('entity').notNull(),
  entityId: uuid('entity_id'),
  action: text('action').notNull(),
  patch: text('patch'),
  at: timestamp('at', { withTimezone: true }).defaultNow().notNull(),
})

/* ==================== SESSION TYPES ==================== */
export type User = typeof users.$inferSelect
export type Workstream = typeof workstreams.$inferSelect
export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
