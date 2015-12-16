<?php

// Creates the absolute paths to be included when the ButtonFactory creates a new class
//function __autoload($class_name) {
//	$message = dirname(__FILE__).DIRECTORY_SEPARATOR."button_classes".DIRECTORY_SEPARATOR.$class_name.'.php';
//	error_log(date("d H:i:s",time())." - ".$message."\n", 3, plugin_dir_path( __FILE__ ).'tibdit.log');
//
//	include_once dirname(__FILE__).DIRECTORY_SEPARATOR."button_classes".DIRECTORY_SEPARATOR.$class_name.'.php';
//}

class ButtonFactory {

	// desc : Factory method.
	// param : A subclass of the Button class.
	// return : An instance of the button.
	static function make_button( $type ){
//		error_log("eric", 3, plugin_dir_path( __FILE__ ).'tibdit.log');
		// The class_exists involkes the autoload before throwing an exception if class does not exist.
		try{
			include dirname(__FILE__).DIRECTORY_SEPARATOR."button_classes".DIRECTORY_SEPARATOR.$type.'.php';
			return new $type();
		} catch(Exception $e) {
			echo $e;
		}
	}
}

// Generic Exception for all errors pertaining to the Button or subclasses.
class ButtonException extends Exception {}

?>
