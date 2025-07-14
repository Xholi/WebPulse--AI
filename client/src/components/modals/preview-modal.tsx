import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { X } from "lucide-react";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  description: string;
  address: string;
  phone: string;
  email: string;
}

export default function PreviewModal({
  isOpen,
  onClose,
  businessName,
  description,
  address,
  phone,
  email,
}: PreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Website Preview</DialogTitle>
              <p className="text-muted-foreground">Review your generated website before approval</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[70vh]">
          <div className="border border-border rounded-lg overflow-hidden">
            {/* Sample website preview */}
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-8 text-center">
              <h1 className="text-4xl font-bold mb-2">{businessName}</h1>
              <p className="text-xl text-amber-100">{description}</p>
              <Button className="mt-4 bg-white text-amber-700 hover:bg-amber-50">
                Learn More
              </Button>
            </div>

            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Welcome to {businessName}</h2>
                  <p className="text-muted-foreground mb-6">{description}</p>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-amber-600">📍</span>
                      <span>{address}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-amber-600">📞</span>
                      <span>{phone}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-amber-600">📧</span>
                      <span>{email}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
                  <span className="text-muted-foreground">Business Image</span>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-6">
                <h3 className="text-2xl font-bold mb-4 text-center">Contact Us</h3>
                <div className="max-w-md mx-auto space-y-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full border border-border rounded-lg px-4 py-3"
                    disabled
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full border border-border rounded-lg px-4 py-3"
                    disabled
                  />
                  <textarea
                    placeholder="Your Message"
                    rows={4}
                    className="w-full border border-border rounded-lg px-4 py-3"
                    disabled
                  />
                  <Button className="w-full bg-amber-600 hover:bg-amber-700" disabled>
                    Send Message
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <p>Ready to approve? <span className="font-medium">60% deposit ($459) required to proceed</span></p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              Request Changes
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              Approve & Pay Deposit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
