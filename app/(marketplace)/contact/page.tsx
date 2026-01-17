"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  HelpCircle,
  User,
  CheckCircle,
} from "lucide-react";
import { submitContactMessage } from "@/app/actions/contact";
import { useState } from "react";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    const form = e.currentTarget; // Stocker la référence avant l'async
    const formData = new FormData(form);
    const result = await submitContactMessage(formData);

    setIsSubmitting(false);

    if (result.success) {
      setSubmitStatus({
        success: true,
        message:
          "Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.",
      });
      form.reset(); // Utiliser la référence stockée
    } else {
      setSubmitStatus({
        success: false,
        message: result.error || "Erreur lors de l'envoi",
      });
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-blue-50/30">
      <div className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary text-white">Contact</Badge>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            Contactez-nous
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Une question ? Notre équipe est là pour vous aider
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Formulaire */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-primary/10">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6">
                  Envoyez-nous un message
                </h2>

                {submitStatus && (
                  <div
                    className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                      submitStatus.success
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    {submitStatus.success && (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    )}
                    <p
                      className={`text-sm ${
                        submitStatus.success ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      {submitStatus.message}
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="name"
                        className="text-sm font-medium mb-2 block"
                      >
                        Nom complet *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="name"
                          name="name"
                          placeholder="Jean Dupont"
                          className="pl-10 h-11"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div>
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium mb-2 block"
                      >
                        Email *
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="jean@optique.fr"
                          className="pl-10 h-11"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="company"
                      className="text-sm font-medium mb-2 block"
                    >
                      Entreprise
                    </Label>
                    <Input
                      id="company"
                      name="company"
                      placeholder="Optique Paris"
                      className="h-11"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="subject"
                      className="text-sm font-medium mb-2 block"
                    >
                      Sujet *
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="Objet de votre message"
                      className="h-11"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="message"
                      className="text-sm font-medium mb-2 block"
                    >
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Décrivez votre demande..."
                      className="min-h-32 resize-none"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 font-semibold shadow-md bg-gradient-to-r from-primary to-primary-dark"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Infos contact - reste identique */}
          <div className="space-y-4">
            <Card className="shadow-md border-primary/10">
              <CardContent className="p-5">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" />
                  Coordonnées
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">
                        Email
                      </div>
                      <a
                        href="mailto:tanuki.corporation@gmail.com"
                        className="text-primary hover:underline"
                      >
                        tanuki.corporation@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">
                        Téléphone
                      </div>
                      <a
                        href="tel:+32465186866"
                        className="text-primary hover:underline"
                      >
                        0465 18 68 66
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">
                        Adresse
                      </div>
                      <p className="text-sm">
                        Avenue de l'indépendance belge 131 (APT 4.02)
                        <br />
                        1081 Bruxelles, Belgique
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-primary/10">
              <CardContent className="p-5">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Horaires
                </h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Lundi - Vendredi
                    </span>
                    <span className="font-medium">9h - 18h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Samedi</span>
                    <span className="font-medium">10h - 16h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dimanche</span>
                    <span className="font-medium">Fermé</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-primary/10 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
              <CardContent className="p-5">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                  Questions fréquentes
                </h3>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold mb-1">
                      Comment vendre sur Opti-Troc ?
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Créez un compte professionnel, publiez vos annonces et
                      gérez vos ventes depuis votre tableau de bord.
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-semibold mb-1">
                      Qui peut s'inscrire ?
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Uniquement les professionnels de l'optique avec un numéro
                      SIRET valide.
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-semibold mb-1">
                      Les paiements sont-ils sécurisés ?
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Oui, toutes les transactions sont protégées et les
                      vendeurs sont vérifiés.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
