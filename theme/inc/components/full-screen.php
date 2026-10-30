<?php

$text = require __DIR__ . '/text.php';

return [
    'label' => 'Full screen',
    'section_class' => 'full-screen w-full relative h-screen flex justify-center align-center overflow-hidden',
    'full_bleed' => true,
    'fields' => array_merge(
        [
            \Carbon_Fields\Field::make('image', 'background_image', 'Immagine di sfondo')
                ->set_value_type('id'),
        ],
        $text['fields']
    ),
    'normalize' => static function (array $data) use ($text): array {
        $image_id = (int) ($data['background_image'] ?? 0);

        $text_data = $text['normalize']($data);
        $text_data['embedded'] = true;

        return [
            'background_image' => [
                'src' => $image_id ? (wp_get_attachment_image_url($image_id, 'full') ?: '') : '',
            ],
            'text' => $text_data,
        ];
    },
];
