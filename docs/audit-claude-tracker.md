# Audit Claude Tracker (Guide Musculation)

Source: `docs/audit_eps_musculation.md`

## Resume (10 lignes max)
1) L'audit souligne l'absence d'onboarding/personalisation AFL1-2.
2) Un choix de projet est rendu visible et persiste.
3) Un carnet de suivi minimal est propose pour la pratique terrain.
4) Les revisions sont restructurees en accordions mobiles.
5) La PWA/offline reste active via le SW existant.
6) Les statuts internes ne sont plus exposes dans les vues muscu.
7) L'accessibilite et les micro-interactions restent a traiter.
8) Pas de regression de contenu ni de routes existantes.

## P0 (Bloquants)
- [DONE] Onboarding + choix de projet (Ref: 1.2 Deficiences majeures; 2.1 AFL1; 5.1 Sprint 1-2)
  - Attendu: selection de projet visible, persistante, et utilisee pour filtrer ou guider.
  - Fichiers: `src/app/musculation/(tabs)/accueil/page.tsx`, `src/components/muscu/*`, `src/lib/muscu/*`
  - Etat: DONE
- [DONE] Carnet d'entrainement minimal (Ref: 2.1 AFL2; 5.1 Sprint 1-2 item 3)
  - Attendu: notes de seance persistees localement et facilement reutilisables.
  - Fichiers: `src/components/muscu/*`, `src/app/musculation/(tabs)/accueil/page.tsx`
  - Etat: DONE
- [DONE] PWA/offline operationnel (Ref: 1.1 Points d'amelioration; 5.2 PWA)
  - Attendu: service worker actif + cache runtime.
  - Fichiers: `src/app/sw.ts`, `next.config.ts`
  - Etat: DONE

## P1 (Ameliorations majeures)
- [DONE] Revisions lisibles terrain (Ref: 2.4 Connaissances theoriques; 5.1 Sprint 3-4)
  - Attendu: sections claires, accordions, infographies accessibles.
  - Fichiers: `src/app/musculation/(tabs)/connaissances/page.tsx`
  - Etat: DONE
- [DONE] Parametres par projet visibles (Ref: 2.1 AFL1; 5.1 Sprint 1-2 item 2)
  - Attendu: rappels simples (reps/repos/intensite) lisibles.
  - Fichiers: `src/lib/muscu/data/knowledge.ts`, `src/components/muscu/MuscuProjectPicker.tsx`
  - Etat: DONE
- [DONE] Retirer statuts internes visibles (Ref: 1.2 UX; 1.3 UI)
  - Attendu: pas d'affichage "Draft/Valide" dans l'UI.
  - Fichiers: `src/app/musculation/(tabs)/*`, `src/components/muscu/*`
  - Etat: DONE

## P2 (Polish)
- [TODO] Ameliorer la hierarchie visuelle (Ref: 1.2 UX; 1.3 UI)
  - Attendu: titres/sections plus differencies, parcours rapide.
  - Fichiers: `src/app/page.tsx`, `src/app/musculation/*`
  - Etat: TODO
- [TODO] Micro-interactions et feedbacks (Ref: 1.3 UI)
  - Attendu: retours visuels legers sur actions clefs.
  - Fichiers: `src/components/*`
  - Etat: TODO
- [TODO] Accessibilite (Ref: 4.3 Accessibilite)
  - Attendu: contrastes/verifs clavier/labels.
  - Fichiers: `src/app/globals.css`, `src/components/*`
  - Etat: TODO

## IA Fred (Refonte)
- [DONE] Phase 1 - Navigation: S'entraîner / Connaissances / Evaluation / Bibliotheque
  - Attendu: labels et ordre alignes, exercices relegues en bibliotheque.
  - Fichiers: `src/components/BottomNav.tsx`, `src/components/muscu/BottomTabsMuscu.tsx`
  - Etat: DONE
- [DONE] Phase 2 - Accueil musculation (topo + hub 4 piliers)
  - Attendu: cartes hub orientees projets, connaissances, evaluation, bibliotheque.
  - Fichiers: `src/app/musculation/(tabs)/accueil/page.tsx`
  - Etat: DONE
- [TODO] Phase 3 - Index S'entraîner (projets + parametres + methodes)
  - Attendu: page d'entree projets et liens vers parametres/methodes/seances type.
  - Fichiers: `src/app/musculation/(tabs)/entrainement/page.tsx`, `src/lib/muscu/*`
  - Etat: TODO
- [TODO] Phase 4 - Connaissances (index clair + a11y)
  - Attendu: sections anatomie/contractions/methodes avec structure accessible.
  - Fichiers: `src/app/musculation/(tabs)/connaissances/page.tsx`
  - Etat: TODO
- [TODO] Phase 5 - Evaluation (index par niveau + Bac contextualise)
  - Attendu: niveaux + branches Bac LGT/Pro sans diffusion globale du terme.
  - Fichiers: `src/app/musculation/(tabs)/evaluation/page.tsx`
  - Etat: TODO
- [TODO] Phase 6 - Bibliotheque (hub categories + etirements)
  - Attendu: hub categories + liens vers /exercises et /musculation/etirements.
  - Fichiers: `src/app/musculation/(tabs)/bibliotheque/page.tsx`
  - Etat: TODO
