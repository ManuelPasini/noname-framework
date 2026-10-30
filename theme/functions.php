<?php
defined('ABSPATH') || exit;

$autoload = __DIR__ . '/vendor/autoload.php';
if (is_file($autoload)) {
    require_once $autoload;
    Timber\Timber::init();
    Timber\Timber::$dirname = ['views', 'components'];
}

add_action('after_setup_theme', function () {
    if (class_exists('Carbon_Fields\\Carbon_Fields')) {
        if (!defined('Carbon_Fields\\URL')) {
            define('Carbon_Fields\\URL', get_template_directory_uri() . '/vendor/htmlburger/carbon-fields');
        }
        Carbon_Fields\Carbon_Fields::boot();
    }

    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', ['search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script']);
    register_nav_menus([
        'primary' => 'Menu principale',
    ]);
});

add_action('carbon_fields_register_fields', function () {
    $registry = require __DIR__ . '/inc/components.php';

    \Carbon_Fields\Container::make('theme_options', 'Impostazioni sito')
        ->add_fields([
            \Carbon_Fields\Field::make('image', 'pixelcut_brand_image', 'Logo header')
                ->set_value_type('id'),
        ]);

    $components_field = \Carbon_Fields\Field::make('complex', 'pixelcut_components', 'Componenti')
        ->set_layout('grid')
        ->set_collapsed(true);

    foreach ($registry as $type => $definition) {
        $components_field->add_fields(
            $type,
            $definition['label'] ?? ucfirst($type),
            $definition['fields']
        );
    }

    \Carbon_Fields\Container::make('post_meta', 'Componenti pagina')
        ->where('post_type', '=', 'page')
        ->add_fields([$components_field]);
});

add_filter('timber/context', function (array $context): array {
    $context['primary_menu'] = Timber\Timber::get_menu('primary');

    $brand_image_id = function_exists('carbon_get_theme_option')
        ? (int) carbon_get_theme_option('pixelcut_brand_image')
        : 0;
    $context['brand_image'] = [
        'src' => $brand_image_id ? (wp_get_attachment_image_url($brand_image_id, 'full') ?: '') : '',
        'alt' => $brand_image_id ? (string) get_post_meta($brand_image_id, '_wp_attachment_image_alt', true) : '',
    ];

    return $context;
});

add_action('init', function () {
    // Il contenuto delle pagine viene gestito da Carbon Fields e dai template Timber.
    remove_post_type_support('page', 'editor');
    remove_post_type_support('page', 'custom-fields');
});

add_action('wp_enqueue_scripts', function () {
    $manifest_file = __DIR__ . '/assets/manifest.json';
    if (!is_file($manifest_file)) return;
    $manifest = json_decode(file_get_contents($manifest_file), true);
    $entry = $manifest['src/js/main.js'] ?? null;
    if (!$entry) return;
    $base = get_template_directory_uri() . '/assets/';
    foreach ($entry['css'] ?? [] as $index => $css) {
        wp_enqueue_style('pixelcut-' . $index, $base . $css, [], null);
    }
    wp_enqueue_style('pixelcut-fonts', 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap', [], null);
    wp_enqueue_script_module('pixelcut', $base . $entry['file'], [], null);
});

function pixelcut_require_timber(): void {
    if (!class_exists('Timber\\Timber')) {
        wp_die('Installa le dipendenze Composer del tema Pixelcut.', 'Pixelcut', ['response' => 503]);
    }
}
