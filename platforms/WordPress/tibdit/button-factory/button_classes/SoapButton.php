<?php
require_once('Button.php');
class SoapButton extends Button { 
	function __construct() {		
		$this->file_name .= "soap/soap.svg";
		parent::__construct();
	}
}
?>