<?php
defined('ABSPATH') || exit;
pixelcut_require_timber();

$context = Timber\Timber::context();
$context['post'] = Timber\Timber::get_post();
$id = is_front_page() ? (int) get_option('page_on_front') : get_queried_object_id();
$registry = require __DIR__ . '/inc/components.php';

$components = [];
$rows = function_exists('carbon_get_post_meta')
    ? carbon_get_post_meta($id, 'pixelcut_components')
    : [];

foreach (is_array($rows) ? $rows : [] as $row) {
    $type = $row['_type'] ?? '';
    $definition = $registry[$type] ?? null;

    if (!$definition || !is_callable($definition['normalize'] ?? null)) {
        continue;
    }

    $components[] = [
        'type' => $type,
        'template' => $definition['template'],
        'full_bleed' => $definition['full_bleed'] ?? false,
        'data' => $definition['normalize']($row),
    ];
}

$context['components'] = $components;
Timber\Timber::render('page.twig', $context);
