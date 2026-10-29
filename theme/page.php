<?php
defined('ABSPATH') || exit;
pixelcut_require_timber();

$context = Timber\Timber::context();
$context['post'] = Timber\Timber::get_post();
$id = is_front_page() ? (int) get_option('page_on_front') : get_queried_object_id();

$image_data = static function (int $image_id): array {
    return [
        'src' => $image_id ? (wp_get_attachment_image_url($image_id, 'large') ?: '') : '',
        'alt' => $image_id ? (string) get_post_meta($image_id, '_wp_attachment_image_alt', true) : '',
    ];
};

$format_rich_text = static function ($value): string {
    $value = trim((string) $value);
    if ($value === '' || preg_match('/<p\b[^>]*>/i', $value)) {
        return $value;
    }

    return wpautop($value);
};

$components = [];
$rows = function_exists('carbon_get_post_meta')
    ? carbon_get_post_meta($id, 'pixelcut_components')
    : [];

foreach (is_array($rows) ? $rows : [] as $row) {
    $type = $row['_type'] ?? '';

    if ($type === 'text') {
        $components[] = [
            'type' => 'text',
            'template' => 'text/text.twig',
            'data' => [
                'width' => in_array($row['width'] ?? '', ['content-width-full', 'content-width-8'], true) ? $row['width'] : 'content-width-full',
                'alignment' => in_array($row['alignment'] ?? '', ['left', 'center', 'right'], true) ? $row['alignment'] : 'left',
                'title' => (string) ($row['title'] ?? ''),
                'subtitle' => (string) ($row['subtitle'] ?? ''),
                'rich_text' => $format_rich_text($row['rich_text'] ?? ''),
            ],
        ];
    }

    if ($type === 'editorial') {
        $image_id = (int) ($row['image'] ?? 0);
        $components[] = [
            'type' => 'editorial',
            'template' => 'editorial/editorial.twig',
            'data' => [
                'width' => in_array($row['width'] ?? '', ['content-width-full', 'content-width-8'], true) ? $row['width'] : 'content-width-full',
                'title' => (string) ($row['title'] ?? ''),
                'text' => (string) ($row['text'] ?? ''),
                'layout' => ($row['layout'] ?? '') === 'text-image' ? 'text-image' : 'image-text',
                'ratio' => in_array($row['ratio'] ?? '', ['ratio-1-1', 'ratio-4-3', 'ratio-3-2', 'ratio-16-9', 'ratio-21-9', 'ratio-4-5', 'ratio-3-4', 'ratio-9-16'], true) ? $row['ratio'] : 'ratio-16-9',
                'image' => $image_data($image_id),
            ],
        ];
    }
}

$context['components'] = $components;
Timber\Timber::render('page.twig', $context);
