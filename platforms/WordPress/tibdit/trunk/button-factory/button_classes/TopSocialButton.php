<?php
require_once('SocialButton.php');
class TopSocialButton extends SocialButton {
    function __construct() {
        $this->file_name .= "social/top-social.svg";
        parent::__construct();
    }
}
?>