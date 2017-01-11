 <!-- body content starts here  -->
  <div class="container">
    <div class="row">
      <div class="col-md-12 tab-content" id="bpm-content">

        Log History <input type="checkbox" ng-model="historyLog">
        <div ng-if="historyLog" ng-repeat="log in changeHistory | limitTo:-3">
          {{log.changeHistorycounter}} Tabelle: {{log.table}} row: {{(log.rowID +1)}} col: {{(log.colID +1)}}
          <textarea rows="1" cols="{{log.cell.length}}">{{log.cell}}</textarea>
        </div>
        <textarea rows="1" cols="150">{{'lastResponse: '+lastResponse}}</textarea>
        <div ng-repeat="table in tables track by $index" class="tab-pane" id="{{table.table_name}}">
          
          <h2>{{table.table_alias}}</h2>
          <table class="table" >
            <!-- <th>{{table.columnames.length}} Spalten, {{table.rows.length}} Zeilen</th> -->
            <th ng-repeat="name in table.columnames">{{name}}</th>

            <tr ng-repeat="row in table.rows" 
                ng-model="table"
                data-toggle='modal' 
                data-target="modal-container-1"
                id="row{{'' + $parent.$index + $index}}">
              <td class="controllcoulm">

                <i id="del{{$index}}"
                class="fa fa-times-circle" 
                aria-hidden="true"
                ng-click="send('delete', {row:row, colum:$index, table:table})"></i>

<!--                 <button id="btnRowAlt{{'' + $parent.$index + $index}}" 
                class="btnUpdateAlt" 
                ng-click="update()"
                >updateAlt</button> -->

                <button id="btnRow{{'' + $parent.$index + $index}}" 
                class="btnUpdate" 
                ng-click="send('update', {row:row, colum:$index, table:table})"
                >update</button>

              </td>
             <td ng-repeat="cell in row track by $index">
              <!-- xeditable controllfield -->
              <a href="#" editable-text="cell">{{ cell || "empty" }}</a>
              <!-- normal Textarea -->
              <textarea 
              rows="1" cols="{{cell.length}}" 
              ng-focus="rememberOrigin(table.tablename, row, cell, $parent.$index, $index)"
              ng-blur="checkCellChange(table, row, cell, $parent.$parent.$index, $parent.$index, $index)"
              ng-model="cell">{{cell}}</textarea>
             </td>
            </tr>

            <tr class="newRows">
             <td>
              <i class="fa fa-plus" aria-hidden="true"></i>
               <button 
               class="btnnewRows" 
               ng-click="send('create', {row:table.newRows[0], table:table})">
               create
               </button>
             </td>
             <td ng-repeat="col in table.newRows[0] track by $index">
              <textarea ng-model="table.newRows[0][$index]"></textarea>
             </td>
            </tr>

            <tr class="newRows" ng-repeat="row in table.newRows track by $index" ng-if="$index > 0">
              <td></td>
             <td  ng-repeat="col in row track by $index">
              <textarea ng-model="table.newRows[$parent.$index][$index]" <!-- ng-focus="addNewRow(table)" -->></textarea>
             </td>
            </tr>
          </table>
        </div>
		 <div class="modal fade" id="modal-container-1" role="dialog" >
		   <div class="modal-dialog" role="document">
		     <div class="modal-content edums-tamodal-tacontent">

		       <button type="button" class="close edums-tacontent-btnclose" data-dismiss="modal" aria-hidden="true">X </button>
		      </div>
		  </div>
		</div>
<!--  body content ends here