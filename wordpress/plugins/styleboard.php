<?php
/*
Plugin Name: Styleboard
Plugin URI: http://mnmlst.me/styleboard-plugin
Description: Embed Styleboard iframes and links into WP
Version: 0.1
Author: Ken Kubiak
Author URI: http://mnmlst.me
*/

/* Copyright - see LICENSE file in root of repo */

/* Shortcode syntax:

   [styleboard pattern="button"]
   [styleboard link pattern="button"]
   [styleboard link pattern="button" text="This is a Button"]
   [styleboard_link pattern="button"]This is a <strong>Button</strong>[/styleboard_link]

   [styleboard embed pattern="button"]

*/

add_shortcode("styleboard", "styleboard_handler");
add_shortcode("styleboard_link", "styleboard_link_handler");

function styleboard_handler( $atts ) {
    return styleboard_link_handler( $atts, $atts['text'] );
}

function styleboard_link_handler( $atts, $text ) {
    $url = '/styleboard/';

    $mode = $atts[1];
    $mode = $mode ? $mode : 'link';

    $pattern = $atts['pattern'];

    if( $pattern ) {
        $url = $url . '#' . $pattern;
        $text = $text ? $text : $pattern;
    }

    $text = $text ? $text : 'Styleboard';

    $html_output = '<a href="' . $url . '">' . $text . '</a>';

    return $html_output;
}

?>
