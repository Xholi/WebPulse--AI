import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Wand2 } from "lucide-react";

const generatorFormSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  industry: z.string().min(1, "Industry is required"),
  description: z.string().min(1, "Description is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
});

type GeneratorFormData = z.infer<typeof generatorFormSchema>;

interface GeneratorFormProps {
  selectedTemplate: string;
}

export default function GeneratorForm({ selectedTemplate }: GeneratorFormProps) {
  const { toast } = useToast();

  const form = useForm<GeneratorFormData>({
    resolver: zodResolver(generatorFormSchema),
    defaultValues: {
      businessName: "",
      industry: "",
      description: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  const generateSiteMutation = useMutation({
    mutationFn: async (data: GeneratorFormData) => {
      // First create a lead
      const leadResponse = await apiRequest("POST", "/api/leads", {
        name: data.businessName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        industry: data.industry,
        description: data.description,
      });
      const lead = await leadResponse.json();

      // Then generate the site
      const siteResponse = await apiRequest("POST", "/api/sites/generate", {
        leadId: lead.id,
        template: selectedTemplate,
        customizations: {
          businessName: data.businessName,
          businessDescription: data.description,
          industry: data.industry,
          email: data.email,
          phone: data.phone,
          address: data.address,
          primaryColor: "#3B82F6",
          secondaryColor: "#10B981",
          includeContactForm: true,
          includeMaps: true,
          includeSocial: false,
          includeSEO: true,
        },
      });
      return siteResponse.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Website Generated",
        description: "Your website has been generated successfully!",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate website",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GeneratorFormData) => {
    generateSiteMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="businessName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter business name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="industry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Industry</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="retail">Retail Store</SelectItem>
                  <SelectItem value="professional">Professional Services</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="automotive">Automotive</SelectItem>
                  <SelectItem value="beauty">Beauty & Wellness</SelectItem>
                  <SelectItem value="fitness">Fitness & Sports</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe your business" rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="business@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="(555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Main St, City, State 12345" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full brand-gradient text-white py-4 font-semibold"
          disabled={generateSiteMutation.isPending}
        >
          <Wand2 className="mr-2 w-5 h-5" />
          {generateSiteMutation.isPending ? "Generating..." : "Generate Website"}
        </Button>
      </form>
    </Form>
  );
}
