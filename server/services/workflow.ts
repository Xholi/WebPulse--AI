import { storage } from "../storage";
import { emailService } from "./email";

interface DevelopmentWorkflow {
  leadId: number;
  siteId: number;
  estimatedDays: number;
}

class WorkflowService {
  async startDevelopment(leadId: number, siteId: number): Promise<void> {
    const lead = await storage.getLeadById(leadId);
    const site = await storage.getSiteById(siteId);
    
    if (!lead || !site) {
      throw new Error("Lead or site not found");
    }

    // Calculate estimated completion (3-5 days)
    const developmentDays = Math.floor(Math.random() * 3) + 3; // 3-5 days
    const estimatedCompletion = new Date();
    estimatedCompletion.setDate(estimatedCompletion.getDate() + developmentDays);

    // Update lead status
    await storage.updateLead(leadId, {
      status: 'in_development',
      developmentStartedAt: new Date(),
      estimatedDelivery: estimatedCompletion,
      developmentNotes: `Development started - estimated completion in ${developmentDays} days`
    });

    // Update site status
    await storage.updateSite(siteId, {
      status: 'in_development',
      developmentStartedAt: new Date(),
      estimatedCompletion: estimatedCompletion,
      developerNotes: 'Pre-built website development in progress'
    });

    // Send confirmation email to client
    if (lead.email) {
      await emailService.sendDevelopmentStarted(
        lead.email,
        lead.name,
        estimatedCompletion.toLocaleDateString()
      );
    }

    // Schedule completion check (in production, this would be a background job)
    setTimeout(() => {
      this.completeDevelopment(leadId, siteId).catch(console.error);
    }, developmentDays * 48 * 60 * 60 * 1000);
  }

  async completeDevelopment(leadId: number, siteId: number): Promise<void> {
    const lead = await storage.getLeadById(leadId);
    const site = await storage.getSiteById(siteId);
    
    if (!lead || !site) return;

    // Generate final website URL (in production, this would be actual hosting)
    const finalUrl = `https://webpulse-sites.replit.app/${lead.name.toLowerCase().replace(/\s+/g, '-')}-${leadId}`;

    // Update lead status
    await storage.updateLead(leadId, {
      status: 'completed',
      completedAt: new Date(),
      developmentNotes: 'Pre-built website development completed successfully'
    });

    // Update site status
    await storage.updateSite(siteId, {
      status: 'completed',
      actualCompletion: new Date(),
      finalUrl: finalUrl,
      qualityChecked: true,
      developerNotes: 'Pre-built website ready for client review and delivery'
    });

    // Send completion email to client
    if (lead.email) {
      await emailService.sendWebsiteCompleted(
        lead.email,
        lead.name,
        finalUrl
      );
    }
  }

  async deliverWebsite(leadId: number, siteId: number): Promise<void> {
    const lead = await storage.getLeadById(leadId);
    const site = await storage.getSiteById(siteId);
    
    if (!lead || !site) {
      throw new Error("Lead or site not found");
    }

    if (site.status !== 'completed') {
      throw new Error("Website must be completed before delivery");
    }

    // Update lead status
    await storage.updateLead(leadId, {
      status: 'delivered',
      deliveredAt: new Date(),
      developmentNotes: 'Pre-built website delivered to client'
    });

    // Update site status
    await storage.updateSite(siteId, {
      status: 'delivered',
      clientApproved: true
    });

    // Send delivery confirmation email
    if (lead.email) {
      await emailService.sendWebsiteDelivered(
        lead.email,
        lead.name,
        site.finalUrl!
      );
    }
  }

  async getWorkflowStatus(leadId: number): Promise<{
    currentStage: string;
    progress: number;
    estimatedCompletion?: Date;
    daysRemaining?: number;
  }> {
    const lead = await storage.getLeadById(leadId);
    
    if (!lead) {
      throw new Error("Lead not found");
    }

    const stages = [
      'pending',
      'preview_sent', 
      'approved',
      'deposit_paid',
      'in_development',
      'completed',
      'delivered'
    ];

    const currentStageIndex = stages.indexOf(lead.status);
    const progress = ((currentStageIndex + 1) / stages.length) * 100;

    let daysRemaining;
    if (lead.estimatedDelivery) {
      const now = new Date();
      const diffTime = lead.estimatedDelivery.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return {
      currentStage: lead.status,
      progress: Math.round(progress),
      estimatedCompletion: lead.estimatedDelivery || undefined,
      daysRemaining: daysRemaining && daysRemaining > 0 ? daysRemaining : undefined
    };
  }

  async processDepositPayment(leadId: number, paymentId: string): Promise<void> {
    const lead = await storage.getLeadById(leadId);
    
    if (!lead) {
      throw new Error("Lead not found");
    }

    // Update lead with deposit payment
    await storage.updateLead(leadId, {
      status: 'deposit_paid',
      depositPaidAt: new Date(),
      developmentNotes: 'Deposit payment received - development will begin'
    });

    // Create payment record
    await storage.createPayment({
      leadId: leadId,
      amount: "6800.00", // 60% deposit of 11500
      gateway: "paypal",
      status: "completed",
      transactionId: paymentId,
      paymentType: "deposit"
    });

    // Get associated site
    const sites = await storage.getSitesByLeadId(leadId);
    if (sites.length > 0) {
      // Start development workflow
      await this.startDevelopment(leadId, sites[0].id);
    }
  }
}

export const workflowService = new WorkflowService();