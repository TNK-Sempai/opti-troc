'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  HelpCircle,
  User,
  CheckCircle,
} from 'lucide-react';
import { submitContactMessage } from '@/app/actions/contact';
import { useState } from 'react';
import { event as gtagEvent } from '@/lib/gtag';

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

    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await submitContactMessage(formData);

    setIsSubmitting(false);

    if (result.success) {
      setSubmitStatus({
        success: true,
        message: 'Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.',
      });

      form.reset();

      // GA4 event
      gtagEvent({
        action: 'contact_click',
        category: 'contact_form',
        label: formData.get('subject')?.toString() || 'Sans sujet',
      });
    } else {
      setSubmitStatus({
        success: false,
        message: result.error || "Erreur lors de l'envoi",
      });
    }
  }

  return (
    <div className="min-h-screen bg-dust-grey">
      <div className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-pine-teal text-white">Contact</Badge>
          <h1 className="text-4xl font-serif font-bold mb-4 text-pine-teal">Contactez-nous</h1>
          <div className="w-12 h-1 bg-gold mx-auto mb-4" />
          <p className="text-xl text-dark-grey max-w-2xl mx-auto">
            Une question ? Notre équipe est là pour vous aider
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Formulaire */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg bg-off-white border-light-grey">
              <CardContent className="p-6">
                <h2 className="text-xl font-serif font-bold mb-6 text-pine-teal">
                  Envoyez-nous un message
                </h2>

                {submitStatus && (
                  <div
                    className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                      submitStatus.success
                        ? 'bg-fern/10 border border-fern/30'
                        : 'bg-error/10 border border-error/30'
                    }`}
                  >
                    {submitStatus.success && <CheckCircle className="w-5 h-5 text-fern mt-0.5" />}
                    <p
                      className={`text-sm ${
                        submitStatus.success ? 'text-hunter-green' : 'text-error'
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
                        className="text-sm font-medium mb-2 block text-charcoal"
                      >
                        Nom complet *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-medium-grey" />
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
                        className="text-sm font-medium mb-2 block text-charcoal"
                      >
                        Email *
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-medium-grey" />
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
                      className="text-sm font-medium mb-2 block text-charcoal"
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
                      className="text-sm font-medium mb-2 block text-charcoal"
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
                      className="text-sm font-medium mb-2 block text-charcoal"
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
                    className="w-full h-11 font-semibold shadow-md bg-gold hover:bg-gold-hover text-charcoal"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Infos contact */}
          <div className="space-y-4">
            <Card className="shadow-md bg-off-white border-light-grey">
              <CardContent className="p-5">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-pine-teal">
                  <Phone className="w-5 h-5 text-pine-teal" />
                  Coordonnées
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-medium-grey mt-0.5" />
                    <div>
                      <div className="text-xs text-medium-grey mb-0.5">Email</div>
                      <a
                        href="mailto:tanuki.corporation@gmail.com"
                        className="text-pine-teal hover:underline"
                      >
                        tanuki.corporation@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-medium-grey mt-0.5" />
                    <div>
                      <div className="text-xs text-medium-grey mb-0.5">Téléphone</div>
                      <a href="tel:+32465186866" className="text-pine-teal hover:underline">
                        +32 465 18 68 66
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-medium-grey mt-0.5" />
                    <div>
                      <div className="text-xs text-medium-grey mb-0.5">Adresse</div>
                      <p className="text-sm text-dark-grey">
                        1081 Koekelberg, Belgique
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md bg-off-white border-light-grey">
              <CardContent className="p-5">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-pine-teal">
                  <Clock className="w-5 h-5 text-pine-teal" />
                  Horaires
                </h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-medium-grey">Lundi - Vendredi</span>
                    <span className="font-medium text-charcoal">9h - 18h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-medium-grey">Samedi</span>
                    <span className="font-medium text-charcoal">10h - 16h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-medium-grey">Dimanche</span>
                    <span className="font-medium text-charcoal">Fermé</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md bg-off-white border-pine-teal/10">
              <CardContent className="p-5">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-pine-teal">
                  <HelpCircle className="w-5 h-5 text-gold" />
                  Questions fréquentes
                </h3>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold mb-1 text-charcoal">
                      Comment vendre sur Opti-Troc ?
                    </h4>
                    <p className="text-xs text-medium-grey">
                      Créez un compte professionnel, publiez vos annonces et gérez vos ventes depuis
                      votre tableau de bord.
                    </p>
                  </div>

                  <Separator className="bg-light-grey" />

                  <div>
                    <h4 className="text-sm font-semibold mb-1 text-charcoal">
                      Qui peut s'inscrire ?
                    </h4>
                    <p className="text-xs text-medium-grey">
                      Uniquement les professionnels de l'optique avec un numéro SIRET valide.
                    </p>
                  </div>

                  <Separator className="bg-light-grey" />

                  <div>
                    <h4 className="text-sm font-semibold mb-1 text-charcoal">
                      Les paiements sont-ils sécurisés ?
                    </h4>
                    <p className="text-xs text-medium-grey">
                      Oui, toutes les transactions sont protégées et les vendeurs sont vérifiés.
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
