import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Upload, ArrowLeft, Check, X, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import { categories } from '@/lib/categories';
import { getLatLngFromAddress, getAddressFromLatLng } from "@/lib/geocoding";

export default function ReportWithAI() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [location, setLocation] = useState('');
  const [classifying, setClassifying] = useState(false);
  const [result, setResult] = useState<{ title: string; description: string; category: string; } | null>(null);
  const [editableResult, setEditableResult] = useState<{ title: string; description: string; category: string; } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setEditableResult(null);
    }
  };

  const handleClassify = async () => {
    if (!image) {
      toast({
        title: 'No image selected',
        description: 'Please select an image first',
        variant: 'destructive',
      });
      return;
    }

    setClassifying(true);

    try {
      const formData = new FormData();
      formData.append('file', image);

      const response = await fetch('https://radvirtua-apex-city-api.hf.space/api/process-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const normalizedData = {
        ...data,
        category: data.category.toLowerCase(),
      };

      setResult(normalizedData);
      setEditableResult(normalizedData);
      toast({
        title: 'Classification complete!',
        description: 'Please review and edit the details if necessary',
      });
    } catch (error) {
      console.error('Classification error:', error);
      toast({
        title: 'Classification failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setClassifying(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const address = await getAddressFromLatLng(latitude, longitude);
          if (address) {
            setLocation(address);
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

  const handleSubmit = async () => {
    if (!editableResult || !image || !location) {
      toast({
        title: 'Missing information',
        description: 'Please provide all required details',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      // Upload image to storage
      const fileExt = image.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('issue-images')
        .upload(fileName, image);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('issue-images')
        .getPublicUrl(fileName);

      const coords = await getLatLngFromAddress(location);

      // Create issue in database
      const { error: insertError } = await supabase
        .from('issues')
        .insert({
          user_id: user?.id,
          title: editableResult.title,
          description: editableResult.description,
          category: editableResult.category,
          location_address: location,
          latitude: coords?.lat,
          longitude: coords?.lng,
          image_url: publicUrl,
          status: 'pending',
        });

      if (insertError) throw insertError;

      toast({
        title: 'Issue reported successfully!',
        description: 'Thank you for helping improve your community',
      });

      navigate('/my-reports');
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: 'Failed to submit report',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setEditableResult(null);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mb-4 text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-3xl font-bold">Report with AI</h1>
          <p className="text-primary-foreground/90 mt-2">
            Take a photo and let AI classify the issue
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-6">
          <div className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-4">
              <Label>Upload Issue Photo</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
                className="hidden"
              />
              
              {imagePreview ? (
                <div className="space-y-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full rounded-lg border"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-12 text-center">
                  <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo
                  </Button>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="Enter location address"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={handleGetCurrentLocation}>
                <MapPin className="h-4 w-4 mr-2" />
                Use Current Location
              </Button>
            </div>

            {/* Classify Button */}
            {image && !result && (
              <Button
                onClick={handleClassify}
                disabled={classifying || !location}
                className="w-full"
              >
                {classifying ? 'Classifying...' : 'Classify Issue with AI'}
              </Button>
            )}

            {/* Classification Result Form */}
            {editableResult && (
              <Card className="p-4 bg-accent/10 border-accent/20">
                <h3 className="font-semibold mb-3">AI Classification Result:</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ai-title">Title</Label>
                    <Input
                      id="ai-title"
                      value={editableResult.title}
                      onChange={(e) => setEditableResult({ ...editableResult, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ai-category">Category</Label>
                    <Select
                      value={editableResult.category}
                      onValueChange={(value) => setEditableResult({ ...editableResult, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
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
                  <div className="space-y-2">
                    <Label htmlFor="ai-description">Description</Label>
                    <Textarea
                      id="ai-description"
                      value={editableResult.description}
                      onChange={(e) => setEditableResult({ ...editableResult, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {submitting ? 'Submitting...' : 'Confirm & Submit'}
                  </Button>
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    disabled={submitting}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}