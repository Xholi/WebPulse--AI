import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { insertLeadSchema, insertSiteSchema, insertPaymentSchema } from "@shared/schema";
import { emailService } from "./services/email";
import { generatorService } from "./services/generator";
import { paymentService } from "./services/payments";
import { workflowService } from "./services/workflow";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
    cb(null, allowedTypes.includes(file.mimetype));
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Analytics
  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Business Leads
  app.get("/api/leads", async (req, res) => {
    try {
      const { status, industry } = req.query;
      let leads;
      
      if (status) {
        leads = await storage.getLeadsByStatus(status as string);
      } else if (industry) {
        leads = await storage.getLeadsByIndustry(industry as string);
      } else {
        leads = await storage.getAllLeads();
      }
      
      res.json(leads);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/leads/:id", async (req, res) => {
    try {
      const lead = await storage.getLeadById(parseInt(req.params.id));
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const validatedData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(validatedData);
      res.status(201).json(lead);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/leads/:id", async (req, res) => {
    try {
      const lead = await storage.updateLead(parseInt(req.params.id), req.body);
      res.json(lead);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Generated Sites
  app.get("/api/sites/:leadId", async (req, res) => {
    try {
      const sites = await storage.getSitesByLeadId(parseInt(req.params.leadId));
      res.json(sites);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/sites/generate", async (req, res) => {
    try {
      const { leadId, template, customizations } = req.body;
      
      // Create site record
      const siteData = insertSiteSchema.parse({
        leadId,
        template,
        customizations,
        status: "draft"
      });
      
      const site = await storage.createSite(siteData);
      
      // Generate HTML using template service
      const html = await generatorService.generateSite(template, customizations);
      
      // Save generated HTML and update site record
      const previewUrl = `/preview/${site.id}`;
      await storage.updateSite(site.id, { 
        previewUrl,
        status: "preview" 
      });

      // Update lead status
      await storage.updateLead(leadId, { status: "generated" });

      res.json({ ...site, previewUrl });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // File Uploads
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { leadId, fileType } = req.body;
      const fileUrl = `/uploads/${req.file.filename}`;

      const fileUpload = await storage.createFileUpload({
        leadId: leadId ? parseInt(leadId) : undefined,
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileType: fileType || "image",
        url: fileUrl,
        size: req.file.size,
      });

      res.json(fileUpload);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // PayPal Routes
  app.get("/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/paypal/order", async (req, res) => {
    // Request body should contain: { intent, amount, currency }
    await createPaypalOrder(req, res);
  });

  app.post("/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });

  // Workflow routes for 3-5 day development process
  app.post("/api/workflow/approve-lead/:id", async (req, res) => {
    try {
      const leadId = parseInt(req.params.id);
      const lead = await storage.updateLead(leadId, {
        status: 'approved',
        approvedAt: new Date()
      });
      
      res.json(lead);
    } catch (error) {
      console.error("Error approving lead:", error);
      res.status(500).json({ message: "Failed to approve lead" });
    }
  });

  app.post("/api/workflow/process-deposit/:leadId", async (req, res) => {
    try {
      const leadId = parseInt(req.params.leadId);
      const { paymentId } = req.body;
      
      await workflowService.processDepositPayment(leadId, paymentId);
      
      res.json({ message: "Deposit processed, development started" });
    } catch (error) {
      console.error("Error processing deposit:", error);
      res.status(500).json({ message: "Failed to process deposit" });
    }
  });

  app.get("/api/workflow/status/:leadId", async (req, res) => {
    try {
      const leadId = parseInt(req.params.leadId);
      const status = await workflowService.getWorkflowStatus(leadId);
      
      res.json(status);
    } catch (error) {
      console.error("Error getting workflow status:", error);
      res.status(500).json({ message: "Failed to get workflow status" });
    }
  });

  app.post("/api/workflow/deliver/:leadId", async (req, res) => {
    try {
      const leadId = parseInt(req.params.leadId);
      const sites = await storage.getSitesByLeadId(leadId);
      
      if (sites.length === 0) {
        return res.status(404).json({ message: "No site found for this lead" });
      }
      
      await workflowService.deliverWebsite(leadId, sites[0].id);
      
      res.json({ message: "Website delivered successfully" });
    } catch (error) {
      console.error("Error delivering website:", error);
      res.status(500).json({ message: "Failed to deliver website" });
    }
  });

  // Create PayPal payment for lead
  app.post("/api/create-payment", async (req, res) => {
    try {
      const { leadId, amount } = req.body;
      
      // Create payment record
      await storage.createPayment({
        leadId,
        amount: amount.toString(),
        gateway: "paypal",
        status: "pending",
        paymentType: "deposit",
      });

      res.json({ success: true, leadId, amount });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment: " + error.message });
    }
  });

  // Update payment status when PayPal payment is captured
  app.post("/api/update-payment-status", async (req, res) => {
    try {
      const { leadId, transactionId, status } = req.body;
      
      // Update payment status
      const payments = await storage.getPaymentsByLeadId(leadId);
      const pendingPayment = payments.find(p => p.status === "pending");
      
      if (pendingPayment) {
        await storage.updatePayment(pendingPayment.id, {
          status: status,
          transactionId: transactionId,
        });

        // Update lead status to paid
        await storage.updateLead(leadId, { status: "paid" });

        // Send confirmation email
        const lead = await storage.getLeadById(leadId);
        if (lead && lead.email) {
          await emailService.sendPaymentConfirmation(lead.email, lead.name);
        }
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Payments
  app.get("/api/payments", async (req, res) => {
    try {
      const payments = await storage.getAllPayments();
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Email Campaigns
  app.post("/api/campaigns", async (req, res) => {
    try {
      const campaign = await storage.createCampaign(req.body);
      res.status(201).json(campaign);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/campaigns/:id/send", async (req, res) => {
    try {
      const campaign = await storage.getCampaignById(parseInt(req.params.id));
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      // Send emails to recipients
      await emailService.sendCampaign(campaign);
      
      // Update campaign status
      await storage.updateCampaign(campaign.id, {
        status: "sent",
        sentAt: new Date(),
      });

      res.json({ message: "Campaign sent successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Client Portal - Site Approval
  app.put("/api/sites/:id/approve", async (req, res) => {
    try {
      const site = await storage.getSiteById(parseInt(req.params.id));
      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }

      await storage.updateSite(site.id, { status: "approved" });
      await storage.updateLead(site.leadId, { status: "approved" });

      res.json({ message: "Site approved successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Bulk operations
  app.post("/api/leads/bulk-import", async (req, res) => {
    try {
      const { leads } = req.body;
      const results = [];

      for (const leadData of leads) {
        try {
          const validatedData = insertLeadSchema.parse(leadData);
          const lead = await storage.createLead(validatedData);
          results.push({ success: true, lead });
        } catch (error) {
          results.push({ success: false, error: error.message, data: leadData });
        }
      }

      res.json({ results });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Reminder system
  app.post("/api/reminders/send", async (req, res) => {
    try {
      const pendingLeads = await storage.getLeadsByStatus("pending");
      const oldLeads = pendingLeads.filter(lead => {
        const hoursAgo = (Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60);
        return hoursAgo > 48; // More than 48 hours old
      });

      let sentCount = 0;
      for (const lead of oldLeads) {
        if (lead.email) {
          await emailService.sendReminder(lead.email, lead.name);
          sentCount++;
        }
      }

      res.json({ message: `Sent ${sentCount} reminder emails` });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  const httpServer = createServer(app);
  return httpServer;
}
