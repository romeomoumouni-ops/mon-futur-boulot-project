# Règles du projet — MonFuturBoulot.com

## 📱 RÈGLE N°1 : MOBILE-FIRST (obligatoire, prioritaire)

**Toute modification d'UI doit être pensée et vérifiée pour le mobile AVANT le desktop.**
La majorité des utilisateurs (jeunes diplômés en Afrique) sont sur téléphone.

Avant de considérer une page/un composant comme « fini » :

1. **Tester à 375px de large** (iPhone SE) ET 390px (iPhone 14). Aucune page ne doit déborder horizontalement.
2. **Zéro scroll horizontal** : `document.documentElement.scrollWidth` ne doit jamais dépasser la largeur du viewport. `html, body { overflow-x: hidden }` est un filet de sécurité, pas une excuse.
3. **Pas de largeurs fixes qui dépassent** : éviter `width: 100vw`, les `gridTemplateColumns` à colonnes fixes sans version mobile, les `nav`/flex en ligne qui ne se replient pas.
4. **Mises en page multi-colonnes** : doivent passer en **1 colonne** sur mobile (`flex-direction: column` / `grid-template-columns: 1fr`).
5. **Navigation** : sur mobile, les barres de nav se replient (liens masqués + menu, comme la landing). Réutiliser les classes `.landing-nav`, `.landing-nav-actions`, `.landing-mobile-toggle`.
6. **Styles inline ≠ responsive** : les `style={{}}` React ne gèrent pas les media queries. Pour tout comportement responsive, utiliser des **classes CSS** dans `globals.css` (avec `@media (max-width: 767px)` / `480px`) et les appliquer via `className`.
7. **Titres** : `h1` max ~28px sur mobile (classe `.hero-title-responsive`). Boutons en `width: 100%` dans les formulaires/hero sur mobile.
8. **Tableaux** : envelopper dans un conteneur `.table-scroll` (défile au lieu de déborder).

Breakpoints : mobile `< 768px`, tablette `768–1023px`, desktop `≥ 1024px`.

## 🚀 RÈGLE N°2 : Déploiement automatique
Après chaque modification validée : `git add -A && git commit && git push origin main` (→ Vercel redéploie le site automatiquement). Voir README.md.
