<?php
require_once('Button.php');
class RectButton extends Button { 	
	function __construct(){		
		$this->file_name .= "rect/rect.svg";
		parent::__construct();
	}
}
?>