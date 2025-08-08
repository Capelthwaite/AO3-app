import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            AO3 Companion
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
            Organize, track, and discover your Archive of Our Own reading
          </p>
          <Link href="/sign-in">
            <Button size="lg" className="text-lg px-8 py-3">
              Get Started
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">📚 Story Library</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Save and organize your favorite fanfictions in custom collections
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">📖 Reading Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Track which chapters you&apos;ve read and get notified of updates
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">✨ Smart Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Discover new stories based on your reading preferences
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
