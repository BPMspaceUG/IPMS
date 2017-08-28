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
              <div class="pull-left" style="margin-top: .4em; font-weight: bold;">{{table.table_alias}}</div>
              <!-- Where filter -->
              <form class="form-inline pull-right">
                <div class="form-group">
                  <!-- ADD -->
                  <button class="btn btn-success" title="Add new entry" ng-hide="table.is_read_only" type="button"
                  	ng-click="addEntry(table.table_name);"><i class="fa fa-plus"></i></button>
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
            <table class="table table-bordered table-striped table-hover table-condensed">
              <!-- ============= COLUMN HEADERS ============= -->
              <thead>
                <tr>                 
                  <th ng-repeat="(key, value) in table.rows[0]">
                    <span>{{getColAlias(table, key)}}</span>
                  </th>
                  <th ng-hide="table.is_read_only"><em class="fa fa-cog"></em></th>
                </tr>
              </thead>
              <tbody>
                <!-- ============= CONTENT ============= -->
                <!-- TODO: do not insert cells via index... because of ORDER! -->
                <tr ng-repeat="row in table.rows" data-toggle='modal' data-target="modal-container-1">
                  <!-- Data entries -->
                  <td ng-repeat="cell in row">
                    <!-- Substitue State Machine -->
                    <!--
                    <div ng-if="((table.columns[$index].COLUMN_NAME.indexOf('state') >= 0) && table.se_active)">
                      <button class="btn" ng-class="'state'+cell"
                        ng-click="openSEPopup(table, row)">{{substituteSE(table.table_name, cell)}}</button>
                    </div>
                    -->
                    <!-- Cell -->
                    {{cell | limitTo: 50}}{{cell.length > 50 ? '...' : ''}}
                  </td>
                  <!-- Edit options -->
                  <td class="controllcoulm" ng-hide="table.is_read_only">
                    <!-- Update Button -->
                    <a class="btn btn-default" data-toggle="modal" data-target="#modal" 
                      ng-click="editEntry(table, row)" title="Edit">
                      <i class="fa fa-pencil"></i>
                    </a>
                    <!-- Delete Button -->
                    <button id="del{{$index}}" class="btn btn-danger" title="Delete"
                      ng-click="send('delete', {row:row, colum:$index, table:table})">
                      <i class="fa fa-times"></i></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="panel-footer">
              <div class="row">
                <div class="col col-xs-6">
                  <span class="text-primary">
                    {{table.count}} Entries total - Page {{table.PageIndex + 1}} of {{ getNrOfPages(table) }}
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

<!-- Modal for Editing DataRows -->
<div class="modal fade" id="modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">
          <span ng-if="createNewEntry"><i class="fa fa-plus"></i> Create Entry</span>
          <span ng-if="!createNewEntry"><i class="fa fa-pencil"></i> Edit Entry</span>
        </h4>
      </div>
      <div class="modal-body">
        <form class="form-horizontal">
          <div class="form-group" ng-repeat="(key, value) in selectedTask">
          	<div ng-hide="selectedTable.se_active && (key.indexOf('state_id') >= 0)">
              <!-- LABEL -->
	            <label for="inputX" class="col-sm-3 control-label">{{getColAlias(selectedTable, key)}}</label>
              <!-- VALUE -->
              <div class="col-sm-9">
                <!-- TODO: Read Only -->
                <!-- FK -->
                <span ng-if="getColByName(selectedTable, key).foreignKey.table != ''">
                	<p class="form-control-static text-muted"><i class="fa fa-key"></i> Foreign-Key (use DB for now)</p>
                </span>
                <!-- NO FK -->
                <span ng-if="getColByName(selectedTable, key).foreignKey.table == ''">
	                <!-- Number  -->
	                <input class="form-control" type="number" string-to-number 
	                  ng-if="getColByName(selectedTable, key).COLUMN_TYPE.indexOf('int') >= 0
	                  && getColByName(selectedTable, key).COLUMN_TYPE.indexOf('tiny') < 0"
	                  ng-model="selectedTask[key]">
	                <!-- Text -->
	                <input class="form-control" type="text"
	                  ng-if="getColByName(selectedTable, key).COLUMN_TYPE.indexOf('int') < 0
	                  && getColByName(selectedTable, key).COLUMN_TYPE.indexOf('long') < 0"
	                  ng-model="selectedTask[key]">
	                <!-- LongText (probably HTML) -->
	                <textarea class="form-control" rows="3"
	                  ng-if="getColByName(selectedTable, key).COLUMN_TYPE.indexOf('longtext') >= 0"
	                  ng-model="selectedTask[key]"></textarea>
	                <!-- TODO: Date -->
	                <!-- TODO: Boolean (tinyint or boolean)
	                <input class="form-control" type="checkbox"
	                  ng-show="table.columnsX[$index].COLUMN_TYPE.indexOf('tinyint') >= 0 &&
	                  !table.columnsX[$index].is_read_only"
	                  ng-model="table.newRows[0][$index]">
	                <!-- Datatype -->
	                <!--<div><small class="text-muted">{{ getColByName(selectedTable, key).COLUMN_TYPE }}</small></div>-->
	              </span>
	            </div>
	          </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
      	<span ng-if="!createNewEntry">
        	<button class="btn btn-primary" ng-click="saveEntry()"><i class="fa fa-floppy-o"></i> Save</button>
        	<button class="btn btn-primary" ng-click="saveEntry()" data-dismiss="modal"><i class="fa fa-floppy-o"></i> Save &amp; Close</button>
        </span>
        <span ng-if="createNewEntry">
        	<button class="btn btn-success" data-dismiss="modal" ng-click="send('create', {row: selectedTask, table: selectedTable})"><i class="fa fa-plus"></i> Create</button>
        </span>
        &nbsp;
        <button class="btn btn-default pull-right" type="button" data-dismiss="modal"><i class="fa fa-times"></i> Close</button>
      </div>
    </div>
  </div>
</div>

<!-- Modal for StateEngine -->
<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="myModalLabel">Go to next State</h4>
      </div>
      <div class="modal-body">
        <p></p>
      </div>
      <div class="modal-footer">
        <span class="pull-left">
          <span>Goto &rarr; </span>
          <span ng-repeat="state in selectedTable.nextstates">
            <!--<pre>{{state}}</pre>-->
            <button type="button" class="btn" ng-class="'state'+state.id" ng-click="gotoState(state)" >{{state.name}}</button>
          </span>
        </span>
        <button type="button" class="btn btn-default pull-right" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div> 
<!-- content ends here -->