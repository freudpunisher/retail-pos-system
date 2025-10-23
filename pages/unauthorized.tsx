
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-foreground flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500 mr-2" />
            Accès Non Autorisé
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center">
            Vous n'êtes pas autorisé à accéder à cette page. Votre compte caissier n'est associé à aucun point de vente.
            Veuillez contacter un administrateur pour configurer votre point de vente.
          </p>
          <div className="flex justify-center space-x-4">
            <Button asChild variant="outline">
              <Link href="/login">Retour à la connexion</Link>
            </Button>
            <Button asChild>
              <Link href="/">Page d'accueil</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}