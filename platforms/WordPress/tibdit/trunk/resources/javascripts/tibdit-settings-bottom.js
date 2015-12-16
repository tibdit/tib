// version 10
( 
function( $ )
  {
    function initColorPicker( widget ) 
      {
        widget.find( '.bd-colourp' ).wpColorPicker( 
          // {
          //   change: _.throttle( function() 
          //     { // For Customizer
          //       $(this).trigger( 'change' );
          //     }, 3000 )
          // } 

          );
      }

    function onFormUpdate( event, widget ) 
      {
        initColorPicker( widget );
      }

    $( document ).on( 'widget-added widget-updated', onFormUpdate );

    $( document ).ready( function() 
    {
      $( '#widgets-right .widget:has(.bd-colourp)' ).each( function () 
        {
          initColorPicker( $( this ) );
        } 
      );
    } );
  } ( jQuery ) 
);

jQuery(document).on( "ready", function() 
    { 
      if(window.location.hash == "#help") 
        { jQuery("a#contextual-help-link").trigger("click"); }
    }
  );     
