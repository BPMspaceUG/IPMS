<?php
function getResultArray($result) {
	$results_array = array();
  if (!$result) return false;
	while ($row = $result->fetch_assoc()) {
		$results_array[] = $row;
	}
	return $results_array;
}

class RequestHandler 
{
    private $db;

    public function __construct() {
      // Get global variables here
      global $DB_host;
      global $DB_user;
      global $DB_pass;
      global $DB_name;
      
      $db = new mysqli($DB_host, $DB_user, $DB_pass, $DB_name);
      /* check connection */
      if($db->connect_errno){
        printf("Connect failed: %s\n", mysqli_connect_error());
        exit();
      }
      $db->query("SET NAMES utf8");
      $this->db = $db;
    }
	
    public function handle($command, $params) {
        switch($command) {

			case 'TABLE_NAME':
				$return = $this->get_TABLE_NAME_List();
				return json_encode($return);
				break;
   
			case 'create_TABLE_NAME':
				return $this->add_TABLE_NAME($params["ALL_NECCESATRY_ATTRIBUTES"]);
				break;
				
			case 'delete_TABLE_NAME':
				return $this->del_TABLE_NAME($params["TABLE_NAME_Primary_KEY"]);
				break;
      
			case 'update_TABLE_NAME':
				$id = $params["TABLE_NAME_Primary_KEY"];
				$res = $this->updateATTRIBUTE($id, $params["ATTRIBUTE"]);
				$res += $this->updateATTRIBUTE($id, $params["ATTRIBUTE"]);
				$res += $this->updateATTRIBUTE_3($id, $params["ATTRIBUTE_3"]);
//				if ($res != Number_of Attributes) return ''; else return $res;
				break;

				
			default:
				return ""; // empty string
				exit;
				break;
        }
    }

    ###################################################################################################################
    ####################### Definition der Handles
    ###################################################################################################################

	private function get_TABLE_NAME_List() {
        $query = "SELECT 
		primary_key,
		attribute,
		attribute,
		attribute_3,
	FROM
		TABLE_NAME;";
		
		$res = $this->db->query($query);
        $return['TABLE_NAME_List'] = getResultArray($res);
        return $return;
    }	

	private function update_TABLE_NAME_attribute($PRIMARY_KEY, $ATTRIBUTE) {
    $query = "UPDATE TABLE_NAME SET ATTRIBUTE = ? WHERE Primary_key = ?;";
    $stmt = $this->db->prepare($query); // prepare statement
    $stmt->bind_param("si", $name, $id); // bind params
    $result = $stmt->execute(); // execute statement
    return (!is_null($result) ? 1 : 0);
	}
	
	private function update_TABLE_NAME_attribute2($PRIMARY_KEY, $ATTRIBUTE) {
    $query = "UPDATE TABLE_NAME SET ATTRIBUTE = ? WHERE Primary_key = ?;";
    $stmt = $this->db->prepare($query); // prepare statement
    $stmt->bind_param("si", $name, $id); // bind params
    $result = $stmt->execute(); // execute statement
    return (!is_null($result) ? 1 : 0);
	}

	private function del_TABLE_NAME($id) {
		// TODO: Prepare statement
		$query = "DELETE from TABLE_NAME WHERE PRIMARY_KEY = ".$id.";";
        $result = $this->db->query($query);
		//if (!$result) $this->db->error;
		return (!is_null($result) ? 1 : null);
	}
}