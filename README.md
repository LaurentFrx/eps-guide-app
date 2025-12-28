# Guide EPS (PWA)

Application mobile-first pour consulter des fiches d'exercices EPS, filtrer, rechercher, sauvegarder en favoris et fonctionner hors ligne.

## Installation

```bash
npm install
```

## Extraction des donnees (DOCX -> JSON + images)

Le script lit par defaut ces fichiers (depuis la racine du repo) :

- `source_docs/EPS-1.docx`
- `source_docs/EPS-2.docx`

Commande :

```bash
npm run extract:data
```

Dependances Python a installer si besoin :

```bash
python3 -m pip install python-docx pillow
```

Vous pouvez aussi passer vos propres chemins :

```bash
python3 tools/extract_eps_docx.py /chemin/vers/EPS-1.docx /chemin/vers/EPS-2.docx
```

Si les DOCX sont absents, un dataset de demonstration est genere et un bandeau discret s'affiche dans l'UI.

## Developpement

```bash
npm run dev
```

## Build + test offline

```bash
npm run build
npm start
```

Ensuite :

- Ouvrir `http://localhost:3000`
- Installer la PWA
- Visiter quelques fiches
- Passer hors ligne pour verifier le fallback `/~offline`

## iOS (installation)

Dans Safari : `Partager -> Sur l'ecran d'accueil`

## Depannage cache / Service Worker

- Desinstaller la PWA puis relancer l'installation
- Dans Chrome : DevTools -> Application -> Service Workers -> Unregister
- Recharger la page avec `Hard Reload` si besoin
