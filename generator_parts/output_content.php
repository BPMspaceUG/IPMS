 <!-- body content starts here  -->
  <div style="margin: 0 1em;">
    <div class="row">
      <div class="col-md-12 tab-content" id="bpm-content">

        <div ng-repeat="table in tables track by $index" class="tab-pane" id="{{table.table_name}}">
          <div class="panel panel-default panel-table" disabled>
            <div class="panel-heading">
              <h3 class="panel-title">
                <div class="pull-left" style="margin-top: .4em; font-weight: bold;">{{table.table_alias}}</div>
                <!--
                <input type="text" style="width:50px" class="form-control pull-right" ng-model="PageLimit">
                -->
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

              <!-- DEBUG -->
              <!-- <pre>{{table}}</pre> -->

              <table class="table table-bordered">
                <thead>
                  <tr>
                    <th ng-hide="table.is_read_only"><em class="fa fa-cog"></em></th>
                    <th ng-repeat="col in table.columnsX">{{col.COLUMN_NAME}}</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Table Content -->
                  <tr ng-repeat="row in table.rows track by $index" ng-model="table"
                      data-toggle='modal' data-target="modal-container-1"
                      id="row{{'' + $parent.$index + $index}}">
                    <td class="controllcoulm" ng-hide="table.is_read_only">
                      <!-- Delete Button -->
                      <button id="del{{$index}}" class="btn btn-danger" title="Delete this Row"
                        ng-click="send('delete', {row:row, colum:$index, table:table})">
                        <i class="fa fa-times"></i><!-- Delete--></button>
                      <!-- Update Button -->
                      <button id="btnRow{{'' + $parent.$index + $index}}" class="btn btn-success btnUpdate" title="Update this Row"
                        ng-click="send('update', {row:row, colum:$index, table:table, x:[$index, $parent.$index]})">
                        <i class="fa fa-floppy-o"></i><!-- Update--></button>
                    </td>
                    <td ng-repeat="cell in row track by $index">
                      <!-- xeditable controllfield -->
                      <!-- <a href="#" editable-text="cell">{{ cell || "empty" }}</a> -->

                      <!-- Substitue State Machine -->
                      <div ng-show="((table.columnames[$index].indexOf('state') >= 0) && table.SE_enabled)">
                        <button class="btn btn-success"
                          ng-click="openSEPopup({row:row, colum:$index, table:table})">NEW</button>
                      </div>

                      <!-- normal Textarea -->
                      <div ng-hide="((table.columnames[$index].indexOf('state') >= 0) && table.SE_enabled)">
                        <textarea class="form-control" rows="1" cols="{{cell.length}}" 
                         ng-hide="table.is_read_only" ng-focus="rememberOrigin(table.table_name, table.columnames, row, cell, $parent.$parent.$index, $index)" ng-blur="checkCellChange(table, row, cell, $parent.$parent.$parent.$index, $parent.$parent.$index, $index)"
                        ng-model="cell"
                        ng-if="!(table.columnames[$index] == table.primary_col)">{{cell}}</textarea>
                        <p ng-if="table.columnames[$index] == table.primary_col || table.is_read_only">{{cell}}</p>
                      </div>
                    </td>
                  </tr>
                  <!-- ############################## N E W ##### R O W #################################### -->
                  <!-- Table AddRow -->
                  <tr class="newRows" ng-hide="table.is_read_only">
                   <td>
                      <!-- Create Button -->
                      <button class="btn btn-primary" title="Create new Row"
                        ng-click="send('create', {row:table.newRows[0], table:table})">
                        <i class="fa fa-plus"></i><!-- Create--></button>
                   </td>
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
                      <li ng-repeat="elem in getPages(table, PageIndex, PageLimit) track by $index"
                        ng-class="{disabled: elem == PageIndex}">
                        <a href="" ng-click="gotoPage(elem, table, $index)">{{elem+1}}</a>
                      </li>
                      <!-- OLD -->
                      <!--
                      <li ng-class="{disabled: PageIndex <= 0}">
                        <a href="" ng-click="gotoPage(-1, table, $index)">« Page</a>
                      </li>
                      <li ng-class="{disabled: (PageIndex + 1) >= (table.count / PageLimit)}">
                        <a href="" ng-click="gotoPage(1, table, $index)">Page »</a>
                      </li>
                      -->
                    </ul>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal -->
		<div class="modal fade" id="modal-container-1" role="dialog" >
		  <div class="modal-dialog" role="document">
		    <div class="modal-content edums-tamodal-tacontent">
		       <button type="button" class="close btn-default" data-dismiss="modal" aria-hidden="true">X </button>
		    </div>
		  </div>
		</div>
    <!-- content ends here -->
  </div>