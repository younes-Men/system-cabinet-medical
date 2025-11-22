# Nettoyer le cache Vite

Si vous avez des erreurs de compilation, essayez de nettoyer le cache :

```bash
cd vite-project
Remove-Item -Recurse -Force node_modules\.vite
```

Puis redémarrez le serveur :
```bash
npm run dev
```

