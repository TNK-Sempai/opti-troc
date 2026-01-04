import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Building2, MapPin, Phone, Mail, FileText, Calendar } from 'lucide-react'
import Image from 'next/image'
import { validateUser, rejectUser, requestMoreInfo } from './actions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function UserDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: adminProfile } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (adminProfile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const { data: profile, error } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !profile) {
    notFound()
  }

  const { data: documents } = await supabaseAdmin
    .from('user_documents')
    .select('*')
    .eq('user_id', id)

  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(id)

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary-dark">
                {profile.first_name} {profile.last_name}
              </h1>
              <p className="text-sm text-neutral-600">{profile.company_name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations de l'entreprise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-600">Nom de la société</p>
                    <p className="font-medium">{profile.company_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Pays</p>
                    <p className="font-medium">{profile.country}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Numéro d'entreprise</p>
                    <p className="font-medium">{profile.company_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Numéro de TVA</p>
                    <p className="font-medium">{profile.vat_number}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Coordonnées</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-neutral-500" />
                    <span>{authUser.user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-neutral-500" />
                    <span>{profile.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Boutique</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-neutral-600">Adresse</p>
                  <p className="font-medium">{profile.shop_address}</p>
                  <p className="font-medium">{profile.postal_code} {profile.city}</p>
                </div>

                {profile.opening_hours && profile.opening_hours.length > 0 && (
                  <div>
                    <p className="text-sm text-neutral-600 mb-2">Horaires d'ouverture</p>
                    <div className="space-y-1">
                      {profile.opening_hours.map((hour: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="font-medium">{hour.day}</span>
                          <span className="text-neutral-600">{hour.hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documents officiels</CardTitle>
              </CardHeader>
              <CardContent>
                {documents && documents.length > 0 ? (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-primary" />
                            <div>
                              <p className="font-medium text-sm">
                                Document officiel ({doc.document_type})
                              </p>
                              <p className="text-xs text-neutral-500">
                                {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          <Button asChild size="sm" variant="outline">
                            <a href={doc.document_url} target="_blank" rel="noopener noreferrer">
                              Voir
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-500 text-sm">Aucun document</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Photos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.profile_photo_url && (
                  <div>
                    <p className="text-sm text-neutral-600 mb-2">Logo</p>
                    <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                      <Image
                        src={profile.profile_photo_url}
                        alt="Logo"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}

                {profile.shop_photos && profile.shop_photos.length > 0 && (
                  <div>
                    <p className="text-sm text-neutral-600 mb-2">Photos de la boutique</p>
                    <div className="grid grid-cols-3 gap-3">
                      {profile.shop_photos.map((photo: string, index: number) => (
                        <div key={index} className="relative aspect-square border rounded-lg overflow-hidden">
                          <Image
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
          <Card>
              <CardHeader>
                <CardTitle>Statut du compte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Badge 
                    variant="outline" 
                    className={
                      profile.status === 'pending' 
                        ? 'bg-warning/10 text-warning border-warning/30' 
                        : profile.status === 'validated'
                        ? 'bg-success/10 text-success border-success/30'
                        : 'bg-error/10 text-error border-error/30'
                    }
                  >
                    {profile.status === 'pending' && 'En attente'}
                    {profile.status === 'validated' && 'Validé'}
                    {profile.status === 'rejected' && 'Rejeté'}
                    {profile.status === 'suspended' && 'Suspendu'}
                  </Badge>
                </div>

                {profile.is_early_adopter && (
                  <Badge className="bg-warning/10 text-warning border-warning/30">
                    🎉 Early Adopter
                  </Badge>
                )}

                <div className="pt-4 border-t">
                  <p className="text-xs text-neutral-600 mb-1">Inscrit le</p>
                  <p className="text-sm font-medium">
                    {new Date(profile.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                {profile.status === 'pending' && (
                  <div className="pt-4 border-t space-y-2">
                    <form action={validateUser}>
                      <input type="hidden" name="userId" value={profile.id} />
                      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                        ✓ Valider le compte
                      </Button>
                    </form>
                    
                    <form action={requestMoreInfo}>
                      <input type="hidden" name="userId" value={profile.id} />
                      <Button type="submit" variant="outline" className="w-full">
                        📧 Demander des précisions
                      </Button>
                    </form>
                    
                    <form action={rejectUser}>
                      <input type="hidden" name="userId" value={profile.id} />
                      <Button type="submit" variant="destructive" className="w-full">
                        ✗ Rejeter le compte
                      </Button>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Type de compte</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">
                  {profile.account_type === 'shop' ? '🏪 Shop' : '🏭 Fournisseur'}
                </Badge>
                <p className="text-sm text-neutral-600 mt-2">
                  {profile.account_type === 'shop' 
                    ? 'Opticien indépendant'
                    : 'Grossiste / Fournisseur'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}