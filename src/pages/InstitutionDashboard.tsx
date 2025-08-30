import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Loader2, 
  Building, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  DollarSign,
  GraduationCap,
  FileText,
  Download
} from 'lucide-react';
import DocumentUpload from '@/components/DocumentUpload';

export default function InstitutionDashboard() {
  const { user, profile, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingReview: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    if (profile?.role === 'institution') {
      fetchApplications();
      fetchScholarships();
    }
  }, [profile]);

  const fetchApplications = async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('scholarship_applications')
      .select(`
        *,
        scholarships (
          title,
          amount,
          currency
        ),
        profiles:student_id (
          full_name,
          email
        )
      `)
      .in('scholarship_id', 
        await supabase
          .from('scholarships')
          .select('id')
          .in('institution_id', 
            await supabase
              .from('institutions')
              .select('id')
              .eq('profile_id', profile.id)
              .then(res => res.data?.map(i => i.id) || [])
          )
          .then(res => res.data?.map(s => s.id) || [])
      )
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications:', error);
    } else {
      setApplications(data || []);
      
      // Calculate stats
      const totalApplications = data?.length || 0;
      const pendingReview = data?.filter(app => app.status === 'pending').length || 0;
      const approved = data?.filter(app => app.status === 'approved').length || 0;
      const rejected = data?.filter(app => app.status === 'rejected').length || 0;
      
      setStats({ totalApplications, pendingReview, approved, rejected });
    }
  };

  const fetchScholarships = async () => {
    if (!profile) return;

    const { data: institutionData } = await supabase
      .from('institutions')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (institutionData) {
      const { data, error } = await supabase
        .from('scholarships')
        .select('*')
        .eq('institution_id', institutionData.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching scholarships:', error);
      } else {
        setScholarships(data || []);
      }
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string, reviewNotes?: string) => {
    setIsLoading(true);

    const { error } = await supabase
      .from('scholarship_applications')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: profile.id,
        review_notes: reviewNotes,
      })
      .eq('id', applicationId);

    if (error) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Application Updated",
        description: `Application has been ${status}.`,
      });
      fetchApplications();
    }

    setIsLoading(false);
  };

  const downloadDocument = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('student-documents')
        .download(filePath);

      if (error) {
        toast({
          title: "Download failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop() || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const getFileName = (filePath: string) => {
    return filePath.split('/').pop() || filePath;
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

  if (profile?.role !== 'institution') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Only institutions can access this dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'under_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'under_review': return <Eye className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
              <Building className="h-8 w-8" />
              Institution Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your scholarships and review applications
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalApplications}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingReview}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="applications" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="applications">
                <Users className="h-4 w-4 mr-2" />
                Applications
              </TabsTrigger>
              <TabsTrigger value="scholarships">
                <GraduationCap className="h-4 w-4 mr-2" />
                My Scholarships
              </TabsTrigger>
            </TabsList>

            <TabsContent value="applications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Scholarship Applications</CardTitle>
                  <CardDescription>
                    Review and manage applications for your scholarships
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {applications.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No applications received yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {applications.map((application) => (
                        <Card key={application.id} className="border-l-4 border-l-primary/20">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">
                                  {application.profiles?.full_name}
                                </CardTitle>
                                <CardDescription>
                                  Applied for: {application.scholarships?.title}
                                </CardDescription>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(application.status)}>
                                  {getStatusIcon(application.status)}
                                  <span className="ml-1 capitalize">{application.status}</span>
                                </Badge>
                                <Badge variant="outline">
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  {application.scholarships?.currency} {application.scholarships?.amount}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-sm font-medium">Email:</p>
                                <p className="text-sm text-muted-foreground">{application.profiles?.email}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">GPA:</p>
                                <p className="text-sm text-muted-foreground">{application.gpa}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Field of Study:</p>
                                <p className="text-sm text-muted-foreground">{application.field_of_study}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Graduation Year:</p>
                                <p className="text-sm text-muted-foreground">{application.graduation_year}</p>
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <p className="text-sm font-medium mb-2">Personal Statement:</p>
                              <p className="text-sm text-muted-foreground bg-secondary/20 p-3 rounded">
                                {application.personal_statement}
                              </p>
                            </div>

                            {/* Documents Section */}
                            {application.uploaded_documents && application.uploaded_documents.length > 0 && (
                              <div className="mb-4">
                                <p className="text-sm font-medium mb-2">Uploaded Documents:</p>
                                <DocumentUpload
                                  userId={user.id}
                                  existingDocuments={application.uploaded_documents}
                                  isReadOnly={true}
                                />
                              </div>
                            )}

                            {application.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => updateApplicationStatus(application.id, 'approved')}
                                  disabled={isLoading}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateApplicationStatus(application.id, 'under_review')}
                                  disabled={isLoading}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Under Review
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateApplicationStatus(application.id, 'rejected')}
                                  disabled={isLoading}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}

                            <div className="text-xs text-muted-foreground mt-2">
                              Submitted: {new Date(application.submitted_at).toLocaleDateString()}
                              {application.reviewed_at && (
                                <span> • Reviewed: {new Date(application.reviewed_at).toLocaleDateString()}</span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scholarships" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Scholarships</CardTitle>
                  <CardDescription>
                    View and manage your published scholarships
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {scholarships.length === 0 ? (
                    <div className="text-center py-8">
                      <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No scholarships created yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {scholarships.map((scholarship) => (
                        <Card key={scholarship.id} className="relative">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg">{scholarship.title}</CardTitle>
                              <Badge variant={scholarship.is_active ? 'default' : 'secondary'}>
                                {scholarship.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <CardDescription className="line-clamp-2">
                              {scholarship.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Amount:</span>
                                <span className="font-medium">
                                  {scholarship.currency} {scholarship.amount}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Deadline:</span>
                                <span className="font-medium">
                                  {new Date(scholarship.application_deadline).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Max Recipients:</span>
                                <span className="font-medium">{scholarship.max_recipients}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}