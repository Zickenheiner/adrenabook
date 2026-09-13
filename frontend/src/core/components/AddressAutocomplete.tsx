import { useEffect, useRef, useState } from 'react';
import { Loader2, MapPin } from 'lucide-react';
import { Input } from '@/core/components/ui/input';
import { cn } from '@/core/utils/cn';

export interface AddressSuggestion {
  label: string;
  street: string;
  postalCode: string;
  city: string;
}

interface Props {
  value: string;
  onChange: (street: string) => void;
  onSelect: (address: AddressSuggestion) => void;
  placeholder?: string;
  id?: string;
}

/**
 * Saisie de rue avec suggestions issues de l'API Adresse
 * (api-adresse.data.gouv.fr), deja utilisee cote backend pour le geocodage :
 * service public, gratuit et sans cle, appele directement pour eviter un
 * aller-retour par notre API.
 *
 * Choisir une suggestion renseigne aussi le code postal et la ville, que
 * l'utilisateur n'a donc plus a ressaisir.
 */
const SEARCH_URL = 'https://api-adresse.data.gouv.fr/search/';
const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 250;

interface AddressFeature {
  properties?: {
    label?: string;
    name?: string;
    postcode?: string;
    city?: string;
  };
}

export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
  id,
}: Props) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  // Une suggestion venant d'etre choisie ne doit pas relancer une recherche
  // sur le texte qu'elle vient d'inscrire.
  const skipNext = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    if (value.trim().length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const url = `${SEARCH_URL}?q=${encodeURIComponent(value)}&limit=5`;
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(String(response.status));

        const data = (await response.json()) as { features?: AddressFeature[] };
        const results = (data.features ?? [])
          .map((feature) => ({
            label: feature.properties?.label ?? '',
            street: feature.properties?.name ?? '',
            postalCode: feature.properties?.postcode ?? '',
            city: feature.properties?.city ?? '',
          }))
          .filter((item) => item.label);

        setSuggestions(results);
        setOpen(results.length > 0);
      } catch {
        // L'annuaire d'adresses est un confort : en cas d'echec la saisie
        // manuelle reste possible, sans message d'erreur.
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [value]);

  // Fermer la liste sur un clic exterieur.
  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const choose = (item: AddressSuggestion) => {
    skipNext.current = true;
    onSelect(item);
    setOpen(false);
    setSuggestions([]);
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
      />
      {loading && (
        <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      )}

      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-popover p-1 shadow-md"
        >
          {suggestions.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => choose(item)}
                className={cn(
                  'flex w-full items-start gap-2 rounded-sm px-2 py-2 text-left text-sm',
                  'hover:bg-accent hover:text-accent-foreground',
                )}
              >
                <MapPin
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
