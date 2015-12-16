<?php
require_once('SocialButton.php');
class SideSocialButton extends SocialButton {
    function __construct() {
        $this->file_name .= "social/side-social.svg";
        parent::__construct();
    }
}
?>