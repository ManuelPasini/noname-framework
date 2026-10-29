<?php
defined('ABSPATH') || exit;
pixelcut_require_timber();
$context = Timber\Timber::context();
$context['posts'] = Timber\Timber::get_posts();
Timber\Timber::render('index.twig', $context);
