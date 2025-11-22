# Réinstallation des dépendances

## Étapes à suivre

1. Supprimez le dossier `node_modules` et le fichier `package-lock.json` :
   ```bash
   cd vite-project
   Remove-Item -Recurse -Force node_modules
   Remove-Item -Force package-lock.json
   ```

2. Réinstallez les dépendances :
   ```bash
   npm install
   ```

Maintenant React 18 est configuré et compatible avec lucide-react !

