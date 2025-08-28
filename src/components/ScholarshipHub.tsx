import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Calendar, Users, DollarSign, GraduationCap, Target } from "lucide-react";

const ScholarshipHub = () => {
  const scholarships = [
    {
      id: 1,
      title: "Computer Science Excellence Scholarship",
      amount: 5000,
      deadline: "2025-03-15",
      applicants: 45,
      maxApplicants: 100,
      category: "STEM",
      requirements: ["GPA ≥ 3.5", "CS Major", "Open Source Contributions"],
      funded: 85,
      totalFunding: 50000,
      status: "Active"
    },
    {
      id: 2,
      title: "Diversity in Tech Grant",
      amount: 3000,
      deadline: "2025-02-28",
      applicants: 78,
      maxApplicants: 150,
      category: "Diversity",
      requirements: ["Underrepresented Group", "Tech Field", "Essay Required"],
      funded: 60,
      totalFunding: 30000,
      status: "Active"
    },
    {
      id: 3,
      title: "Blockchain Innovation Award",
      amount: 8000,
      deadline: "2025-04-01",
      applicants: 23,
      maxApplicants: 50,
      category: "Innovation",
      requirements: ["Blockchain Project", "Technical Demo", "Business Plan"],
      funded: 95,
      totalFunding: 80000,
      status: "Featured"
    }
  ];

  return (
    <section id="scholarships" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            <span className="text-scholarship">Scholarship</span> Opportunities
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Merit-based scholarships distributed through transparent smart contracts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Award className="w-4 h-4" />
                Available Scholarships
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">47</div>
              <div className="text-xs text-success mt-1">+5 this month</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Funding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">$2.3M</div>
              <div className="text-xs text-scholarship mt-1">Distributed yearly</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Recipients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">1,247</div>
              <div className="text-xs text-muted-foreground mt-1">Students funded</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">94%</div>
              <div className="text-xs text-success mt-1">Graduation rate</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {scholarships.map((scholarship) => (
            <Card key={scholarship.id} className="bg-gradient-card border-border/50 hover:shadow-accent transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <Badge 
                      variant={scholarship.status === "Featured" ? "default" : "secondary"}
                      className={scholarship.status === "Featured" ? "bg-scholarship" : ""}
                    >
                      {scholarship.category}
                    </Badge>
                    {scholarship.status === "Featured" && (
                      <Badge variant="outline" className="ml-2 border-scholarship text-scholarship">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-scholarship">${scholarship.amount.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Award Amount</div>
                  </div>
                </div>
                <CardTitle className="text-foreground leading-tight">{scholarship.title}</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Deadline
                    </span>
                    <span className="text-foreground font-medium">
                      {new Date(scholarship.deadline).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Applications
                      </span>
                      <span className="text-foreground">{scholarship.applicants}/{scholarship.maxApplicants}</span>
                    </div>
                    <Progress value={(scholarship.applicants / scholarship.maxApplicants) * 100} className="h-2" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        Funding Progress
                      </span>
                      <span className="text-foreground">{scholarship.funded}%</span>
                    </div>
                    <Progress value={scholarship.funded} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      ${(scholarship.totalFunding * scholarship.funded / 100).toLocaleString()} of ${scholarship.totalFunding.toLocaleString()} raised
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">Requirements:</div>
                  <div className="space-y-1">
                    {scholarship.requirements.map((req, index) => (
                      <div key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                        <div className="w-1 h-1 bg-scholarship rounded-full"></div>
                        {req}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button variant="scholarship" size="sm" className="flex-1">
                    Apply Now
                  </Button>
                  <Button variant="outline" size="sm">
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button variant="hero" size="lg">
            View All Scholarships
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ScholarshipHub;