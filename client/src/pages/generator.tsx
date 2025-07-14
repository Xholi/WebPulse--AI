import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Wand2, Upload, Info } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import GeneratorForm from "../components/forms/generator-form";

const templates = [
  {
    id: "restaurant",
    name: "Restaurant Pro",
    description: "Perfect for restaurants, cafes, and food services",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
  },
  {
    id: "professional",
    name: "Professional Suite",
    description: "Ideal for law firms, consultants, and agencies",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
  },
  {
    id: "retail",
    name: "Retail Store",
    description: "Great for shops, boutiques, and retail businesses",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
  },
  {
    id: "healthcare",
    name: "Healthcare Plus",
    description: "Designed for medical practices and healthcare",
    image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
  },
];

export default function Generator() {
  const [selectedTemplate, setSelectedTemplate] = useState("retail");
  const [primaryColor, setPrimaryColor] = useState("#3B82F6");
  const { toast } = useToast();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Website Generator</h2>
          <p className="text-muted-foreground">Create beautiful websites using AI-powered templates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent>
              <GeneratorForm selectedTemplate={selectedTemplate} />
            </CardContent>
          </Card>

          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Template Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedTemplate === template.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <img
                      src={template.image}
                      alt={template.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                    {selectedTemplate === template.id && (
                      <div className="mt-2">
                        <Badge>Selected</Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Brand Assets */}
          <Card>
            <CardHeader>
              <CardTitle>Brand Assets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Logo Upload</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/40 transition-colors mt-2">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Drop your logo here or <span className="text-primary font-medium">browse files</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Primary Color</Label>
                <div className="flex items-center space-x-3 mt-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-10 border border-border rounded-lg cursor-pointer"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Secondary Color</Label>
                <div className="flex items-center space-x-3 mt-2">
                  <input
                    type="color"
                    defaultValue="#10B981"
                    className="w-12 h-10 border border-border rounded-lg cursor-pointer"
                  />
                  <Input defaultValue="#10B981" className="flex-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generation Options */}
          <Card>
            <CardHeader>
              <CardTitle>Generation Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Include Contact Form</p>
                  <p className="text-sm text-muted-foreground">Add a contact form to the website</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Google Maps Integration</p>
                  <p className="text-sm text-muted-foreground">Embed location map</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Social Media Links</p>
                  <p className="text-sm text-muted-foreground">Add social media icons</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SEO Optimization</p>
                  <p className="text-sm text-muted-foreground">Optimize for search engines</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full brand-gradient text-white py-4 font-semibold"
            onClick={() => {
              // TODO: Implement website generation logic
              toast({
                title: "Coming Soon",
                description: "Website generation functionality is not implemented yet.",
              });
            }}
          >
            <Wand2 className="mr-2 w-5 h-5" />
            Generate Website
          </Button>

          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Pro Tip</p>
                  <p className="text-sm text-amber-700">
                    Upload a high-quality logo for best results. The AI will automatically optimize images and content for your industry.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
