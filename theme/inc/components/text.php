<?php

return [
    'section_class' => 'text-component',
    'fields' => [
        \Carbon_Fields\Field::make('select', 'width', 'Larghezza')
            ->add_options([
                'content-width-full' => 'Completa',
                'content-width-8' => 'Ridotta',
            ])
            ->set_default_value('content-width-full'),
        \Carbon_Fields\Field::make('select', 'alignment', 'Allineamento')
            ->add_options([
                'left' => 'Sinistra',
                'center' => 'Centro',
                'right' => 'Destra',
            ])
            ->set_default_value('left'),
        \Carbon_Fields\Field::make('text', 'title', 'Titolo'),
        \Carbon_Fields\Field::make('text', 'subtitle', 'Sottotitolo'),
        \Carbon_Fields\Field::make('rich_text', 'rich_text', 'Testo'),
    ],
    'normalize' => static function (array $data): array {
        $rich_text = trim((string) ($data['rich_text'] ?? ''));
        if ($rich_text !== '' && !preg_match('/<p\b[^>]*>/i', $rich_text)) {
            $rich_text = wpautop($rich_text);
        }

        return [
            'width' => in_array($data['width'] ?? '', ['content-width-full', 'content-width-8'], true)
                ? $data['width']
                : 'content-width-full',
            'alignment' => in_array($data['alignment'] ?? '', ['left', 'center', 'right'], true)
                ? $data['alignment']
                : 'left',
            'title' => (string) ($data['title'] ?? ''),
            'subtitle' => (string) ($data['subtitle'] ?? ''),
            'rich_text' => $rich_text,
        ];
    },
];
