'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { loginSchema, type LoginForm } from '@/lib/validations/auth';
import { login } from './actions';

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await login(data.email, data.password);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Rediriger selon le rôle et le statut
      if (result.role === 'admin') {
        router.push('/admin');
      } else if (result.status === 'incomplete') {
        router.push('/onboarding');
      } else if (result.status === 'awaiting_payment') {
        router.push('/inscription/plans');
      } else if (result.status === 'pending') {
        router.push('/dashboard/pending');
      } else if (result.status === 'validated') {
        router.push('/dashboard');
      } else if (result.status === 'rejected') {
        router.push('/dashboard/rejected');
      } else if (result.status === 'suspended') {
        router.push('/dashboard/suspended');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-dust-grey flex items-center justify-center p-4 py-8 md:py-12 relative">
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
        <div className="text-center mb-6 md:mb-8">
          <Link href="/" className="flex justify-center">
            <div className="relative w-40 h-14">
              <Image src="/opti-troc-logo.png" alt="Opti-Troc" fill className="object-contain" />
            </div>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-pine-teal font-serif mt-3 md:mt-4">
            Connexion
          </h1>
          <p className="text-hunter-green mt-1 md:mt-2 text-sm md:text-base">
            Accédez à votre compte professionnel
          </p>
        </div>

        {/* Formulaire */}
        <Card className="bg-off-white border-light-grey border-t-4 border-t-gold">
          <CardHeader>
            <CardTitle>Se connecter</CardTitle>
            <CardDescription>Entrez vos identifiants</CardDescription>
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  placeholder="contact@optique-smith.be"
                  autoComplete="email"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-error mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  {...form.register('password')}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-error mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <Link href="/forgot-password" className="text-fern hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold-hover text-charcoal font-semibold border-0"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-dark-grey mt-6">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-fern hover:underline font-medium">
            S'inscrire gratuitement
          </Link>
        </p>
      </div>
    </div>
  );
}
