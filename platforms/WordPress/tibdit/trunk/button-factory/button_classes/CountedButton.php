<?php
require_once('Button.php');
class CountedButton extends Button {

	protected $count;
	public function set_count( $count ){
		$xpath = new DOMXpath($this->dom_document);
		$elements = $xpath->query("//*[contains(concat(' ', @class, ' '), ' tib_counter ')]");
		if( $elements->length > 0 ){
			// find the tibdit tag
			foreach($elements as $element) {$element->nodeValue = $count;}
		} else {
			throw new ButtonException("CounterButton could not find element with class 'tib_counter'");
		}
		$this->count = $count;
	}

	public function get_count(){
		return $this->count;
	}

}
?>