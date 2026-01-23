'use client';

import { useQuery } from '@tanstack/react-query';
import * as api from '@/lib/api';

// Query keys
export const compendiumKeys = {
  all: ['compendium'] as const,
  story: (storyId: string) => [...compendiumKeys.all, storyId] as const,
  characters: (storyId: string) => [...compendiumKeys.story(storyId), 'characters'] as const,
  character: (storyId: string, id: string) => [...compendiumKeys.characters(storyId), id] as const,
  characterRelations: (storyId: string, id: string) =>
    [...compendiumKeys.character(storyId, id), 'relations'] as const,
  items: (storyId: string) => [...compendiumKeys.story(storyId), 'items'] as const,
  item: (storyId: string, id: string) => [...compendiumKeys.items(storyId), id] as const,
  locations: (storyId: string) => [...compendiumKeys.story(storyId), 'locations'] as const,
  location: (storyId: string, id: string) => [...compendiumKeys.locations(storyId), id] as const,
  monsters: (storyId: string) => [...compendiumKeys.story(storyId), 'monsters'] as const,
  monster: (storyId: string, id: string) => [...compendiumKeys.monsters(storyId), id] as const,
  lore: (storyId: string, category?: string) =>
    [...compendiumKeys.story(storyId), 'lore', category] as const,
  loreEntry: (storyId: string, id: string) => [...compendiumKeys.story(storyId), 'lore', id] as const,
};

// Character hooks
export function useCharacters(storyId: string) {
  return useQuery({
    queryKey: compendiumKeys.characters(storyId),
    queryFn: () => api.getCharacters(storyId),
    enabled: !!storyId,
  });
}

export function useCharacter(storyId: string, characterId: string) {
  return useQuery({
    queryKey: compendiumKeys.character(storyId, characterId),
    queryFn: () => api.getCharacter(storyId, characterId),
    enabled: !!storyId && !!characterId,
  });
}

export function useCharacterRelations(storyId: string, characterId: string) {
  return useQuery({
    queryKey: compendiumKeys.characterRelations(storyId, characterId),
    queryFn: () => api.getCharacterRelations(storyId, characterId),
    enabled: !!storyId && !!characterId,
  });
}

// Item hooks
export function useItems(storyId: string) {
  return useQuery({
    queryKey: compendiumKeys.items(storyId),
    queryFn: () => api.getItems(storyId),
    enabled: !!storyId,
  });
}

export function useItem(storyId: string, itemId: string) {
  return useQuery({
    queryKey: compendiumKeys.item(storyId, itemId),
    queryFn: () => api.getItem(storyId, itemId),
    enabled: !!storyId && !!itemId,
  });
}

// Location hooks
export function useLocations(storyId: string) {
  return useQuery({
    queryKey: compendiumKeys.locations(storyId),
    queryFn: () => api.getLocations(storyId),
    enabled: !!storyId,
  });
}

export function useLocation(storyId: string, locationId: string) {
  return useQuery({
    queryKey: compendiumKeys.location(storyId, locationId),
    queryFn: () => api.getLocation(storyId, locationId),
    enabled: !!storyId && !!locationId,
  });
}

// Monster hooks
export function useMonsters(storyId: string) {
  return useQuery({
    queryKey: compendiumKeys.monsters(storyId),
    queryFn: () => api.getMonsters(storyId),
    enabled: !!storyId,
  });
}

export function useMonster(storyId: string, monsterId: string) {
  return useQuery({
    queryKey: compendiumKeys.monster(storyId, monsterId),
    queryFn: () => api.getMonster(storyId, monsterId),
    enabled: !!storyId && !!monsterId,
  });
}

// Lore hooks
export function useLoreEntries(storyId: string, category?: string) {
  return useQuery({
    queryKey: compendiumKeys.lore(storyId, category),
    queryFn: () => api.getLoreEntries(storyId, category),
    enabled: !!storyId,
  });
}

export function useLoreEntry(storyId: string, loreId: string) {
  return useQuery({
    queryKey: compendiumKeys.loreEntry(storyId, loreId),
    queryFn: () => api.getLoreEntry(storyId, loreId),
    enabled: !!storyId && !!loreId,
  });
}
