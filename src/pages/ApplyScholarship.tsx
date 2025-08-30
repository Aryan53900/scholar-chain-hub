import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, GraduationCap, DollarSign, Calendar, FileText, Send } from 'lucide-react';
import DocumentUpload from '@/components/DocumentUpload';

export default function ApplyScholarship() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [selectedScholarship, setSelectedScholarship] = useState<any>(null);
  
  // Application form states
  const [personalStatement, setPersonalStatement] = useState('');
  const [gpa, setGpa] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [additionalDocuments, setAdditionalDocuments] = useState('');
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    const { data, error } = await supabase
      .from('scholarships')
      .select(`
        *,
        institutions (
          institution_name,
          profiles (
            full_name
          )
        )
      `)
      .eq('is_active', true)
      .gte('application_deadline', new Date().toISOString().split('T')[0]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch scholarships",
        variant: "destructive",
      });
    } else {
      setScholarships(data || []);
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

  if (profile?.role !== 'student') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Only students can apply for scholarships.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScholarship) return;
    
    setIsLoading(true);

    const { error } = await supabase
      .from('scholarship_applications')
      .insert({
        scholarship_id: selectedScholarship.id,
        student_id: profile.id,
        personal_statement: personalStatement,
        gpa: parseFloat(gpa),
        graduation_year: parseInt(graduationYear),
        field_of_study: fieldOfStudy,
        additional_documents: additionalDocuments.split('\n').filter(doc => doc.trim()),
        uploaded_documents: uploadedDocuments,
      });

    if (error) {
      toast({
        title: "Application Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Application Submitted!",
        description: "Your scholarship application has been submitted successfully.",
      });
      
      // Reset form
      setPersonalStatement('');
      setGpa('');
      setGraduationYear('');
      setFieldOfStudy('');
      setAdditionalDocuments('');
      setUploadedDocuments([]);
      setSelectedScholarship(null);
      
      navigate('/dashboard');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Apply for Scholarships</h1>
            <p className="text-muted-foreground">
              Find and apply for scholarships that match your profile
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Available Scholarships */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Available Scholarships</h2>
              
              {scholarships.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No scholarships available at the moment</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                scholarships.map((scholarship) => (
                  <Card 
                    key={scholarship.id} 
                    className={`cursor-pointer transition-all ${
                      selectedScholarship?.id === scholarship.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedScholarship(scholarship)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{scholarship.title}</CardTitle>
                          <CardDescription>
                            {scholarship.institutions?.institution_name}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">
                          {scholarship.currency} {scholarship.amount}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {scholarship.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Due: {new Date(scholarship.application_deadline).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <GraduationCap className="h-4 w-4" />
                          {scholarship.academic_level}
                        </div>
                      </div>
                      {scholarship.requirements && scholarship.requirements.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Requirements:</p>
                          <div className="flex flex-wrap gap-1">
                            {scholarship.requirements.slice(0, 3).map((req: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {req}
                              </Badge>
                            ))}
                            {scholarship.requirements.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{scholarship.requirements.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Application Form */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Application Form</h2>
              
              {!selectedScholarship ? (
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        Select a scholarship to start your application
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Apply for: {selectedScholarship.title}</CardTitle>
                    <CardDescription>
                      Fill out the application form below
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitApplication} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="gpa">GPA</Label>
                          <Input
                            id="gpa"
                            type="number"
                            step="0.01"
                            min="0"
                            max="4"
                            value={gpa}
                            onChange={(e) => setGpa(e.target.value)}
                            placeholder="e.g., 3.8"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="graduationYear">Graduation Year</Label>
                          <Input
                            id="graduationYear"
                            type="number"
                            value={graduationYear}
                            onChange={(e) => setGraduationYear(e.target.value)}
                            placeholder="e.g., 2025"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="fieldOfStudy">Field of Study</Label>
                        <Input
                          id="fieldOfStudy"
                          value={fieldOfStudy}
                          onChange={(e) => setFieldOfStudy(e.target.value)}
                          placeholder="e.g., Computer Science"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="personalStatement">Personal Statement</Label>
                        <Textarea
                          id="personalStatement"
                          value={personalStatement}
                          onChange={(e) => setPersonalStatement(e.target.value)}
                          placeholder="Write about your academic achievements, career goals, and why you deserve this scholarship..."
                          rows={6}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="additionalDocuments">Additional Information</Label>
                        <Textarea
                          id="additionalDocuments"
                          value={additionalDocuments}
                          onChange={(e) => setAdditionalDocuments(e.target.value)}
                          placeholder="List any additional achievements or information (one per line)..."
                          rows={3}
                        />
                      </div>

                      {/* Document Upload Section */}
                      <DocumentUpload
                        applicationId={selectedScholarship.id}
                        userId={user.id}
                        onUploadComplete={(fileUrls) => {
                          setUploadedDocuments(prev => [...prev, ...fileUrls]);
                        }}
                        existingDocuments={uploadedDocuments}
                      />

                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Send className="mr-2 h-4 w-4" />
                        Submit Application
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}