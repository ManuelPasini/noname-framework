# Stato attuale del tema Pixelcut

Questo documento descrive il funzionamento attuale del tema WordPress e il percorso dei dati dall’amministrazione al front-end.

## 1. Vista d’insieme

Il tema usa WordPress come CMS, Carbon Fields per i contenuti strutturati, Timber per preparare il contesto e Twig per il markup finale.

~~~text
WordPress back-end
        │
        │ Carbon Fields
        ▼
metadati della pagina / opzioni del tema
        │
        │ PHP
        ▼
theme/page.php + theme/functions.php
        │
        │ contesto Timber
        ▼
theme/views/page.twig e componenti Twig
        │
        ▼
HTML del front-end
~~~

Il contenuto delle pagine non viene più gestito da ACF. La pagina contiene un campo complex chiamato pixelcut_components: ogni riga è un componente, ogni riga può avere un tipo diverso e l’ordine delle righe è quello usato nel front-end.

Attualmente sono disponibili due tipi:

~~~text
Componenti pagina
├── Text
└── Editorial
~~~

Lo stesso tipo può essere inserito più volte. Una pagina può quindi essere composta, per esempio, da:

~~~text
Text → Editorial → Text → Editorial
~~~

Il riordino avviene direttamente nel back-end tramite il campo Complex di Carbon Fields.

## 2. Cosa è stato integrato

### Carbon Fields

Carbon Fields è stato aggiunto alle dipendenze Composer del tema:

~~~json
"htmlburger/carbon-fields": "^3.6"
~~~

La dipendenza è installata in theme/vendor. Il tema usa già Composer per Timber, quindi entrambe le librerie vengono caricate dallo stesso vendor/autoload.php.

In theme/functions.php Carbon Fields viene avviato durante after_setup_theme:

~~~php
Carbon_Fields\Carbon_Fields::boot();
~~~

Il tema è collegato a WordPress tramite una junction locale. Per questo il percorso reale dei file è fuori dalla directory pubblica di WordPress e Carbon Fields non riusciva a costruire automaticamente l’URL dei propri asset. Il tema imposta quindi esplicitamente Carbon_Fields\URL. Questo permette al back-end di caricare correttamente JavaScript e CSS di Carbon Fields.

### Campo globale del sito

Il contenitore theme_options Impostazioni sito contiene il campo:

~~~text
Logo header → pixelcut_brand_image
~~~

Il campo è di tipo immagine e salva l’ID dell’allegato WordPress. L’ID viene poi trasformato in URL e testo alternativo nel filtro timber/context.

### Componenti delle pagine

Il contenitore post_meta Componenti pagina è disponibile solo per il post type page.

Il campo principale è:

~~~text
pixelcut_components (complex)
~~~

Ogni riga contiene un identificatore _type, generato da Carbon Fields, che indica il layout scelto.

Il layout text contiene:

- titolo;
- sottotitolo;
- rich text;
- allineamento;
- larghezza.

Il layout editorial contiene:

- titolo;
- testo;
- immagine;
- rapporto dell’immagine;
- disposizione immagine/testo;
- larghezza.

### Timber e Twig

Timber gestisce il caricamento dei template. I template sorgenti sono in src/components; la build li copia in theme/components, che è la directory usata dal tema in WordPress.

I template principali sono:

~~~text
src/components/text/text.twig
src/components/editorial/editorial.twig
src/components/header/header.twig
theme/views/page.twig
~~~

theme/views/page.twig non contiene più un elenco di condizioni per ogni tipo. Scorre l’array components e include il template dichiarato dal componente:

~~~twig
{% for component in components %}
  {% include component.template with { component: component.data } only %}
{% endfor %}
~~~

### Rimozione di ACF e dell’editor standard

ACF è stato disinstallato. I vecchi gruppi ACF sono stati rimossi dal repository e il codice non usa più get_field().

Per le pagine il tema nasconde anche:

- l’editor standard WordPress;
- il metabox generico “Campi personalizzati”.

Il contenuto viene quindi inserito nel pannello Carbon Fields Componenti pagina.

## 3. Il percorso tecnico di una pagina

### 3.1 Apertura della pagina

WordPress esegue theme/page.php. Il file controlla che Timber sia disponibile, crea il contesto Timber e identifica l’ID della pagina corrente:

~~~php
$id = is_front_page()
    ? (int) get_option('page_on_front')
    : get_queried_object_id();
~~~

La condizione sulla homepage è necessaria perché la homepage usa front-page.php, che poi richiama page.php.

### 3.2 Lettura dei componenti

Il valore viene letto con:

~~~php
carbon_get_post_meta($id, 'pixelcut_components')
~~~

Carbon Fields restituisce un array di righe. Una riga tipica contiene _type e i campi del layout:

~~~php
[
    '_type' => 'text',
    'title' => 'Titolo',
    'subtitle' => 'Sottotitolo',
    'rich_text' => '...',
]
~~~

page.php non passa direttamente questo formato a Twig. Lo normalizza in una struttura comune:

~~~php
[
    'type' => 'text',
    'data' => [
        'title' => 'Titolo',
        // ...
    ],
]
~~~

Questo separa il tipo del componente dai dati necessari al suo template.

### 3.3 Immagini

Carbon Fields salva l’ID dell’allegato, non l’HTML dell’immagine. page.php usa quindi wp_get_attachment_image_url() per ottenere l’URL e legge l’alt text con get_post_meta().

Il template riceve un oggetto semplice:

~~~php
'image' => [
    'src' => '...',
    'alt' => '...',
]
~~~

### 3.4 Rich text

Il rich text può arrivare già con markup HTML oppure come testo semplice. La funzione format_rich_text controlla soltanto la presenza di un tag <p>:

- se esiste già un <p>, lascia il valore invariato;
- se non esiste, applica wpautop() per creare i paragrafi.

In questo modo non vengono duplicati i paragrafi già generati dall’editor, ma anche il testo semplice viene trasformato in HTML utilizzabile dal front-end.

Il valore viene stampato con il filtro raw in Twig perché contiene HTML prodotto dall’editor. Questo punto va mantenuto sotto controllo se in futuro i valori dovessero arrivare da fonti non fidate.

### 3.5 Rendering Twig

Il template di pagina passa i dati ai componenti senza conoscere i dettagli interni di ciascun componente:

~~~twig
{% include 'text/text.twig' with { text: component.data } only %}
~~~

Il componente Text conosce solo la struttura text; il componente Editorial conosce solo la struttura editorial. Questa separazione permette di aggiungere nuovi layout senza riscrivere quelli esistenti.

## 4. Header e logo

Il filtro timber/context costruisce brand_image per ogni richiesta. Se non esiste un’immagine, brand_image.src è una stringa vuota.

Il template dell’header usa quindi un fallback:

~~~twig
{% if brand_image.src %}
  <img ...>
{% else %}
  {{ site.name }}
{% endif %}
~~~

Il link resta sempre lo stesso: cambia solo il contenuto interno, immagine oppure nome del sito.

Lo stile del logo si trova in src/components/header/header.scss e limita la larghezza massima a 12rem, mantenendo proporzioni automatiche.

## 5. Build del tema

Il front-end WordPress non legge direttamente gli SCSS sorgenti. La build produce:

~~~text
theme/assets/manifest.json
theme/assets/assets/main-*.css
theme/assets/assets/main-*.js
~~~

e copia i template Twig da src/components a theme/components.

Il comando principale è:

~~~powershell
npm.cmd run build:theme
~~~

Su PowerShell npm.cmd evita il blocco dell’Execution Policy che può verificarsi con npm.ps1.

Durante lo sviluppo si può usare:

~~~powershell
npm.cmd run watch:theme
~~~

Il tema legge theme/assets/manifest.json in functions.php e carica i file CSS e JavaScript indicati dal manifest. Per questo, dopo una modifica agli SCSS, è necessario eseguire la build o lasciare attivo il watcher.

## 6. Come aggiungere un nuovo componente

Per aggiungere, ad esempio, una Gallery:

1. definire un nuovo gruppo gallery nel campo pixelcut_components in theme/functions.php;
2. aggiungere i suoi campi Carbon Fields, per esempio un campo Complex interno con immagini ripetibili;
3. creare src/components/gallery/gallery.twig;
4. aggiungere un ramo elseif component.type == 'gallery' in theme/views/page.twig;
5. preparare in page.php la normalizzazione dei dati Gallery;
6. eseguire npm.cmd run build:theme per copiare il Twig nel tema;
7. salvare una pagina e verificare il risultato nel front-end.

Il ciclo di Twig è già predisposto per più istanze e per l’ordine arbitrario. Ogni nuovo componente deve dichiarare il proprio layout, la propria normalizzazione PHP e il proprio template; non è più necessario aggiungere un nuovo ramo in page.twig.

## 7. File principali da conoscere

~~~text
theme/composer.json       dipendenze PHP: Timber e Carbon Fields
theme/functions.php       bootstrap, campi Carbon Fields, contesto Timber
theme/page.php            lettura e normalizzazione dei componenti
theme/front-page.php      riuso del template per la homepage
theme/views/page.twig     ciclo di rendering dei componenti
src/components/           sorgenti Twig e SCSS dei componenti
theme/components/         copie Twig generate dalla build
theme/assets/             CSS, JavaScript e manifest generati
vite.theme.config.js      configurazione della build del tema
~~~

Le directory theme/components e theme/assets sono generate. Le modifiche permanenti ai componenti vanno fatte in src/components, poi propagate con la build.

## 8. Stato e limiti attuali

Il sistema attuale gestisce già:

- più componenti nella stessa pagina;
- più istanze dello stesso tipo;
- ordine libero tramite drag & drop;
- immagini Editorial;
- rich text con paragrafi;
- logo globale dell’header con fallback testuale.

Non sono ancora stati aggiunti:

- Gallery;
- Video;
- condizioni di visibilità per componente;
- anteprima personalizzata dei layout nel pannello;
- migrazione dei vecchi contenuti ACF, che non era necessaria per il progetto sperimentale.
