 <!-- body content starts here  -->
  <div class="container">
    <div class="row">
      <div class="col-md-12 tab-content" id="bpm-content">

        <div ng-repeat="table in tables track by $index" class="tab-pane" id="{{table.table_name}}">         
          <h2>{{table.table_alias}}</h2>
          <table class="table">
            <thead>
              <tr>
                <th >&nbsp;</th>
                <th ng-repeat="col in table.columnsX">{{col.COLUMN_NAME}}</th>
              </tr>
            </thead>
            <tbody>
              <!-- Table Content -->
              <tr ng-repeat="row in table.rows track by $index" ng-model="table"
                  data-toggle='modal' data-target="modal-container-1" id="row{{'' + $parent.$index + $index}}">
                <td class="controllcoulm">
                  <!-- Delete Button -->
                  <button id="del{{$index}}" class="btn btn-danger" title="Delete"
                    ng-click="send('delete', {row:row, colum:$index, table:table})">
                    <i class="fa fa-times"></i><!-- Delete--></button>
                  <!-- Update Button -->
                  <button id="btnRow{{'' + $parent.$index + $index}}" class="btn btn-success btnUpdate" title="Update"
                    ng-click="send('update', {row:row, colum:$index, table:table, x:[$index, $parent.$index]})">
                    <i class="fa fa-floppy-o"></i><!-- Update--></button>
                </td>
                <td ng-repeat="cell in row track by $index">
                  <!-- xeditable controllfield -->
                  <!-- <a href="#" editable-text="cell">{{ cell || "empty" }}</a> -->
                  <!-- normal Textarea -->
                  <textarea 
                  rows="1" cols="{{cell.length}}" 
                  ng-focus="rememberOrigin(table.table_name, table.columnames, row, cell, $parent.$parent.$index, $index)"
                  ng-blur="checkCellChange(table, row, cell, $parent.$parent.$parent.$index, $parent.$parent.$index, $index)"
                  ng-model="cell"
                  ng-if="!(table.columnames[$index] == table.primary_col)">{{cell}}</textarea>
                  <p ng-if="table.columnames[$index] == table.primary_col">{{cell}}</p>
                </td>
              </tr>
              <!-- Table AddRow -->
              <tr class="newRows">
               <td>
                  <!-- Create Button -->
                  <button class="btn btn-primary" title="Create"
                    ng-click="send('create', {row:table.newRows[0], table:table})">
                    <i class="fa fa-plus"></i><!-- Create--></button>
               </td>
               <td ng-repeat="col in table.newRows[0] track by $index">
                  <div><small>{{ table.columnsX[$index].COLUMN_TYPE }}</small></div>
                  <textarea ng-model="table.newRows[0][$index]"></textarea>
               </td>
              </tr>
              <!--
              <tr class="newRows" ng-repeat="row in table.newRows track by $index" ng-if="$index > 0">
                <td></td>
                <td  ng-repeat="col in row track by $index">
                  <textarea ng-model="table.newRows[$parent.$index][$index]" ></textarea>
               </td>
              </tr>
              -->
            </tbody>
          </table>
        </div>
		 <div class="modal fade" id="modal-container-1" role="dialog" >
		   <div class="modal-dialog" role="document">
		     <div class="modal-content edums-tamodal-tacontent">

		       <button type="button" class="close btn-default" data-dismiss="modal" aria-hidden="true">X </button>
		      </div>
		  </div>
		</div>
<!--  body content ends here