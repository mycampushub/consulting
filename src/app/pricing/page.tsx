"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  CheckCircle, 
  Star, 
  Zap, 
  Users, 
  Globe, 
  Shield, 
  Headphones,
  Database,
  BarChart3,
  MessageSquare,
  Calendar,
  FileText,
  CreditCard,
  Building2,
  Award,
  TrendingUp,
  ArrowRight,
  Check,
  X,
  HelpCircle,
  Code,
  GraduationCap,
  Palette
} from "lucide-react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

interface PricingPlan {
  id: string
  name: string
  price: {
    monthly: string
    yearly: string
  }
  description: string
  popular?: boolean
  features: string[]
  notIncluded?: string[]
  highlighted?: boolean
  cta: string
  icon: any
  color: string
}

interface FeatureCategory {
  id: string
  name: string
  description: string
  features: {
    name: string
    description: string
    plans: string[]
  }[]
}

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly")

  const plans: PricingPlan[] = [
    {
      id: "starter",
      name: "Starter",
      price: {
        monthly: "$99",
        yearly: "$990"
      },
      description: "Perfect for small agencies just getting started",
      icon: Users,
      color: "text-blue-600",
      features: [
        "Up to 100 active students",
        "Basic CRM functionality",
        "Email support (48h response)",
        "Standard analytics dashboard",
        "5GB document storage",
        "Basic form builder (3 forms)",
        "Email templates (10 templates)",
        "Mobile app access",
        "Basic reporting",
        "SSL security"
      ],
      notIncluded: [
        "Marketing automation",
        "Advanced workflows",
        "API access",
        "White-label options",
        "Priority support",
        "Custom integrations"
      ],
      cta: "Start Free Trial"
    },
    {
      id: "professional",
      name: "Professional",
      price: {
        monthly: "$299",
        yearly: "$2,990"
      },
      description: "For growing agencies with advanced needs",
      icon: TrendingUp,
      color: "text-purple-600",
      popular: true,
      highlighted: true,
      features: [
        "Up to 500 active students",
        "Advanced CRM with automation",
        "Priority support (24h response)",
        "Advanced analytics & reporting",
        "50GB document storage",
        "Advanced form builder (unlimited)",
        "Email templates (unlimited)",
        "Marketing automation",
        "Workflow builder (visual)",
        "API access (basic)",
        "White-label branding",
        "Custom domain",
        "Advanced reporting",
        "Team collaboration tools",
        "Integration with 50+ apps",
        "SMS notifications",
        "Appointment scheduling",
        "Document e-signature"
      ],
      notIncluded: [
        "Custom development",
        "Dedicated account manager",
        "Advanced API features",
        "Custom integrations",
        "SLA guarantee"
      ],
      cta: "Start Free Trial"
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: {
        monthly: "Custom",
        yearly: "Custom"
      },
      description: "For large agencies with custom requirements",
      icon: Building2,
      color: "text-orange-600",
      features: [
        "Unlimited active students",
        "Complete feature set",
        "24/7 dedicated support",
        "Custom analytics & BI",
        "Unlimited storage",
        "All form builder features",
        "All communication features",
        "Advanced marketing automation",
        "Advanced workflow builder",
        "Full API access",
        "Complete white-label",
        "Multiple custom domains",
        "Custom reporting",
        "Advanced team management",
        "Unlimited integrations",
        "All communication channels",
        "Advanced scheduling",
        "Advanced document management",
        "Custom development",
        "Dedicated account manager",
        "SLA guarantee (99.9%)",
        "Custom training",
        "Data migration assistance",
        "Custom integrations",
        "Advanced security features",
        "Compliance support",
        "Custom branding"
      ],
      cta: "Contact Sales"
    }
  ]

  const featureCategories: FeatureCategory[] = [
    {
      id: "core",
      name: "Core Features",
      description: "Essential features for managing your education agency",
      features: [
        {
          name: "Student Management",
          description: "Complete student profiles and application tracking",
          plans: ["starter", "professional", "enterprise"]
        },
        {
          name: "CRM System",
          description: "Customer relationship management with communication tools",
          plans: ["starter", "professional", "enterprise"]
        },
        {
          name: "Document Management",
          description: "Secure storage and sharing of student documents",
          plans: ["starter", "professional", "enterprise"]
        },
        {
          name: "Analytics Dashboard",
          description: "Real-time insights and performance metrics",
          plans: ["starter", "professional", "enterprise"]
        }
      ]
    },
    {
      id: "marketing",
      name: "Marketing & Sales",
      description: "Tools to attract and convert more students",
      features: [
        {
          name: "Form Builder",
          description: "Create custom forms for lead capture",
          plans: ["starter", "professional", "enterprise"]
        },
        {
          name: "Email Templates",
          description: "Pre-built and custom email templates",
          plans: ["starter", "professional", "enterprise"]
        },
        {
          name: "Marketing Automation",
          description: "Automated email campaigns and lead nurturing",
          plans: ["professional", "enterprise"]
        },
        {
          name: "Landing Pages",
          description: "Custom landing pages for campaigns",
          plans: ["professional", "enterprise"]
        }
      ]
    },
    {
      id: "automation",
      name: "Automation & Workflows",
      description: "Streamline your agency operations",
      features: [
        {
          name: "Workflow Builder",
          description: "Visual workflow automation tool",
          plans: ["professional", "enterprise"]
        },
        {
          name: "API Access",
          description: "RESTful API for custom integrations",
          plans: ["professional", "enterprise"]
        },
        {
          name: "Custom Integrations",
          description: "Build custom integrations with other systems",
          plans: ["enterprise"]
        },
        {
          name: "Advanced Automation",
          description: "Complex multi-step automation workflows",
          plans: ["enterprise"]
        }
      ]
    },
    {
      id: "support",
      name: "Support & Services",
      description: "Get the help you need to succeed",
      features: [
        {
          name: "Email Support",
          description: "Email support with guaranteed response times",
          plans: ["starter", "professional", "enterprise"]
        },
        {
          name: "Priority Support",
          description: "Faster response times and priority queue",
          plans: ["professional", "enterprise"]
        },
        {
          name: "Dedicated Account Manager",
          description: "Personal account manager for your agency",
          plans: ["enterprise"]
        },
        {
          name: "Custom Training",
          description: "Personalized training for your team",
          plans: ["enterprise"]
        }
      ]
    }
  ]

  const faqs = [
    {
      question: "What's included in the free trial?",
      answer: "Our 14-day free trial includes full access to all features of the Professional plan. No credit card required to start."
    },
    {
      question: "Can I change plans later?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle."
    },
    {
      question: "Do you offer discounts for non-profits?",
      answer: "Yes, we offer special pricing for registered non-profit educational organizations. Contact our sales team for details."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers for enterprise customers."
    },
    {
      question: "Is there a setup fee?",
      answer: "No, there are no setup fees for any of our plans. You can start immediately after signing up."
    },
    {
      question: "Can I cancel my subscription?",
      answer: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
    }
  ]

  const getDisplayPrice = (plan: PricingPlan) => {
    return billingCycle === "yearly" ? plan.price.yearly : plan.price.monthly
  }

  const getPriceSuffix = (plan: PricingPlan) => {
    if (plan.price.monthly === "Custom") return ""
    return billingCycle === "yearly" ? "/year" : "/month"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-20">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-4">
              Transparent Pricing
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
              Choose the perfect plan for your education agency. No hidden fees, no surprises.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <Label htmlFor="billing-cycle" className="text-lg">Monthly</Label>
              <Switch
                id="billing-cycle"
                checked={billingCycle === "yearly"}
                onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
                className="data-[state=checked]:bg-primary-foreground"
              />
              <Label htmlFor="billing-cycle" className="text-lg flex items-center gap-2">
                Yearly
                <Badge variant="secondary" className="bg-green-500 text-green-900">
                  Save 17%
                </Badge>
              </Label>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                    plan.highlighted ? 'border-primary shadow-lg scale-105' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-center py-2 text-sm font-semibold">
                      Most Popular Choice
                    </div>
                  )}
                  
                  <CardHeader className={`text-center ${plan.popular ? 'pt-12' : ''}`}>
                    <div className="flex items-center justify-center mb-4">
                      <plan.icon className={`h-8 w-8 ${plan.color}`} />
                    </div>
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-base">{plan.description}</CardDescription>
                    <div className="mt-6">
                      <span className="text-4xl font-bold">{getDisplayPrice(plan)}</span>
                      <span className="text-muted-foreground">{getPriceSuffix(plan)}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <Button 
                      className={`w-full ${plan.highlighted ? '' : 'variant-outline'}`}
                      size="lg"
                    >
                      {plan.cta}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                    
                    <div>
                      <h4 className="font-semibold mb-3">What's Included:</h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {plan.notIncluded && plan.notIncluded.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Not Included:</h4>
                        <ul className="space-y-2">
                          {plan.notIncluded.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <X className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Compare Features Across Plans
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Detailed feature comparison to help you choose the right plan
              </p>
            </div>

            <Tabs defaultValue="core" className="max-w-6xl mx-auto">
              <TabsList className="grid w-full grid-cols-4">
                {featureCategories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {featureCategories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="mt-8">
                  <div className="bg-background rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                    <p className="text-muted-foreground mb-6">{category.description}</p>
                    
                    <div className="space-y-4">
                      {category.features.map((feature, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{feature.name}</h4>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                          </div>
                          <div className="flex gap-4">
                            {plans.map((plan) => (
                              <div key={plan.id} className="w-20 text-center">
                                {feature.plans.includes(plan.id) ? (
                                  <Check className="h-5 w-5 text-green-500 mx-auto" />
                                ) : (
                                  <X className="h-5 w-5 text-gray-400 mx-auto" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        {/* Add-ons & Extras */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Add-ons & Extra Services
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Enhance your plan with additional services and features
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  name: "Additional Storage",
                  price: "$10/month per 10GB",
                  description: "Extra storage space for documents and media",
                  icon: Database
                },
                {
                  name: "SMS Credits",
                  price: "$0.05 per SMS",
                  description: "Send SMS notifications to students",
                  icon: MessageSquare
                },
                {
                  name: "Custom Development",
                  price: "Starting at $150/hour",
                  description: "Custom features and modifications",
                  icon: Code
                },
                {
                  name: "Data Migration",
                  price: "Starting at $500",
                  description: "Help migrating data from other systems",
                  icon: Database
                },
                {
                  name: "Training Sessions",
                  price: "$200/hour",
                  description: "Personalized training for your team",
                  icon: GraduationCap
                },
                {
                  name: "White-label Setup",
                  price: "$500 one-time",
                  description: "Complete white-label configuration",
                  icon: Palette
                }
              ].map((addon, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <addon.icon className="h-8 w-8 text-primary mb-4" />
                    <h3 className="font-semibold text-lg mb-2">{addon.name}</h3>
                    <p className="text-2xl font-bold text-primary mb-2">{addon.price}</p>
                    <p className="text-sm text-muted-foreground">{addon.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to know about our pricing
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <HelpCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium mb-2">{faq.question}</h3>
                        <p className="text-sm text-muted-foreground">{faq.answer}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of education agencies already using EduSaaS to transform their operations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Start Free Trial
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Schedule a Demo
                <Calendar className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}