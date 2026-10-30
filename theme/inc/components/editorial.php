<?php

return [
    'fields' => [
        \Carbon_Fields\Field::make('text', 'title', 'Titolo'),
        \Carbon_Fields\Field::make('textarea', 'text', 'Testo'),
        \Carbon_Fields\Field::make('image', 'image', 'Immagine')
            ->set_value_type('id'),
        \Carbon_Fields\Field::make('select', 'layout', 'Layout')
            ->add_options([
                'image-text' => 'Immagine / testo',
                'text-image' => 'Testo / immagine',
            ])
            ->set_default_value('image-text'),
        \Carbon_Fields\Field::make('select', 'ratio', 'Rapporto immagine')
            ->add_options([
                'ratio-1-1' => '1:1',
                'ratio-4-3' => '4:3',
                'ratio-3-2' => '3:2',
                'ratio-16-9' => '16:9',
                'ratio-21-9' => '21:9',
                'ratio-4-5' => '4:5',
                'ratio-3-4' => '3:4',
                'ratio-9-16' => '9:16',
            ])
            ->set_default_value('ratio-16-9'),
        \Carbon_Fields\Field::make('select', 'width', 'Larghezza')
            ->add_options([
                'content-width-full' => 'Completa',
                'content-width-8' => 'Ridotta',
            ])
            ->set_default_value('content-width-full'),
    ],
    'normalize' => static function (array $data): array {
        $image_id = (int) ($data['image'] ?? 0);

        return [
            'title' => (string) ($data['title'] ?? ''),
            'text' => (string) ($data['text'] ?? ''),
            'layout' => ($data['layout'] ?? '') === 'text-image' ? 'text-image' : 'image-text',
            'ratio' => in_array($data['ratio'] ?? '', [
                'ratio-1-1', 'ratio-4-3', 'ratio-3-2', 'ratio-16-9',
                'ratio-21-9', 'ratio-4-5', 'ratio-3-4', 'ratio-9-16',
            ], true) ? $data['ratio'] : 'ratio-16-9',
            'width' => in_array($data['width'] ?? '', ['content-width-full', 'content-width-8'], true)
                ? $data['width']
                : 'content-width-full',
            'image' => [
                'src' => $image_id ? (wp_get_attachment_image_url($image_id, 'large') ?: '') : '',
                'alt' => $image_id ? (string) get_post_meta($image_id, '_wp_attachment_image_alt', true) : '',
            ],
        ];
    },
];
