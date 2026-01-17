# Mise à jour des cartes d'annonces - Règles de visibilité

## ✅ Corrections effectuées

### 1. Composant unifié ListingCard créé
**Fichier**: `components/shop/ListingCard.tsx`

**Fonctionnalités**:
- Support des variantes `grid` et `list`
- Règles de visibilité basées sur le statut utilisateur
- Affichage conditionnel des prix
- Message "Compte validé requis" pour les utilisateurs non validés
- Icône cadenas pour les prix masqués

### 2. Pages mises à jour

#### Page d'accueil (`app/(marketplace)/page.tsx`)
- ✅ Import du nouveau composant `ListingCard`
- ✅ Vérification du statut utilisateur (validated/admin)
- ✅ Passage du prop `isValidated` à toutes les cards
- ✅ Suppression de l'ancien composant local

#### Page shop (`app/(marketplace)/shop/page.tsx`)
- ✅ Import du nouveau composant `ListingCard`
- ✅ Vérification du statut utilisateur
- ✅ Support des variantes grid/list
- ✅ Passage du prop `isValidated` à toutes les cards

#### Page want-to-buy (`app/(marketplace)/want-to-buy/page.tsx`)
- ✅ Ajout de logging pour debug (problème RLS probable)

### 3. Anciens composants (peuvent être supprimés)
- `components/shop/ListingCardGrid.tsx`
- `components/shop/ListingCardList.tsx`

## 🔐 Règles de visibilité implémentées

### Pour les utilisateurs NON validés:
- ✅ Peuvent voir les photos
- ✅ Peuvent voir marque, modèle, référence
- ✅ Peuvent voir les badges (Unit/Lot, Nouveau)
- ✅ Peuvent voir le nombre de vues
- ❌ **NE PEUVENT PAS** voir les prix
- ❌ **NE PEUVENT PAS** contacter le vendeur (à implémenter dans page détail)

### Pour les utilisateurs validés ou admins:
- ✅ Peuvent tout voir
- ✅ Peuvent voir les prix
- ✅ Peuvent contacter les vendeurs

## 📋 Prochaines étapes

### 1. Page de détail d'annonce
**Fichier à modifier**: `app/(marketplace)/listing/[id]/page.tsx`

**Modifications nécessaires**:
- Vérifier le statut utilisateur
- Masquer le prix si non validé
- Masquer/désactiver le bouton "Contacter le vendeur" si non validé
- Afficher un message invitant à créer un compte ou à attendre validation

### 2. Composant ContactSellerButton
**Fichier**: `components/messages/ContactSellerButton.tsx`

**Modifications nécessaires**:
- Ajouter un prop `isValidated`
- Désactiver le bouton si non validé
- Afficher un tooltip explicatif

### 3. Dashboard listings
**Route**: `/dashboard/listings`

Cette page est pour les utilisateurs connectés, donc pas de restrictions nécessaires.

## 🧪 Tests à effectuer

1. **En tant que visiteur non connecté**:
   - [ ] Page d'accueil: prix masqués ✓
   - [ ] Page shop: prix masqués ✓
   - [ ] Page détail annonce: prix masqué + bouton contact désactivé (à faire)

2. **En tant qu'utilisateur pending**:
   - [ ] Mêmes restrictions que visiteur
   - [ ] Message "En attente de validation" sur la page détail

3. **En tant qu'utilisateur validated**:
   - [ ] Tous les prix visibles
   - [ ] Bouton contact vendeur actif
   - [ ] Peut créer des annonces

4. **En tant qu'admin**:
   - [ ] Accès total
   - [ ] Tous les prix visibles

## 🐛 Problème identifié: want-to-buy

**Symptôme**: La page `/want-to-buy` n'affiche pas les recherches actives

**Causes possibles**:
1. RLS trop restrictif sur la table `wanted_items`
2. Pas de données avec status='active' en base
3. Problème avec le join sur `user_profiles`

**Solution temporaire**: Ajout de logging pour identifier la cause

**SQL à vérifier**:
```sql
-- Vérifier les wanted_items actifs
SELECT count(*) FROM wanted_items WHERE status = 'active';

-- Vérifier les RLS policies
SELECT * FROM pg_policies WHERE tablename = 'wanted_items';
```

## 💡 Notes d'implémentation

### Vérification du statut utilisateur (pattern utilisé partout)
```typescript
const { data: { user } } = await supabase.auth.getUser()
let isValidated = false

if (user) {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('status, role')
    .eq('id', user.id)
    .single()

  isValidated = profile?.status === 'validated' || profile?.role === 'admin'
}
```

### Utilisation du composant ListingCard
```tsx
// Vue grille
<ListingCard
  listing={listing}
  isValidated={isValidated}
  variant="grid"
  showNew={isRecent}
/>

// Vue liste
<ListingCard
  listing={listing}
  isValidated={isValidated}
  variant="list"
/>
```
