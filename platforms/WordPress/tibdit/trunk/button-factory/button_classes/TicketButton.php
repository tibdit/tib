<?php
require_once('CountedButton.php');
class TicketButton extends CountedButton { 
	
	private $count_visible;

	public function __construct() {		
		$this->file_name .= "ticket/ticket.svg";
		parent::__construct();
	}

	public function set_count_visible( $count_visible ){
		$this->count_visible = $count_visible;
		if($this->count_visible){
			// find all elements with class 'no_count';
			$xpath = new DOMXpath($this->dom_document);
			$elements = $xpath->query("//*[contains(concat(' ', @class, ' '), ' no_count ')]");
			// remove class no_count and add class count;
			foreach ($elements as $element) {
				// get the element's classes as a string. 
				$original_classes_string = $element->attributes->getNamedItem("class")->nodeValue; 
				// replace instances of 'no_count' with 'count'
				$replaced_classes_string = str_replace("no_count", "count", $original_classes_string);
				$element->attributes->getNamedItem("class")->nodeValue = $replaced_classes_string;
			}
		}

	}

}
?>