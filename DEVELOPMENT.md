# Guida allo sviluppo

Pixelcut è diviso in due ambienti: `src/` e `docs/` per lo sviluppo frontend standalone, `theme/` per l'integrazione WordPress con Timber e ACF.

## Frontend standalone

Avvia la documentazione con `npm install` e `npm run dev`, poi apri `http://127.0.0.1:5173/`. I sorgenti principali sono `src/components/`, `src/scss/`, `src/js/` e `src/assets/`; gli esempi vivono in `docs/templates/`, `docs/components/`, `docs/content/` e `docs/public/`.

I componenti Twig ricevono dati Twig e non chiamano direttamente WordPress. Per compilare la documentazione statica usa `npm run build:docs`; il risultato è in `dist/docs/`.

## Componenti

Un componente standard vive in `src/components/nome-componente/` con un file `.twig` e, se necessario, un file `.scss`. Importa lo SCSS in `src/scss/index.scss` e aggiungi un esempio alla documentazione. Usa le utility del framework per griglia, spazi, tipografia e immagini; lo SCSS del componente contiene solo personalizzazioni.

Non modificare direttamente `theme/components` o `theme/assets`: sono cartelle generate. I token condivisi sono in `src/scss/_settings.scss`; per un sito specifico puoi aggiungere token dedicati in `src/scss/_site.scss`.

## WordPress

`npm run build:theme` compila gli asset e copia i Twig da `src/components` in `theme/components`. In locale il tema è collegato tramite junction a `C:\xampp\htdocs\pixelcut-wp\wp-content\themes\pixelcut`, quindi WordPress legge direttamente la cartella `theme` del progetto.

I file principali sono `theme/functions.php` per Timber, menu e asset, `theme/page.php` per i dati ACF, `theme/front-page.php` per la homepage, `theme/views/` per i layout e `theme/acf-json/` per i gruppi ACF.

Il flusso è: campi ACF → `theme/page.php` → Timber → `theme/views/page.twig` → componenti Twig. Composer installa Timber e Twig in `theme/vendor`; non serve per modifiche a Twig, SCSS, JavaScript o template PHP.

Il tema attuale usa campi fissi per Editorial e Text. Per aggiungere e riordinare liberamente più componenti nella stessa pagina serve ACF Pro con Flexible Content.

## Comandi

`npm run dev` avvia la documentazione frontend. `npm run build:docs` crea la documentazione statica. `npm run build:theme` aggiorna il tema WordPress. `npm run watch:theme` ricompila il tema durante lo sviluppo. `npm run build` esegue entrambe le build.

## Distribuzione

Esegui `npm run build:theme` e `composer install --working-dir=theme --no-dev`, poi comprimi `theme` includendo `assets`, `components`, `vendor`, `views`, `acf-json` e i file PHP. Nell'altra installazione attiva ACF, installa il tema e sincronizza i gruppi ACF. Database, pagine, menu, utenti e immagini caricate vanno migrati separatamente.
