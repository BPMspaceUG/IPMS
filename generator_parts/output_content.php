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
          <div class="row">
            <div class="col-sm-8 col-xs-12">
              <!-- Tabs-->
              <ul class="nav nav-tabs">
                <li ng-repeat="t in tables" ng-class="{active: (selectedTable.table_name == t.table_name)}" ng-if="t.is_in_menu">
                  <a href="#{{t.table_name}}" data-toggle="tab" ng-click="changeTab(t.table_name)">
                    <i class="{{t.table_icon}}"></i>&nbsp;<span ng-bind="t.table_alias"></span>
                  </a>
                </li>
              </ul>
            </div>
            <!-- Where filter -->
            <div class="col-sm-4 col-xs-12">
              <form class="form-inline pull-right">
                <div class="form-group" style="white-space: nowrap; /*Prevents Wrapping*/">
                  <!-- PROCESS -->
                  <button class="btn btn-default" title="Show Process" ng-hide="!selectedTable.se_active" type="button"
                    ng-click="openSEPopup(selectedTable.table_name)" style="display: inline-block;"><i class="fa fa-random"></i></button>
                  <!-- ADD -->
                  <button class="btn btn-success" title="Create Entry" ng-hide="selectedTable.is_read_only" type="button"
                  	ng-click="addEntry(selectedTable.table_name)" style="display: inline-block;"><i class="fa fa-plus"></i></button>
                  <!-- SEARCH -->
                  <input type="text" class="form-control searchfield" placeholder="Search..."
                    ng-model="selectedTable.sqlwhere" style="display: inline-block; max-width: 150px" autofocus>
                  <!-- REFRESH -->
                  <button class="btn btn-default" title="Refresh" 
                  	ng-click="refresh(selectedTable.table_name);" style="display: inline-block;"><i class="fa fa-refresh"></i></button>
                </div>
              </form>
            </div>
            <!--Clear -->
            <div class="clearfix"></div>
          </div>
        </div>
        <!-- Panel Body -->
        <div class="panel-body" ng-class="{'text-primary': (selectedTable.sqlwhere_old.length != 0)}">
          <div class="tab-content" style="overflow: auto;">
            <div ng-repeat="(name, table) in tables" class="tab-pane" ng-class="{active: (selectedTable.table_name == table.table_name)}" id="{{table.table_name}}">
            	<!-- No Entries -->
            	<table class="table table-bordered table-condensed" ng-if="table.count <= 0">
            		<thead>
            			<tr><th style="padding: 3em 0; font-weight: normal;">No entries found</th></tr>
            		</thead>          		
            	</table>
              <!-- Data content -->
              <table class="table table-bordered table-striped table-hover table-condensed tableCont" ng-if="table.count > 0">
                <!-- ============= COLUMN HEADERS ============= -->
                <thead>
                  <tr>
                    <!-- Control-Column -->
                    <th ng-hide="table.is_read_only">
                      <em class="fa fa-cog"></em>
                    </th>
                    <!-- Data-Columns -->
                    <th ng-repeat="col in table.columns | orderObjectBy:'col_order':false"
                    		ng-click="sortCol(table, col.COLUMN_NAME)"
                        ng-class="{sorted: table.sqlorderby == col.COLUMN_NAME}"
                    		ng-if="col.is_in_menu">
                      <span>{{col.column_alias}}
                        <i class="fa fa-caret-down" ng-show="table.sqlorderby == col.COLUMN_NAME && table.sqlascdesc == 'desc'"></i>
                        <i class="fa fa-caret-up" ng-show="table.sqlorderby == col.COLUMN_NAME && table.sqlascdesc == 'asc'"></i>
                      </span>
                    </th>
                  </tr>
                </thead>
                <!-- ============= CONTENT ============= -->
                <tbody>
                  <!-- Rows -->
                  <tr ng-repeat="row in table.rows" ng-class="getRowCSS(row)">
                    <!-- Control-Column -->
                    <td class="controllcoulm" ng-hide="table.is_read_only">
                      <!--<button class="btn btn-default" ng-click="editEntry(table, row)" title="Edit Entry">
                        <i class="fa fa-pencil"></i>
                      </button>-->
                      <button class="btn btn-danger" ng-click="deleteEntry(table, row)" title="Delete Entry">
                        <i class="fa fa-times"></i>
                      </button>
                    </td>
                    <!-- Cells -->
                    <td ng-repeat="col in table.columns | orderObjectBy:'col_order':false"
                      ng-click="editEntry(table, row)"
                    	ng-if="col.is_in_menu">
                      <!-- Substitue StateMachine -->
                      <!-- TODO: Use maybe ForeignKeys for this function -->
                      <div ng-if="(col.COLUMN_NAME == 'state_id' && table.se_active)">
                        <b ng-class="'state'+ row[col.COLUMN_NAME]">{{substituteSE(table.table_name, row[col.COLUMN_NAME])}}</b>
                      </div>
                      <!-- Cell -->
                      <span ng-if="!(col.COLUMN_NAME == 'state_id' && table.se_active)">
                        {{ row[col.COLUMN_NAME] | limitTo: 40 }}{{ row[col.COLUMN_NAME].length > 40 ? '...' : ''}}
                     	</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <!-- Panel Footer -->
        <div class="panel-footer">
          <div class="row">
            <div class="col col-xs-6">
              <span class="text-primary">
                <span>{{selectedTable.count}} Entries total</span>
                <span ng-if="getNrOfPages(selectedTable) > 0"> - Page {{selectedTable.PageIndex + 1}} of {{ getNrOfPages(selectedTable) }}</span>
              </span>
            </div>
            <div class="col col-xs-6">
              <ul class="pagination pull-right"><!-- visible-xs -->
                <!-- JUMP to first page -->
                <li ng-class="{disabled: selectedTable.PageIndex <= 0}">
                  <a href="" ng-click="gotoPage(0, selectedTable)">«</a>
                </li>          
                <!-- Page Buttons -->
                <li ng-repeat="btn in getPageination(selectedTable.table_name)"
                  ng-class="{disabled: btn + selectedTable.PageIndex == selectedTable.PageIndex}">
                  <a href="" ng-click="gotoPage(btn + selectedTable.PageIndex, selectedTable)">{{btn + selectedTable.PageIndex + 1}}</a>
                </li>
                <!-- JUMP to last page -->
                 <li ng-class="{disabled: (selectedTable.PageIndex + 1) >= (selectedTable.count / PageLimit)}">
                  <!-- TODO: fix 9999 number, maybe to (-1) -->
                  <a href="" ng-click="gotoPage(999999, selectedTable)">»</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

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
      <div class="modal-body" style="max-height: 600px; overflow-y: auto;">
        <!-- Content -->
        <form class="form-horizontal">
          <!-- Add if is in menu -->
          <div class="form-group"
            ng-repeat="(key, value) in selectedRow track by $index"
            ng-if="getColByName(selectedTable, key).is_in_menu && (selectedTable.form_data[key] != 'HI')">
            <!-- [LABEL] -->
            <label class="col-sm-3 control-label">{{getColAlias(selectedTable, key)}}</label>
            <!-- [VALUE] -->
            <div class="col-sm-9">
              <!-- Foreign Key (FK) -->
              <span ng-if="getColByName(selectedTable, key).foreignKey.table != ''">
                <button class="btn btn-default"
                  ng-click="(selectedTable.form_data[key] == 'RO') || openFK(key)"
                  ng-readonly="selectedTable.form_data[key] == 'RO'"
                  ng-disabled="selectedTable.form_data[key] == 'RO'">
                  <i class="fa fa-key"></i> {{value}}
                </button>
              </span>
              <!-- NO FK -->
              <span ng-if="getColByName(selectedTable, key).foreignKey.table == ''">
                <!-- Number  -->
                <input class="form-control" type="number" string-to-number 
                  ng-if="getColByName(selectedTable, key).COLUMN_TYPE.indexOf('int') >= 0
                  && getColByName(selectedTable, key).COLUMN_TYPE.indexOf('tiny') < 0"
                  ng-model="selectedRow[key]"
                  ng-readonly="selectedTable.form_data[key] == 'RO'" autofocus>
                <!-- Text -->
                <input class="form-control" type="text"
                  ng-if="getColByName(selectedTable, key).COLUMN_TYPE.indexOf('int') < 0
                  && getColByName(selectedTable, key).COLUMN_TYPE.indexOf('long') < 0
                  && !getColByName(selectedTable, key).is_ckeditor"
                  ng-model="selectedRow[key]"
                  ng-readonly="selectedTable.form_data[key] == 'RO'" autofocus>
                <!-- LongText (probably HTML) -->
                <textarea class="form-control" rows="3"
                  ng-if="getColByName(selectedTable, key).COLUMN_TYPE.indexOf('longtext') >= 0
                  || getColByName(selectedTable, key).is_ckeditor"
                  ng-model="selectedRow[key]" style="font-family: Courier;"
                  ng-readonly="selectedTable.form_data[key] == 'RO'" autofocus></textarea>
                <!-- Boolean (tinyint or boolean) -->
                <input class="form-control"
                  type="checkbox"
                  ng-show="getColByName(selectedTable, key).COLUMN_TYPE.indexOf('tinyint') >= 0
                  && !getColByName(selectedTable, key).is_read_only"
                  ng-model="selectedRow[key]"
                  ng-true-value="'1'"
                  ng-false-value="'0'"
                  ng-readonly="selectedTable.form_data[key] == 'RO'"
                  style="width: 50px;"
                  autofocus>
                <!-- TODO: Date -->
              </span>
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <!-- CREATE / CLOSE -->
        <button class="btn btn-success" ng-click="send('create', {row: selectedRow, table: selectedTable})">
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
      <div class="modal-body" style="max-height: 600px; overflow-y: auto;">
        <!-- Content -->
        <form class="form-horizontal">
          <!-- Add if is in menu -->
          <div class="form-group"
            ng-repeat="(key, value) in selectedRow track by $index"
            ng-if="getColByName(selectedTable, key).is_in_menu && (selectedTable.form_data[key] != 'HI')">
            <!-- [LABEL] -->
            <label class="col-sm-3 control-label">{{getColAlias(selectedTable, key)}}</label>
            <!-- [VALUE] -->
            <div class="col-sm-9">
              <!-- Foreign Key (FK) -->
              <span ng-if="getColByName(selectedTable, key).foreignKey.table != ''">
              	<button class="btn btn-default"
                  ng-click="(selectedTable.form_data[key] == 'RO') || openFK(key)"
                  ng-readonly="selectedTable.form_data[key] == 'RO'"
                  ng-disabled="selectedTable.form_data[key] == 'RO'"
                  >
                  <i class="fa fa-key"></i> {{value}}
                </button>
              </span>
              <!-- NO FK -->
              <span ng-if="getColByName(selectedTable, key).foreignKey.table == ''">
                <!-- Number  -->
                <p class="form-control-static" ng-if="key == 'state_id'">
                  <b ng-if="!pendingState" ng-class="'state'+ selectedRow[key]">
                    {{substituteSE(selectedTable.table_name, selectedRow[key])}}</b>
                  <b ng-if="pendingState"><i class="fa fa-cog fa-spin"></i> Loading...</b>
                </p>
                <!-- Number  -->
                <input class="form-control" type="number" string-to-number 
                  ng-if="key != 'state_id' && getColByName(selectedTable, key).COLUMN_TYPE.indexOf('int') >= 0
                  && getColByName(selectedTable, key).COLUMN_TYPE.indexOf('tiny') < 0"
                  ng-model="selectedRow[key]"
                  ng-readonly="selectedTable.form_data[key] == 'RO'" autofocus>
                <!-- Text -->
                <input class="form-control" type="text"
                  ng-if="getColByName(selectedTable, key).COLUMN_TYPE.indexOf('int') < 0
                  && getColByName(selectedTable, key).COLUMN_TYPE.indexOf('long') < 0
                  && !getColByName(selectedTable, key).is_ckeditor"
                  ng-model="selectedRow[key]"
                  ng-readonly="selectedTable.form_data[key] == 'RO'" autofocus>
                <!-- LongText (probably HTML) -->
                <textarea class="form-control" rows="3"
                  ng-if="getColByName(selectedTable, key).COLUMN_TYPE.indexOf('longtext') >= 0
                  || getColByName(selectedTable, key).is_ckeditor"
                  ng-model="selectedRow[key]" style="font-family: Courier;"
                  ng-readonly="selectedTable.form_data[key] == 'RO'" autofocus></textarea>
                <!-- Boolean (tinyint or boolean) -->
                <input class="form-control"
                  type="checkbox"
                  ng-show="getColByName(selectedTable, key).COLUMN_TYPE.indexOf('tinyint') >= 0
                  && !getColByName(selectedTable, key).is_read_only"
                  ng-model="selectedRow[key]"
                  ng-true-value="'1'"
                  ng-false-value="'0'"
                  ng-readonly="selectedTable.form_data[key] == 'RO'"
                  style="width: 50px;"
                  autofocus>
                <!-- TODO: Date -->
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
            <span ng-if="state.id == selectedRow.state_id">
              <a class="btn btn-primary" ng-click="gotoState(state)">
                <i class="fa fa-floppy-o"></i> Save</a>
            </span>
            <!-- Normal state -->
            <span ng-if="state.id != selectedRow.state_id" class="btn btn-default stateBtn"
              ng-class="'state'+state.id" ng-click="gotoState(state)">{{state.name}}</span>
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
<div class="modal fade" id="myFKModal" tabindex="-1" role="dialog"">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="myFKModalLabel"><i class="fa fa-key"></i> Select a Foreign Key</h4>
      </div>
      <div class="modal-body">
        <!-- Search form -->
        <form class="form-inline">
          <div class="form-group">
            <label for="searchtext">Search:</label>
            <input type="text" class="form-control" id="searchtext" placeholder="Seachword" ng-model="FKTbl.sqlwhere" autofocus>
          </div>
          <button type="submit" class="btn btn-default" ng-click="refresh(FKTbl.table_name)"><i class="fa fa-search"></i> Search</button>
        </form>
        <br>
        <!-- Table Content -->
        <div style="overflow: auto;">
          <table class="table table-bordered table-striped table-hover table-condensed table-responsive">
            <thead>
              <tr>
                <th ng-repeat="(key, value) in FKTbl.rows[0]" ng-if="getColByName(FKTbl, key).is_in_menu">
                  <span>{{getColAlias(FKTbl, key)}}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr ng-repeat="row in FKTbl.rows" ng-click="selectFK(row)" style="cursor: pointer;">
                <td ng-repeat="(key, value) in row" ng-if="getColByName(FKTbl, key).is_in_menu">
                  {{value | limitTo: 50}}{{value.length > 50 ? '...' : ''}}
                </td>
              </tr>
            </tbody>
          </table>
        </div>        
        <span class="text-primary">
          <span>{{FKTbl.count}} Entries total</span>
          <span ng-if="getNrOfPages(FKTbl) > 0"> - Page {{FKTbl.PageIndex + 1}} of {{ getNrOfPages(FKTbl) }}</span>
        </span>
      </div>
      <div class="modal-footer">
        <div class="row">
          <div class="col-xs-8">
            <ul class="pagination" style="margin:0; padding:0;">
              <li ng-class="{disabled: FKTbl.PageIndex <= 0}"><a href="" ng-click="gotoPage(0, FKTbl)">«</a></li>          
              <li ng-repeat="btn in getPageination(FKTbl.table_name)"
                ng-class="{disabled: btn + FKTbl.PageIndex == FKTbl.PageIndex}">
                <a href="" ng-click="gotoPage(btn + FKTbl.PageIndex, FKTbl)">{{btn + FKTbl.PageIndex + 1}}</a>
              </li>
              <li ng-class="{disabled: (FKTbl.PageIndex + 1) >= (FKTbl.count / PageLimit)}">
                <a href="" ng-click="gotoPage(999999, FKTbl)">»</a>
              </li>
            </ul>
          </div>        
          <div class="col-xs-4">
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
      	<button type="button" class="btn btn-warning" id="test" ng-click="openSEPopup(selectedTable.table_name)">
          <i class="fa fa-refresh"></i> Refresh</button>
        <button type="button" class="btn btn-default pull-right" data-dismiss="modal"><i class="fa fa-times"></i> Close</button>
      </div>
    </div>
  </div>
</div>

<!-- content ends here -->
