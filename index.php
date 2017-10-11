
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

		<div ng-if="dbNames">

		    <!-- Load Config -->
		    <div class="row">&nbsp;</div>
		    <div class="row">
		      <label class="col-sm-2"><span class="label label-warning">Optional</span> Load config</label>
		      <div>
		        <p>Paste the content of the configuration file here:</p>
		        <textarea class="form-control configtxt" ng-model="configtext"></textarea>
		        <br>
		        <button class="btn btn-default" ng-click="loadconfig(configtext)">
		        	<i class="fa fa-arrow-right"></i> Parse and Load configuration file</button>
		      </div>
		    </div>

		    <hr>

        	<!-- Content of Databases -->        
          	<div class="row">
            <!-- Database -->
            <div class="row form-group">
              <label for="sqlDatabases" class="col-sm-2"><span class="label label-success">1</span> Select Database</label>
              <select class="form-control" name="repeatSelect" id="repeatSelect" ng-model="dbNames.model" ng-change="updateTables(dbNames.model)" style="display: inline-block; max-width: 400px;">
                <option ng-repeat="name in dbNames.names" value="{{name}}" >{{name}}</option>
              </select>
            </div> 
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
                    <th width="10px"></th>
                    <th width="15%">TABLENAME</th>
                    <th width="20%">ALIAS</th>
                    <th width="5%"><a href="" ng-click="tbl_toggle_sel_all()">IN MENU</a></th>
                    <th width="5%">STATE-ENGINE</th>
                    <th width="5%">RO (View)</th>
                    <th width="40%">ICON</th>
                  </tr>
                </thead>
                <tbody ng-repeat="tbl in tables track by $index">
                  <!-- Table START -->
                  <tr>
                    <td><a class="btn" ng-click="toggle_kids(tbl)" title="Show column settings"><i class="fa fa-plus-square"></i></a></td>
                    <td><p><b>{{tbl.table_name}}</b></p></td>
                    <td>
                      <input type="text" class="form-control" rows="1" cols="{{tbl.table_alias.length}}" 
                      ng-blur="checkSpell(tbl.table_alias)" ng-model="tbl.table_alias"/>
                    </td>
                    <td><input type="checkbox" class="form-control" ng-model="tbl.is_in_menu"></td>
                    <td><input type="checkbox" class="form-control" ng-model="tbl.se_active" ng-disabled="tbl.table_name == 'state' || tbl.table_name == 'state_rules'"></td>         
                    <td><input type="checkbox" class="form-control" ng-model="tbl.is_read_only"></td>
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
                  <tr ng-repeat="col in tbl.columns" ng-show="tbl.showKids" style="font-size: .8em;">
                    <td>&nbsp;</td>
                    <td>{{col.COLUMN_NAME}}<!-- ({{col.COLUMN_KEY}}, {{col.COLUMN_TYPE}}, {{col.EXTRA}}) --></td>
                    <td><input type="text" ng-model="col.column_alias"></td>
                    <td colspan="4">
                      <input type="checkbox" ng-model="col.is_in_menu"> Visible&nbsp;&nbsp;&nbsp;
                      <input type="checkbox" ng-model="col.is_read_only"> RO&nbsp;&nbsp;&nbsp;
                      <input type="checkbox" ng-model="col.is_ckeditor"> CKEditor
                      &nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;<b>FK:</b>
                      <input type="text" style="width: 80px" ng-model="col.foreignKey.table" placeholder="Table">
                      <input type="text" style="width: 80px" ng-model="col.foreignKey.col_id" placeholder="JoinID">
                      <input type="text" style="width: 80px" ng-model="col.foreignKey.col_subst" placeholder="ReplacedCloumn">
                    </td>
                  </tr>
                  <!-- Columns END -->
                </tbody>
              </table>
            </div>

            <!-- Create Button -->
            <div class="row">&nbsp;</div>
            <div class="row">
              <label class="col-sm-2"><span class="label label-success">4</span> Create</label>
              <div>
                <!-- Create Button -->
                <button name="createScript" class="btn btn-lg btn-danger" id="createScript" ng-click="create_fkt()">
                  <i class="fa fa-play"></i> CREATE</button>
                <!-- Open Test Dir Button -->
                <a name="test" class="btn btn-sm btn-success" href="../IPMS_test/" target="_blank">
                  <i class="fa fa-folder-open"></i> Open Test Directory</a>
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