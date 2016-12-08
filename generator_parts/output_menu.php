<?php
$output_menu = "<!--  body menu starts here -->"	
."<body ng-controller=""."$db_name"."Ctrl">
."  <div class="container">
."    <div class="row">"
."    <div  class="row text-right">
."      <div class="col-md-12">
."      <a href='#' id="bpm-logo-care" class="btn collapsed" data-toggle="collapse" data-target="#bpm-logo, #bpm-liam-header"><i class="fa fa-caret-square-o-down"></i></a>
."      </div>"
."      <div class="col-md-12 collapse in text-right" id="bpm-liam-header">
."        <?php
."          // comment if you do NOT want to use LIAM for identity and access management
."          include_once '../_header_LIAM.inc.php'
."          // end liam header
."        ?>
."      </div>
."    </div>
."  </div>"
."    <div class="col-md-12 collapse in" id="bpm-logo">
."      <div class="col-md-6 "><svg height="100" width="100"><rect fill="red" x="0" y="0" width="100" height="100" rx="15" ry="15"></rect><text x="50" y="55" fill="white" text-anchor="middle" alignment-baseline="central">your logo</text></svg></div>
."      <div class="col-md-6 "><svg class="pull-right" height="100" width="200"><rect fill="blue" x="0" y="0" width="200" height="100" rx="15" ry="15"></rect><text x="100" y="55" fill="white" text-anchor="middle" alignment-baseline="central">"."$db_name"."</text></svg></div>
."    </div>
."  </div>
.""
."<nav class="navbar navbar-default bg-faded">
."  <div class="container">
."    <ul class="nav nav-tabs" id="bpm-menu">";
foreach($all_table_names as $value){
if ($value['is_in_menu'])
  ."      <li><a title="".$value['table_name']."" href="#".$value['table_name']."" data-toggle="tab"><i class="".$value['table_icon'].""></i> ".$value['table_alias']."</a></li>";
}	
$output_menu .= "    </ul>
."  </div>
."</nav>
."<!--  body menu starts here -->";
?>