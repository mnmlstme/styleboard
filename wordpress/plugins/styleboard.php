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

   [styleboard button]
   [styleboard pattern=button]

   [styleboard button mode=link]
   [styleboard button mode=link text="This is a Button"]

   [styleboard_link button]This is a <strong>Button</strong>[/styleboard_link]

*/

add_shortcode("styleboard", "styleboard_handler");
add_shortcode("styleboard_link", "styleboard_link_handler");

function styleboard_handler( $atts ) {
    if ( !$atts['mode'] ) {
        $atts['mode'] = 'embed';
    }

    return $atts['mode'] === 'embed' ?
        styleboard_embed_handler( $atts ) :
        styleboard_link_handler( $atts, $atts['text'] );
}

function styleboard_embed_handler( $atts ) {
    $width = $atts['width'] ? $atts['width'] : "100%";
    $height = $atts['height'] ? $atts['height'] : "300";

    return  '<iframe src="' . styleboard_url($atts) . '"' .
        ' style="width:' . $width . ';height:' . $height . 'px"' .
        '></iframe>';
}

function styleboard_link_handler( $atts, $content ) {
    if ( !$content ) {
        $pattern = styleboard_pattern($atts);
        $content =  $pattern ? $pattern : 'Styleboard';
    }

    return '<a href="' . styleboard_url($atts) . '">' . $content . '</a>';
}

function styleboard_pattern( $atts ) {
    return $atts['pattern'] ? $atts['pattern'] : $atts[0];
}

function styleboard_url( $atts ) {
    $url = '/styleboard/';
    $pattern = styleboard_pattern($atts);

    if ( $atts['mode'] === 'embed' ) {
        $url = $url . 'embed.html';
    }

    if ( $pattern ) {
        $url = $url . '#' . $pattern;
    }

    return $url;
}

?>
