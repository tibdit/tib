jQuery(document).ready(function($){

    $('.button-container li').click(function(){
        if($(this).find('svg.has-secondary-colour').length){
            $('.new_spectrum_2').show();
        }
        else{
            $('.new_spectrum_2').hide();
        }
    });

    $('.new_spectrum_1 input').wpColorPicker({
        width: 300

    });

    $('.new_spectrum_2 input').wpColorPicker({
        width: 300
    });


    $('.button-container li').each(function(){
        if( $(this).find('input').prop('checked') && $(this).find('.has-secondary-colour').length ){
            $('.new_spectrum_2').show();
        }
    });


    $('.new_spectrum_1 a').attr("title", "Primary Colour");
    $('.new_spectrum_2 a').attr("title", "Secondary Colour");


});

$('.new_spectrum_1 input').change(function(){
    $(".base_colour").css("fill", $('.new_spectrum_1 .wp-color-picker').val());
});

$('.new_spectrum_2 input').change(function(){
    $(".colour_two").css("fill", $('.new_spectrum_2 .wp-color-picker').val());
});

$('.new_spectrum_1').mousedown(function() {
    // functions to be executed while the mouse button is held down

    timeoutId = setInterval(function () {
        $(".base_colour").css("fill", $('.new_spectrum_1 .wp-color-picker').val());
    }, 50);



}).bind('mouseup mouseleave click', function() {
    //
    clearInterval(timeoutId);
    baseValueRgbString = hexToRgbString($('.new_spectrum_1 .wp-color-picker').val());
    $( '#base_colour' ).val(baseValueRgbString);
});

$('.new_spectrum_2').mousedown(function() {
    timeoutId = setInterval(function(){
        $(".colour_two").css("fill" , $('.new_spectrum_2 .wp-color-picker').val());
    }, 50);
}).bind('mouseup mouseleave click', function() {
    clearInterval(timeoutId);
    //console.log($('.new_spectrum_2 .wp-color-picker').val());
    baseValueRgbString = hexToRgbString($('.new_spectrum_2 .wp-color-picker').val());
    $( '#colour_two' ).val(baseValueRgbString);
});

function hexToRawRgb(hex){

    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;

}

function hexToRgbString(hex){
    baseValueRgbRaw = hexToRawRgb(hex);
    baseValueRgbString = "";
    baseValueRgbString += "rgb(" + baseValueRgbRaw["r"] + "," + baseValueRgbRaw["g"] + "," +
        baseValueRgbRaw["b"] + ")";
    return baseValueRgbString;
    //console.log(baseValueRgbString);
}

function rgbToHex(rgb) {
    var rgbRegex = /^rgb\(\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*\)$/;
    var result, r, g, b, hex = "";
    if ( (result = rgbRegex.exec(rgb)) ) {
        r = componentFromStr(result[1], result[2]);
        g = componentFromStr(result[3], result[4]);
        b = componentFromStr(result[5], result[6]);

        hex = "0x" + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    return hex;
}