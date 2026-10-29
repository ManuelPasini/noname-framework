# Editorial

Componente Twig composto con le utility del framework. Esempi nella pagina principale della documentazione. `editorial.scss` resta importato ma contiene solo un commento: e riservato alle personalizzazioni.

```twig
{% include '../../src/components/editorial/editorial.twig' with {
  editorial: {
    layout: 'image-text',
    title: 'Titolo del contenuto',
    text: 'Testo del contenuto',
    ratio: 'ratio-16-9',
    image: { src: '/images/gallery-91.jpg', alt: 'Descrizione della fotografia' }
  }
} only %}
```

- `image-text`: immagine prima del testo.
- `text-image`: testo prima dell'immagine.
- Da 768px: due colonne uguali, allineate al centro verticalmente.
- Su mobile: una colonna, nello stesso ordine del markup.
- Il testo è semplice, con ritorni a capo conservati; l'HTML viene escapato.
- Le immagini sono ritagliate a 16:9 e caricate con lazy loading: questo componente è pensato per sezioni sotto la prima schermata.

L'esempio parte da `docs/templates`. Nel tema Timber l'include è `editorial/editorial.twig`: la build copia il componente in `theme/components`, e `theme/page.php` passa i dati ACF nell'oggetto `editorial`. Modifica soltanto il sorgente in `src/components`.

Utility utilizzate:

- Griglia: `grid grid-cols-1 grid-cols-md-2 align-center`.
- Spazi: `gap-lg my-xl`, `m-0 mb-md` sul titolo e `m-0` sul testo.
- Tipografia: `text-2xl weight-700` sul titolo, `text-md` sul testo.
- Immagini: `media ratio-16-9 overflow-hidden` e `object-cover`.
- Ratio: il campo ACF `editorial_ratio` accetta `ratio-1-1`, `ratio-4-3`, `ratio-3-2`, `ratio-16-9`, `ratio-21-9`, `ratio-4-5`, `ratio-3-4` e `ratio-9-16`.
- Contenuto: `min-w-0`.

Le classi `editorial` e `editorial__*` sono agganci per future personalizzazioni, senza regole proprie. L'ordine viene gestito dal markup Twig.
