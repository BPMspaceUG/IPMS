<!-- Loading Screen or Errors -->
<div class="container">
  <div class="alert alert-info" ng-show="isLoading">
    <p><i class="fa fa-cog fa-spin"></i> Loading ...</p>
  </div>
</div>
<!-- body content starts here  -->
<div class="container" id="content">

  <div class="row">
    <div class="col-xs-12 tab-content">

      <div ng-repeat="table in tables track by $index" class="tab-pane" ng-class="{active: ($index == 0)}" id="{{table.table_name}}">
        <div class="panel panel-primary panel-table" disabled>
          <div class="panel-heading">
            <h3 class="panel-title">
              <div class="pull-left" style="margin-top: .4em; font-weight: bold;">
                <i class="{{table.table_icon}}"></i>&nbsp;<span ng-bind="table.table_alias"></span>
              </div>
              <!-- Where filter -->
              <form class="form-inline pull-right">
                <div class="form-group">
                  <!-- PROCESS -->
                  <button class="btn btn-default" title="Show Process" ng-hide="!table.se_active" type="button"
                    ng-click="openSEPopup(table.table_name)"><i class="fa fa-random"></i></button>
                  <!-- ADD -->
                  <button class="btn btn-success" title="Add new entry" ng-hide="table.is_read_only" type="button"
                  	ng-click="addEntry(table.table_name)"><i class="fa fa-plus"></i></button>
                  <!-- SEARCH -->
                  <input type="text" class="form-control" style="width:200px;" placeholder="Search..."
                    ng-model="table.sqlwhere"/>
                  <!-- REFRESH -->
                  <button class="btn btn-default" title="Refresh table" 
                  	ng-click="refresh(table.table_name);"><i class="fa fa-refresh"></i></button>                  
                </div>
              </form>
              <div class="clearfix"></div>
            </h3>
          </div>
          <div class="panel-body table-responsive">
          	<!-- Display user info No Entries found -->
          	<table class="table table-bordered table-striped table-hover table-condensed" ng-if="table.count <= 0">
          		<thead>
          			<tr><th style="padding: 3em 0; font-weight: normal;">No entries found</th></tr>
          		</thead>          		
          	</table>
            <!-- Dispay real content -->
            <table class="table table-bordered table-striped table-hover table-condensed tableCont" ng-if="table.count > 0">
              <!-- ============= COLUMN HEADERS ============= -->
              <thead>
                <tr>
                  <!-- Control-Column -->
                  <th ng-hide="table.is_read_only"><em class="fa fa-cog"></em></th>
                  <!-- Data-Columns -->
                  <th ng-repeat="col in table.columns"
                  		ng-click="sortCol(table, col.COLUMN_NAME)"
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
                <tr ng-repeat="row in table.rows">
                  <!-- Control-Column -->
                  <td class="controllcoulm" ng-hide="table.is_read_only">
                    <!-- Edit Button -->
                    <button class="btn btn-default" ng-click="editEntry(table, row)" title="Edit Row">
                      <i class="fa fa-pencil"></i>
                    </button>
                    <!-- Delete Button -->
                    <button class="btn btn-danger" ng-click="deleteEntry(table, row)" title="Delete Row">
                      <i class="fa fa-times"></i>
                    </button>
                  </td>
                  <!-- DATA ROWS -->
                  <td ng-repeat="(key, value) in row"
                  		ng-if="getColByName(table, key).is_in_menu">
                    <!-- Substitue State Machine -->
                    <div ng-if="(( key.indexOf('state') >= 0) && table.se_active)">
                      <b ng-class="'state'+ value">{{substituteSE(table.table_name, value)}}</b>
                    </div>
                    <!-- Cell -->
                    <span ng-if="!(( key.indexOf('state') >= 0) && table.se_active)">
                   		{{value | limitTo: 50}}{{value.length > 50 ? '...' : ''}}
                   	</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="panel-footer">
              <div class="row">
                <div class="col col-xs-6">
                  <span class="text-primary">
                    <span>{{table.count}} Entries total</span>
                    <span ng-if="getNrOfPages(table) > 0"> - Page {{table.PageIndex + 1}} of {{ getNrOfPages(table) }}</span>
                  </span>
                </div>
                <div class="col col-xs-6">
                  <ul class="pagination pull-right"><!-- visible-xs -->
                    <!-- JUMP to first page -->
                    <li ng-class="{disabled: table.PageIndex <= 0}">
                      <a href="" ng-click="gotoPage(0, table)">«</a>
                    </li>          
                    <!-- Page Buttons -->
                    <li ng-repeat="btn in getPageination(table.table_name)"
                      ng-class="{disabled: btn + table.PageIndex == table.PageIndex}">
                      <a href="" ng-click="gotoPage(btn + table.PageIndex, table)">{{btn + table.PageIndex + 1}}</a>
                    </li>
                    <!-- JUMP to last page -->
                     <li ng-class="{disabled: (table.PageIndex + 1) >= (table.count / PageLimit)}">
                      <a href="" ng-click="gotoPage(999999, table)">»</a>
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

</div>


<!-- Modal for Editing DataRows -->
<div class="modal fade" id="modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">
          <span ng-if="createNewEntry"><i class="fa fa-plus"></i> Create Entry</span>
          <span ng-if="!createNewEntry"><i class="fa fa-pencil"></i> Edit Entry</span>
        </h4>
      </div>
      <div class="modal-body">
        <!-- Content -->
        <form class="form-horizontal">
          <!-- Add if is in menu -->
          <div class="form-group"
            ng-repeat="(key, value) in selectedRow"
            ng-if="
              (getColByName(selectedTable, key).is_in_menu
          && !(selectedTable.se_active && (key.indexOf('state_id') >= 0))
          && (selectedTable.form_data[key] != 'HI'))
          || (createNewEntry
          && getColByName(selectedTable, key).is_in_menu
          && !(selectedTable.se_active
          && (key.indexOf('state_id') >= 0)))
          ">
            <!-- [LABEL] -->
            <label class="col-sm-3 control-label">{{getColAlias(selectedTable, key)}}</label>
            <!-- [VALUE] -->
            <div class="col-sm-9">
              <!-- Foreign Key (FK) -->
              <span ng-if="getColByName(selectedTable, key).foreignKey.table != ''">
              	<a class="btn btn-default"
                  ng-click="(selectedTable.form_data[key] == 'RO' && !createNewEntry) || openFK(key)"
                  ng-disabled="selectedTable.form_data[key] == 'RO' && !createNewEntry">
                  <i class="fa fa-key"></i> {{value}}
                </a>
              </span>
              <!-- NO FK -->
              <span ng-if="getColByName(selectedTable, key).foreignKey.table == ''">
                <!-- Number  -->
                <input class="form-control" type="number" string-to-number 
                  ng-if="getColByName(selectedTable, key).COLUMN_TYPE.indexOf('int') >= 0
                  && getColByName(selectedTable, key).COLUMN_TYPE.indexOf('tiny') < 0"
                  ng-model="selectedRow[key]"
                  ng-disabled="selectedTable.form_data[key] == 'RO' && !createNewEntry">
                <!-- Text -->
                <input class="form-control" type="text"
                  ng-if="getColByName(selectedTable, key).COLUMN_TYPE.indexOf('int') < 0
                  && getColByName(selectedTable, key).COLUMN_TYPE.indexOf('long') < 0
                  && !getColByName(selectedTable, key).is_ckeditor"
                  ng-model="selectedRow[key]"
                  ng-disabled="selectedTable.form_data[key] == 'RO' && !createNewEntry">
                <!-- LongText (probably HTML) -->
                <textarea class="form-control" rows="3"
                  ng-if="getColByName(selectedTable, key).COLUMN_TYPE.indexOf('longtext') >= 0
                  || getColByName(selectedTable, key).is_ckeditor"
                  ng-model="selectedRow[key]" style="font-family: Courier;"
                  ng-disabled="selectedTable.form_data[key] == 'RO' && !createNewEntry"></textarea>
                <!-- Boolean (tinyint or boolean) -->
                <input class="form-control"
                  type="checkbox"
                  ng-show="getColByName(selectedTable, key).COLUMN_TYPE.indexOf('tinyint') >= 0
                  && !getColByName(selectedTable, key).is_read_only"
                  ng-model="selectedRow[key]"
                  ng-true-value="'1'"
                  ng-false-value="'0'"
                  ng-disabled="selectedTable.form_data[key] == 'RO' && !createNewEntry"
                  style="width: 50px;">
                <!-- TODO: Date -->
              </span>
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <!-- CREATE / CLOSE -->
      	<span ng-if="!createNewEntry">
          <!-- STATE MACHINE -->
          <span class="pull-left" ng-hide="!selectedTable.se_active || selectedTable.hideSmBtns">
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
          <span ng-if="!selectedTable.se_active">
        	  <button class="btn btn-primary" ng-click="saveEntry()"><i class="fa fa-floppy-o"></i> Save</button>
        	  <button class="btn btn-primary" ng-click="saveEntry()" data-dismiss="modal"><i class="fa fa-floppy-o"></i> Save &amp; Close</button>
          </span>
        </span>
        <span ng-if="createNewEntry">
        	<button class="btn btn-success" data-dismiss="modal" ng-click="send('create', {row: selectedRow, table: selectedTable})">
            <i class="fa fa-plus"></i> Create</button>
        </span>
        &nbsp;
        <button class="btn btn-default pull-right" type="button" data-dismiss="modal"><i class="fa fa-times"></i> Close</button>
      </div>
    </div>
  </div>
</div>

<!-- Modal for ForeignKey -->
<div class="modal fade" id="myFKModal" tabindex="-1" role="dialog" aria-labelledby="myFKModalLabel">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="myFKModalLabel"><i class="fa fa-key"></i> Select a Foreign Key</h4>
      </div>
      <div class="modal-body">
        <p>Search: <input class="form-control" type="text" autofocus></p>
        <div>
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
        <h4 class="modal-title">State-Machine for <b>{{selectedTable.table_alias}}</b></h4>
      </div>
      <div class="modal-body">
        <div id="statediagram" style="max-height: 300px; overflow: auto;"></div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default pull-right" data-dismiss="modal"><i class="fa fa-times"></i> Close</button>
      </div>
    </div>
  </div>
</div>
<!-- content ends here -->
