<?php 
abstract class Button {



	protected $width, $height;
	protected $file_path, $file_name, $thumbnail, $dom_document;
	protected $base_colour;
	protected $id;

	// Creates the DOM and loads the SVG for additonal information to be added e.g. CSS
	public function __construct(){
		//header('Content-type: image/svg+xml');
		$this->file_path = plugins_url() . "/tibdit/button-factory/resources/buttons/".$this->file_name;
		$this->dom_document = new DomDocument();
		$this->dom_document->load($this->file_path);
		$this->generate_id();
		$styleElement = $this->dom_document->createElement("style",
			"svg.{$this->id} .tibbed { display:none; }");
		$this->dom_document->getElementsByTagName("svg")->item(0)->appendChild($styleElement);
		$this->set_hover_opaque();
	}

	/*
	* Generates a random alpha-numeric string and adds it as a class of the SVG document.
	* This enables us to style buttons independently of one-another.
	*/
	protected function generate_id(){
		$characters = 'abcdefghijklmnopqrstuvwxyz';
		$string = '';
		for ($i = 0; $i < strlen($characters); $i++) {
			$string .= $characters[rand(0, strlen($characters) - 1)];
		}
		$this->set_id("tibdit_{$string}");
	}

	public function set_colour_two_class(){
		$originalClasses = $this->dom_document->getElementsByTagName("svg")->item(0)->getAttribute("class");
//		saving the original class list of the svg element to an array
		$this->dom_document->getElementsByTagName("svg")->item(0)->setAttribute("class", $originalClasses . " has-secondary-colour");
//		appending "has-secondary-colour" to the original list of classes, and re-setting the class attribute
//		of our SVG element
	}

	public function set_id( $id ){
		$this->id = $id;
		$this->dom_document->getElementsByTagName("svg")->item(0)->setAttribute("class", $id);
	}

	public function set_onclick ($onClickToSet){
		$this->dom_document->getElementsByTagName("svg")->item(0)->setAttribute("onclick", $onClickToSet);
	}

	// Prints the SVG file that was loaded to the screen
	public function render() {
		return $this->dom_document->saveXML();
	}

	// Adjusts the 'tranform: scale' property to make it bigger or smaller.
	public function set_scale( $factor ){
		$style = $this->dom_document->getElementsByTagName("svg")->item(0)->attributes->getNamedItem("style");
		if ( isset($style) ){
			$scale = $style->nodeValue;
			$new_scale = str_replace("transform: scale(1);", "transform: scale(".$factor.");", $scale);
			$this->dom_document->getElementsByTagName("svg")->item(0)->attributes->getNamedItem("style")->nodeValue = $new_scale;
		} else {
			//insert the style Element to change colour
			$styleElement = $this->dom_document->createElement("style", "
				svg { transform: scale(".$factor.") }"
				);
			$this->dom_document->getElementsByTagName("svg")->item(0)->appendChild($styleElement);
		}
	}

	// param : $rgb, an associative array of 'red', 'green', and 'blue' values.
	public function set_colour( $rgb ){
		$this->base_colour = $rgb;
		$xpath = new DOMXpath($this->dom_document);

        //insert the style Element to change colour
		$styleElement = $this->dom_document->createElement("style", "
			.base_colour { fill:rgb(".$rgb['red'].",".$rgb['green'].",".$rgb['blue'].");}");

        // add the style tag to the end of the document.
		$this->dom_document->getElementsByTagName("svg")->item(0)->appendChild($styleElement);
	}

	public function set_hover_opaque(){
		$xpath = new DOMXpath($this->dom_document);

        //insert the style Element to change colour
		$styleElement = $this->dom_document->createElement("style", 
			".".$this->id.":hover { opacity : 0.8; }");

        // add the style tag to the end of the document.
		$this->dom_document->getElementsByTagName("svg")->item(0)->appendChild($styleElement);
	}

	// It changes the stylesheet to either tib or tibbed based on what it has been currently been set to.
	public function set_tibbed(){
		
		$style_tags = $this->dom_document->getElementsByTagName("style");		
		
		foreach ( $style_tags as $style_tag ) { 
			if(strstr($style_tag->nodeValue, "$this->id .tibbed")) {
				$style_tag->nodeValue = str_replace(".tibbed", ".tib", $style_tag->nodeValue);

			}
			elseif (strstr($style_tag->nodeValue, "$this->id .tib")){
				$style_tag->nodeValue = str_replace(".tib", ".tibbed", $style_tag->nodeValue);
			}
		}

	}

}
?>