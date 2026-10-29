# Pixelcut

Il progetto contiene il framework frontend, la sua documentazione e il tema WordPress. WordPress resta installato separatamente in `C:\xampp\htdocs\pixelcut-wp`.

## Dove lavorare

```text
src/
  components/        componenti Twig e SCSS per personalizzazioni
  scss/              utility, token e stili condivisi del framework
  js/                JavaScript condiviso e moduli
  assets/            font, icone e immagini statiche del tema
docs/
  templates/         pagine dimostrative Twig
  components/        sezioni della documentazione, esempi e stili dedicati
  content/           dati delle demo
  public/            immagini e video delle demo
  scss/              stili della documentazione
  main.js            ingresso della documentazione
theme/
  style.css          intestazione che identifica il tema WordPress
  functions.php      Timber, supporti WordPress e caricamento asset
  page.php           lettura componenti Carbon Fields e dati per Twig
  index.php          template di fallback WordPress
  views/             layout e template di pagina Timber
  composer.json      dipendenza Timber
  components/        GENERATO da src/components
  assets/            GENERATO dalla build del frontend
  vendor/            GENERATO da Composer
scripts/             rendering, collegamento del tema
dist/docs/           GENERATO: documentazione pronta da pubblicare
```

`src/components/editorial/editorial.twig` e l'unico sorgente di Editorial. Layout, font, spazi e immagini usano le utility del framework; il suo SCSS resta per personalizzazioni. La build copia i Twig in `theme/components`: non modificare le copie generate.

Le immagini dimostrative sono in `docs/public`. Le immagini inserite in WordPress tramite Carbon Fields appartengono alla Libreria media e vengono salvate in `C:\xampp\htdocs\pixelcut-wp\wp-content\uploads`.

## Comandi frontend

```sh
npm install
npm run dev           # documentazione e portfolio dimostrativo con Vite
npm run build:docs    # genera dist/docs
npm run build:theme   # genera theme/assets e theme/components
npm run watch:theme   # ricompila asset e componenti durante il lavoro sul tema
npm run build        # entrambe le build
```

`npm run dev` serve la documentazione. Il sito WordPress usa Apache: `http://localhost/pixelcut-wp/`. Durante il lavoro su WordPress tieni avviato `npm run watch:theme` e aggiorna la pagina del browser dopo le modifiche. Le modifiche a PHP e `theme/views` sono immediatamente disponibili grazie al collegamento di directory.

## Collegamento con XAMPP

```powershell
powershell -ExecutionPolicy Bypass -File scripts/link-theme.ps1
```

Lo script crea la junction:

```text
C:\xampp\htdocs\pixelcut-wp\wp-content\themes\pixelcut
  -> C:\Users\manuelpasini\Desktop\pixelcut\theme
```

Non copia il tema e non sovrascrive una destinazione esistente. Se sposti il progetto, il collegamento andra ricreato. La junction serve solo in locale; sull'hosting si trasferisce il contenuto completo di `theme`, dopo build e installazione delle dipendenze PHP.

## Preparazione WordPress, Timber e Carbon Fields

La struttura del tema non configura il database e non installa WordPress o plugin automaticamente.

1. Avvia Apache e MySQL nel pannello XAMPP, crea un database dedicato e completa l'installazione WordPress.
2. Installa Composer, quindi esegui `composer install --working-dir=theme`. Al primo avvio verra creato `theme/composer.lock`: va conservato in Git. Timber e una dipendenza Composer del tema, non un plugin WordPress.
3. Esegui `npm run build:theme`, collega il tema e attiva Pixelcut da Aspetto > Temi.
4. Modifica una pagina: nel pannello Componenti pagina puoi aggiungere e riordinare Text ed Editorial. Per renderla la homepage, selezionala in Impostazioni > Lettura.

Il flusso è: campo Complex di Carbon Fields della pagina -> `theme/page.php` -> `theme/views/page.twig` -> componenti Twig. La homepage passa da `theme/front-page.php` e usa gli stessi componenti.

## Git e backup

Versionare `src`, `docs`, i file sorgente del tema, script, configurazioni e lockfile. `node_modules`, `vendor`, build e strumenti temporanei sono esclusi da Git. La cartella WordPress e il database sono fuori dal repository: contenuti, caricamenti e configurazione richiedono un backup separato.

I backup precedenti in `git-recovery-*` restano separati e non partecipano alla build.
