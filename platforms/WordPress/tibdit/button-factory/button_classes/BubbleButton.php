<?php
require_once('CountedButton.php');
class BubbleButton extends CountedButton { 
	function __construct() {		
		$this->file_name .= "bubble/bubble.svg";
		parent::__construct();
	}
}
?>