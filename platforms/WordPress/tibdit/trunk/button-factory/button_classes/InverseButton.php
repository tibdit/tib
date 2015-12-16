<?php
require_once('CountedButton.php');
class InverseButton extends CountedButton { 
	
	protected $colour_two;

	function  set_colour_two( $rgb ){
		$this->colour_two = "rgb(  ".$rgb['red'].", ".$rgb['green'].", ".$rgb['blue']." )";
		$xpath = new DOMXpath($this->dom_document);

        //insert the style Element to change colour
        $styleElement = $this->dom_document->createElement("style", ".colour_two {fill: {$this->colour_two};}");
        $this->dom_document->getElementsByTagName("svg")->item(0)->appendChild($styleElement);
	}

	function __construct() {
		$this->file_name .= "inverse/inverse.svg";
		parent::__construct();
	}
}
?>