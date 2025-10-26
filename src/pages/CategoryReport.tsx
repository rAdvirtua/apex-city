import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Camera, MapPin, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import { categories } from "@/lib/categories";
import { getLatLngFromAddress, getAddressFromLatLng } from "@/lib/geocoding";

export default function CategoryReport() {
  const { category } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categoryNames: Record<string, string> = Object.fromEntries(
    categories.map(c => [c.value, c.label])
  );

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

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
      let imageUrl = '';

      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('issue-images')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('issue-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const coords = await getLatLngFromAddress(formData.location);

      const { error } = await supabase.from('issues').insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        category: category || 'others',
        location_address: formData.location,
        latitude: coords?.lat,
        longitude: coords?.lng,
        image_url: imageUrl,
        status: 'pending',
      });

      if (error) throw error;

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
          <h1 className="text-3xl font-bold">{categoryNames[category || 'others']}</h1>
          <p className="text-primary-foreground/90 mt-2">
            Provide details about the issue
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="Enter exact location"
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

            <div className="space-y-2">
              <Label>Photo Evidence (Optional)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
                className="hidden"
              />
              
              {imagePreview ? (
                <div className="space-y-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium mb-1">Click to take photo</p>
                  <p className="text-sm text-muted-foreground">Optional but recommended</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={submitting} className="flex-1">
                <Upload className="h-4 w-4 mr-2" />
                {submitting ? 'Submitting...' : 'Submit Report'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
