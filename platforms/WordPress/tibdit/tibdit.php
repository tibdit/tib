<?php
bd_log("#BOF");

/*
 * Plugin Name: tibit
 * Plugin URI: http://www.tibdit.com
 * Description: Collect tibs from readers.
 * Version: 1.4.4
 * Author: Justin Maxwell / Jim Smith / Laxyo Solution Softs Pvt Ltd.
 * Author URI:
 * Text Domain: tibit
 * Domain Path:
 * License: GPL3
 */

/*  Copyright (C) 2014 tibdit limited

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    See <http://www.gnu.org/licenses/> for the full text of the
    GNU General Public License.
*/

define( 'TIBDIT_VERSION', '1.4.4' );
define( 'TIBDIT_RELEASE_DATE', date_i18n( 'F j, Y', '1397937230' ) );
define( 'TIBDIT_DIR', plugin_dir_path( __FILE__ ) );
define( 'TIBDIT_URL', plugin_dir_url( __FILE__ ) );

$default_settings = array
(
    'payaddr' => '',
    'title' => 'tibit',
    'intro' => 'Please drop a microdonation in my tibjar',
    'acktime' => 3,
    'bd_base_colour' => 'rgb(79, 168, 58)',
    'bd_colour_two' => 'rgb(79, 168, 58)',
    'bd_button' => "BubbleButton",
    'bd_button_scale' => 1
);


register_activation_hook( __FILE__, 'activate' );

/**
 * Plugin Activation hook function to check for Minimum PHP and WordPress versions
 * @param string $wp Minimum version of WordPress required for this plugin
 * @param string $php Minimum version of PHP required for this plugin
 */
function activate() {


    $wp = '3.3'; $php = '5.2.6';
    global $wp_version;

    if ( version_compare( PHP_VERSION, $php, '<' ) )
        $flag = 'PHP';
    elseif
    ( version_compare( $wp_version, $wp, '<' ) )
        $flag = 'WordPress';
    else
        return;
    $version = 'PHP' == $flag ? $php : $wp;
    deactivate_plugins( basename( __FILE__ ) );
    wp_die('<p>The <strong>tibit</strong> plugin requires '.$flag.'  version '.$version.' or greater.</p>','Plugin Activation Error',  array( 'response'=>200, 'back_link'=>TRUE ) );
}


if (!function_exists('is_admin'))
{
    bd_log("not admin");
    header('Status: 403 Forbidden');
    header('HTTP/1.1 403 Forbidden');
    exit();
}


// include 'ChromePhp.php';
include_once('helper-functions.php');
$plugurl = plugin_dir_url( __FILE__ );
$image_resource_url = $plugurl."resources".DIRECTORY_SEPARATOR."images";
$stylesheet_resource_url = $plugurl."resources".DIRECTORY_SEPARATOR."styles";
$javascript_resource_url = $plugurl."resources".DIRECTORY_SEPARATOR."javascripts";

/**
 * Register the javascripts files which can be used at a later time
 *
 * filetype is used to ensure that the latest version of the file is used
 * regardless of caching.
 *
 * @param $name the name of the javascript filename
 * @param bool|false $in_footer the files would be added to the header only
 * @param array $deps can be used if a particular script is depended on another script.
 */

function bd_register_script( $name, $in_footer=false, $deps=array())
{
    global $javascript_resource_url;
    $filename= plugin_dir_path( __FILE__ )."resources/javascripts/".$name.'.js';
    $fileurl= $javascript_resource_url.DIRECTORY_SEPARATOR.$name.'.js';
    wp_register_script( 'bd-'.$name, $fileurl, $deps, filemtime( $filename ), $in_footer);
    ## log this fully to find out why --bottom.js not queued at end
    bd_log( $fileurl);
}


/**
 * Register a CSS style file for later use with wp_enqueue_style().
 *
 * @param $name the name of the style sheet
 * @param array $deps if this stylesheet is dependent on another stylesheet
 */
function bd_register_style( $name, $deps=array())
{
    global $stylesheet_resource_url;
    $filename= plugin_dir_path( __FILE__ )."resources/styles/".$name.'.css';
    $fileurl= $stylesheet_resource_url.DIRECTORY_SEPARATOR.$name.'.css';
    wp_register_style( 'bd-'.$name, $fileurl, $deps, filemtime( $filename ));
    bd_log( $fileurl);
}

function bd_get_tib_token()    // On page load (wp_head) check for tib token (ie page load is tibdit callback)
{

    if ( get_query_var( 'tibdit' ) ){
        $token = get_query_var( 'tibdit' );
    } else if (get_query_var( 'tibtok' )){
        $token = get_query_var( 'tibtok' );
    } else {
        $token = 1;
    }

    if($token != 1)  // if a token is found, assume this page is loading in the tibdit popup window
    {
        // Break apart the proof-of-tib token
        $token = base64_decode($token);
        parse_str($token, $token_content);
        extract($token_content, EXTR_OVERWRITE);
        // This is here to reflect changes made to the tib-token.
        $payaddr= $PAD;
        $subref= $SUB;
        $tibcount= $QTY;
        // Determine cookie lifetime
        $options = get_option('tibdit_options');
        $acktime = $options['acktime'] ; // 1 - 30  // minutes or days
        if (substr($payaddr, 0, 1) == '1' || substr($payaddr, 0, 1) == '3' )  // mainnet - not testmode
            $acktime = $acktime * 60 * 24 ; // minutes per day

        // insert page load javascript to set user cookie for subref, and close
        echo "<script> bd_plugin_setCookie($acktime,'$subref'); x=window.open('','_self'); x.close(); </script>";

        bd_log("bd_get_tib_token(): token " . var_export($token, true));

        // bd_log("callback: " . $SERVER["REQ"]);

        if (substr($subref, 0, 3) != "WP_")
            bd_log( "bd_get_tib_token() - not a WP_ subref! #$subref %$tibcount");  // need to force WP_ for widget
        elseif ($subref == "WP_SITE")    // [TIB_SITE]
        {
            bd_log("bd_get_tib_token() - site tibbed #$subref %$tibcount");
            update_option("tib_count_".$subref, $tibcount);
        }
        elseif (substr($subref, 3,3) == "ID_" && intval(substr($subref, 6)) > 0)  // [TIB_POST]
        {
            bd_log("bd_get_tib_token() - post tibbed #$subref %$tibcount");
            update_post_meta(intval(substr($subref, 6)), "tib_count", $tibcount);
            bd_log(get_post_meta( intval(substr($subref, 6)), "tib_count", true ));
        }
        else        // WIDGET - arbitrary subref
        {
            bd_log( "bd_get_tib_token() - Couldn't parse WP_ token  #$subref %$tibcount ~".substr($subref, 6));
            update_option("tib_count_".$subref, $tibcount);
        }
    }
    else
    {
        bd_log("bd_get_tib_token() - no tib token");
        return false;
    }
}




if (!class_exists("tibditWidget"))
{
    bd_log( "no tibditWidget:: class exists");

    class tibditWidget extends WP_Widget {
        var $hastibbed = false;
        var $settings, $options_page;

        function __construct()
        {
            bd_log("tibditWidget:: __construct");
            $this->settings_field = 'tibdit_options';

            parent::__construct( 'tibdit_widget', 'tibit', array( 'description' => __( 'Collect tibs from readers', 'tibit' )));

            if (is_admin())
            {
                bd_log("tibditWidget:: __construct admin");
                // Load example settings page
                if (!class_exists("tibdit_settings")) {
                    bd_log("before include $TIBDIT_DIR");
                    include(TIBDIT_DIR . 'tibdit-settings.php');
                    bd_log("AFTER INCL");
                }
                bd_log("after ! class exists");
                $this->settings = new tibdit_settings();
                bd_log("after new");
            }

            include(TIBDIT_DIR . 'AddressValidator.php');

            add_action('init', array($this,'init') );
            add_action('admin_init', array($this,'admin_init') );
            // add_action('admin_menu', array($this,'add_admin_menu') );
            add_action('wp_head', 'bd_get_tib_token');
            add_action('wp_enqueue_scripts', array($this,'tibdit_plugin_enqueue') );
            add_filter('query_vars', array($this,'add_query_vars_filter') );

            add_shortcode('tib_site', array($this,'tib_site_func') );
            add_shortcode('tib_post', array($this,'tib_post_func') );
            add_shortcode('tib_inline', array($this,'tib_inline_func') );

            // add_filter('the_content', "$this::that", 1);

            // register_activation_hook( __FILE__, array($this,'activate') );
            // register_deactivation_hook( __FILE__, array($this,'deactivate') );
        }
        function init() {

            $options = get_site_option('tibdit_options');
//          getting the array of current options from wordpress and saving to $options
            bd_log('init: ' . var_export($options, true));

            bd_log('init: default settings are: ' . var_export($GLOBALS["default_settings"], true));

            if(!isset($options['last_known_version'])){
//          if there is no value for last_known_version, set it to the constant specified when the plugin runs,
//          and then fill out $options with defaults
                bd_log('init: no version found on record (first load?)');
                $options['last_known_version'] = TIBDIT_VERSION;
                $options = wp_parse_args($options, $GLOBALS["default_settings"]);
            }

            if(version_compare($options['last_known_version'], TIBDIT_VERSION, "<")){
//          if the current version is more recent than the version on record, check the options against defaults
//          to ensure each field has values
                bd_log('init: this version (' . TIBDIT_VERSION . ') is newer than the one on record (' .
                    $options['last_known_version'] . ')');
                $options['last_known_version'] = TIBDIT_VERSION;
                $options = wp_parse_args($options, $GLOBALS["default_settings"]);
            }

            update_option('tibdit_options', $options);
        }
        function admin_init() {}

        // function add_admin_menu()
        // {
        // 	add_menu_page( 'tib config', 'tibdit', 'administrator', 'tibdit', 'admin_page', plugin_dir_url( __FILE__ ).'admin_icon.png' );
        // }


        function add_query_vars_filter( $vars )           // For query variable
        {
            bd_log("tibditWidget::add_query_vars_filter()");
            $vars[] = "tibdit";
            return $vars;
        }


        function tibdit_plugin()
        {
            bd_log("tibditWidget::tibdit_plugin()");
            parent::WP_Widget(false, $name = 'tibdit_widget');
        }


        function form($instance)    // widget form creation
        {
//             echo "top of the form to ya";

            $options = get_option( $this->settings_field );
            bd_log("tibditWidget::form()");
            if( $instance)          // Check values
            {
                bd_log("form() has instance " . var_export($instance, true));
            }
            else
            {
                bd_log( "form() no instance - options " . var_export($instance, true));
                $instance = wp_parse_args($instance, get_option('tibdit_options'));
                $instance['subref'] = "WP_Widget";
                $instance['colour'] = "#D09B79";
                bd_log("form() no instance - defaults set " . var_export($instance, true));   //default content for widget settings on Apearance/Widget page
            }

            $setting = array
            (
                "title" => "Heading",
                "intro" => "Intro text",
                "subref" => "Subreference",
                "colour" => "Background shading"
            );


            foreach ($setting as $key => $label)
            {
                $item = array
                (
                    "ckey" => $key,
                    "label" => _e($label, 'tibdit'),
                    "fname" => $this->get_field_name($key),
                    "fid" => $this->get_field_id($key),
                    "value" => esc_textarea($instance[$key])
                );
                echo "<p><label for=$item[fid]>$item[label]</label>";
                echo "<input type=text id='$item[fid]' name='$item[fname]' value='$item[value]'";
                switch ($key)
                {
                    case 'title':
                    case 'intro':
                    case 'subref':
                        echo " >";
                        break;
                    case 'colour':
                        echo " class='bd bd-colourp' data-default-color='$item[value]' >";
                        break;
                }
                echo "</p>";
            }
        }



        function update($new_instance, $old_instance)
        {

            static $default_settings = array(
                'title' => 'tibit',
                'intro' => 'Please drop a microdonation in my tibjar',
                'subref' => 'WP_widget_something',
                'colour' => '#D09B79',
                'scale' => '100'
            );

            $options = get_option( $this->settings_field );

            bd_log( "tibditWidget::update() old instance:" . var_export($old_instance, true));
            bd_log( "tibditWidget::update() new instance :" . var_export($new_instance, true));
            $instance = array();

            if ($new_instance['title'])
            {
                bd_log("update() has title");
                $instance['title'] = strip_tags($new_instance['title']);
                $instance['title'] = preg_replace_callback("/([Tt][iI][bB])([^ACE-Zace-z][\w]*|$)/", array($this, 'tibtolower'), $new_instance['title']);
            }
            elseif ($options['title'])
            {
                bd_log("update() no title but option title found");
                $instance['title'] = $options['title'];
            }
            else
            {
                bd_log("update() no title using default");
                $instance['title'] = $default_settings['title'];
            }

            if ($new_instance['intro'])
            {
                $instance['intro'] = strip_tags($new_instance['intro']);
                $instance['intro'] = preg_replace_callback("/([Tt][iI][bB])([^ACE-Zace-z][\w]*|$)/", array($this, 'tibtolower'), $new_instance['intro']);
            }
            elseif ($options['intro'])
                $instance['intro'] = $options['intro'];
            else
                $instance['intro'] = $default_settings['intro'];

            if ($new_instance['colour'])
                $instance['colour'] = strip_tags($new_instance['colour']);
            elseif ($options['colour'])
                $instance['colour'] = $options['colour'];
            else
                $instance['colour'] = $default_settings['colour'];

            if($new_instance['scale']){
//          if a new value for scale is fed into the update function, update $instance to reflect this
                $instance['scale'] = $new_instance['scale'];
            }
            elseif ($options['scale']){
//          If there is no new value, but there is a pre-set value in the options, feed this value to $instance
                $instance['scale'] = $options['scale'];
            }
            else{
//            if there is no new value, and no pre-set value, fall back to the default value
                $instance['scale'] = $default_settings['scale'];
            }


            // $instance['payaddr'] = strip_tags($new_instance['payaddr']);
            $instance['payaddr'] = $options['payaddr'];
            $instance['subref'] = strip_tags($new_instance['subref']);

            bd_log( "tibditWidget::update() end instance" . var_export($instance, true));

            return $instance;
        }

        function tibtolower($matches)
        {
            return strtolower($matches[0]);
        }

        function widget($args, $instance) // non shortcode widget output
        {
            $options = get_option( $this->settings_field );

            bd_log( "widget() dump args: " . var_export($args, true));
            bd_log( "widget() dump instance: " . var_export($instance, true));
            bd_log( "widget() dump options: " . var_export($options, true));
            extract( $instance );
//            $payaddr = $PAD;
//            $subref = $SUB;
//            $count = $QTY;


            $plugurl = plugin_dir_url( __FILE__ );

            $hex = $instance['colour'];
            $hex = str_replace("#", "", $hex);
            if(strlen($hex) == 3) {
                $r = hexdec(substr($hex,0,1).substr($hex,0,1));
                $g = hexdec(substr($hex,1,1).substr($hex,1,1));
                $b = hexdec(substr($hex,2,1).substr($hex,2,1));
            } else {
                $r = hexdec(substr($hex,0,2));
                $g = hexdec(substr($hex,2,2));
                $b = hexdec(substr($hex,4,2));
            }

            echo $args['before_widget']."<div class='bd widget' style='background-color: rgba($r, $g, $b, 0.2);'>";
            // echo  "<img class='beta' src='$plugurl/beta-35px.png' alt='beta'/>";


            if (!$title) $title = "tibit";
            echo $args['before_title'] . apply_filters('widget_title', $title) . $args['after_title'];

            if ($intro)
                echo "<p class='wp_widget_plugin_textarea'>$intro</p>";

            // $add_option("tib_count_".$subref,"","","");
            $count = get_option("tib_count_".$instance['subref'], 0);
            bd_log("widget() option " . ".tib_count_".$instance['subref']);
            echo tib_button( $options['payaddr'], $subref, $count, null);

            bd_log("widget() @$payaddr #$subref %$count");

            echo "</div>".$args['after_widget'];
        }

        function tib_site_func( $atts, $content=null )
        {

            $options= get_option('tibdit_options');
            $instance = shortcode_atts( array
            (
                "title" => $options['title'],
                "intro" => $options['intro'],
                "payaddr" => $options['payaddr'],
                "subref" => "WP_SITE"
            ), $atts, "tib");


            $option= "tib_count_".$instance[subref];

            add_option($option,"","","");

            $count = get_option("tib_count_".$instance['subref'], 0);

            $html.='<div class="widget-text wp_widget_plugin_box;">';
            $html.='<p class="wp_widget_plugin_textarea">';
            $html.='</p>';

            bd_log( "tib_site_func() dump atts: " . var_export($atts, true));
            bd_log( "tib_site_func() dump instance: " . var_export($instance, true));
            bd_log( "tib_site_func() @$instance[payaddr] #$instance[subref] %$count");

            if (is_null($content) or $content=="")
            {
                bd_log( "tib_site_func() $subref NULL content [[$content]]". var_export($content, true));
                $html = tib_button( $instance['payaddr'], $instance['subref'], $count, null);
            }
            elseif (isset($_COOKIE["tibbed_$instance[subref]"]))
            {
                bd_log( "tib_site_func() $subref TIBBED content [[$content]]");
                $html.=$content;
                $html.=tib_button( $instance['payaddr'], $instance['subref'], $count, null);
            }
            else
            {
                bd_log( "tib_site_func() $subref HIDDEN content ");
                $appearance= array('readmore' => true);
                $html.=tib_button( $instance['payaddr'], $instance['subref'], $count, $appearance);
            }

            return $html;
        }


        function tib_post_func( $atts, $content=null )
        {
            $html="";
            $options= get_option('tibdit_options');
            $instance = shortcode_atts( array
            (
                'title' => "",
                'intro' => "",
                'payaddr' => $options['payaddr'],
                'subref' => "WP_ID_".get_the_ID(),
            ), $atts, "tib");

            $count = get_post_meta( get_the_ID(), "tib_count", true );

            bd_log( "tib_post_func() dump atts: " . var_export($atts, true));
            bd_log( "tib_post_func() dump instance: " . var_export($instance, true));
            bd_log( "tib_post_func() @$instance[payaddr] #$instance[subref] %$count *".isset($_COOKIE["tibbed_$instance[subref]"]));
            // bd_log( "tib_post_func() NULL: " . is_null($content) . "<br>[[$content]]");

            // the_widget('tibditWidget');

            if (is_null($content) or $content=="")
            {
                bd_log( "tib_post_func() #$instance[subref] NULL content [[$content]]". var_export($content, true));
                $html = tib_button( $instance['payaddr'], $instance['subref'], $count, null);
            }
            elseif (isset($_COOKIE["tibbed_$instance[subref]"]))
            {
                bd_log( "tib_post_func() #$instance[subref] TIBBED content [[$content]]");
                $html=$content;
                $html.=tib_button( $instance['payaddr'], $instance['subref'], $count, null);
            }
            else
            {
                bd_log( "tib_post_func() #$instance[subref] HIDDEN content");
                $appearance= array('readmore' => true);
                $html.=tib_button( $instance['payaddr'], $instance['subref'], $count, $appearance);
            }

            return $html;
        }

        function tib_inline_func( $atts, $content=null )
        {
            $html="";
            $options= get_option('tibdit_options');
            $instance = shortcode_atts( array
            (
                'title' => "",
                'intro' => "",
                'payaddr' => $options['payaddr'],
                'subref' => "WP_ID_".get_the_ID()."_inline",
                'text' => " (tib) "
            ), $atts, "tib");

            bd_log( "tib_inline_func() dump atts: " . var_export($atts, true));
            bd_log( "tib_inline_func() dump instance: " . var_export($instance, true));
            bd_log( "tib_inline_func() @$instance[payaddr] #$instance[subref] %$count *".isset($_COOKIE["tibbed_$instance[subref]"]));

            if (is_null($content) or $content=="")  // no paired closing shortcode
            {
                if (!isset($_COOKIE["tibbed_$instance[subref]"])) // not already tibbed
                {
                    bd_log( "tib_inline_func() inline #$instance[subref] NULL content [[$content]]". var_export($content, true));
                    $html = "<a class='bd-link bd-live' onclick=\"bd_plugin_tib('$instance[payaddr]','$instance[subref]')\"> $instance[text] </a>";
                }
                else
                {
                    bd_log( "tib_inline_func() inline #$instance[subref] TIBBED NULL content [[$content]]". var_export($content, true));
                    $html = "";
                }
            }
            else // enclosed content
            {
                if (!isset($_COOKIE["tibbed_$instance[subref]"])) // not already tibbed
                {
                    bd_log( "tib_inline_func() inline #$instance[subref] LINK content [[$content]]". var_export($content, true));
                    $html = "<a class='bd-link bd-live' onclick=\"bd_plugin_tib('$instance[payaddr]','$instance[subref]')\">$content</a>";
                }
                else
                {
                    bd_log( "tib_inline_func() inline #$instance[subref] TIBBED LINK content [[$content]]". var_export($content, true));
                    $html = "<span class='bd-link tibbed'>$content</span>";
                }
            }
            return $html;
        }

        function tibdit_plugin_enqueue()
        {
            $plugurl = plugin_dir_url( __FILE__ );
            bd_log("tibdit_plugin_enqueue() ". $plugurl);

            bd_register_style( 'tibbee');
            wp_enqueue_style( 'bd-tibbee');

            bd_register_script( 'tib-functions-bottom', true, array('bd-tib-functions'));
            bd_register_script( 'tib-functions', false);

            bd_log("BD-TIB-ENQ");
            wp_enqueue_script( 'bd-tib-functions');
        }

        // function bd_admin_enqueue()
        //   {
        //     $plugurl = plugin_dir_url( __FILE__ );
        //     bd_log("bd_admin_enqueue() ". $plugurl);
        //     wp_enqueue_style( 'wp-color-picker' );
        //     wp_enqueue_script( 'wp-color-picker' );
        //     wp_enqueue_script( 'bd-admin-bottom', $plugurl.'/tibdit-settings-bottom.js', array( 'wp-color-picker' ), "2", true );
        //   }

    }
    add_action( 'widgets_init', 'register_tibdit_widget');
}

function register_tibdit_widget()
{
    bd_log("register_tibdit_widget() ");
    register_widget('tibditWidget');
}


function tib_button( $payaddr, $subref, $count, $appearance)
{
    global $image_resource_url;
    $html= "";

    //this scale variable needs to be set from the plugin options, being manually set here temporarily
    $scale = 1;
    $button_height = $scale * 22;

    $plugurl = plugin_dir_url( __FILE__ );

    include_once("button-factory/ButtonFactory.php");
    $bd_options = get_option("tibdit_options");
    $mybutton = ButtonFactory::make_button( $bd_options[ "bd_button" ] );
    $mybutton->set_colour( convert_rgb_array( $bd_options["bd_base_colour"] ) );
    $mybutton->set_scale($bd_options['bd_button_scale']);

    if(isset($_COOKIE["tibbed_$subref"])){
        // check cookies to determine if the corresponding subref has been tibbed
        // If the corresponding cookie is set, the onclick just sends the user to their profile
        $mybutton->set_onclick("window.open(\"https://tib.me/account_overview\",\"tibit\",\"height=600,width=640,menubar=no,location=no,resizable=no,status=no\")");
    }
    else{
        // If the corresponding cookie isn't set, the onclick opens a tibbing window
        $mybutton->set_onclick( "bd_plugin_tib('" . $payaddr . "','" . "$subref')" );
    }
    // Sets a second colour to the button
    if((property_exists($mybutton, 'colour_two' )) && !empty( $bd_options[ "bd_colour_two" ] )  ) {
        $mybutton->set_colour_two( convert_rgb_array( bd_set_colour_value( 'bd_colour_two' ) ) );
    }

    // Shows count on the buttons which has a number built-in
    $show_count = false;

    switch($bd_options[ "bd_button" ]){
        case "InverseButton":
            $mybutton->set_count($count);
            break;
        case "TicketButton":
            $mybutton->set_count_visible(false);
            $mybutton->set_count($count);
            break;
        case "BubbleButton":
            $mybutton->set_count($count);
            break;
        case "SideSocialButton":
            $mybutton->set_count($count);
            break;
        case "TopSocialButton":
            $mybutton->set_count($count);
            break;
        default:
            $show_count = true;
    }



    if (substr($payaddr,0,1) == '1')  $testmode = false;
    else  $testmode = true;

    if(isset($_COOKIE["tibbed_$subref"]))
    { $html.="<div class='bd tibbed button'> \n";}
    else
    {
        $html.="<div class='bd button live'> \n";
        if ($appearance['readmore'])
            $html.="<span class='annotation'>read<br>more</span>";
    }



    if ($testmode) // button testmode icon
    { $html.="<img style='height: " . $button_height ."px' alt='testmode' class='testmode' src='$image_resource_url/testmode-icon-24px.png' alt='' />";
    }



    if(isset($_COOKIE["tibbed_$subref"])) // tib graphic
    {
        $mybutton->set_tibbed();
        $html.= $mybutton->render(); }

    else
    {
        $html.= $mybutton->render(); }

//    Redundant now that buttons have their own counter.
    // if($show_count){
    //     $html.="<span class='count'>$count</span>";  // counter
    // }
    $html .= "</div>";

    if(! isset($_COOKIE["tibbed_$subref"]))  // tooltip
    {

        if(! $testmode)  // testmode tooltip
        {
            $html.="<div class='tip bd-testmode'>";
            $html.="<img class='callout' src='$image_resource_url/callout_black.png' />";
            $html.="<p class=dict><strong>tib</strong>&ensp;/tÉªb/</p>";
            $html.="<p class='detail lead'>(n)</p>";
            $html.="<p class='detail'>A microdonation or micropayment of around 15p / 25Â¢.</p>";
        }
        else  // realmode tooltip
        {
            $html.="<div class='tip bd-testmode'>";
            $html.="<img class='callout' src='$image_resource_url/callout_black.png' />";
            $html.="<img src='$image_resource_url/testmode-icon-24px.png' style='float:left; height: 1.2em; padding: 0.3em 0.3em 0 0;'>";
            $html.="<p class=detail>testmode tibs are free and carry no value</p>";
        }
        $html.="</div>";
    }


    bd_log("plugindir: .$plugurl");
    return $html;
}

// Initialize our plugin object.

// global $tibdit_plug;
// if (class_exists("tibditWidget") && !$tibdit_plug)
//   {
//   	bd_log("tibdit_plug");
//     $tibdit_plug = new tibditWidget();
//   }

function bd_log($message)
{
//    error_log(date("d H:i:s",time())." - ".$message."\n", 3, plugin_dir_path( __FILE__ ).'tibdit.log');
}

?>