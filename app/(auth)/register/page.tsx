'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { simpleRegistrationSchema, type SimpleRegistrationForm } from '@/lib/validations/auth';
import { registerSimple } from './simple-actions';

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SimpleRegistrationForm>({
    resolver: zodResolver(simpleRegistrationSchema),
  });

  const onSubmit = async (data: SimpleRegistrationForm) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await registerSimple(data);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Redirection vers l'onboarding
      router.push('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-dust-grey flex items-center justify-center p-4 py-8 relative">
      {/* Bouton retour */}
      <Link
        href="/"
        className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 text-dark-grey hover:text-pine-teal transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Retour à l'accueil</span>
      </Link>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="flex justify-center">
            <div className="relative w-40 h-14">
              <Image src="/opti-troc-logo.png" alt="Opti-Troc" fill className="object-contain" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-pine-teal font-serif mt-4">Créer votre compte</h1>
          <p className="text-hunter-green mt-2">Rejoignez la marketplace B2B pour opticiens</p>
        </div>

        {/* Offre de lancement */}
        <div className="mb-6 p-4 bg-gold-light border border-gold/30 rounded-xl text-center">
          <p className="text-sm font-semibold text-gold-hover mb-1">Offre de lancement</p>
          <p className="text-xs text-dark-grey">
            <span className="font-bold">1€/mois pendant 3 mois</span> - Limité aux 2000 premiers
            inscrits
          </p>
        </div>

        {/* Formulaire */}
        <Card className="bg-off-white border-light-grey border-t-4 border-t-gold">
          <CardHeader>
            <CardTitle>Informations de base</CardTitle>
            <CardDescription>Créez votre compte en quelques secondes</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email professionnel *</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  placeholder="contact@optique-smith.be"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-error mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Mot de passe *</Label>
                <Input
                  id="password"
                  type="password"
                  {...form.register('password')}
                  placeholder="••••••••"
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-error mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...form.register('confirmPassword')}
                  placeholder="••••••••"
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-error mt-1">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="civility">Civilité *</Label>
                <Select onValueChange={(value) => form.setValue('civility', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mr">Monsieur</SelectItem>
                    <SelectItem value="mrs">Madame</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.civility && (
                  <p className="text-sm text-error mt-1">
                    {form.formState.errors.civility.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input id="firstName" {...form.register('firstName')} placeholder="Jean" />
                  {form.formState.errors.firstName && (
                    <p className="text-sm text-error mt-1">
                      {form.formState.errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input id="lastName" {...form.register('lastName')} placeholder="Dupont" />
                  {form.formState.errors.lastName && (
                    <p className="text-sm text-error mt-1">
                      {form.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold-hover text-charcoal font-semibold border-0"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création du compte...
                  </>
                ) : (
                  'Créer mon compte'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-dark-grey mt-6">
          Vous avez déjà un compte ?{' '}
          <Link href="/login" className="text-fern hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
