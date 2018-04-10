<!-- Loading Screen or Errors -->
<div class="container">
  <div class="alert alert-info" ng-show="isLoading">
    <p><i class="fa fa-cog fa-spin"></i> Loading ...</p>
  </div>
</div>

<!-- body content starts here  -->
<div class="container" id="content" ng-hide="isLoading" style="width: 100%">
  <div class="row">
    <div class="col-xs-12">

      <div class="panel panel-default panel-table">
        <!-- Panel Header -->
        <div class="panel-heading">
          <!-- Tabs-->
          <ul class="nav nav-tabs">
            <li ng-repeat="t in tables" ng-class="{active: (selectedTable.table_name == t.table_name)}" ng-if="t.is_in_menu">
              <a href="#{{t.table_name}}" data-toggle="tab" ng-click="changeTab(t.table_name)">
                <i class="{{t.table_icon}}"></i>&nbsp;<span ng-bind="t.table_alias"></span>
              </a>
            </li>
          </ul>
        </div>
        <!-- Panel Body -->
        <div class="panel-body">
          <div class="tab-content">
            <div>
              <!-- Table Options -->
              <form class="form-inline" style="background: #eee; padding: .5em;">
                <div class="form-group" >
                  <!-- DELETE -->
                  <button class="btn btn-danger" title="Show Process" ng-hide="!selectedRow" type="button"
                    ng-click="deleteEntry()"><i class="fa fa-trash"></i> Delete</button>
                </div>
              </form>
              <div class="tab-pane">
                <div class="table_x"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</div>

<!-- Modal for Create -->
<div class="modal fade" id="modalCreateEntry" tabindex="-1" role="dialog">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
        <h4 class="modal-title">
          <i class="fa fa-plus"></i> Create Entry <small>in <b>#Table</b></small>
        </h4>
      </div>
      <div class="modal-body">
        <div class="create_form"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-success" id="btnCreateEntry">
          <i class="fa fa-plus"></i> Create</button>
        &nbsp;
        <button class="btn btn-default pull-right" type="button" data-dismiss="modal">
          <i class="fa fa-times"></i> Close</button>
      </div>
    </div>
  </div>
</div>

<!-- Modal for Edit -->
<div class="modal fade" id="modalEditEntry" tabindex="-1" role="dialog">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
        <h4 class="modal-title">
          <i class="fa fa-pencil"></i> Edit Entry <small>in <b>#Table</b></small>
        </h4>
      </div>
      <div class="modal-body">
        <div class="edit_form"></div>
      </div>
      <div class="modal-footer">
        <span class="footer_btns">
          <button class="btn btn-primary" id="btnSaveEntry" type="button">Save &amp; Close</button>
        </span>
        &nbsp;
        <button class="btn btn-default pull-right" type="button" data-dismiss="modal">
          <i class="fa fa-times"></i> Close</button>
      </div>
    </div>
  </div>
</div>




<!-- Modal for Create -->
<div class="modal fade" id="modalCreate" tabindex="-1" role="dialog">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
        <h4 class="modal-title">
          <i class="fa fa-plus"></i> Create Entry <small>in <b>{{selectedTable.table_alias}}</b></small>
        </h4>
      </div>
      <div class="modal-body" style="max-height: 500px; overflow-y: auto;">
        <!-- Content -->
        <form class="form-horizontal">
          <!-- Add if is in menu -->
          <div class="form-group"
            ng-repeat="(key, value) in selectedRow track by $index"
            ng-if="selectedTable.columns[key].is_in_menu
              && selectedTable.form_data[key] != 'HI'
              && selectedTable.columns[key].EXTRA != 'auto_increment'">
            <!-- [LABEL] -->
            <label class="col-sm-3 control-label">{{selectedTable.columns[key].column_alias}}</label>
            <!-- [VALUE] -->
            <div class="col-sm-9">
              <!-- Foreign Key (FK) -->
              <span ng-if="selectedTable.columns[key].foreignKey.table != ''">
                <button class="btn btn-default"
                  ng-click="(selectedTable.form_data[key] == 'RO') || openFK(key)"
                  ng-readonly="selectedTable.form_data[key] == 'RO'"
                  ng-disabled="selectedTable.form_data[key] == 'RO'">
                  <i class="fa fa-key"></i> {{value}}
                </button>
              </span>
              <!-- NO FK -->
              <span ng-if="selectedTable.columns[key].foreignKey.table == ''">
                <!-- Number  -->
                <input class="form-control" type="number" string-to-number 
                  ng-if="selectedTable.columns[key].COLUMN_TYPE.indexOf('int') >= 0
                  && selectedTable.columns[key].COLUMN_TYPE.indexOf('tiny') < 0"
                  ng-model="selectedRow[key]"
                  ng-readonly="selectedTable.form_data[key] == 'RO'" autofocus>
                <!-- Text -->
                <input class="form-control" type="text"
                  ng-if="selectedTable.columns[key].COLUMN_TYPE.indexOf('int') < 0
                  && selectedTable.columns[key].COLUMN_TYPE.indexOf('long') < 0
                  && !selectedTable.columns[key].is_ckeditor
                  && selectedTable.columns[key].COLUMN_TYPE != 'datetime'
                  && selectedTable.columns[key].COLUMN_TYPE != 'date'"
                  ng-model="selectedRow[key]"
                  ng-readonly="selectedTable.form_data[key] == 'RO'" autofocus>
                <!-- LongText (probably HTML) -->
                <textarea class="form-control" rows="3"
                  ng-if="selectedTable.columns[key].COLUMN_TYPE.indexOf('longtext') >= 0
                  || selectedTable.columns[key].is_ckeditor"
                  ng-model="selectedRow[key]" style="font-family: Courier;"
                  ng-readonly="selectedTable.form_data[key] == 'RO'" autofocus></textarea>
                <!-- Boolean (tinyint or boolean) -->
                <input class="form-control" type="checkbox"
                  ng-if="selectedTable.columns[key].COLUMN_TYPE.indexOf('tinyint(') >= 0
                  && !selectedTable.columns[key].is_read_only"
                  ng-model="selectedRow[key]"
                  ng-true-value="'1'"
                  ng-false-value="'0'"
                  ng-readonly="selectedTable.form_data[key] == 'RO'"
                  style="width: 50px;"
                  autofocus>
                <!-- Date -->
                <input class="form-control" type="date"
                  ng-if="selectedTable.columns[key].COLUMN_TYPE == 'date'
                  && !selectedTable.columns[key].is_read_only"
                  ng-model="selectedRow[key]"
                  ng-model-options="{timezone: 'UTC'}"
                  ng-readonly="selectedTable.form_data[key] == 'RO'"
                  autofocus>
                <!-- Datetime -->
                <div class="form-inline"
                	ng-if="selectedTable.columns[key].COLUMN_TYPE == 'datetime'
	                  && !selectedTable.columns[key].is_read_only">
	                <input class="form-control col-sm-7" type="date"
	                  ng-model="selectedRow[key]"
	                  ng-model-options="{timezone: 'UTC'}"
	                  ng-readonly="selectedTable.form_data[key] == 'RO'">	                  
	                <input class="form-control col-sm-5" type="time"
	                  ng-model="selectedRow[key]"
	                  ng-model-options="{timezone: 'UTC'}"
	                  ng-readonly="selectedTable.form_data[key] == 'RO'">
	              </div>
              </span>
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <!-- CREATE / CLOSE -->
        <button class="btn btn-success" ng-click="send(selectedTable.table_name, 'create', {row: selectedRow, table: selectedTable})">
          <i class="fa fa-plus"></i> Create</button>
        &nbsp;
        <button class="btn btn-default pull-right" type="button" data-dismiss="modal">
          <i class="fa fa-times"></i> Close</button>
      </div>
    </div>
  </div>
</div>

<!-- Modal for Edit -->
<div class="modal fade" id="modalEdit" tabindex="-1" role="dialog">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">
          <i class="fa fa-pencil"></i> Edit Entry <small>in <b>{{selectedTable.table_alias}}</b></small>
        </h4>
      </div>
      <div class="modal-body" style="max-height: 500px; overflow-y: auto;">
        <!-- Content -->
        <form class="form-horizontal">
          <!-- Add if is in menu -->
          <div class="form-group"
            ng-repeat="(key, value) in selectedRow track by $index"
            ng-if="selectedTable.columns[key].is_in_menu
              && selectedTable.form_data[key] != 'HI'
              && selectedTable.columns[key].EXTRA != 'auto_increment'">
            <!-- [LABEL] -->
            <label class="col-sm-3 control-label">{{selectedTable.columns[key].column_alias}}</label>
            <!-- [VALUE] -->
            <div class="col-sm-9">
              <!-- Foreign Key (FK) -->
              <span ng-if="selectedTable.columns[key].foreignKey.table != ''">
              	<button class="btn btn-default"
                  ng-click="(selectedTable.form_data[key] == 'RO') || openFK(key)"
                  ng-readonly="selectedTable.form_data[key] == 'RO'"
                  ng-disabled="selectedTable.form_data[key] == 'RO'">
                  <i class="fa fa-key"></i> {{value}}
                </button>
              </span>
              <!-- NO FK -->
              <span ng-if="selectedTable.columns[key].foreignKey.table == ''">
                <!-- Number  -->
                <p class="form-control-static" ng-if="key == 'state_id'">
                  <b ng-if="!pendingState" ng-class="'state'+ selectedRow[key]">
                    {{substituteSE(selectedTable.table_name, selectedRow[key])}}</b>
                  <b ng-if="pendingState"><i class="fa fa-cog fa-spin"></i> Loading...</b>
                </p>
                <!-- Number  -->
                <input class="form-control" type="number" string-to-number 
                  ng-if="key != 'state_id' && selectedTable.columns[key].COLUMN_TYPE.indexOf('int') >= 0
                  && selectedTable.columns[key].COLUMN_TYPE.indexOf('tiny') < 0"
                  ng-model="selectedRow[key]"
                  ng-readonly="selectedTable.form_data[key] == 'RO'" autofocus>
                <!-- Text -->
                <input class="form-control" type="text"
                  ng-if="selectedTable.columns[key].COLUMN_TYPE.indexOf('int') < 0
                  && selectedTable.columns[key].COLUMN_TYPE.indexOf('long') < 0
                  && !selectedTable.columns[key].is_ckeditor
                  && selectedTable.columns[key].COLUMN_TYPE != 'date'
                  && selectedTable.columns[key].COLUMN_TYPE != 'datetime'
                  "
                  ng-model="selectedRow[key]"
                  ng-readonly="selectedTable.form_data[key] == 'RO'" autofocus>
                <!-- LongText (probably HTML) -->
                <textarea class="form-control" rows="3"
                  ng-if="selectedTable.columns[key].COLUMN_TYPE.indexOf('longtext') >= 0
                  || selectedTable.columns[key].is_ckeditor"
                  ng-model="selectedRow[key]" style="font-family: Courier;"
                  ng-readonly="selectedTable.form_data[key] == 'RO'" autofocus></textarea>
                <!-- Boolean (tinyint or boolean) -->
                <input class="form-control" type="checkbox"
                  ng-if="selectedTable.columns[key].COLUMN_TYPE.indexOf('tinyint(') >= 0
                  && !selectedTable.columns[key].is_read_only"
                  ng-model="selectedRow[key]"
                  ng-true-value="'1'"
                  ng-false-value="'0'"
                  ng-readonly="selectedTable.form_data[key] == 'RO'"
                  style="width: 50px;"
                  autofocus>
                <!-- Date -->
                <input class="form-control" type="date"
                  ng-if="selectedTable.columns[key].COLUMN_TYPE == 'date'
                  && !selectedTable.columns[key].is_read_only"
                  ng-model="selectedRow[key]"
                  ng-readonly="selectedTable.form_data[key] == 'RO'"
                  autofocus>
                <!-- Datetime -->
                <div class="form-inline" ng-if="selectedTable.columns[key].COLUMN_TYPE == 'datetime'
	                  && !selectedTable.columns[key].is_read_only">
	                <input class="form-control col-sm-7" type="date"
	                  ng-model="selectedRow[key]"
	                  ng-model-options="{timezone: 'UTC'}"
	                  ng-readonly="selectedTable.form_data[key] == 'RO'">	                  
	                <input class="form-control col-sm-5" type="time"
	                  ng-model="selectedRow[key]"
	                  ng-readonly="selectedTable.form_data[key] == 'RO'">
	              </div>
              </span>
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <!-- STATE MACHINE -->
        <span class="pull-left" ng-hide="!selectedTable.se_active || selectedTable.hideSmBtns">
          <span ng-hide="selectedTable.nextstates.length == 0">
            <p class="form-control-static pull-left"><i class="fa fa-floppy-o"></i> Save and goto&nbsp;</p>
          </span>
          <span ng-repeat="state in selectedTable.nextstates">
            <!-- Recursive State -->
            <span ng-if="state.name == selectedRow.state_id">
              <button class="btn btn-primary" ng-click="gotoState(state)"><i class="fa fa-floppy-o"></i> Save</button>
            </span>
            <!-- Normal state -->
            <span ng-if="state.name != selectedRow.state_id">
              <button class="btn btn-default stateBtn" ng-class="'state'+state.id" ng-click="gotoState(state)">{{state.name}}</button>
            </span>
          </span>
        </span>
        <!-- If has no StateMachine -->
        <span class="pull-left" ng-if="!selectedTable.se_active">
          <button class="btn btn-primary" ng-click="saveEntry()">
            <i class="fa fa-floppy-o"></i> Save</button>
          <button class="btn btn-primary" ng-click="saveEntry()" data-dismiss="modal">
            <i class="fa fa-floppy-o"></i> Save &amp; Close</button>
        </span>
        <!-- Close Button -->
        <button class="btn btn-default pull-right" type="button" data-dismiss="modal">
          <i class="fa fa-times"></i> Close</button>
      </div>
    </div>
  </div>
</div>

<!-- Modal for ForeignKey -->
<div class="modal fade" id="myFKModal" tabindex="-1" role="dialog">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="myFKModalLabel"><i class="fa fa-key"></i> Select a Foreign Key</h4>
      </div>
      <div class="modal-body">
        <div id="foreignTable"></div>
      </div>
      <div class="modal-footer">
        <div class="row">
          <div class="col-xs-12">
            <button class="btn btn-primary" type="button" onclick="test()"><i class="fa fa-floppy-o"></i> Save</button>
            <button class="btn btn-default pull-right" type="button" data-dismiss="modal"><i class="fa fa-times"></i> Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Modal for StateEngine -->
<div class="modal fade" id="modalStateMachine" tabindex="-1" role="dialog">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">
          <i class="fa fa-random"></i> State-Machine <small>for <b>{{selectedTable.table_alias}}</b></small>
        </h4>
      </div>
      <div class="modal-body">
        <div id="statediagram" style="max-height: 600px; overflow: auto;"></div>
      </div>
      <div class="modal-footer">
      	<!--<button type="button" class="btn btn-warning" id="test" ng-click="openSEPopup(selectedTable.table_name)">
          <i class="fa fa-refresh"></i> Refresh</button>-->
        <button type="button" class="btn btn-default pull-right" data-dismiss="modal"><i class="fa fa-times"></i> Close</button>
      </div>
    </div>
  </div>
</div>

<!-- Modal for Result -->
<div class="modal fade" id="modalResult" tabindex="-1" role="dialog">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
      <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">
          <i class="fa fa-arrow-right"></i> This modal is in a transition
        </h4>
      </div>
      <div class="modal-body">
        <p class="sm_result"></p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default pull-right" data-dismiss="modal"><i class="fa fa-times"></i> Close</button>
      </div>
    </div>
  </div>
</div>

<!-- content ends here -->
