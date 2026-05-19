import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-full w-full items-center justify-center bg-background p-8">
      <Card className="w-full max-w-md border border-border bg-card shadow-sm">
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
          </div>

          <p className="text-sm text-muted-foreground">
            The route you followed doesn't exist on this platform. It may have been moved
            or renamed during the navigation refactor.
          </p>

          <Link href="/dashboard">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
