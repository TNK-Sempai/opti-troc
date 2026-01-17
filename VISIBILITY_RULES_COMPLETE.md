# Règles de visibilité - Implémentation complète

## ✅ Toutes les pages mises à jour

### 1. Page d'accueil (`/`)
**Fichier**: [`app/(marketplace)/page.tsx`](app/(marketplace)/page.tsx)

**Implémentation**:
- ✅ Vérification du statut utilisateur (validated/admin)
- ✅ Composant `ListingCard` unifié avec prop `isValidated`
- ✅ Prix masqués pour non-validés
- ✅ Message "Compte validé requis" avec icône cadenas

### 2. Page shop (`/shop`)
**Fichier**: [`app/(marketplace)/shop/page.tsx`](app/(marketplace)/shop/page.tsx)

**Implémentation**:
- ✅ Vérification du statut utilisateur
- ✅ Composant `ListingCard` avec variantes grid/list
- ✅ Passage du prop `isValidated` à toutes les cards
- ✅ Prix masqués pour non-validés

### 3. Page détail annonce (`/listing/[id]`)
**Fichier**: [`app/(marketplace)/listing/[id]/page.tsx`](app/(marketplace)/listing/[id]/page.tsx)

**Implémentation complète**:

#### Prix
- ✅ **Mobile**: Prix affiché si validé, sinon message avec cadenas
- ✅ **Desktop**: Header prix coloré si validé, sinon header gris avec cadenas et message

#### Bouton contact
- ✅ **Utilisateur validé**: Bouton ContactSellerButton actif
- ✅ **Utilisateur non connecté**: Bouton "Connectez-vous" + lien vers inscription
- ✅ **Utilisateur pending**: Bouton désactivé + message d'attente de validation
- ✅ **Utilisateur non validé**: Bouton désactivé + message explicatif
- ✅ **Propre annonce**: Bouton "Votre annonce" désactivé

**Code ajouté**:
```tsx
// Ligne 82: Vérification stricte pour le contact
const canContact = user && user.id !== listing.user_id && isValidated

// Lignes 214-222: Prix mobile avec visibilité
{isValidated ? (
  <span className="text-2xl font-bold text-primary">{parseFloat(details.price).toFixed(0)}€</span>
) : (
  <div className="flex items-center gap-2 text-muted-foreground">
    <Lock className="w-4 h-4" />
    <span className="text-sm font-medium">Compte validé requis pour voir le prix</span>
  </div>
)}

// Lignes 352-371: Prix desktop avec visibilité
{isValidated ? (
  <div className="bg-gradient-to-br from-primary to-primary-dark p-4 text-white">
    <span className="text-3xl font-bold">{price}€</span>
  </div>
) : (
  <div className="bg-gradient-to-br from-neutral-400 to-neutral-500 p-4 text-white">
    <div className="flex items-center gap-2">
      <Lock className="w-6 h-6" />
      <div>
        <p className="text-sm font-medium">Prix masqué</p>
        <p className="text-xs opacity-90">Compte validé requis</p>
      </div>
    </div>
  </div>
)}

// Lignes 385-414: Boutons contact avec états
{canContact ? (
  <ContactSellerButton ... />
) : isOwnListing ? (
  <Button disabled>Votre annonce</Button>
) : user && !isValidated ? (
  <div className="space-y-2">
    <Button disabled>
      <Lock className="w-4 h-4 mr-1.5" />
      Contacter le vendeur
    </Button>
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
      <p className="text-xs text-amber-800 font-medium mb-1">
        {userStatus === 'pending' ? '⏳ Compte en attente de validation' : '🔒 Compte non validé'}
      </p>
      <p className="text-xs text-amber-700">
        {userStatus === 'pending'
          ? 'Votre compte est en cours de validation...'
          : 'Votre compte doit être validé...'}
      </p>
    </div>
  </div>
) : (
  <div className="space-y-2">
    <Button asChild>
      <Link href="/login">Connectez-vous pour contacter</Link>
    </Button>
    <p className="text-xs text-center text-muted-foreground">
      Ou <Link href="/register">créez un compte</Link> pour accéder aux prix
    </p>
  </div>
)}
```

### 4. Composant ListingCard unifié
**Fichier**: [`components/shop/ListingCard.tsx`](components/shop/ListingCard.tsx)

**Fonctionnalités**:
- Support variantes `grid` et `list`
- Prop `isValidated` pour contrôler la visibilité des prix
- Icône Lock et message pour prix masqués
- Debug logging temporaire (à supprimer après tests)

## 📋 Matrice de visibilité complète

| État utilisateur | Pages listing (/, /shop) | Page détail (/listing/[id]) | Bouton contact |
|-----------------|-------------------------|----------------------------|----------------|
| **Non connecté** | ❌ Prix masqués 🔒 | ❌ Prix masqué 🔒 | "Connectez-vous" |
| **Pending** | ❌ Prix masqués 🔒 | ❌ Prix masqué 🔒 | ⏳ "En attente validation" |
| **Rejected** | ❌ Prix masqués 🔒 | ❌ Prix masqué 🔒 | 🔒 "Compte non validé" |
| **Suspended** | ❌ Prix masqués 🔒 | ❌ Prix masqué 🔒 | 🔒 "Compte suspendu" |
| **Validated** | ✅ Prix visibles | ✅ Prix visible | ✅ Bouton actif |
| **Admin** | ✅ Prix visibles | ✅ Prix visible | ✅ Bouton actif |
| **Propre annonce** | ✅ Prix visible | ✅ Prix visible | "Votre annonce" (disabled) |

## 🐛 Debug en cours

### Problème: Cards n'affichent que les photos

**Symptômes**:
- Les cards affichent les photos
- Mais pas les informations (marque, modèle, référence, prix)

**Debug ajouté**:

#### Côté serveur (page.tsx)
```tsx
// Lignes 48-56
if (!details) {
  console.log('⚠️ Listing sans details:', {
    id: listing.id,
    type: listing.listing_type,
    unit_listings: listing.unit_listings,
    lot_listings: listing.lot_listings
  })
}
```

#### Côté client (ListingCard.tsx)
```tsx
// Lignes 26-33
if (!details) {
  console.log('🔴 ListingCard sans details:', {
    id: listing.id,
    type: listing.listing_type,
    keys: Object.keys(listing)
  })
}
```

**Vérifications à faire**:
1. ✅ La requête SQL inclut bien `unit_listings(*), lot_listings(*)`
2. ⚠️ Vérifier dans la console du navigateur les logs de debug
3. ⚠️ Vérifier dans les logs serveur (terminal) les logs de debug
4. ⚠️ Vérifier que la table `unit_listings` a bien des données

**Requête SQL actuelle**:
```sql
SELECT
  *,
  unit_listings(*),
  lot_listings(*),
  listing_photos(*)
FROM listings
WHERE status = 'active'
ORDER BY created_at DESC
```

**Hypothèses**:
1. Les relations Supabase ne sont pas bien configurées (RLS?)
2. Les données `unit_listings` existent mais ne sont pas retournées
3. Problème de clé étrangère `listing_id` vs `id`

**Tests à effectuer**:
```sql
-- Dans Supabase SQL Editor
-- 1. Vérifier les données
SELECT
  l.id,
  l.listing_type,
  l.status,
  ul.brand,
  ul.model,
  ul.price
FROM listings l
LEFT JOIN unit_listings ul ON ul.listing_id = l.id
WHERE l.status = 'active'
LIMIT 5;

-- 2. Vérifier les RLS policies sur unit_listings
SELECT * FROM pg_policies WHERE tablename = 'unit_listings';
```

## 🎨 Prochaine étape: UI/UX Overhaul

Une fois le problème des cards résolu, il faudra:

### Améliorations générales
- [ ] Espacements cohérents partout
- [ ] Couleurs harmonieuses (palette définie)
- [ ] Animations de transition (hover, chargement)
- [ ] Responsive optimisé (mobile-first)
- [ ] États de chargement (skeletons)
- [ ] Messages d'erreur user-friendly

### Composants à améliorer
- [ ] Cards produits (hover effects, badges)
- [ ] Boutons (couleurs, hovers, focus)
- [ ] Formulaires (validation visuelle)
- [ ] Navigation (animations, active states)
- [ ] Footer (mise en page)
- [ ] Headers (gradient, spacing)

### Template à intégrer
L'utilisateur a mentionné avoir un template à intégrer. Il faudra:
1. Recevoir les fichiers du template
2. Extraire la palette de couleurs
3. Adapter les composants existants
4. Intégrer les animations/effets
5. Tester la cohérence visuelle

## 📝 Notes importantes

### Want-to-buy ne s'affiche pas
**Erreur**: `Error fetching wanted items: {}`

**Cause probable**: RLS trop restrictif sur `wanted_items`

**Solution**: Vérifier les policies RLS:
```sql
-- Permettre la lecture publique des wanted_items actifs
CREATE POLICY "Public can view active wanted items"
ON wanted_items FOR SELECT
TO public
USING (status = 'active');
```

### Build réussi
✅ Le projet compile sans erreurs TypeScript
✅ Toutes les pages sont générées correctement
✅ Aucun warning bloquant

## 🔄 Checklist de test

Après résolution du problème d'affichage:

### En tant que visiteur (non connecté)
- [ ] Page `/` → Prix masqués avec message
- [ ] Page `/shop` → Prix masqués avec message
- [ ] Page `/listing/[id]` → Prix masqué + bouton "Connectez-vous"
- [ ] Clic sur "Connectez-vous" → Redirige vers `/login`
- [ ] Voir "créez un compte" → Lien vers `/register`

### En tant qu'utilisateur pending
- [ ] Page `/` → Prix masqués
- [ ] Page `/shop` → Prix masqués
- [ ] Page `/listing/[id]` → Prix masqué + message "En attente de validation"
- [ ] Bouton contact → Désactivé avec message explicatif

### En tant qu'utilisateur validated
- [ ] Page `/` → Tous les prix visibles
- [ ] Page `/shop` → Tous les prix visibles
- [ ] Page `/listing/[id]` → Prix visible + bouton contact actif
- [ ] Bouton contact → Ouvre la messagerie
- [ ] Propre annonce → Bouton "Votre annonce" désactivé

### En tant qu'admin
- [ ] Tous les prix visibles partout
- [ ] Bouton contact actif partout (sauf propres annonces)
- [ ] Accès à toutes les fonctionnalités

## 🚀 Commandes de test

```bash
# Développement
npm run dev

# Vérifier les logs console navigateur
# Vérifier les logs serveur (terminal)

# Build de production
npm run build
npm start
```

## 📊 Métriques de succès

- ✅ Build sans erreurs TypeScript
- ✅ Toutes les pages accessibles
- ✅ Prix masqués pour non-validés sur 3 pages
- ✅ Boutons contact avec états appropriés
- ✅ Messages explicatifs pour chaque état
- ⏳ Cards affichant toutes les informations (en cours de debug)
- ⏳ Want-to-buy fonctionnel (RLS à corriger)
