# Privacy Portal Client

This repository contains the source code of the Privacy Portal web app.

## Installing dependencies

```bash
npm install
```

## Developing

```bash
# start the server
npm run dev

# or start the server on a custom port
PORT=3000 npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Committing changes

```bash
# fix code styling prior to pushing changes
npm run format
```

## Building

```bash
# build dev
npm run build

# build staging
npm run build -- --mode staging

# build production
npm run build -- --mode production
```
