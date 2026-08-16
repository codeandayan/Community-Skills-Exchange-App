import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Users, ArrowRightLeft, Star } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Exchange Skills, Not Money
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join a community where people trade knowledge and skills. Offer what
            you know, learn what you want — no money needed.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto flex gap-2">
            <Input
              placeholder="Search for skills... (e.g., web design, cooking)"
              className="bg-white text-black"
            />
            <Link href="/signup">
              <Button size="lg" variant="secondary">
                Get Started
              </Button>
            </Link>
            <Link href="/skills">
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-blue-700"
              >
                Browse Skills
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="mt-4">Create Your Profile</CardTitle>
                <CardDescription>
                  List the skills you can offer and the skills you want to learn
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center">
                  <Search className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="mt-4">Find a Match</CardTitle>
                <CardDescription>
                  Browse skills or get matched with someone who has what you
                  need
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto bg-purple-100 p-4 rounded-full w-16 h-16 flex items-center justify-center">
                  <ArrowRightLeft className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="mt-4">Exchange & Review</CardTitle>
                <CardDescription>
                  Meet, exchange skills, and rate each other to build trust
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Skills Section (Placeholder) */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Popular Skills
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              "Web Development",
              "Cooking",
              "Photography",
              "Language Tutoring",
            ].map((skill) => (
              <Card
                key={skill}
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardHeader>
                  <CardTitle className="text-lg">{skill}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span>4.8 (24 exchanges)</span>
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">SkillShare</h3>
              <p className="text-gray-400 text-sm">
                Exchange skills, not money. Build your community through
                knowledge sharing.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/skills"
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    Browse Skills
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Legal & Policies</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    Terms and Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>
              &copy; {new Date().getFullYear()} Community Skills Exchange. All
              rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
