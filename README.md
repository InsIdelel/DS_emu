# DS Web Emu — intégration melonDS-wasm (Option A)

Appli web (Vite + React + TS) avec :
- Bibliothèque ROM (IndexedDB)
- Player double écran + contrôles + “tactile”
- Persistence (SaveRAM + savestates) côté appli (IndexedDB)

## Important
Le **core d’émulation** n’est pas inclus. Vous devez copier les fichiers du repo 44670/melonDS-wasm (wasm-port) :

- `wasm-port/a.out.js`   -> `public/cores/melonds/a.out.js`
- `wasm-port/a.out.wasm` -> `public/cores/melonds/a.out.wasm`

Repo : https://github.com/44670/melonDS-wasm/tree/master/wasm-port

## Lancer

```bash
npm install
npm run dev
```

## BIOS/Firmware requis
Le README du projet indique que melonDS nécessite :
- `bios7.bin` (16KB), `bios9.bin` (4KB), `firmware.bin` (128/256/512KB)
(à dumper depuis votre matériel)

## Limitations du port wasm-port
Le port wasm-port expose :
- `_getSymbol(0..5)` (pointeurs bios/firmware/rom/framebuffers/frontbuffer)
- `_reset()`, `_loadROM(len)`, `_runFrame()`

Mais ne fournit pas, tel quel, une API JS pour :
- input (touches / tactile DS)
- SaveRAM (pour persister les sauvegardes in-game)
- savestates

Il faut patcher/rebuilder le core pour une expérience complète.
