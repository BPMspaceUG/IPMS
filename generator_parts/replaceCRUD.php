<?php
  foreach ($all_table_names as $table) {
    //for each table of the sected DB generate CRUD functions
    $query = "SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '".$table["table_name"]."' AND TABLE_SCHEMA = '$db_name'";
    if (!$result = $con->query($query)) {
      die('There was an error running the query [' . $con->error . ']');
    }
    $columns_info = $result->fetch_all(MYSQLI_ASSOC);

    $prim_key = array();
    $i = 0;
    foreach ($columns_info as $value){
      if ($value['COLUMN_KEY'] == "PRI") {
        $output_RequestHandler .=  "     //Primary Key[".$i."] ".$value['COLUMN_NAME']."";
        $prim_key[$i] = $value['COLUMN_NAME'];
        $i++;
      }
    }

    $foreign_key = array();
    public function read_$table[table_name]($parameter = array())
    {
      $sql = "SELECT ";
      $sql .= array_key_exists("select",$parameter)?$parameter['select']:'*';
      $sql .= " FROM $table[table_name]";
      $sql .= array_key_exists("inner_join_1",$parameter)?" INNER JOIN ".$parameter['inner_join_1']:'';
      $sql .= array_key_exists("inner_join_2",$parameter)?" INNER JOIN ".$parameter['inner_join_2']:'';
      $sql .= array_key_exists("inner_join_3",$parameter)?" INNER JOIN ".$parameter['inner_join_3']:'';
      $sql .= array_key_exists("where",$parameter)?" WHERE ".$parameter['where']:'';
      $sql .= array_key_exists("order_by",$parameter)?" ORDER BY ".$parameter['order_by']:'';
      $sql .= array_key_exists("limit",$parameter)?" LIMIT ".$parameter['limit']:'LIMIT 100';
      $query = $this->db->query($sql);
      return !empty($query)?$this->getResultArray($query):false;
    }