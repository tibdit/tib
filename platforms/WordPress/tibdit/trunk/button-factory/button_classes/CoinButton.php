<?php
require_once('Button.php');
class CoinButton extends Button {
	function __construct() {
		$this->file_name .= "coin/coin.svg";
		parent::__construct();
	}
	
}
?>