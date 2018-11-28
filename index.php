
<?php  include_once '_header.inc.php'; ?>
<!-- Content -->
<div ng-app="IPMS">
  <div ng-controller="IPMScontrol">

    <!-- CONNECT Part -->
		<div class="container" style="padding-top: 30px">
			<form class="bpm-server-connect" action="modules/ConnectDB.php">
		  <h3 class="title">connect</h3>
		  <div class="form-group row">
		    <label for="sqlServer" class="col-sm-2 form-control-label">Hostname</label>
		    <div class="col-sm-2">
		      <input type="text" class="form-control" autocomplete="off" name="host" id="sqlServer" ng-model="sqlServer" value='{{sqlServer}}'>
		    </div>
		    <label for="sqlPort" class="col-sm-2 form-control-label">Port</label>
		    <div class="col-sm-2">
		      <input type="number" autocomplete="off" class="form-control" name="port" id="sqlPort" ng-model="sqlPort" value={{sqlPort}}>
		    </div>
		    <div class="col-sm-1">
		      <button id="new" type="reset" class="btn btn-success" name="new">New</button>
		    </div>
		    <div class="col-sm-1">
		      <button id="" type="button" class="btn btn-info" name="_connect" value="true" ng-click="connectToDB()">Connect</button>
		    </div>
		  </div>
		  <div class="form-group row">
		    <label for="username" class="col-sm-2 form-control-label">Username</label>
		    <div class="col-sm-2">
		        <input type="text" autocomplete="off"  class="form-control" id="username" name="user" ng-model="username" value='{{username}}'>
		    </div>
		    <label for="password" class="col-sm-2 form-control-label">Password</label>
		    <div class="col-sm-2">
		      <input type="password"  autocomplete="off" class="form-control" id="sqlPass" name="pwd" ng-model="pw" value='{{pw}}'>
		    </div>
		    <!-- Button: Load -->
		    <div class="col-sm-1">
		      <a href="#loadDb" name="load" data-toggle="modal" id="loadF" class="btn btn-default "
		         name="load">Load</a>
		    </div>
		    <!-- Button: Save -->
		    <div class="col-sm-1">
		      <button type="button" name="save" id="save" class="btn btn-primary" name="save">Save</button>
		    </div>
		    <!-- Hidden area -->
		    <div class="col-sm-2">
		      <i class="fa fa-check" aria-hidden="true" style="display: none"></i>
		      <i class="fa fa-minus-circle" aria-hidden="true" style="display: none"></i>
		    </div>
		  </div>
			</form>
		</div>

    <!-- CONTENT -->
    <div class="container">

      <!-- Loading -->
      <div class="alert alert-info" ng-show="isLoading">
        <p><i class="fa fa-cog fa-spin"></i> Loading...</p>
      </div>
      <!-- Error Message -->
      <div class="alert alert-danger" ng-show="isError">
        <p><i class="fa fa-exclamation"></i> <strong>Error:</strong> Login data is not correct.</p>
      </div>

      <!-- DB Configuration -->
		  <div ng-if="dbNames">

        <!-- Database -->
        <div class="row">
          <div class="panel panel-default">
            <div class="panel-body">
              <form class="form-inline">
                <div class="form-group">
                  <label for="sqlDatabases"><span class="label label-success">1</span> Select a Database&nbsp;&nbsp;&nbsp;</label>
                  <select class="form-control" name="repeatSelect" id="repeatSelect" ng-model="dbNames.model" ng-change="changeSelection()">
                    <option ng-repeat="name in dbNames.names" value="{{name}}">{{name}}</option>
                  </select>
                  <button ng-click="changeSelection()" class="btn btn-default"><i class="fa fa-refresh"></i> Refresh</button>
                </div>
              </form>
            </div>
          </div>
        </div>

		    <!-- Load Config -->
		    <div class="row">
		      <label><span class="label label-warning">Optional</span> Load config</label>
		      <div class="panel panel-default">
            <div class="panel-body">
              <br>
              <!-- Automatically load config -->
              <h6>Automatically load config</h6>
              <button class="btn btn-default" ng-click="loadConfigByName()"><i class="fa fa-search"></i> Look for last config</button>
              <br>
              <br>
              <p class="text-danger" ng-show="configFileWasNotFound">No configuration file found</p>
              <p class="text-success" ng-show="configFileWasFound">Configuration file found and loaded</p>

              <hr ng-hide="configFileWasFound">
              <!-- Manually load config -->
              <div ng-hide="configFileWasFound">
                <h6>Manually load config</h6>
    		        <p>Paste the contents of the configuration file here:</p>
    		        <textarea class="form-control configtxt" ng-model="configtext" placeholder="Post Content of the Config-File here"></textarea>
    		        <br>
    		        <button class="btn btn-default" ng-click="loadconfig(configtext)">
                  <i class="fa fa-arrow-right"></i> Parse and Load configuration file
                </button>
              </div>
            </div>
		      </div>
		    </div>

        <!-- Content of Databases -->        
        <div class="row">

          <!-- Tables -->
          <div class="row">
            <label for="sqlTables" class="col-sm-2">
              <span class="label label-success">2</span> Tables
            </label>
            <table class="table table-bordered table-striped" id="loadedtables" style="background-color: #eee;"
              ng-model="tbl" id="row{{$index}}">
              <i>{{dbNames.model+' ,'}} {{tables.length}} Tabelle{{tables.length > 1 ? 'n' : ''}}</i>
              <thead>
                <tr>
                  <th width="10px"><span class="text-muted">Order</span></th>
                  <th width="25%">TABLENAME</th>
                  <th width="15%">ALIAS</th>
                  <th width="5%"><a href="" ng-click="tbl_toggle_sel_all()">IN MENU</a></th>
                  <th width="5%">STATE-ENGINE</th>
                  <th width="5%">RO (View)</th>
                  <th width="5%">N:M</th>
                  <th width="30%">ICON</th>
                </tr>
              </thead>
              <tbody ng-repeat="(name, tbl) in tables">
                <!-- Table START -->
                <tr>
                  <td>
                    <div style="white-space:nowrap; overflow: hidden;">
                      <!-- Expand / Collapse -->
                      <a class="btn" ng-click="toggle_kids(tbl)" title="Show column settings">
                        <i class="fa fa-plus-square" ng-if="!tbl.showKids"></i>
                        <i class="fa fa-minus-square" ng-if="tbl.showKids"></i>
                      </a>
                      <button class="btn btn-sm btn-success" ng-click="add_virtCol(tbl)">+ virt.Col</button>
                    </div>
                  </td>
                  <td>
                    <!-- Tablename -->
                    <p><b>{{name}}</b></p>
                  </td>
                  <td>
                    <input type="text" class="form-control" rows="1" cols="{{tbl.table_alias.length}}" 
                    ng-blur="checkSpell(tbl.table_alias)" ng-model="tbl.table_alias"/>
                  </td>
                  <td>
                    <input type="checkbox" class="form-control" ng-model="tbl.is_in_menu">
                  </td>
                  <td>
                    <input type="checkbox" class="form-control"
                      ng-model="tbl.se_active"
                      ng-disabled="tbl.table_name == 'state' || tbl.table_name == 'state_rules'">
                  </td>         
                  <td><input type="checkbox" class="form-control" ng-model="tbl.is_read_only"></td>
                  <td ng-class="{'success' : tbl.is_nm_table}"><input type="checkbox" class="form-control" ng-model="tbl.is_nm_table"></td>
                  <td>
                    <div class="row">
                      <div class="col-xs-3">
                        <i class="{{tbl.table_icon}}" style="cursor: pointer;"></i>
                      </div>
                      <div class="col-xs-9">
                        <input type="text" class="form-control" rows="1" cols="{{tbl.table_icon.length + 2}}" ng-model="tbl.table_icon"/>
                      </div>
                    </div>
                  </td>
                </tr>
                <!-- Columns START -->
                <tr ng-repeat="col in convertObjToArr(tbl.columns) | orderBy: 'col_order'" ng-show="tbl.showKids" ng-class="{'warning' : col.is_virtual}" style="font-size: .8em;">
                  <!-- Column Order -->
                  <td>
                    <div style="white-space:nowrap;overflow:hidden;">
                      <input type="text" style="width: 40px" ng-model="col.col_order" placeholder="0">
                      <a class="btn" ng-click="changeSortOrder(col, 1)"><i class="fa fa-angle-down"></i></a>
                      <a class="btn" ng-click="changeSortOrder(col, -1)"><i class="fa fa-angle-up"></i></a>
                    </div>
                  </td>
                  <!-- Column Name and Type -->
                  <td>
                    <div class="pull-left"><b>{{col.COLUMN_NAME}}</b></div>
                    <div class="pull-right">{{col.COLUMN_TYPE}}</div>
                    <div class="clearfix"></div>
                  </td>
                  <td><input type="text" ng-model="col.column_alias"></td>

                  <td colspan="5" ng-if="!col.is_virtual">
                    <input type="checkbox" ng-model="col.is_in_menu"> Visible&nbsp;&nbsp;&nbsp;
                    <!--<input type="checkbox" ng-model="col.is_read_only"> RO&nbsp;&nbsp;&nbsp;-->
                    <!--<input type="checkbox" ng-model="col.is_ckeditor"> CKEditor-->
                    
                    &nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;<b>FK:</b>
                    <input type="text" style="width: 80px" ng-model="col.foreignKey.table" placeholder="Table">
                    <input type="text" style="width: 80px" ng-model="col.foreignKey.col_id" placeholder="JoinID">
                    <input type="text" style="width: 80px" ng-model="col.foreignKey.col_subst" placeholder="ReplacedCloumn">
                  </td>

                  <td colspan="5" ng-if="col.is_virtual">
                    <span>SELECT ( i.e. CONCAT(a, b) ): </span>
                    <input type="text" ng-model="col.virtual_select" style="width: 300px" placeholder="CONCAT(id, col1, col2)">
                    <button class="btn btn-sm btn-danger" ng-click="del_virtCol(tbl, col)">delete</button>
                  </td>
                </tr>
                <!-- Columns END -->
              </tbody>
            </table>
          </div>

          <!-- Create Button -->
          <div class="row">&nbsp;</div>
          <div class="row">
            <label class="col-sm-2"><span class="label label-success">4</span> Generate</label>
            <div>
              <!-- Create Button -->
              <button name="createScript" class="btn btn-lg btn-danger" id="createScript" ng-click="create_fkt()">
                <i class="fa fa-rocket"></i> Generate!</button>
              <!-- Open Project -->
              <a name="test" class="btn btn-default" ng-click="openProject()" target="_blank">
                <i class="fa fa-folder-open"></i> Open Project</a>
              <!-- Open Test Dir Button -->
              <a name="test" class="btn btn-default" href="../IPMS_test/" target="_blank">
                <i class="fa fa-folder-open"></i> Open Test-Directory</a>
            </div>
          </div>

          <!-- File String -->
          <div class="row">
            <div class="col-md-12" id="code">
                <button class="btn btn-default bpm-copy" name="copy" data-clipboard-target="#bpm-code" >Copy
                  All</button>
                <div readonly style="width: 100%; min-height: 100px; resize: none; padding:
                  50px 0 0; margin:0 0 50px; overflow:auto;" class="bpm-textarea" id="bpm-code">
                  Currently Empty
                </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Load Modal -->
    <div class="modal fade" id="loadDb">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
              <h3 class="modal-title">Stored Connections</h3>
            </div>
            <div class="modal-body">
              <h5 class="text-center">List of Stored connections in Database</h5>
              <table class="table table-striped" id="tblGrid">
                <thead id="tblHead_1">
                <tr>
                  <th>Id</th>
                  <th>Host</th>
                  <th>Username</th>
                  <th>Port</th>
                  <th>Actions</th>
                </tr>
                </thead>
                <tbody class="connection-values">
                </tbody>
              </table>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-default " data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
    </div>

  </div>
</div>
<!-- Footer -->
<?php  include_once "_footer.inc.php" ?>