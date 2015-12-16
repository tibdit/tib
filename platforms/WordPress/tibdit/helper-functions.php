<?php
/*
This is where common used functions would be included for example validations
To reduce repetition of code

*/

  // Turns the rgb values into an array (P.S. This function is also in tibdit-settings.php)
  function convert_rgb_array( $rgb ){
      $rgb = str_replace("rgb", "", $rgb);
      $rgb = str_replace("(", "", $rgb);
      $rgb = str_replace(")", "", $rgb);
      $array_rgb = explode(",", $rgb);
      $array_keys = array("red","green", "blue");
      return array_combine($array_keys, $array_rgb);

  }

  function bd_set_colour_value( $set_colour ){

    $options = get_option("tibdit_options");

      // base colour
      if( $set_colour == 'bd_base_colour' ){
        $base_colour = $options['bd_base_colour'];
        return ( $base_colour )? $base_colour : 'rgb(218, 151, 110)';
      }
      // set second colour 
      elseif( $set_colour == 'bd_colour_two' ){
        $colour_two = $options['bd_colour_two'];
        return ( $colour_two )? $colour_two  : 'rgb(194, 194, 196))';
      }
    }

?>