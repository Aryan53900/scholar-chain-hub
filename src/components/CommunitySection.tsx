import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, ThumbsUp, Users, TrendingUp, BookOpen, HelpCircle } from "lucide-react";

const CommunitySection = () => {
  const forumPosts = [
    {
      id: 1,
      title: "How to improve your DeFi credit score?",
      author: "Alex Chen",
      avatar: "/api/placeholder/32/32",
      replies: 23,
      likes: 156,
      category: "Credit",
      timestamp: "2 hours ago",
      isHot: true
    },
    {
      id: 2,
      title: "Scholarship application tips for international students",
      author: "Maria Rodriguez",
      avatar: "/api/placeholder/32/32",
      replies: 45,
      likes: 289,
      category: "Scholarships",
      timestamp: "5 hours ago",
      isHot: false
    },
    {
      id: 3,
      title: "Smart contract security in educational lending",
      author: "David Kim",
      avatar: "/api/placeholder/32/32",
      replies: 12,
      likes: 87,
      category: "DeFi",
      timestamp: "1 day ago",
      isHot: true
    }
  ];

  const mentors = [
    {
      name: "Dr. Sarah Johnson",
      role: "DeFi Expert",
      expertise: ["Smart Contracts", "Risk Assessment"],
      rating: 4.9,
      sessions: 234
    },
    {
      name: "Prof. Michael Wu",
      role: "Education Finance",
      expertise: ["Scholarships", "Grant Writing"],
      rating: 4.8,
      sessions: 187
    },
    {
      name: "Lisa Thompson",
      role: "Career Coach",
      expertise: ["Career Planning", "Networking"],
      rating: 4.9,
      sessions: 156
    }
  ];

  return (
    <section id="community" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Student <span className="text-defi-blue">Community</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with peers, get mentorship, and share knowledge in our vibrant community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-defi-blue mx-auto mb-3" />
              <div className="text-2xl font-bold text-foreground">12,547</div>
              <div className="text-sm text-muted-foreground">Active Members</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-6 text-center">
              <MessageSquare className="w-8 h-8 text-scholarship mx-auto mb-3" />
              <div className="text-2xl font-bold text-foreground">3,241</div>
              <div className="text-sm text-muted-foreground">Discussions</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-6 text-center">
              <BookOpen className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-2xl font-bold text-foreground">856</div>
              <div className="text-sm text-muted-foreground">Study Groups</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-accent mx-auto mb-3" />
              <div className="text-2xl font-bold text-foreground">94%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Recent Discussions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {forumPosts.map((post) => (
                  <div key={post.id} className="p-4 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-colors">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={post.avatar} />
                        <AvatarFallback>{post.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {post.category}
                          </Badge>
                          {post.isHot && (
                            <Badge variant="destructive" className="text-xs">
                              Hot
                            </Badge>
                          )}
                        </div>
                        
                        <h4 className="font-medium text-foreground mb-1 line-clamp-2">
                          {post.title}
                        </h4>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>by {post.author}</span>
                          <span>{post.timestamp}</span>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {post.replies}
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            {post.likes}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="flex gap-3 pt-4">
                  <Button variant="defi" size="sm" className="flex-1">
                    Start New Discussion
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    View All Posts
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Expert Mentors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mentors.map((mentor, index) => (
                  <div key={index} className="p-3 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>{mentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground text-sm">{mentor.name}</div>
                        <div className="text-xs text-muted-foreground">{mentor.role}</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      {mentor.expertise.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>⭐ {mentor.rating} rating</span>
                      <span>{mentor.sessions} sessions</span>
                    </div>
                    
                    <Button variant="outline" size="sm" className="w-full">
                      Book Session
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Quick Help
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Knowledge Base
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Live Chat Support
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Study Groups
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;