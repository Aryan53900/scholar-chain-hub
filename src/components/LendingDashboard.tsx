import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Clock, AlertTriangle } from "lucide-react";

const LendingDashboard = () => {
  const loanData = {
    totalBorrowed: 25000,
    remainingBalance: 18750,
    monthlyPayment: 312,
    interestRate: 3.2,
    riskScore: 750,
    paymentProgress: 25
  };

  const getRiskBadge = (score: number) => {
    if (score >= 700) return { variant: "default", text: "Low Risk", color: "risk-low" };
    if (score >= 600) return { variant: "secondary", text: "Medium Risk", color: "risk-medium" };
    return { variant: "destructive", text: "High Risk", color: "risk-high" };
  };

  const riskBadge = getRiskBadge(loanData.riskScore);

  return (
    <section id="lending" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Your <span className="text-primary">Lending</span> Dashboard
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track your loans, payments, and financial health in real-time
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Borrowed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">${loanData.totalBorrowed.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-1">Original Amount</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Remaining Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">${loanData.remainingBalance.toLocaleString()}</div>
              <Progress value={loanData.paymentProgress} className="mt-2" />
              <div className="text-xs text-muted-foreground mt-1">{loanData.paymentProgress}% Paid</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Monthly Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">${loanData.monthlyPayment}</div>
              <div className="text-xs text-success mt-1">Next due: Jan 15, 2025</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{loanData.riskScore}</div>
              <Badge variant={riskBadge.variant as any} className="mt-2">
                {riskBadge.text}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Loan Application</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Loan Amount</label>
                  <div className="text-2xl font-bold text-primary">$15,000</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Interest Rate</label>
                  <div className="text-2xl font-bold text-accent">{loanData.interestRate}% APR</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Purpose</label>
                  <div className="p-3 bg-secondary rounded-lg text-secondary-foreground">
                    Computer Science Degree - Final Year
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Collateral</label>
                  <div className="p-3 bg-secondary rounded-lg text-secondary-foreground">
                    Future Earnings (Income Share Agreement)
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button variant="hero" className="flex-1">
                  Apply for New Loan
                </Button>
                <Button variant="outline" className="flex-1">
                  Refinance Existing
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Smart Contract Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Contract Address</span>
                <Badge variant="outline">0x1234...abcd</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Auto-Payment</span>
                <Badge variant="default" className="bg-success">Active</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Liquidation Risk</span>
                <Badge variant={riskBadge.variant as any}>{riskBadge.text}</Badge>
              </div>
              
              <div className="pt-4 space-y-3">
                <Button variant="defi" size="sm" className="w-full">
                  View on Blockchain
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  Download Contract
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default LendingDashboard;