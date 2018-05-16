<?php
  // Includes
  $config_file = __DIR__."/../replaceDBName-config.inc.php";
  if (file_exists($config_file)) include_once($config_file);
  
  /****************************************************/
  /* Class: Database                                  */
  /****************************************************/
  class DB {
    private $_connection;
    private static $_instance; //The single instance

    public static function getInstance() {
      if(!self::$_instance) { // If no instance then make one
        self::$_instance = new self();
      }
      return self::$_instance;
    }
    // Constructor
    private function __construct() {
      $this->_connection = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
      // Error handling
      if(mysqli_connect_error()) {
        trigger_error("Failed to connect to MySQL: ".mysql_connect_error(), E_USER_ERROR);
      }
    }
    // Magic method clone is empty to prevent duplication of connection
    private function __clone() {
    }
    // Get mysqli connection
    public function getConnection() {
      return $this->_connection;
    }
    public function __destruct() {
      $this->_connection->close();
    }
  }
?>