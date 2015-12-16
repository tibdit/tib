<?php
require_once('Button.php');
class HexButton extends Button { 
	function __construct() {		
		$this->file_name .= "hex/hex.svg";
		parent::__construct();
	}
}
?>