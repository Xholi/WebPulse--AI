import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: text("username").unique(),
  password: text("password"),
  role: text("role").notNull().default("team"), // admin, team, client
  isActive: boolean("is_active").notNull().default(true),
  websitesGenerated: integer("websites_generated").notNull().default(0),
  maxWebsites: integer("max_websites").notNull().default(10),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const businessLeads = pgTable("business_leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  industry: text("industry").notNull(),
  description: text("description"),
  website: text("website"),
  status: text("status").notNull().default("pending"), // pending, preview_sent, approved, deposit_paid, in_development, completed, delivered
  assignedTo: varchar("assigned_to").references(() => users.id),
  createdBy: varchar("created_by").references(() => users.id),
  searchQuery: text("search_query"),
  isDemo: boolean("is_demo").notNull().default(false),
  previewSentAt: timestamp("preview_sent_at"),
  approvedAt: timestamp("approved_at"),
  depositPaidAt: timestamp("deposit_paid_at"),
  developmentStartedAt: timestamp("development_started_at"),
  completedAt: timestamp("completed_at"),
  deliveredAt: timestamp("delivered_at"),
  developmentNotes: text("development_notes"),
  clientFeedback: text("client_feedback"),
  estimatedDelivery: timestamp("estimated_delivery"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const generatedSites = pgTable("generated_sites", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").notNull().references(() => businessLeads.id),
  template: text("template").notNull(),
  customizations: jsonb("customizations").notNull(), // colors, logo, content
  previewUrl: text("preview_url"),
  finalUrl: text("final_url"),
  status: text("status").notNull().default("draft"), // draft, preview, in_development, completed, delivered
  developmentStartedAt: timestamp("development_started_at"),
  estimatedCompletion: timestamp("estimated_completion"),
  actualCompletion: timestamp("actual_completion"),
  developerNotes: text("developer_notes"),
  qualityChecked: boolean("quality_checked").default(false),
  clientApproved: boolean("client_approved").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").notNull().references(() => businessLeads.id),
  siteId: integer("site_id").references(() => generatedSites.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  gateway: text("gateway").notNull(), // stripe, payfast
  transactionId: text("transaction_id"),
  status: text("status").notNull().default("pending"), // pending, completed, failed, refunded
  paymentType: text("payment_type").notNull().default("deposit"), // deposit, full, refund
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const emailCampaigns = pgTable("email_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  template: text("template").notNull(),
  recipients: jsonb("recipients").notNull(), // array of lead IDs
  status: text("status").notNull().default("draft"), // draft, sent, scheduled
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const fileUploads = pgTable("file_uploads", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => businessLeads.id),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  fileType: text("file_type").notNull(), // logo, testimonial, image
  url: text("url").notNull(),
  size: integer("size"),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  leads: many(businessLeads, { relationName: "userLeads" }),
  assignedLeads: many(businessLeads, { relationName: "assignedLeads" }),
  fileUploads: many(fileUploads),
}));

export const businessLeadsRelations = relations(businessLeads, ({ one, many }) => ({
  assignedUser: one(users, {
    fields: [businessLeads.assignedTo],
    references: [users.id],
    relationName: "assignedLeads",
  }),
  createdByUser: one(users, {
    fields: [businessLeads.createdBy],
    references: [users.id],
    relationName: "userLeads",
  }),
  sites: many(generatedSites),
  payments: many(payments),
  files: many(fileUploads),
}));

export const generatedSitesRelations = relations(generatedSites, ({ one, many }) => ({
  lead: one(businessLeads, {
    fields: [generatedSites.leadId],
    references: [businessLeads.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  lead: one(businessLeads, {
    fields: [payments.leadId],
    references: [businessLeads.id],
  }),
  site: one(generatedSites, {
    fields: [payments.siteId],
    references: [generatedSites.id],
  }),
}));

export const fileUploadsRelations = relations(fileUploads, ({ one }) => ({
  lead: one(businessLeads, {
    fields: [fileUploads.leadId],
    references: [businessLeads.id],
  }),
  uploadedByUser: one(users, {
    fields: [fileUploads.uploadedBy],
    references: [users.id],
  }),
}));

// Schema validation
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  username: true,
  password: true,
  role: true,
});

export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertLeadSchema = createInsertSchema(businessLeads).pick({
  name: true,
  email: true,
  phone: true,
  address: true,
  industry: true,
  description: true,
  website: true,
  status: true,
  assignedTo: true,
  createdBy: true,
  searchQuery: true,
  isDemo: true,
});

export const insertSiteSchema = createInsertSchema(generatedSites).pick({
  leadId: true,
  template: true,
  customizations: true,
  status: true,
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  leadId: true,
  siteId: true,
  amount: true,
  gateway: true,
  transactionId: true,
  status: true,
  paymentType: true,
});

export const insertEmailCampaignSchema = createInsertSchema(emailCampaigns).pick({
  name: true,
  subject: true,
  template: true,
  recipients: true,
  status: true,
});

export const insertFileUploadSchema = createInsertSchema(fileUploads).pick({
  leadId: true,
  filename: true,
  originalName: true,
  fileType: true,
  url: true,
  size: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type BusinessLead = typeof businessLeads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type GeneratedSite = typeof generatedSites.$inferSelect;
export type InsertSite = z.infer<typeof insertSiteSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type InsertEmailCampaign = z.infer<typeof insertEmailCampaignSchema>;
export type FileUpload = typeof fileUploads.$inferSelect;
export type InsertFileUpload = z.infer<typeof insertFileUploadSchema>;
