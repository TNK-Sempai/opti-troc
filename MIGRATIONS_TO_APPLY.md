# Migrations à appliquer dans Supabase

⚠️ **IMPORTANT** : Appliquez ces migrations dans l'ordre via l'éditeur SQL de Supabase.

## 1. Fix Wanted Items Trigger
**Fichier**: `supabase/migrations/20260117_fix_wanted_items_trigger.sql`
**Raison**: Corrige l'erreur "seller_id field not found" lors de la création d'annonces unitaires

## 2. Add Archive Columns to Contact Messages
**Fichier**: `supabase/migrations/20260117_add_archive_columns_to_contact_messages.sql`
**Raison**: Ajoute les colonnes nécessaires pour archiver les messages pendant 5 ans (conformité RGPD)

## 3. Fix Messaging RLS Recursion
**Fichier**: `supabase/migrations/20260117_fix_messaging_rls_recursion.sql`
**Raison**: Corrige la récursion infinie dans les politiques RLS du système de messagerie

## 4. Add User Archive
**Fichier**: `supabase/migrations/20260117_add_user_archive.sql`
**Raison**: Permet d'archiver les utilisateurs pendant 5 ans au lieu de les supprimer (conformité RGPD)

---

## Comment appliquer les migrations

1. Connectez-vous à votre dashboard Supabase
2. Allez dans **SQL Editor**
3. Copiez-collez le contenu de chaque migration **dans l'ordre**
4. Cliquez sur **Run** pour chaque migration
5. Vérifiez qu'il n'y a pas d'erreurs

## Migrations déjà appliquées (normalement)

Ces migrations devraient déjà être en base :
- `20260116_create_messaging.sql` - Système de messagerie
- Autres migrations initiales du système

Si vous rencontrez des erreurs de type "already exists", c'est normal - la migration gère les cas où les objets existent déjà.
