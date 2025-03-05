import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-black py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 mb-4">
                Empowering Nigerian Farmers
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                AgriGrow Finance
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300">
                Harvest-cycle-aligned microloans for smallholder farmers in
                Nigeria
              </p>
              <p className="text-gray-600 dark:text-gray-400 max-w-lg">
                Our platform connects microfinance institutions with farmers,
                providing loans that align with harvest cycles and using AI to
                assess risk.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Link href="/apply">Apply for a Loan</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/imf-dashboard">IMF Dashboard</Link>
                </Button>
              </div>
            </div>
            <div className="flex-1">
              <Image
                src="/hero-image.jpg"
                alt="Nigerian farmers in a field"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-black">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              How AgriGrow Finance Works
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our platform makes it easy for farmers to access loans and for
              microfinance institutions to manage them.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>USSD Loan Applications</CardTitle>
                <CardDescription>
                  Apply for loans using your basic phone
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md mb-4">
                  <Image
                    src="/hero-image.jpg"
                    alt="USSD Application"
                    width={80}
                    height={80}
                  />
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Dial *123# to apply for loans, check status, and make
                  repayments without needing a smartphone or internet.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/ussd-guide">Learn How to Use USSD</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Harvest-Cycle Repayments</CardTitle>
                <CardDescription>Pay when your crops are ready</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md mb-4">
                  <Image
                    src="/hero-image.jpg"
                    alt="Harvest Calendar"
                    width={80}
                    height={80}
                  />
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Repayment schedules are aligned with your crop&apos;s harvest
                  cycle, ensuring you can pay when you have income.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/repayment-guide">View Repayment Guide</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Risk Assessment</CardTitle>
                <CardDescription>Smart loan approval process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md mb-4">
                  <Image
                    src="/hero-image.jpg"
                    alt="AI Assessment"
                    width={80}
                    height={80}
                  />
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Our AI analyzes weather data, crop prices, and farm details to
                  provide fair and accurate risk assessments.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/risk-assessment">How Risk Assessment Works</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">The AgriGrow Process</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From application to repayment, we&apos;ve designed a simple
              process for farmers and IMF Partners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h3 className="text-2xl font-bold mb-6">For Farmers</h3>
              <ol className="space-y-8">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Apply via USSD or Web</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Dial *123# or visit our website to apply for a loan with
                      your farm details.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Receive Approval</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Get notified via SMS when your loan is approved.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">
                      Get Your Repayment Schedule
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Receive a custom repayment plan based on your crop&apos;s
                      harvest cycle.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Make Repayments</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Pay via USSD, mobile money, or bank transfer when your
                      crops are harvested.
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-6">For IMF Partners</h3>
              <ol className="space-y-8">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Review Applications</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Access the dashboard to review loan applications with
                      AI-generated risk scores.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Approve Loans</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Make informed decisions based on comprehensive risk
                      assessments.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Monitor Repayments</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Track repayments and loan performance in real-time on your
                      dashboard.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Analyze Portfolio</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Get insights into your loan portfolio performance and
                      repayment rates.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600 text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="max-w-2xl mx-auto mb-8 text-green-100">
            Join AgriGrow Finance today and transform agricultural financing in
            Nigeria.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/register">Register as a Farmer</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent text-white border-white hover:bg-white hover:text-green-600"
            >
              <Link href="/imf-signup">Partner as an IMF</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">AgriGrow Finance</h3>
              <p className="text-gray-400">
                Empowering Nigerian farmers with harvest-cycle-aligned
                microloans.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-gray-400 hover:text-white"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/apply"
                    className="text-gray-400 hover:text-white"
                  >
                    Apply for a Loan
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="text-gray-400 hover:text-white"
                  >
                    IMF Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-400 hover:text-white"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/ussd-guide"
                    className="text-gray-400 hover:text-white"
                  >
                    USSD Guide
                  </Link>
                </li>
                <li>
                  <Link
                    href="/repayment-guide"
                    className="text-gray-400 hover:text-white"
                  >
                    Repayment Guide
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-gray-400 hover:text-white">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-gray-400 hover:text-white">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Contact</h3>
              <address className="not-italic text-gray-400">
                <p>123 Agric Road</p>
                <p>Lagos, Nigeria</p>
                <p className="mt-2">Email: info@agrigrowfinance.com</p>
                <p>Phone: +234 123 456 7890</p>
              </address>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>
              © {new Date().getFullYear()} AgriGrow Finance. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
