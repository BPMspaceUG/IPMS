<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" ng-app="sampleApp">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>BPMspace sample</title>
  <!-- CSS -->
  <link rel="stylesheet" href="../css/bootstrap.min.css" media="screen" />
  <link rel="stylesheet" href="../css/font-awesome.min.css" />
  <link rel="stylesheet" href="../css/fuelux.min.css" />
  <link rel="stylesheet" href="../css/xeditable.css" />
  <link rel="stylesheet" href="./css/jsonviewer.css" />
  <link rel="stylesheet" href="./css/muster.css" />

  <!-- <link rel="stylesheet" href="css/sample.css" /> -->
</head>
<!--  header ends here -->

<!--  body menu starts here -->
<body ng-controller="sampleCtrl">
  <app></app>
  <div class="container">
    <div class="row">
      <div  class="row text-right">
        <div class="col-md-12">
          <a href='#' id="bpm-logo-care" class="btn collapsed" data-toggle="collapse" data-target="#bpm-logo, #bpm-liam-header"><i class="fa fa-caret-square-o-down"></i></a>
        </div>
        <div class="col-md-12 collapse in text-right" id="bpm-liam-header">
          <?php
          // comment if you do NOT want to use LIAM for identity and access management
          include_once '../_header_LIAM.inc.php'
          // end liam header
          ?>

        </div>
      </div>
    </div>
    <div class="col-md-12 collapse in" id="bpm-logo">
      <div class="col-md-6 "><svg height="100" width="100"><rect fill="red" x="0" y="0" width="100" height="100" rx="15" ry="15"></rect><text x="50" y="55" fill="white" text-anchor="middle" alignment-baseline="central">your logo</text></svg></div>
      <div class="col-md-6 "><svg class="pull-right" height="100" width="200"><rect fill="blue" x="0" y="0" width="200" height="100" rx="15" ry="15"></rect><text x="100" y="55" fill="white" text-anchor="middle" alignment-baseline="central">sample</text></svg></div>
    </div>
  </div>
<div id="json-renderer" class="collapsed"></div>

  <nav class="navbar navbar-default bg-faded">
    <div class="container">
      <ul class="nav nav-tabs" id="bpm-menu">
        <li ng-repeat="table in tables">
          <a id="nav-{{table.htmlID}}" title="{{table.tablename}}" href="#{{table.htmlID}}" data-toggle="tab">
          <i class="fa fa-circle-o"></i>{{table.tablename}}</a>
        </li>
      </ul>
    </div>
  </nav>


  <!--  body menu starts here -->
  <!--  body content starts here -->
  <div class="container">
    <div class="row">
      <div class="col-md-12 tab-content" id="bpm-content">
        Log History <input type="checkbox" ng-model="historyLog">
        <div ng-repeat="log in changeHistory | limitTo:-3">{{log.changeHistorycounter}} Tabelle: {{log.table}} Zeile: {{(log.rowID +1)}} Spalte: {{(log.colID +1)}}
        <textarea rows="1" cols="40">{{log.cell}}</textarea>
        </div>
        <div ng-repeat="table in tables track by $index" class="tab-pane" id="{{table.htmlID}}">
          
          <h2>{{table.tablename}}</h2>
          <table class="table" >
            <th>{{table.columnames.length}} Spalten, {{table.rows.length}} Zeilen</th>
            <th ng-repeat="name in table.columnames">{{name}}</th>

            <tr ng-repeat="row in table.rows" 
                ng-model="table"
                data-toggle='modal' 
                data-target="modal-container-1"
                id="row{{'' + $parent.$index + $index}}">
              <td>
                <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
                <button id="btnRow{{'' + $parent.$index + $index}}" 
                class="btnUpdate" 
                ng-click="update()"
                >update</button>
              </td>
             <td ng-repeat="cell in row track by $index">
              <!-- xeditable controllfield -->
              <a 
              href="#" editable-text="cell"
              >{{ cell || "empty" }}</a>
              <!-- normal Textarea -->
              <textarea 
              rows="1" cols="{{cell.length}}" 
              ng-focus="rememberOrigin(table.tablename, row, cell, $parent.$index, $index)"
              ng-blur="checkCellChange(table, row, cell, $parent.$parent.$index, $parent.$index, $index)"
              ng-model="cell">{{cell}}</textarea>
             </td>
            </tr>

            <tr class="newRows">
             <td>
              <i class="fa fa-plus" aria-hidden="true"></i>
              <button class="btnnewRows" ng-click="createRow(table)">create</button>
             </td>
             <td ng-repeat="col in table.newRows[0] track by $index">
              <textarea ng-model="table.newRows[0][$index]"></textarea>
             </td>
            </tr>

            <tr class="newRows" ng-repeat="row in table.newRows track by $index" ng-if="$index > 0">
              <td></td>
             <td  ng-repeat="col in row track by $index">
              <textarea ng-model="table.newRows[$parent.$index][$index]" ng-focus="addNewRow(table)"></textarea>
             </td>
            </tr>
          </table>
        </div>
 <div class="modal fade edums-tamodal" id="modal-container-1" role="dialog" >
   <div class="modal-dialog" role="document">
     <div class="modal-content edums-tamodal-tacontent">

       <button type="button" class="close edums-tacontent-btnclose" data-dismiss="modal" aria-hidden="true">X </button>
          </div>
          </div>
          </div>

              <!--  body content ends here -->

              <!--  footer starts here -->

              <div class="container">
                <div class="row well" id="bpm-footer">
                  <div class="col-md-3">BPMspace sample using</div>
                  <small><div class="col-md-9">
                    <ul class="list-inline">
                      <li><a href="http://getbootstrap.com/" target="_blank">Bootstrap</a></li>
                      <li><a href="https://jquery.com/" target="_blank">jQuery</a></li>
                      <li><a href="https://angularjs.org/" target="_blank">AngularJS</a></li>
                      <li><a href="http://php.net/" target="_blank">PHP</a></li>
                      <li><a href="http://getfuelux.com/" target="_blank">FuelUX</a></li>
                      <li><a href="https://angular-ui.github.io/" target="_blank">AngularUI</a></li>
                      <li><a href="https://www.tinymce.com/" target="_blank">TinyMCE</a></li>
                      <li><a href="https://vitalets.github.io/x-editable/" target="_blank">X-editable</a></li>
                      <li><a href="https://github.com/peredurabefrog/phpSecureLogin" target="_blank">phpSecureLogin</a></li>
                    </ul>
                  </div><small>
                </div>
              </div>
              <!-- JS -->
              <script type="text/javascript" src="../js/angular.min.js"></script>
              <script type="text/javascript" src="../js/angular-sanitize.min.js"></script>
              <script type="text/javascript" src="../js/ui-bootstrap-1.3.1.min.js"></script>
              <script type="text/javascript" src="../js/ui-bootstrap-tpls-1.3.1.min.js"></script>
              <script type="text/javascript" src="../js/jquery-2.1.4.min.js"></script>
              <script type="text/javascript" src="../js/tinymce.min.js"></script>
              <script type="text/javascript" src="../js/tinymceng.js"></script>
              <script type="text/javascript" src="../js/bootstrap.min.js"></script>
              <script type="text/javascript" src="../js/xeditable.min.js"></script>
              <script type="text/javascript" src="../js/jsonviewer.min.js"></script>
              <script type="text/javascript" src="./js/muster.js"></script>
              <!-- <script type="text/javascript" src="js/sample.js"></script> -->
              
  </body>
</html>


<!--  footer ends here -->
