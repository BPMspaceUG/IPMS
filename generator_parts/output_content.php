<!-- Loading Screen or Errors -->
<div class="container">
  <div class="alert alert-info" ng-show="isLoading">
    <p><i class="fa fa-cog fa-spin"></i> Loading ...</p>
  </div>
</div>
<!-- body content starts here  -->
<div class="container">

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
                  <th ng-repeat="col in table.columns" ng-if="col.is_in_menu">
                    <span>{{col.column_alias}}</span>
                  </th>
                  <th ng-hide="table.is_read_only"><em class="fa fa-cog"></em></th>
                </tr>
              </thead>
              <tbody>
                <!-- ============= CONTENT ============= -->
                <tr ng-repeat="row in table.rows track by $index" ng-model="table"
                    data-toggle='modal' data-target="modal-container-1"
                    id="row{{'' + $parent.$index + $index}}">
                  <!-- Data entries -->
                  <td animate-on-change="cell" ng-repeat="cell in row track by $index" ng-if="table.columns[$index].is_in_menu">
                    <!-- Substitue State Machine -->
                    <div ng-if="((table.columns[$index].COLUMN_NAME.indexOf('state') >= 0) && table.se_active)">
                      <button class="btn" ng-class="'state'+cell"
                        ng-click="openSEPopup(table, row)">{{substituteSE(table.table_name, cell)}}</button>
                    </div>
                    <!-- Cell -->
                    <p ng-hide="((table.columns[$index].COLUMN_NAME.indexOf('state') >= 0) && table.se_active)">
                    	{{cell | limitTo: 50}}{{cell.length > 50 ? '...' : ''}}
                    </p>
                  </td>
                  <!-- Edit options -->
                  <td class="controllcoulm" ng-hide="table.is_read_only">
                    <!-- Update Button -->
                    <a class="btn btn-default" data-toggle="modal" data-target="#modal"
                    	ng-click="editEntry(table, row)" title="Edit this row">
                      <i class="fa fa-pencil"></i>
                    </a>
                    <!-- Delete Button -->
                    <button id="del{{$index}}" class="btn btn-danger" title="Delete this Row"
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
          <span ng-if="createNewEntry">Create Entry</span>
          <span ng-if="!createNewEntry">Edit Entry</span>
        </h4>
      </div>
      <div class="modal-body">
        <form class="form-horizontal">
          <div class="form-group" ng-repeat="(key, value) in selectedTask">
          	<div ng-hide="selectedTable.se_active && (key.indexOf('state_id') >= 0)">
	            <label for="x" class="col-sm-3 control-label">{{getColAlias(selectedTable, key)}}</label>
	            <div class="col-sm-9">              
	            	<input type="text" class="form-control" ng-model="selectedTask[key]">
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