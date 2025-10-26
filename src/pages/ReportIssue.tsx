import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Upload, MapPin, Camera, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { categories } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getLatLngFromAddress, getAddressFromLatLng } from "@/lib/geocoding";

export default function ReportIssue() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    file: null as File | null,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const address = await getAddressFromLatLng(latitude, longitude);
          if (address) {
            setFormData({ ...formData, location: address });
          } else {
            toast({
              title: "Could not find address",
              description: "Unable to find address for your current location.",
              variant: "destructive",
            });
          }
        },
        () => {
          toast({
            title: "Location access denied",
            description: "Please enable location access in your browser settings.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);

    try {
      let imageUrl = "";
      if (formData.file) {
        const fileExt = formData.file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("issue-images")
          .upload(fileName, formData.file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("issue-images")
          .getPublicUrl(fileName);
        imageUrl = publicUrl;
      }

      const coords = await getLatLngFromAddress(formData.location);

      const { error } = await supabase.from("issues").insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location_address: formData.location,
        latitude: coords?.lat,
        longitude: coords?.lng,
        image_url: imageUrl,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Issue Reported Successfully!",
        description: "Your report has been submitted and will be reviewed shortly.",
      });
      navigate("/my-reports");
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Failed to submit report",
        description: "There was a problem submitting your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-3">Report an Issue</h1>
          <p className="text-lg text-primary-foreground/90">
            Help improve your city by reporting civic problems
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Info Card */}
          <Card className="p-6 mb-8 bg-accent/10 border-accent/20">
            <div className="flex gap-4">
              <AlertCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">Before you report:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Check if the issue has already been reported</li>
                  <li>• Provide clear photos and exact location details</li>
                  <li>• Be specific in your description</li>
                  <li>• You'll receive updates via email on your report status</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Issue Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Large pothole on Main Street"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select issue category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about the issue..."
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Include details like size, severity, and how long the issue has existed
                </p>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="Enter exact location (street name, landmarks)"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={handleGetCurrentLocation}>
                  <MapPin className="h-4 w-4 mr-2" />
                  Use Current Location
                </Button>
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label htmlFor="photo">Photo Evidence</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <input
                    type="file"
                    id="photo"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) =>
                      setFormData({ ...formData, file: e.target.files?.[0] || null })
                    }
                  />
                  <label htmlFor="photo" className="cursor-pointer">
                    <Camera className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="font-medium mb-1">Click to upload photo</p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG up to 10MB (optional but recommended)
                    </p>
                    {formData.file && (
                      <p className="text-sm text-accent mt-2 font-medium">
                        Selected: {formData.file.name}
                      </p>
                    )}
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1" variant="default" disabled={submitting}>
                  <Upload className="h-4 w-4 mr-2" />
                  {submitting ? "Submitting..." : "Submit Report"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setFormData({
                      title: "",
                      description: "",
                      category: "",
                      location: "",
                      file: null,
                    })
                  }
                >
                  Clear Form
                </Button>
              </div>
            </form>
          </Card>

          {/* Help Text */}
          <p className="text-sm text-muted-foreground mt-6 text-center">
            By submitting this report, you agree to our terms of service and privacy policy.
            Your contact information will only be used for updates on this issue.
          </p>
        </div>
      </div>
    </div>
  );
}
