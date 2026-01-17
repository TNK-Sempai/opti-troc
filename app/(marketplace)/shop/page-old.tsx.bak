import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Package,
  Layers,
  Eye,
  X,
  SlidersHorizontal,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface SearchParams {
  search?: string;
  type?: string;
  gender?: string;
  category?: string;
  state?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const page = parseInt(params.page || "1");
  const pageSize = 40;
  const offset = (page - 1) * pageSize;

  // Construire la requête de base
  let query = supabase
    .from("listings")
    .select(
      `
      *,
      unit_listings(*),
      lot_listings(*),
      listing_photos(*)
    `,
      { count: "exact" }
    )
    .eq("status", "active");

  if (params.type && params.type !== "all") {
    query = query.eq("listing_type", params.type);
  }

  const { data: allListings, count } = await query;

  if (!allListings) return <div>Erreur de chargement</div>;

  // Enrichir les données
  let enrichedListings = allListings.map((listing) => {
    const details =
      listing.listing_type === "unit"
        ? listing.unit_listings?.[0]
        : listing.lot_listings?.[0];
    const photo = listing.listing_photos?.find((p: any) => p.is_primary);
    return { ...listing, details, photo };
  });

  // Filtres
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    enrichedListings = enrichedListings.filter((listing) => {
      if (listing.listing_type === "unit" && listing.details) {
        return (
          listing.details.brand?.toLowerCase().includes(searchLower) ||
          listing.details.model?.toLowerCase().includes(searchLower) ||
          listing.details.reference?.toLowerCase().includes(searchLower)
        );
      } else if (listing.listing_type === "lot" && listing.details) {
        return listing.details.description?.toLowerCase().includes(searchLower);
      }
      return false;
    });
  }

  // ⚠️ CORRECTION : Ces filtres s'appliquent UNIQUEMENT aux unitaires
  if (params.gender && params.gender !== "all") {
    enrichedListings = enrichedListings.filter(
      (listing) =>
        listing.listing_type === "unit" &&
        listing.details?.gender === params.gender
    );
  }

  if (params.category && params.category !== "all") {
    enrichedListings = enrichedListings.filter(
      (listing) =>
        listing.listing_type === "unit" &&
        listing.details?.category === params.category
    );
  }

  // État s'applique aux deux types
  if (params.state && params.state !== "all") {
    enrichedListings = enrichedListings.filter(
      (listing) => listing.details?.state === params.state
    );
  }

  if (params.minPrice) {
    const minPrice = parseFloat(params.minPrice);
    enrichedListings = enrichedListings.filter((listing) => {
      const price =
        listing.listing_type === "unit"
          ? parseFloat(listing.details?.price || 0)
          : parseFloat(listing.details?.total_price || 0);
      return price >= minPrice;
    });
  }

  if (params.maxPrice) {
    const maxPrice = parseFloat(params.maxPrice);
    enrichedListings = enrichedListings.filter((listing) => {
      const price =
        listing.listing_type === "unit"
          ? parseFloat(listing.details?.price || 0)
          : parseFloat(listing.details?.total_price || 0);
      return price <= maxPrice;
    });
  }

  // Tri
  const sortBy = params.sort || "recent";
  if (sortBy === "recent") {
    enrichedListings.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } else if (sortBy === "views") {
    enrichedListings.sort(
      (a, b) => (b.views_count || 0) - (a.views_count || 0)
    );
  } else if (sortBy === "price_asc") {
    enrichedListings.sort((a, b) => {
      const priceA =
        a.listing_type === "unit"
          ? parseFloat(a.details?.price || 0)
          : parseFloat(a.details?.total_price || 0);
      const priceB =
        b.listing_type === "unit"
          ? parseFloat(b.details?.price || 0)
          : parseFloat(b.details?.total_price || 0);
      return priceA - priceB;
    });
  } else if (sortBy === "price_desc") {
    enrichedListings.sort((a, b) => {
      const priceA =
        a.listing_type === "unit"
          ? parseFloat(a.details?.price || 0)
          : parseFloat(a.details?.total_price || 0);
      const priceB =
        b.listing_type === "unit"
          ? parseFloat(b.details?.price || 0)
          : parseFloat(b.details?.total_price || 0);
      return priceB - priceA;
    });
  }

  // Pagination
  const totalResults = enrichedListings.length;
  const paginatedListings = enrichedListings.slice(offset, offset + pageSize);
  const totalPages = Math.ceil(totalResults / pageSize);

  // Filtres actifs
  const activeFilters = [
    params.search && { key: "search", label: `"${params.search}"` },
    params.type &&
      params.type !== "all" && {
        key: "type",
        label: params.type === "unit" ? "Unitaire" : "Lot",
      },
    params.gender &&
      params.gender !== "all" && { key: "gender", label: params.gender },
    params.category &&
      params.category !== "all" && { key: "category", label: params.category },
    params.state &&
      params.state !== "all" && {
        key: "state",
        label: params.state.replace("_", " "),
      },
    (params.minPrice || params.maxPrice) && {
      key: "price",
      label: `${params.minPrice || "0"}€ - ${params.maxPrice || "∞"}€`,
    },
  ].filter(Boolean) as { key: string; label: string }[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-blue-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent mb-2">
            Marketplace
          </h1>
          <p className="text-muted-foreground">
            {totalResults} annonce{totalResults > 1 ? "s" : ""} disponible
            {totalResults > 1 ? "s" : ""}
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Sidebar filtres */}
          <aside className="lg:col-span-1">
            <div className="sticky top-20">
              <Card className="border-primary/20 shadow-lg overflow-hidden">
                {/* Header sidebar */}
                <div className="bg-gradient-to-r from-primary to-primary-dark p-4">
                  <div className="flex items-center gap-2 text-white">
                    <SlidersHorizontal className="w-5 h-5" />
                    <h2 className="font-semibold">Filtres</h2>
                  </div>
                </div>

                <CardContent className="p-5">
                  <form method="GET" className="space-y-5">
                    {/* Recherche */}
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                        Recherche
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          name="search"
                          placeholder="Marque, modèle..."
                          defaultValue={params.search}
                          className="pl-9 h-10"
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Type */}
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                        Type
                      </Label>
                      <Select name="type" defaultValue={params.type || "all"}>
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous types</SelectItem>
                          <SelectItem value="unit">📦 Unitaire</SelectItem>
                          <SelectItem value="lot">📚 Lot</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Genre */}
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                        Genre
                      </Label>
                      <Select
                        name="gender"
                        defaultValue={params.gender || "all"}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous</SelectItem>
                          <SelectItem value="homme">Homme</SelectItem>
                          <SelectItem value="femme">Femme</SelectItem>
                          <SelectItem value="mixte">Mixte</SelectItem>
                          <SelectItem value="enfant">Enfant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Catégorie */}
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                        Catégorie
                      </Label>
                      <Select
                        name="category"
                        defaultValue={params.category || "all"}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes</SelectItem>
                          <SelectItem value="vue">Vue</SelectItem>
                          <SelectItem value="solaires">Solaires</SelectItem>
                          <SelectItem value="sport">Sport</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* État */}
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                        État
                      </Label>
                      <Select name="state" defaultValue={params.state || "all"}>
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous</SelectItem>
                          <SelectItem value="neuf_etiquette">
                            Neuf étiquette
                          </SelectItem>
                          <SelectItem value="neuf_sans_etiquette">
                            Neuf
                          </SelectItem>
                          <SelectItem value="tres_bon">Très bon</SelectItem>
                          <SelectItem value="bon">Bon</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    {/* Prix */}
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                        Prix (€)
                      </Label>
                      <div className="space-y-2">
                        <Input
                          name="minPrice"
                          type="number"
                          placeholder="Min"
                          defaultValue={params.minPrice}
                          className="h-10"
                        />
                        <Input
                          name="maxPrice"
                          type="number"
                          placeholder="Max"
                          defaultValue={params.maxPrice}
                          className="h-10"
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Tri */}
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                        Trier par
                      </Label>
                      <Select name="sort" defaultValue={sortBy}>
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recent">Plus récent</SelectItem>
                          <SelectItem value="views">Plus consultés</SelectItem>
                          <SelectItem value="price_asc">Prix ↑</SelectItem>
                          <SelectItem value="price_desc">Prix ↓</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Boutons */}
                    <div className="space-y-2 pt-2">
                      <Button type="submit" className="w-full h-10 shadow-md">
                        Appliquer
                      </Button>
                      <Button asChild variant="outline" className="w-full h-10">
                        <Link href="/shop">Réinitialiser</Link>
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Contenu principal */}
          <div className="lg:col-span-4 space-y-6">
            {/* Filtres actifs */}
            {activeFilters.length > 0 && (
              <Card className="border-primary/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                      Filtres actifs :
                    </span>
                    {activeFilters.map((filter) => (
                      <Badge
                        key={filter.key}
                        variant="secondary"
                        className="gap-2 pl-3 pr-2 py-1.5 bg-primary/10 hover:bg-primary/20 border-primary/20"
                      >
                        {filter.label}
                        <Link
                          href={`/shop?${new URLSearchParams(
                            Object.fromEntries(
                              Object.entries(params).filter(
                                ([k]) =>
                                  k !== filter.key &&
                                  k !== "minPrice" &&
                                  k !== "maxPrice"
                              )
                            )
                          ).toString()}`}
                          className="hover:text-destructive transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Link>
                      </Badge>
                    ))}
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                    >
                      <Link href="/shop">Tout effacer</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Grille annonces */}
            {paginatedListings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-20">
                  <div className="w-20 h-20 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
                    <Package className="w-10 h-10 text-neutral-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Aucune annonce trouvée
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Essayez de modifier vos critères de recherche
                  </p>
                  <Button asChild>
                    <Link href="/shop">Réinitialiser les filtres</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {paginatedListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Card className="border-primary/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          {offset + 1}-
                          {Math.min(offset + pageSize, totalResults)} sur{" "}
                          {totalResults} résultats
                        </p>

                        <div className="flex items-center gap-1">
                          {page > 1 && (
                            <Button asChild variant="outline" size="sm">
                              <Link
                                href={`/shop?${new URLSearchParams({
                                  ...params,
                                  page: String(page - 1),
                                }).toString()}`}
                              >
                                ← Préc.
                              </Link>
                            </Button>
                          )}

                          {Array.from(
                            { length: Math.min(totalPages, 5) },
                            (_, i) => {
                              let pageNum = i + 1;
                              if (totalPages > 5 && page > 3) {
                                pageNum = page - 2 + i;
                                if (pageNum > totalPages)
                                  pageNum = totalPages - (4 - i);
                              }
                              return (
                                <Button
                                  key={pageNum}
                                  asChild
                                  variant={
                                    pageNum === page ? "default" : "ghost"
                                  }
                                  size="sm"
                                  className="w-9"
                                >
                                  <Link
                                    href={`/shop?${new URLSearchParams({
                                      ...params,
                                      page: String(pageNum),
                                    }).toString()}`}
                                  >
                                    {pageNum}
                                  </Link>
                                </Button>
                              );
                            }
                          )}

                          {page < totalPages && (
                            <Button asChild variant="outline" size="sm">
                              <Link
                                href={`/shop?${new URLSearchParams({
                                  ...params,
                                  page: String(page + 1),
                                }).toString()}`}
                              >
                                Suiv. →
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant Card
function ListingCard({ listing }: { listing: any }) {
  const isUnit = listing.listing_type === 'unit'
  const details = listing.details

  return (
    <Link href={`/listing/${listing.id}`}>  {/* ✅ CHANGÉ ICI */}
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-neutral-200 h-full hover:border-primary/50 hover:-translate-y-1">
        <div className="relative h-32 bg-gradient-to-br from-neutral-100 to-neutral-50">
          {listing.photo ? (
            <Image
              src={listing.photo.photo_url}
              alt={isUnit && details ? `${details.brand} ${details.model}` : 'Lot'}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              {isUnit ? (
                <Package className="w-8 h-8 text-neutral-300" />
              ) : (
                <Layers className="w-8 h-8 text-neutral-300" />
              )}
            </div>
          )}

          <div className="absolute top-1.5 left-1.5">
            <Badge className={`text-xs h-5 ${isUnit ? 'bg-primary' : 'bg-green-600'} shadow-lg`}>
              {isUnit ? 'Unit' : 'Lot'}
            </Badge>
          </div>

          <div className="absolute bottom-1.5 right-1.5 bg-black/70 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
            <Eye className="w-2.5 h-2.5" />
            {listing.views_count || 0}
          </div>
        </div>

        <CardContent className="p-2.5">
          {isUnit && details ? (
            <>
              <h3 className="font-semibold text-xs line-clamp-1 mb-0.5 group-hover:text-primary transition-colors">
                {details.brand} {details.model}
              </h3>
              {details.reference && (
                <p className="text-[10px] font-mono text-muted-foreground mb-1.5 line-clamp-1">
                  {details.reference}
                </p>
              )}
              <p className="text-base font-bold text-primary">
                {parseFloat(details.price).toFixed(0)}€
              </p>
            </>
          ) : details ? (
            <>
              <h3 className="font-semibold text-xs mb-0.5 group-hover:text-green-600 transition-colors">
                Lot
              </h3>
              <p className="text-[10px] text-muted-foreground line-clamp-2 mb-1.5">
                {details.description}
              </p>
              <p className="text-base font-bold text-green-600">
                {parseFloat(details.total_price).toFixed(0)}€
              </p>
            </>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  )
}