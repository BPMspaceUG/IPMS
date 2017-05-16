  <!-- body content starts here  -->
  <div style="margin: 0 1em;">
    <div class="row">
      <div class="col-md-12 tab-content" id="bpm-content">

        <div ng-repeat="table in tables track by $index" class="tab-pane" id="{{table.table_name}}">
          <div class="panel panel-default panel-table" disabled>
            <div class="panel-heading">
              <h3 class="panel-title">
                <div class="pull-left" style="margin-top: .4em; font-weight: bold;">{{table.table_alias}}</div>
                <!-- Where filter -->
                <form class="form-inline pull-right">
                  <div class="form-group">
                    <input type="text" class="form-control" style="width:200px;" placeholder="WHERE"
                      ng-model="sqlwhere[$index]" />
                    <button class="btn btn-default" title="Refresh table"
                      ng-click="refresh(table, $index);"><i class="fa fa-refresh"></i></button>
                  </div>
                </form>
                <div class="clearfix"></div>
              </h3>
            </div>
            <div class="panel-body table-responsive" style="padding:0;">
              <table class="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th ng-repeat="col in table.columnsX">{{col.COLUMN_NAME}}</th>
                    <th ng-hide="table.is_read_only"><em class="fa fa-cog"></em></th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Table Content -->
                  <tr ng-repeat="row in table.rows track by $index" ng-model="table"
                      data-toggle='modal' data-target="modal-container-1"
                      id="row{{'' + $parent.$index + $index}}">
                    <!-- Data entries -->
                    <td animate-on-change="cell" ng-repeat="cell in row track by $index">
                      <!-- Substitue State Machine -->
                      <div ng-if="((table.columnames[$index].indexOf('state') >= 0) && table.SE_enabled)">
                        <button class="btn btn-primary"
                          ng-click="openSEPopup(table, row)">{{subState(cell)}}</button>
                      </div>
                      <!-- Normal field -->
                      <p ng-hide="((table.columnames[$index].indexOf('state') >= 0) && table.SE_enabled)">{{cell}}</p>
                    </td>
                    <!-- Edit options -->
                    <td class="controllcoulm" ng-hide="table.is_read_only">
                      <!-- Update Button -->
                      <a class="btn btn-default" data-toggle="modal" data-target="#modal" ng-click="loadRow(table, row)">
                        <i class="fa fa-pencil"></i>
                      </a>
                      <!-- Delete Button -->
                      <button id="del{{$index}}" class="btn btn-danger" title="Delete this Row"
                        ng-click="send('delete', {row:row, colum:$index, table:table})">
                        <i class="fa fa-times"></i></button>
                    </td>
                  </tr>
                  <!-- ############################## N E W ##### R O W #################################### -->
                  <!-- Table AddRow -->
                  <tr class="newRows" ng-hide="table.is_read_only">
                   <td ng-repeat="col in table.newRows[0] track by $index">
                      <!--<textarea class="form-control nRws" ng-model="table.newRows[0][$index]"></textarea>-->
                      <!-- Number -->
                      <input class="form-control nRws" type="number"
                        ng-show="table.columnsX[$index].COLUMN_TYPE.indexOf('int') >= 0 && table.columnsX[$index].COLUMN_TYPE.indexOf('tiny') < 0"
                        ng-model="table.newRows[0][$index]">
                      <!-- Text -->
                      <input class="form-control nRws" type="text"
                        ng-show="table.columnsX[$index].COLUMN_TYPE.indexOf('int') < 0"
                        ng-model="table.newRows[0][$index]">
                      <!-- Date -->
                      <!-- Boolean (tinyint or boolean) -->
                      <input class="form-control nRws" type="checkbox"
                        ng-show="table.columnsX[$index].COLUMN_TYPE.indexOf('tinyint') >= 0"
                        ng-model="table.newRows[0][$index]">
                      <!-- Datatype --> 
                      <div><small>{{ table.columnsX[$index].COLUMN_TYPE }}</small></div>
                   </td>
                   <td>
                      <!-- Create Button -->
                      <button class="btn btn-success" title="Create new Row"
                        ng-click="send('create', {row:table.newRows[0], table:table})">
                        <i class="fa fa-plus"></i> Add</button>
                   </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="panel-footer">
                <div class="row">
                  <div class="col col-xs-6">
                    <b>Status:</b> {{status}} - {{table.count}} Entries // Showing page {{PageIndex + 1}} of {{table.count / PageLimit | ceil}}
                  </div>
                  <div class="col col-xs-6">
                    <ul class="pagination pull-right"><!-- visible-xs -->
                      <li ng-class="{disabled: PageIndex <= 0}">
                        <a href="" ng-click="gotoPage(0, table, $index)">«</a>
                      </li>
                      <li ng-repeat="elem in getPages(table, PageIndex, PageLimit) track by $index"
                        ng-class="{disabled: elem == PageIndex}">
                        <a href="" ng-click="gotoPage(elem, table, $index)">{{elem+1}}</a>
                      </li>
                       <li ng-class="{disabled: (PageIndex + 1) >= (table.count / PageLimit)}">
                        <a href="" ng-click="gotoPage((table.count / PageLimit)-1, table, $index)">»</a>
                      </li>
                    </ul>
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
          <h4 class="modal-title">Edit</h4>
        </div>
        <div class="modal-body">
          <form class="form-horizontal">
            <div class="form-group" ng-repeat="(key, value) in selectedTask">
              <label for="x" class="col-sm-3 control-label">{{key}}</label>
              <div class="col-sm-9">
                <input type="text" class="form-control" ng-model="selectedTask[key]">
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" ng-click="saveTask()" data-dismiss="modal">OK</button>
          <button type="button" class="btn btn-default pull-right" data-dismiss="modal">Close</button>
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
            <span ng-repeat="state in nextstates">
	        	  <button type="button" class="btn btn-primary" ng-click="gotoState(state)" >{{state.name}}</button>
            </span>
	        </span>
	        <button type="button" class="btn btn-default pull-right" data-dismiss="modal">Close</button>
	      </div>
	    </div>
	  </div>
	</div>  
</div>
<!-- body content ends here -->