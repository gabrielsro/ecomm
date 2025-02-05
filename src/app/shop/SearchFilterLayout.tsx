"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductsSort } from "@/wix-api/products";
import { collections } from "@wix/stores";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useOptimistic, useState, useTransition } from "react";

interface SearchFilterLayoutProps {
  collections: collections.Collection[];
  children: React.ReactNode;
}

export default function SearchFilterLayout({
  collections,
  children,
}: SearchFilterLayoutProps) {
  const router = useRouter();

  //URL will be the source of truth. Filters reflect the state of the URL:
  const searchParams = useSearchParams();

  const [optimisticFilters, setOptimisticFilters] = useOptimistic(
    //Initial state:
    {
      collection: searchParams.getAll("collection"),
      price_min: searchParams.get("price_min") || undefined,
      price_max: searchParams.get("price_max") || undefined,
      sort: searchParams.get("sort") || undefined,
    },
    //OptimisticFilters are the settled values obtained after user action. Functions above will fetch those
  );

  const [isPending, startTransition] = useTransition();

  //Update the URL and go to it:
  //Partial allows for using some of the type values instead of having to use all (e.g. collection vs collection + price_min + price_max)
  function updateFilters(updates: Partial<typeof optimisticFilters>) {
    //updates will be used to override optimisticFilters
    const newState = { ...optimisticFilters, ...updates };
    const newSearchParams = new URLSearchParams(searchParams);

    //Turn newState into an array. Then, iterate on its destructured key-value tuples []:
    Object.entries(newState).forEach(([key, value]) => {
      //Do the update on each filter (each tuple):
      //1. Delete old entry:
      newSearchParams.delete(key);
      //2. Take care of the array values, such as that of 'collection' first:
      if (Array.isArray(value)) {
        value.forEach((v) => newSearchParams.append(key, v));
      }
      //3. Take care of other data structure values. such as 'price_min':
      else if (value) {
        newSearchParams.set(key, value);
      }
    });

    //4. Delete page number so that new filters show results from the beginnig:
    newSearchParams.delete("page");

    startTransition(() => {
      //Show user action on screen immediately:
      setOptimisticFilters(newState);
      //Navigate to the new URL. The result of the line below will update the one above:
      //While the line below is working, 'isPending' will be true
      router.push(`?${newSearchParams.toString()}`);
    });
  }

  return (
    <main className="group flex flex-col items-center justify-center gap-10 px-5 py-10 lg:flex-row lg:items-start">
      {/* aside is for elements, usually navigation, besides the main content */}
      <aside
        className="h-fit space-y-5 lg:sticky lg:top-10 lg:w-64"
        // Custom attribute below alow us to pass info on transition status to the main component (via 'group'). Tailwind trickery
        data-pending={isPending ? "" : undefined}
      >
        <CollectionsFilter
          collections={collections}
          selectedCollectionIds={optimisticFilters.collection}
          //Specify collectionIds so that only that type can be updated with the function 'updateFilters':
          updateCollectionIds={(collectionIds) =>
            updateFilters({ collection: collectionIds })
          }
        />
        <PriceFilter
          minDefaultInput={optimisticFilters.price_min}
          maxDefaultInput={optimisticFilters.price_max}
          updatePriceRange={(priceMin, priceMax) =>
            updateFilters({ price_min: priceMin, price_max: priceMax })
          }
        />
      </aside>
      <div className="w-full max-w-7xl space-y-5">
        <div className="flex justify-center lg:justify-end">
          <SortFilter
            sort={optimisticFilters.sort}
            updateSort={(sort) => updateFilters({ sort })}
          />
        </div>
        {children}
      </div>
    </main>
  );
}

interface CollectionsFilterProps {
  collections: collections.Collection[];
  selectedCollectionIds: string[];
  updateCollectionIds: (collectionIds: string[]) => void;
}

function CollectionsFilter({
  collections,
  selectedCollectionIds,
  updateCollectionIds,
}: CollectionsFilterProps) {
  return (
    <div className="space-y-3">
      <div className="font-bold">Collections</div>
      <ul className="space-y 1 5">
        {collections.map((collection) => {
          const collectionId = collection._id;
          if (!collectionId) return null;
          return (
            <li key={collectionId}>
              <label className="flex cursor-pointer items-center gap-2 font-medium">
                <Checkbox
                  id={collectionId}
                  checked={selectedCollectionIds.includes(collectionId)}
                  onCheckedChange={(checked) => {
                    updateCollectionIds(
                      checked
                        ? [...selectedCollectionIds, collectionId]
                        : selectedCollectionIds.filter(
                            (id) => id !== collectionId,
                          ),
                    );
                  }}
                />
                <span className="line-clamp-1 break-all">
                  {collection.name}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      {selectedCollectionIds.length > 0 && (
        <button
          onClick={() => updateCollectionIds([])}
          className="text-sm text-primary hover:underline"
        >
          Clear
        </button>
      )}
    </div>
  );
}

//Default values are obtained from the server and will be used as initial values:
interface PriceFilterProps {
  minDefaultInput: string | undefined;
  maxDefaultInput: string | undefined;
  updatePriceRange: (min: string | undefined, max: string | undefined) => void;
}

function PriceFilter({
  minDefaultInput,
  maxDefaultInput,
  updatePriceRange,
}: PriceFilterProps) {
  const [minInput, setMinInput] = useState(minDefaultInput);
  const [maxInput, setMaxInput] = useState(maxDefaultInput);

  //Reset input values upon server response:
  useEffect(() => {
    setMinInput(minDefaultInput || "");
    setMaxInput(maxDefaultInput || "");
  }, [minDefaultInput, maxDefaultInput]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    //Function below is received via props:
    updatePriceRange(minInput, maxInput);
  }

  return (
    <div className="space-y-3">
      <div className="font-bold">Price range</div>
      <form className="flex items-center gap-2" onSubmit={onSubmit}>
        <Input
          type="number"
          name="min"
          placeholder="Min"
          value={minInput}
          onChange={(e) => setMinInput(e.target.value)}
          className="w-20"
        />
        <span>-</span>
        <Input
          type="number"
          name="max"
          placeholder="Max"
          value={maxInput}
          onChange={(e) => setMaxInput(e.target.value)}
          className="w-20"
        />
        <Button type="submit">Go</Button>
      </form>
      {(!!minDefaultInput || !!maxDefaultInput) && (
        <button
          className="text-sm text-primary hover:underline"
          onClick={() => updatePriceRange(undefined, undefined)}
        >
          Clear
        </button>
      )}
    </div>
  );
}

interface SortFilterProps {
  sort: string | undefined;
  updateSort: (value: ProductsSort) => void;
}

function SortFilter({ sort, updateSort }: SortFilterProps) {
  return (
    <Select value={sort || "last_updated"} onValueChange={updateSort}>
      <SelectTrigger className="w-fit gap-2 text-start">
        <span>
          Sort by: <SelectValue />
        </span>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="last_updated">Newest</SelectItem>
        <SelectItem value="price_asc">Price (Low to high)</SelectItem>
        <SelectItem value="price_desc">Price (High to low)</SelectItem>
      </SelectContent>
    </Select>
  );
}
