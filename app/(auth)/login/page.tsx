'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { loginSchema, type LoginForm } from '@/lib/validations/auth'
import { login } from './actions'

export default function LoginPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await login(data.email, data.password)

      if (!result.success) {
        throw new Error(result.error)
      }

      // Redirection gérée par le middleware
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-primary-dark">
            Opti-troc
          </Link>
          <h1 className="text-3xl font-bold text-primary-dark mt-4">
            Connexion
          </h1>
          <p className="text-neutral-600 mt-2">
            Accédez à votre compte professionnel
          </p>
        </div>

        {/* Formulaire */}
        <Card>
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
                  <p className="text-sm text-error mt-1">
                    {form.formState.errors.email.message}
                  </p>
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
                <Link 
                  href="/forgot-password" 
                  className="text-primary hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
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
        <p className="text-center text-sm text-neutral-600 mt-6">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-primary hover:underline font-medium">
            S'inscrire gratuitement
          </Link>
        </p>
      </div>
    </div>
  )
}