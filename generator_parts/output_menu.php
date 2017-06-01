<!--  body menu starts here -->
<!--
<div class="container">
  <div class="row">
    <div  class="row text-right">
      <div class="col-md-12">
        <a href='#' id="bpm-logo-care" class="btn collapsed" data-toggle="collapse" data-target="#bpm-logo, #bpm-liam-header">
          <i class="fa fa-caret-square-o-down"></i>
        </a>
      </div>
      <div class="col-md-12 collapse" id="bpm-liam-header">
        <?php include_once('../_header_LIAM.inc.php'); ?>          
      </div>
    </div>
  </div>
  <!-- Company Header -->
  <!--
  <div class="row collapse">
    <div class="col-md-12" id="bpm-logo">
      <div class="col-md-6 ">
        <svg height="100" width="100">
          <rect fill="red" x="0" y="0" width="100" height="100" rx="15" ry="15"></rect>
          <text x="50" y="55" fill="white" text-anchor="middle" alignment-baseline="central">your logo</text>
        </svg>
      </div>
      <div class="col-md-6 ">
        <svg class="pull-right" height="100" width="200">
          <rect fill="blue" x="0" y="0" width="200" height="100" rx="15" ry="15"></rect>
          <text x="100" y="55" fill="white" text-anchor="middle" alignment-baseline="central">sample</text>
        </svg>
      </div>
    </div>
  </div>
  -->
  <!-- NAVIGATION -->
  <nav class="navbar navbar-nav">
    <div class="container">
      <ul class="nav nav-pills">
        <li ng-repeat="table in tables | orderBy : 'table_alias'">
          <a title="Goto table {{table.table_alias}}" href="#{{table.table_name}}" class="tab" data-toggle="tab" ng-click="changeTab()">
            <i class="{{table.table_icon}}"></i>&nbsp;{{table.table_alias}}</a>
        </li>
      </ul>
    </div>
  </nav>