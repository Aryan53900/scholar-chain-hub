import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Wallet, User, Building, Save } from 'lucide-react';

export default function Profile() {
  const { user, profile, loading, connectWallet } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  
  // Profile form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  
  // Institution form states
  const [institutionName, setInstitutionName] = useState('');
  const [institutionType, setInstitutionType] = useState('');
  const [accreditation, setAccreditation] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [establishedYear, setEstablishedYear] = useState('');
  const [location, setLocation] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [description, setDescription] = useState('');
  
  const [institutionData, setInstitutionData] = useState<any>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
      setBio(profile.bio || '');
      setDateOfBirth(profile.date_of_birth || '');
      setWalletAddress(profile.wallet_address || '');
      
      if (profile.role === 'institution') {
        fetchInstitutionData();
      }
    }
  }, [profile]);

  const fetchInstitutionData = async () => {
    if (!profile) return;
    
    const { data } = await supabase
      .from('institutions')
      .select('*')
      .eq('profile_id', profile.id)
      .single();
    
    if (data) {
      setInstitutionData(data);
      setInstitutionName(data.institution_name || '');
      setInstitutionType(data.institution_type || '');
      setAccreditation(data.accreditation || '');
      setWebsiteUrl(data.website_url || '');
      setEstablishedYear(data.established_year?.toString() || '');
      setLocation(data.location || '');
      setContactEmail(data.contact_email || '');
      setContactPhone(data.contact_phone || '');
      setDescription(data.description || '');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleWalletConnect = async () => {
    if (!walletAddress.trim()) {
      toast({
        title: "Invalid Wallet Address",
        description: "Please enter a valid wallet address",
        variant: "destructive",
      });
      return;
    }
    
    await connectWallet(walletAddress);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone,
        address,
        bio,
        date_of_birth: dateOfBirth || null,
      })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    }

    setIsLoading(false);
  };

  const handleInstitutionUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const institutionPayload = {
      profile_id: profile.id,
      institution_name: institutionName,
      institution_type: institutionType,
      accreditation,
      website_url: websiteUrl,
      established_year: establishedYear ? parseInt(establishedYear) : null,
      location,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      description,
    };

    let error;
    if (institutionData) {
      const { error: updateError } = await supabase
        .from('institutions')
        .update(institutionPayload)
        .eq('id', institutionData.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('institutions')
        .insert(institutionPayload);
      error = insertError;
    }

    if (error) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Institution Updated",
        description: "Your institution details have been successfully updated.",
      });
      fetchInstitutionData();
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
            <p className="text-muted-foreground">
              Manage your account information and preferences
            </p>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="wallet">
                <Wallet className="h-4 w-4 mr-2" />
                Wallet
              </TabsTrigger>
              {profile?.role === 'institution' && (
                <TabsTrigger value="institution">
                  <Building className="h-4 w-4 mr-2" />
                  Institution
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={profile?.email || ''}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter your address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself"
                        rows={4}
                      />
                    </div>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wallet">
              <Card>
                <CardHeader>
                  <CardTitle>Wallet Connection</CardTitle>
                  <CardDescription>
                    Connect your blockchain wallet for smart contract interactions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="walletAddress">Wallet Address</Label>
                    <div className="flex gap-2">
                      <Input
                        id="walletAddress"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        placeholder="0x..."
                        className="font-mono"
                      />
                      <Button onClick={handleWalletConnect} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Wallet className="mr-2 h-4 w-4" />
                        Connect
                      </Button>
                    </div>
                  </div>
                  {profile?.wallet_address && (
                    <div className="p-4 bg-secondary/20 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Connected Wallet:</p>
                      <p className="font-mono text-sm break-all">{profile.wallet_address}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {profile?.role === 'institution' && (
              <TabsContent value="institution">
                <Card>
                  <CardHeader>
                    <CardTitle>Institution Details</CardTitle>
                    <CardDescription>
                      Manage your institution's information and credentials
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleInstitutionUpdate} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="institutionName">Institution Name</Label>
                          <Input
                            id="institutionName"
                            value={institutionName}
                            onChange={(e) => setInstitutionName(e.target.value)}
                            placeholder="Enter institution name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="institutionType">Institution Type</Label>
                          <Input
                            id="institutionType"
                            value={institutionType}
                            onChange={(e) => setInstitutionType(e.target.value)}
                            placeholder="e.g., University, College, School"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="accreditation">Accreditation</Label>
                          <Input
                            id="accreditation"
                            value={accreditation}
                            onChange={(e) => setAccreditation(e.target.value)}
                            placeholder="Enter accreditation info"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="websiteUrl">Website URL</Label>
                          <Input
                            id="websiteUrl"
                            value={websiteUrl}
                            onChange={(e) => setWebsiteUrl(e.target.value)}
                            placeholder="https://www.example.edu"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="establishedYear">Established Year</Label>
                          <Input
                            id="establishedYear"
                            type="number"
                            value={establishedYear}
                            onChange={(e) => setEstablishedYear(e.target.value)}
                            placeholder="e.g., 1990"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="City, Country"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contactEmail">Contact Email</Label>
                          <Input
                            id="contactEmail"
                            type="email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="contact@example.edu"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contactPhone">Contact Phone</Label>
                          <Input
                            id="contactPhone"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            placeholder="Phone number"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Describe your institution"
                          rows={4}
                        />
                      </div>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Save Institution Details
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}