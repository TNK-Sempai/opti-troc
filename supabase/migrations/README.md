# Migrations Supabase

## Application des migrations

Pour appliquer la migration `wanted_items`, exécutez le SQL dans votre dashboard Supabase:

1. Allez sur votre projet Supabase: https://app.supabase.com
2. Naviguez vers "SQL Editor" dans le menu de gauche
3. Copiez le contenu du fichier `20260116_create_wanted_items.sql`
4. Collez-le dans l'éditeur SQL
5. Cliquez sur "Run" pour exécuter la migration

## Ce que cette migration crée

### Table `wanted_items`
Stocke les recherches des utilisateurs pour des paires spécifiques:
- `brand`: Marque recherchée (obligatoire)
- `model`: Modèle spécifique (optionnel)
- `reference`: Référence exacte (optionnel)
- `max_price`: Budget maximum (optionnel)
- `status`: État de la recherche (active/fulfilled/cancelled)

### Table `wanted_item_notifications`
Gère les notifications automatiques quand un listing correspond à une recherche.

### Système de notification automatique
Un trigger SQL détecte automatiquement quand un nouveau listing correspond aux critères d'une recherche active et crée une notification pour l'utilisateur.

### Sécurité (RLS)
- Les utilisateurs ne peuvent voir et gérer que leurs propres recherches
- Les notifications sont personnelles et privées
