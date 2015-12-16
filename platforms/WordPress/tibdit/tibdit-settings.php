<?PHP

// tibit plugin settings
// Version: 1.4.4
// License: GPL3


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
if( !defined( 'TIBDIT_DIR')) define( 'TIBDIT_DIR', plugin_dir_path( __FILE__ ) );
if( !defined( 'TIBDIT_URL')) define( 'TIBDIT_URL', plugin_dir_url(__FILE__) );
include_once('helper-functions.php');
// use LinusU\Bitcoin\AddressValidator;
// use AddressValidator;
// include 'AddressValidator.php';

bd_log("admin page");

if (!function_exists('is_admin'))
{
    bd_log("admin but not admin");
    header('Status: 403 Forbidden');
    header('HTTP/1.1 403 Forbidden');
    exit();
}

if (!class_exists("tibdit_settings"))
{
    class tibdit_settings
    {
        public static $default_settings = array
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

        private $options;

        private $help_hook;

        function __construct()
        {
            bd_log("||ADM __construct");


            $this->page_id = 'tibdit_options';
            // This is the get_options slug used in the database to store our plugin option values.
            $this->settings_field = 'tibdit_options';
            $this->options = get_option( $this->settings_field );
            bd_log("ADM __construct checking options on load" . var_export($this->options, true));
            $this->page_title = "tibit plugin settings";
            $this->section = "tibdit_main_section";
            $this->list = "tibdit_tibs_list";
            $this->blockchain = "tibdit_blockchain";

            add_action( 'admin_menu', array($this, 'add_admin_menu') );
            add_action( 'admin_init', array($this, 'init_admin_page') );
            add_action( 'admin_enqueue_scripts', array($this,'tibdit_settings_enqueue') );
            // add_action( 'admin_enqueue_scripts', array($this, 'mw_enqueue_color_picker') );
            add_filter( 'contextual_help', array($this, 'admin_help'), 10, 3);
            $plugin = plugin_basename(__FILE__);
            bd_log("plugin_action_links_$plugin");
            add_filter( "plugin_action_links_tibdit/tibdit.php", array($this,'bd_plugins_page'));

            // Setup for the colour picker to use to adjust the SVG buttons
            // add_action( "admin_print_scripts-settings_page_tibdit_options" , array( $this,
            // "bd_colour_picker_setup" ) );
        }




        // Add settings link on plugin page
        function bd_plugins_page($links)
        {
            bd_log("bd_plugins_page() " . var_export($links, true));
            $settings_link = '<a href="options-general.php?page=tibdit_options#help">Settings &amp; Help</a>';
            array_unshift($links, $settings_link);
            return $links;
        }

        function init_admin_page()
        {
            add_option( $this->settings_field, tibdit_settings::$default_settings );

            $this->options = get_option( $this->settings_field );
            $this->options = wp_parse_args($this->options, tibdit_settings::$default_settings);


            bd_log( "||ADM init: " . var_export($this->options, true));

            register_setting( $this->settings_field, $this->settings_field, array($this, 'sanitise') );

            add_settings_section($this->section, '', array($this, 'main_section'), $this->page_id);

            // add_settings_field('title', 'Widget Heading', array($this, 'title_field'), $this->page_id, $this->section);
            // add_settings_field('intro', 'Widget Intro', array($this, 'intro_field'), $this->page_id, $this->section);
//      add_settings_field('payaddr', 'Bitcoin Address', array($this, 'payaddr_field'), $this->page_id, $this->section);
//      add_settings_field('acktime', 'Acknowledge tib for', array($this, 'acktime_field'), $this->page_id, $this->section);
//      add_settings_field('bd_button', 'Select button', array($this, 'tib_button_field'), $this->page_id, $this->section);
            // add_settings_field('widget_colour', 'Widget background shading', array($this, 'widget_colour'), $this->page_id, $this->section);

            if (get_option('tib_list'))
            {
                add_settings_section($this->list, "list", array($this, 'list_section'), $this->page_id);
                update_option('tib_list', false);
            }
        }

        function admin_help($contextual_help, $screen_id, $screen)
        {
            bd_log("admin_help() ");
            include ('tibdit-settings-help.php');

            if ($screen_id == $this->help_hook) {
                // $contextual_help = 'This is where I would provide help to the user on how everything in my admin panel works. Formatted HTML works fine in here too.';
                $screen->add_help_tab( array(
                    'id' => "bd_help_overview",            //unique id for the tab
                    'title' => "overview",      //unique visible title for the tab
                    'content' => $bd_help_overview,  //actual help text
                ) );
                $screen->add_help_tab( array(
                    'id' => "bd_help_settings",            //unique id for the tab
                    'title' => "settings",      //unique visible title for the tab
                    'content' => $bd_help_settings,  //actual help text
                ) );
                $screen->add_help_tab( array(
                    'id' => "bd_help_bitcoin",            //unique id for the tab
                    'title' => "bitcoin",      //unique visible title for the tab
                    'content' => $bd_help_bitcoin,  //actual help text
                ) );
                $screen->add_help_tab( array(
                    'id' => "bd_help_shortcodes",            //unique id for the tab
                    'title' => "shortcodes",      //unique visible title for the tab
                    'content' => $bd_help_shortcodes,  //actual help text
                ) );
                $screen->add_help_tab( array(
                    'id' => "bd_help_widgets",            //unique id for the tab
                    'title' => "widgets",      //unique visible title for the tab
                    'content' => $bd_help_widgets,  //actual help text
                ) );
                $screen->add_help_tab( array(
                    'id' => "bd_help_testmode",            //unique id for the tab
                    'title' => "testmode",      //unique visible title for the tab
                    'content' => $bd_help_testmode,  //actual help text
                ) );
            }
            return $contextual_help;
        }

        function tibdit_settings_enqueue()
        {
            $plugurl = plugin_dir_url(__FILE__);
            bd_log("||ADM enqueue");

            wp_enqueue_style('wp-color-picker');
            wp_enqueue_script('bd-wp-color-picker', plugins_url('/resources/javascripts/bd-wp-color-picker.js', __FILE__ ), array('wp-color-picker'), false, true);

            bd_register_script( 'jsbn');
            bd_register_script( 'jsbn2');
            bd_register_script( 'crypto-sha256');
            bd_register_script( 'btcaddr_validator', false, array('bd-jsbn', 'bd-jsbn2', 'bd-crypto-sha256'));

            bd_register_script( 'tibdit-settings', false, array('bd-tibdit-settings-bottom'));
            bd_register_script( 'tibdit-settings-bottom', true);

            bd_register_script( 'tib-functions', false, array('bd-tib-functions-bottom'));
            bd_register_script( 'tib-functions-bottom', true);

            wp_enqueue_script( 'wp-color-picker');
            wp_enqueue_script( 'bd-btcaddr_validator');
            wp_enqueue_script( 'bd-tibdit-settings');
            wp_enqueue_script( 'bd-tib-functions');

            bd_register_style( 'tibbee', array('wp-color-picker'));
            wp_enqueue_style( 'bd-tibbee');

            // Adding colour picker for the buttons
            wp_register_style( 'bd-colour-picker', plugins_url( 'tibdit/button-factory/resources/third_party/colourpicker/color-picker.css' ) );
            wp_enqueue_style( 'bd-colour-picker' );

            wp_register_script( 'jquery-colour-picker', 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js' );
            wp_enqueue_script( 'jquery-colour-picker' );


            wp_register_script( 'bd-colour-picker-script', plugins_url( 'tibdit/button-factory/resources/third_party/colourpicker/color-picker.js' ), array('jquery-colour-picker') );
            wp_enqueue_script( 'bd-colour-picker-script' );

            wp_register_style('jquery-ui-slider-sheet', "http://code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css");
            wp_enqueue_style('jquery-ui-slider-sheet');

            wp_register_script('jquery-ui-slider-script', "https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js");
            wp_enqueue_script( 'jquery-ui-slider-script' );

        }


        function main_section()
        {
            $plugurl = plugin_dir_url(__FILE__);

            bd_log("||ADM form section");

            echo '<br>Please refer to the <a class="bd-admin-link" onclick="jQuery(\'a#contextual-help-link\').trigger(\'click\');"> plugin help</a> for information and instructions.';

            if ( isset ( $_GET['tab'] ) ){
                $this->bd_tidit_tabs($_GET['tab']);
            } else {
                $this->bd_tidit_tabs();
            }
            ?>

            <?php
        }

        /* Creation of tabs for tibdit plugin settings page */
        function bd_tidit_tabs( $bd_current = 'settings' )
        {
            $tabs = array( "settings" => "tibit settings", "customise_button" => "Customise Button Appearance", "list" => "List tib counts", "balance" => "Show balance" );
            echo '<h2 class="nav-tab-wrapper">';
            foreach( $tabs as $tab => $name ){
                $class = ( $tab == $bd_current ) ? ' nav-tab-active' : '';
                echo "<a class='nav-tab$class' href='?page=tibdit_options&tab=$tab'>$name</a>";

            }
            echo '</h2>';
            ?>

            <?php
            if( $_GET['tab'] == 'settings' || !isset($_GET['tab'] ) ) {
                if( substr($this->options['payaddr'],0,1) == 'm' or substr($this->options['payaddr'],0,1) == 'n' )
                {
                    $mode="/testnet";
                }
                $plugurl = plugin_dir_url(__FILE__);
                bd_log("admin render");
                echo "<div class='wrap'>";
                echo "<h2>$this->page_title</h2>";
                echo "<form method='post' action='options.php' class='bd';>";
                ?>

                <table class="form-table">
                    <tr>
                        <th scope="row">Bitcoin Address</th>
                        <td><?php $this->payaddr_field("") ?></td>
                    </tr>
                    <tr>
                        <th scope="row">Acknowledge tib for</th>
                        <td><?php $this->acktime_field(""); ?></td>
                    </tr>
                </table>
                <?php
                submit_button( 'Save Changes', 'primary', 'submit', false);
                echo("&emsp;");


                echo "<script>payaddr.onchange();</script>";
                echo "</form></div>";
            }
            elseif( $_GET['tab'] == 'customise_button' )  {

                echo "<form method='post' action='options.php' class='bd';>";

                echo "<div class='wrap'>";
                echo "<h2>" . $tabs['customise_button']. "</h2>";

                echo "<form method='post' action='options.php' class='bd';>";

                ?>


                <table class="form-table">




                    <?php $this->tib_button_field(); ?>

                </table>
                <?php
                submit_button( 'Save Changes', 'primary', 'submit', false);
                echo "</form></div>";
            }

            elseif( $_GET['tab'] == 'list' )  {
                $this->list_section();
            } elseif( $_GET['tab'] == "balance" ) {
                $payaddr = $this->options['payaddr'];
                echo '<iframe width="1000" height="700" src="https://www.biteasy.com/testnet/addresses/' . $payaddr . '"> </iframe>';
            }
            ?>

            <?php
        }


        function list_section()
        {
            bd_log("||ADM list section");
            // $qargs = array()

            echo("<table class='widefat'><tr><th>title</th><th>id</th><th>tibs received</th></tr>");

            $alloptions = wp_load_alloptions();

            // bd_log("admin: list section: list all options: " . var_export($alloptions, true));

            foreach ($alloptions as $wp_option => $wp_option_value)
            {
                bd_log("admin: list section: list all options: " . substr($wp_option, 0, 10) );

                if($wp_option == "WP_SITE" or substr($wp_option, 0, 10) == "tib_count_")
                {
                    echo("<tr><td>");
                    echo( $wp_option);
                    echo("</td><td>n/a</td><td>");
                    echo($wp_option_value);
                    echo("</td></tr>");
                }
            }

            $qry = new WP_Query( 'meta_key=tib_count');
            if ($qry -> have_posts())
            {

                while ($qry -> have_posts())
                {
                    $qry -> the_post();
                    $tibcountfield = get_post_custom_values("tib_count");
                    // echo("test1" . var_export($tibcountfield, true));
                    echo("<tr><td>");
                    echo( the_title());
                    echo( "</td><td>" . get_the_ID() . "</td><td>" . $tibcountfield[0] . "</td></tr>");
                }
            }
            echo("</table><br><br>");
        }

        // function title_field( $args )
        // {
        //   $slug= "title";
        //   $value= $this->options[$slug];

        //   echo "<input id='$slug' name='$this->settings_field[$slug]' value='$value'
        //     class='bd' type='text' size=20 maxlength=20 onchange='lowercase_tib(this);'
        //     onkeypress='this.onchange();' onpaste='this.onchange();' oninput='this.onchange();'  >";
        //   echo "<span id='title_field_status'></span>";
        // }


        // function intro_field( $args )
        // {
        //   $slug= "intro";
        //   $value= $this->options[$slug];


        // echo "<input id='$slug' name='$this->settings_field[$slug]' value='$value'";
        // echo "class='bd' type='text' size=100 maxlength=100 onchange='bd_lowercase_tib(this);'
        //    onkeypress='this.onchange();' onpaste='this.onchange();' oninput='this.onchange();'  >";
        // echo "<span id='intro_field_status'></span>";
        // }



        function payaddr_field( $args )
        {
            $slug= "payaddr";
            $value= $this->options[$slug];

            $plugurl= plugin_dir_url(__FILE__);

            echo "<input id='$slug' name='$this->settings_field[$slug]' value='$value'
                class='bd' type='text' size=36 maxlength=36 onchange='bd_payaddr_change(this, \"$plugurl\");'
                onkeypress='this.onchange();' onpaste='this.onchange();' oninput='this.onchange();'  >";

            echo "<span class='bd status' id='payaddr_field_status'>&emsp;?</span>";

        }




        function acktime_field( $args )
        {
            $slug="acktime";
            $value=$this->options[$slug];

            echo "<input id='$slug' name='$this->settings_field[$slug]' value='$value'
                class='bd' type='number' min='1' max='30' step='1'  >";

            echo "&emsp;days &emsp;(or minutes if a testmode / testnet address)";
        }

        function widget_colour( $args )
        {
            $slug="widget_colour";
            $value=$this->options[$slug];

            echo "<input id='$slug' name='$this->settings_field[$slug]' value='$value'
                class='bd bd-colourp' type='text' data-default-color='$value' >";
        }

        /**
         * Displays images and radio buttons
         */
        function tib_button_field( )
        {
            // This section is for the setup
            include("button-factory/ButtonFactory.php");
            // Displays the two colours pickers

            // Setting up the names for the creation of the buttons
            $svg_button_names = array(
                "RectButton", "SoapButton", "CoinButton",  "HexButton",
                "InverseButton", "TicketButton", "BubbleButton", "SideSocialButton", "TopSocialButton"
            );
            $slug= "bd_button";
            $value= $this->options[$slug];

            // This would be used to decide on how many buttons should be shown in a row (<br> tag would be added to the images)
            $bd_button_length =  count($svg_button_names);

            $bd_output = ""; // This would display the radio buttons and images

            // Gets the name of the stored button
            $options = get_option("tibdit_options");  // get_option( $this->settings_field );
            $bd_selected = $options['bd_button'];
            // Checks that the named button is in the svg array
            $bd_button_exists = in_array($bd_selected, $svg_button_names);
            // Use this to set default colours for all buttons in the admin
            $bd_set_button_colour = convert_rgb_array(bd_set_colour_value( 'bd_base_colour' ) );

            for( $bd_index = 0; $bd_index < $bd_button_length;  $bd_index++ )
            {
                $mybutton = ButtonFactory::make_button( $svg_button_names[ $bd_index ] );

                $mybutton->set_colour( $bd_set_button_colour );

                $mybutton->set_scale( $options['bd_button_scale'] );

                if((property_exists($mybutton, 'colour_two' )) && bd_set_colour_value( 'bd_colour_two' )  ) {
                    $mybutton->set_colour_two( convert_rgb_array( bd_set_colour_value( 'bd_colour_two' ) ) );
                    $mybutton->set_colour_two_class();
                }


                $bd_output .= "<li>";
                $bd_output .= $mybutton->render();
                $bd_output .= "<input id='" . $svg_button_names[ $bd_index ] . "' type='radio' name='$this->settings_field[$slug]'";
                $bd_output .= "value='" . $svg_button_names[ $bd_index ]  . "'";

                if( $bd_button_exists ){
                    if( $svg_button_names[ $bd_index ] == $bd_selected ){
                        $bd_output .= " checked ";
                    }

                } elseif( $svg_button_names[ $bd_index ] == 0 ) {
                    $bd_output .= " checked ";
                }

                $bd_output .= "id='{$slug}{$bd_index}' >";
                $bd_output .= "<label for='" . $svg_button_names[ $bd_index ] . "' ><div class='label-background-div'></div></label>";
                $bd_output .=  "</li>";
            }

            ?>



            <?php

            echo "<div class='button-container'>";
            echo $bd_output;
            echo "</div>";
            echo $this->bd_display_scale_picker();
            echo $this->bd_display_colour_picker();
        }

        private function rgb_to_hex($rgbstring) {
            // function to convert RGB string to Hex

            $rgb = sscanf($rgbstring, "rgb(%d, %d, %d)");
            $hex = "#";
            $hex .= str_pad(dechex($rgb[0]), 2, "0", STR_PAD_LEFT);
            $hex .= str_pad(dechex($rgb[1]), 2, "0", STR_PAD_LEFT);
            $hex .= str_pad(dechex($rgb[2]), 2, "0", STR_PAD_LEFT);

            return $hex; // returns the hex value including the number sign (#)
        }

        // This would display the colour picker and hooks for changing the svg buttons
        function bd_display_colour_picker(){

            $hex_base_colour = $this->rgb_to_hex(bd_set_colour_value( 'bd_base_colour' ));
            $hex_secondary_colour = $this->rgb_to_hex(bd_set_colour_value( 'bd_colour_two' ));

            ?>



            <div class="outerwrapper-colour-picker">
                <div class="new_spectrum_1 innerwrapper-colour-picker">
                    <input type="text" id="spectrum_1" name="spectrum_1" value="<?php echo $hex_base_colour ?>" data-default-color="<?php echo $hex_base_colour ?>" />
                </div>
                <div class="new_spectrum_2 innerwrapper-colour-picker" style="display:none">
                    <input type="text" id="spectrum_2" name="spectrum_2" value="<?php echo $hex_secondary_colour ?>" data-default-color="<?php echo $hex_secondary_colour ?>" />
                </div>
            </div>



            <?php

            $hidden_field = "";

            $hidden_field .= "<input type='hidden' id='base_colour' name='$this->settings_field[bd_base_colour]' ";
            $hidden_field .= " value='" . bd_set_colour_value( 'bd_base_colour' ) . "'  />";
            $hidden_field .= "<input type='hidden' id='colour_two' name='$this->settings_field[bd_colour_two]' ";
            $hidden_field .= " value='" . bd_set_colour_value( 'bd_colour_two' ) . "'  />";
            echo $hidden_field;
        }

        function bd_display_scale_picker(){
            $options = get_option("tibdit_options");

            ?>
            <div class="scale-slider-container">
                <div id="slider"></div>
                <script>

                    $(function() {

                        sliderMaxValue = 1.3;
                        sliderInitValue = <?php
                    echo $options['bd_button_scale']; ?>;
                        svgHeight = 0;

                        $('.settings_page_tibdit_options .button-container li').each(function(index){
                            // newHeight = $(this).height() * normalizedSliderVal + 40;
                            // $(this).height( newHeight );
                            svgWidth = $(this).find('svg')[0].getBoundingClientRect().width;
                            // Have to use the getBoundingClientRect method of SVG elements to get the width, doing it via jQuery gives
                            svgMaxWidth = (svgWidth / sliderInitValue) * sliderMaxValue;
                            // Divide the current width by the current scale and then multiply by the max scale, giving the max possible width

                            if(svgHeight < $(this).find('svg')[0].getBoundingClientRect().height)
                            {
                                svgHeight = $(this).find('svg')[0].getBoundingClientRect().height;
                            }


                            $(this).width( svgMaxWidth );
                            // set the width of the div to the max SVG width, ensuring that however big the SVG gets, it won't overflow
                        });

                        svgHeight = (svgHeight / sliderInitValue) * sliderMaxValue;
                        svgHeight += 20;
                        $('.settings_page_tibdit_options .button-container li').height(svgHeight);

                        $('.settings_page_tibdit_options .button-container li').height

                        $( "#slider" ).slider({
                            min: 0.5,
                            max: sliderMaxValue,
                            step: 0.05,
                            value: sliderInitValue,
                            slide: function( event, ui ){
                                var sliderValue = ui.value;

                                $("svg").css("transform", "scale(" + sliderValue + ")");
                                $("#button_scale").val(sliderValue);





                            },
                            change: function (event, ui){
                                var sliderValue = ui.value;
                                $("svg").css("transform", "scale(" + sliderValue + ")");
                                $("#button_scale").val(sliderValue);



                            }
                        });

                    });
                </script>

                <?php
                echo "<input type='hidden' id='button_scale' name='$this->settings_field[bd_button_scale]' value='" . $options['bd_button_scale'] . "'  />";
                ?>

            </div>
            <?php
        }

        function add_admin_menu()
        {
            bd_log("add admin menu");
            if ( ! current_user_can('manage_options') )
                return;

            // $this->pagehook = $page =  add_options_page( $this->page_title, 'tibdit', 'manage_options', $this->page_id, array($this,'render') );
            $this->help_hook = add_options_page( $this->page_title, 'tibit', 'manage_options', $this->page_id, array($this,'render') );
        }

        private function sanitiser_setter ($key, $opts_in, $default){
// checks the incoming array for the specified option key. If it is set, the value is returned. If it isn't, the
//    corresponding value is retrieved from the existing options and this is returned instead

            if(isset($opts_in[$key])){
                bd_log("||ADM sanitiser_setter " . var_export($opts_in[$key], true));
                return $opts_in[$key];
            }
            elseif(isset($this->options[$key])){
                bd_log("||ADM sanitiser_setter " . var_export($this->options[$key], true));
                return $this->options[$key];
            }
            else{
                bd_log("||ADM sanitiser_setter " . var_export($default[$key], true));
                return $default[$key];

            }

        }

        function sanitise($opts_in) // Sanitize our plugin settings array as needed.
        {
            // TODO Cleanup to use PHP array defaulting.
            bd_log("Options in " . var_export($opts_in, true));

            bd_log("||ADM sanitise: POST " . var_export($_POST, true));

            static $new_options=array();

            if (isset($_POST['list']))
            {
                bd_log( "||ADM sanitise: list !!!!");
                update_option( 'tib_list', true);   //persist request for list of tibs through page multiple refreshes
            }

            $new_options['bd_button'] = $this->sanitiser_setter('bd_button', $opts_in, $GLOBALS["default_settings"]);
            $new_options['bd_base_colour'] = $this->sanitiser_setter('bd_base_colour', $opts_in, $GLOBALS["default_settings"]);
            $new_options['bd_colour_two'] = $this->sanitiser_setter('bd_colour_two', $opts_in, $GLOBALS["default_settings"]);
            $new_options['bd_button_scale'] = $this->sanitiser_setter('bd_button_scale', $opts_in, $GLOBALS["default_settings"]);

            $new_options['title']= $GLOBALS["default_settings"]['title'];
            $new_options['intro']= $GLOBALS["default_settings"]['intro'];
//$new_options['bd_base_colour']= tibdit_settings::$default_settings['bd_base_colour'];
//$new_options['bd_colour_two']= tibdit_settings::$default_settings['bd_colour_two'];
//$new_options['bd_button'] = tibdit_settings::$default_settings['bd_button'];
//$new_options['bd_button_scale'] = tibdit_settings::$default_settings['bd_button_scale'];

            bd_log( "|ADM sanitise: default scale:  " . var_export($GLOBALS["default_settings"], true) );

            bd_log( "||ADM sanitise: current options dump" . var_export($this->options ,true) );
//$new_options['bd_button_scale']= $opts_in['bd_colour_two'];

            if( isset($opts_in['payaddr']) && strlen($opts_in['payaddr']) > 2)
                if (AddressValidator::typeOf($opts_in['payaddr']))
                    $new_options['payaddr'] = $opts_in['payaddr'];
                else
                    $new_options['payaddr'] = "";
            elseif ($opts_in['payaddr'] = "")
                $new_options['payaddr'] = "";
            else
                $new_options['payaddr'] = $this->options['payaddr'];

            if( isset($opts_in['acktime']))
                if (intval($opts_in['acktime']) > 0 && intval($opts_in['acktime']) < 31)
                    $new_options['acktime'] = intval($opts_in['acktime']);
                else
                    $new_options['acktime']= $GLOBALS["default_settings"]['acktime'];
            else
                $new_options['acktime']= $GLOBALS["default_settings"]['acktime'];


// if( isset($opts_in['widget_colour']))
//   $new_options['widget_colour'] = ($opts_in['widget_colour']);
// else
//   $new_options['widget_colour']= tibdit_settings::$default_settings['widget_colour'];

            bd_log("||ADM sanitise: options " . var_export($opts_in, true));
            bd_log("||ADM sanitise: new_options " . var_export($new_options, true));

            return $new_options;
        }


        function render()
        {
            // if (! current_user_can('manage_options'))
            //   wp_die( __( 'You do not have sufficient permissions to access this page.' ) );
            // $mode="";
            if( substr($this->options['payaddr'],0,1) == 'm' or substr($this->options['payaddr'],0,1) == 'n' )
            {
                $mode="/testnet";
            }
            $plugurl = plugin_dir_url(__FILE__);
            bd_log("admin render");
//      echo "<div class='wrap'>";
//      echo "<h2>$this->page_title</h2>";
            echo "<form method='post' action='options.php' class='bd';>";
            settings_fields( $this->settings_field );
            do_settings_sections( $this->page_id );
//      submit_button( 'Save Changes', 'primary', 'submit', false);
//      echo("&emsp;");
//      submit_button( 'list tib counts', 'secondary', 'list', false, array( 'onclick' => "{}" ));
//      submit_button( 'balance', 'secondary', 'blockchain', false, array( 'onclick' => "{biteasy_blockchain();}"));
//
//      echo "<script>payaddr.onchange();</script>";
//      echo "</form></div>";



        }
    } // end class
} // end if