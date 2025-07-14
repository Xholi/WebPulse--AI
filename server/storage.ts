import {
  users, businessLeads, generatedSites, payments, emailCampaigns, fileUploads,
  type User, type InsertUser, type UpsertUser, type BusinessLead, type InsertLead,
  type GeneratedSite, type InsertSite, type Payment, type InsertPayment,
  type EmailCampaign, type InsertEmailCampaign, type FileUpload, type InsertFileUpload
} from "@shared/schema";
import { db } from "./db";
import { eq, and, count, desc, like, or } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserWebsiteCount(id: string): Promise<User>;
  validatePassword(username: string, password: string): Promise<User | null>;
  getAllUsers(): Promise<User[]>;

  // Business Leads
  getAllLeads(userId?: string): Promise<BusinessLead[]>;
  getLeadById(id: number): Promise<BusinessLead | undefined>;
  createLead(lead: InsertLead): Promise<BusinessLead>;
  updateLead(id: number, updates: Partial<BusinessLead>): Promise<BusinessLead>;
  getLeadsByStatus(status: string, userId?: string): Promise<BusinessLead[]>;
  getLeadsByIndustry(industry: string, userId?: string): Promise<BusinessLead[]>;
  createDemoLeads(searchQuery: string, leads: Partial<InsertLead>[], userId: string): Promise<BusinessLead[]>;

  // Generated Sites
  getSiteById(id: number): Promise<GeneratedSite | undefined>;
  getSitesByLeadId(leadId: number): Promise<GeneratedSite[]>;
  createSite(site: InsertSite): Promise<GeneratedSite>;
  updateSite(id: number, updates: Partial<GeneratedSite>): Promise<GeneratedSite>;

  // Payments
  getAllPayments(): Promise<Payment[]>;
  getPaymentById(id: number): Promise<Payment | undefined>;
  getPaymentsByLeadId(leadId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, updates: Partial<Payment>): Promise<Payment>;

  // Email Campaigns
  getAllCampaigns(): Promise<EmailCampaign[]>;
  getCampaignById(id: number): Promise<EmailCampaign | undefined>;
  createCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign>;
  updateCampaign(id: number, updates: Partial<EmailCampaign>): Promise<EmailCampaign>;

  // File Uploads
  getFilesByLeadId(leadId: number): Promise<FileUpload[]>;
  createFileUpload(file: InsertFileUpload): Promise<FileUpload>;
  deleteFile(id: number): Promise<boolean>;

  // Analytics
  getAnalytics(userId?: string): Promise<{
    totalLeads: number;
    sitesGenerated: number;
    conversionRate: number;
    totalRevenue: number;
    monthlyStats: Array<{ month: string; leads: number; sites: number; revenue: number }>;
    industryBreakdown: Array<{ industry: string; count: number }>;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash password if provided
    if (insertUser.password) {
      insertUser.password = await bcrypt.hash(insertUser.password, 10);
    }

    // Generate a unique ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        id: userId,
      })
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserWebsiteCount(id: string): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");

    const [updatedUser] = await db
      .update(users)
      .set({
        websitesGenerated: (user.websitesGenerated || 0) + 1,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async validatePassword(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user?.password) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Business Leads operations
  async getAllLeads(userId?: string): Promise<BusinessLead[]> {
    let query = db.select().from(businessLeads);
    
    if (userId) {
      query = query.where(or(
        eq(businessLeads.createdBy, userId),
        eq(businessLeads.assignedTo, userId)
      ));
    }
    
    return await query.orderBy(desc(businessLeads.createdAt));
  }

  async getLeadById(id: number): Promise<BusinessLead | undefined> {
    const [lead] = await db.select().from(businessLeads).where(eq(businessLeads.id, id));
    return lead;
  }

  async createLead(insertLead: InsertLead): Promise<BusinessLead> {
    const [lead] = await db.insert(businessLeads).values(insertLead).returning();
    
    // Update user's website count if this is a generated lead
    if (insertLead.createdBy && insertLead.status === 'generated') {
      await this.updateUserWebsiteCount(insertLead.createdBy);
    }
    
    return lead;
  }

  async updateLead(id: number, updates: Partial<BusinessLead>): Promise<BusinessLead> {
    const [updated] = await db
      .update(businessLeads)
      .set({...updates, updatedAt: new Date()})
      .where(eq(businessLeads.id, id))
      .returning();
    return updated;
  }

  async getLeadsByStatus(status: string, userId?: string): Promise<BusinessLead[]> {
    let query = db.select().from(businessLeads).where(eq(businessLeads.status, status));
    
    if (userId) {
      query = query.where(and(
        eq(businessLeads.status, status),
        or(
          eq(businessLeads.createdBy, userId),
          eq(businessLeads.assignedTo, userId)
        )
      ));
    }
    
    return await query.orderBy(desc(businessLeads.createdAt));
  }

  async getLeadsByIndustry(industry: string, userId?: string): Promise<BusinessLead[]> {
    let query = db.select().from(businessLeads).where(eq(businessLeads.industry, industry));
    
    if (userId) {
      query = query.where(and(
        eq(businessLeads.industry, industry),
        or(
          eq(businessLeads.createdBy, userId),
          eq(businessLeads.assignedTo, userId)
        )
      ));
    }
    
    return await query.orderBy(desc(businessLeads.createdAt));
  }

  async createDemoLeads(searchQuery: string, leads: Partial<InsertLead>[], userId: string): Promise<BusinessLead[]> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    // Check if user has reached their limit
    if ((user.websitesGenerated || 0) >= (user.maxWebsites || 10)) {
      throw new Error("User has reached maximum website generation limit");
    }
    
    // Limit to max 15 leads per search
    const limitedLeads = leads.slice(0, 15);
    
    const insertData = limitedLeads.map(lead => ({
      name: lead.name || 'Demo Business',
      industry: lead.industry || 'General',
      email: lead.email || null,
      phone: lead.phone || null,
      address: lead.address || null,
      description: lead.description || null,
      website: lead.website || null,
      status: 'pending',
      createdBy: userId,
      assignedTo: userId,
      searchQuery,
      isDemo: true,
    }));

    const createdLeads = await db.insert(businessLeads).values(insertData).returning();
    return createdLeads;
  }

  // Generated Sites operations
  async getSiteById(id: number): Promise<GeneratedSite | undefined> {
    const [site] = await db.select().from(generatedSites).where(eq(generatedSites.id, id));
    return site;
  }

  async getSitesByLeadId(leadId: number): Promise<GeneratedSite[]> {
    return await db.select().from(generatedSites).where(eq(generatedSites.leadId, leadId));
  }

  async createSite(insertSite: InsertSite): Promise<GeneratedSite> {
    const [site] = await db.insert(generatedSites).values(insertSite).returning();
    return site;
  }

  async updateSite(id: number, updates: Partial<GeneratedSite>): Promise<GeneratedSite> {
    const [updated] = await db
      .update(generatedSites)
      .set(updates)
      .where(eq(generatedSites.id, id))
      .returning();
    return updated;
  }

  // Payments operations
  async getAllPayments(): Promise<Payment[]> {
    return await db.select().from(payments).orderBy(desc(payments.createdAt));
  }

  async getPaymentById(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async getPaymentsByLeadId(leadId: number): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.leadId, leadId));
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(insertPayment).returning();
    return payment;
  }

  async updatePayment(id: number, updates: Partial<Payment>): Promise<Payment> {
    const [updated] = await db
      .update(payments)
      .set(updates)
      .where(eq(payments.id, id))
      .returning();
    return updated;
  }

  // Email Campaigns operations
  async getAllCampaigns(): Promise<EmailCampaign[]> {
    return await db.select().from(emailCampaigns).orderBy(desc(emailCampaigns.createdAt));
  }

  async getCampaignById(id: number): Promise<EmailCampaign | undefined> {
    const [campaign] = await db.select().from(emailCampaigns).where(eq(emailCampaigns.id, id));
    return campaign;
  }

  async createCampaign(insertCampaign: InsertEmailCampaign): Promise<EmailCampaign> {
    const [campaign] = await db.insert(emailCampaigns).values(insertCampaign).returning();
    return campaign;
  }

  async updateCampaign(id: number, updates: Partial<EmailCampaign>): Promise<EmailCampaign> {
    const [updated] = await db
      .update(emailCampaigns)
      .set(updates)
      .where(eq(emailCampaigns.id, id))
      .returning();
    return updated;
  }

  // File Uploads operations
  async getFilesByLeadId(leadId: number): Promise<FileUpload[]> {
    return await db.select().from(fileUploads).where(eq(fileUploads.leadId, leadId));
  }

  async createFileUpload(insertFile: InsertFileUpload): Promise<FileUpload> {
    const [file] = await db.insert(fileUploads).values(insertFile).returning();
    return file;
  }

  async deleteFile(id: number): Promise<boolean> {
    const result = await db.delete(fileUploads).where(eq(fileUploads.id, id));
    return result.rowCount > 0;
  }

  // Analytics
  async getAnalytics(userId?: string): Promise<{
    totalLeads: number;
    sitesGenerated: number;
    conversionRate: number;
    totalRevenue: number;
    monthlyStats: Array<{ month: string; leads: number; sites: number; revenue: number }>;
    industryBreakdown: Array<{ industry: string; count: number }>;
  }> {
    // Get basic counts
    let leadsQuery = db.select({ count: count() }).from(businessLeads);
    let sitesQuery = db.select({ count: count() }).from(generatedSites);
    let paymentsQuery = db.select().from(payments).where(eq(payments.status, 'completed'));

    if (userId) {
      leadsQuery = leadsQuery.where(or(
        eq(businessLeads.createdBy, userId),
        eq(businessLeads.assignedTo, userId)
      ));
      
      sitesQuery = sitesQuery.innerJoin(businessLeads, eq(generatedSites.leadId, businessLeads.id))
        .where(or(
          eq(businessLeads.createdBy, userId),
          eq(businessLeads.assignedTo, userId)
        ));
    }

    const [totalLeadsResult] = await leadsQuery;
    const [sitesGeneratedResult] = await sitesQuery;
    const completedPayments = await paymentsQuery;

    const totalLeads = totalLeadsResult?.count || 0;
    const sitesGenerated = sitesGeneratedResult?.count || 0;
    const conversionRate = totalLeads > 0 ? (sitesGenerated / totalLeads) * 100 : 0;
    const totalRevenue = completedPayments.reduce((sum, payment) => 
      sum + parseFloat(payment.amount), 0
    );

    // Industry breakdown
    let industryQuery = db.select({
      industry: businessLeads.industry,
      count: count()
    }).from(businessLeads).groupBy(businessLeads.industry);

    if (userId) {
      industryQuery = industryQuery.where(or(
        eq(businessLeads.createdBy, userId),
        eq(businessLeads.assignedTo, userId)
      ));
    }

    const industryBreakdown = await industryQuery;

    return {
      totalLeads,
      sitesGenerated,
      conversionRate,
      totalRevenue,
      monthlyStats: [], // TODO: Implement monthly stats
      industryBreakdown: industryBreakdown.map(item => ({
        industry: item.industry,
        count: item.count
      }))
    };
  }
}

export const storage = new DatabaseStorage();