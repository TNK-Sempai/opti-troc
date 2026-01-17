import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { X, Package } from "lucide-react";
import { MarketplaceFilters } from "@/components/shop/MarketplaceFilters";
import { ViewControls } from "@/components/shop/ViewControls";
import { ListingCard } from "@/components/shop/ListingCard";

export const dynamic = "force-dynamic";

interface SearchParams {
  search?: string;
  type?: string;
  brand?: string;
  model?: string;
  gender?: string;
  category?: string;
  state?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  view?: string;
  page?: string;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // Vérifier le statut de l'utilisateur
  const { data: { user } } = await supabase.auth.getUser();
  let isValidated = false;

  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('status, role')
      .eq('id', user.id)
      .single();

    isValidated = profile?.status === 'validated' || profile?.role === 'admin';
  }

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
    // IMPORTANT: unit_listings et lot_listings sont des TABLEAUX
    const details =
      listing.listing_type === "unit"
        ? (Array.isArray(listing.unit_listings) ? listing.unit_listings[0] : listing.unit_listings)
        : (Array.isArray(listing.lot_listings) ? listing.lot_listings[0] : listing.lot_listings);
    const photo = listing.listing_photos?.find((p: any) => p.is_primary) || listing.listing_photos?.[0];
    return { ...listing, details, photo };
  });

  // Extraire marques et modèles uniques pour les filtres dynamiques
  const brandsSet = new Set<string>();
  const modelsMap: Record<string, Set<string>> = {};

  enrichedListings.forEach((listing) => {
    if (listing.listing_type === "unit" && listing.details) {
      const brand = listing.details.brand;
      const model = listing.details.model;

      if (brand) {
        brandsSet.add(brand);
        if (model) {
          if (!modelsMap[brand]) {
            modelsMap[brand] = new Set();
          }
          modelsMap[brand].add(model);
        }
      }
    }
  });

  const brands = Array.from(brandsSet).sort();
  const models: Record<string, string[]> = {};
  Object.keys(modelsMap).forEach((brand) => {
    models[brand] = Array.from(modelsMap[brand]).sort();
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

  if (params.brand && params.brand !== "all") {
    enrichedListings = enrichedListings.filter(
      (listing) =>
        listing.listing_type === "unit" &&
        listing.details?.brand === params.brand
    );
  }

  if (params.model && params.model !== "all") {
    enrichedListings = enrichedListings.filter(
      (listing) =>
        listing.listing_type === "unit" &&
        listing.details?.model === params.model
    );
  }

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
    params.brand &&
      params.brand !== "all" && { key: "brand", label: params.brand },
    params.model &&
      params.model !== "all" && { key: "model", label: params.model },
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

  const viewMode = (params.view || "grid") as "grid" | "list";

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-blue-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent mb-2">
            Marketplace
          </h1>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Sidebar filtres */}
          <aside className="lg:col-span-1">
            <div className="sticky top-20">
              <MarketplaceFilters brands={brands} models={models} />
            </div>
          </aside>

          {/* Contenu principal */}
          <div className="lg:col-span-4 space-y-6">
            {/* Contrôles de vue et tri */}
            <Card className="border-primary/10">
              <CardContent className="p-4">
                <ViewControls totalResults={totalResults} />
              </CardContent>
            </Card>

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

            {/* Grille/Liste annonces */}
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
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {paginatedListings.map((listing) => (
                      <ListingCard key={listing.id} listing={listing} isValidated={isValidated} variant="grid" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedListings.map((listing) => (
                      <ListingCard key={listing.id} listing={listing} isValidated={isValidated} variant="list" />
                    ))}
                  </div>
                )}

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
