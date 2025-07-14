import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

interface SiteCustomizations {
  businessName: string;
  businessDescription: string;
  industry: string;
  email: string;
  phone: string;
  address: string;
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
  includeContactForm: boolean;
  includeMaps: boolean;
  includeSocial: boolean;
  includeSEO: boolean;
}

class GeneratorService {
  private templatesDir: string;

  constructor() {
    this.templatesDir = path.join(process.cwd(), 'server', 'templates');
  }

  async generateSite(template: string, customizations: SiteCustomizations): Promise<string> {
    try {
      // Read template file
      const templatePath = path.join(this.templatesDir, `${template}.html`);
      
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template ${template} not found`);
      }

      const templateContent = fs.readFileSync(templatePath, 'utf-8');
      
      // Compile template with Handlebars
      const compiledTemplate = Handlebars.compile(templateContent);
      
      // Generate context for template
      const context = {
        ...customizations,
        currentYear: new Date().getFullYear(),
        generatedDate: new Date().toLocaleDateString(),
        mapEmbedUrl: customizations.includeMaps ? 
          `https://www.google.com/maps/embed/v1/place?key=AIzaSyBOti4mM-6x9WDnZIjIeyFor35hvHi-8bM&q=${encodeURIComponent(customizations.address)}` : 
          null,
        seoTitle: `${customizations.businessName} - ${this.getIndustryTitle(customizations.industry)}`,
        seoDescription: `${customizations.businessDescription.substring(0, 160)}...`,
      };

      // Generate HTML
      const generatedHtml = compiledTemplate(context);
      
      return generatedHtml;
    } catch (error) {
      console.error('Error generating site:', error);
      throw error;
    }
  }

  private getIndustryTitle(industry: string): string {
    const titles = {
      restaurant: 'Fine Dining & Cuisine',
      retail: 'Shopping & Retail',
      professional: 'Professional Services',
      healthcare: 'Healthcare & Medical Services',
      automotive: 'Automotive Services',
      beauty: 'Beauty & Wellness',
      fitness: 'Fitness & Health',
      education: 'Education & Training',
    };
    
    return titles[industry as keyof typeof titles] || 'Professional Services';
  }

  getAvailableTemplates() {
    return [
      {
        id: 'restaurant',
        name: 'Restaurant Pro',
        description: 'Perfect for restaurants, cafes, and food services',
        industries: ['restaurant', 'cafe', 'catering'],
        features: ['Menu showcase', 'Reservation system', 'Location map', 'Photo gallery']
      },
      {
        id: 'professional',
        name: 'Professional Suite',
        description: 'Ideal for law firms, consultants, and agencies',
        industries: ['legal', 'consulting', 'finance', 'professional'],
        features: ['Service pages', 'Team profiles', 'Testimonials', 'Contact forms']
      },
      {
        id: 'retail',
        name: 'Retail Store',
        description: 'Great for shops, boutiques, and retail businesses',
        industries: ['retail', 'fashion', 'electronics', 'jewelry'],
        features: ['Product showcase', 'Store locator', 'Contact info', 'Business hours']
      },
      {
        id: 'healthcare',
        name: 'Healthcare Plus',
        description: 'Designed for medical practices and healthcare',
        industries: ['healthcare', 'dental', 'medical', 'clinic'],
        features: ['Services list', 'Appointment info', 'Staff profiles', 'Insurance info']
      }
    ];
  }
}

export const generatorService = new GeneratorService();
