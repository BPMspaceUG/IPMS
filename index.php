<?php include_once '_header.inc.php'; ?>
<body>
<div class="container" style="padding-top: 30px">
    <form class="bpm-server-connect" action="modules/ConnectDB.php">
        <h3 class="title">connect</h3>
        <div class="form-group row">
            <label for="sqlServer" class="col-sm-2 form-control-label">MySQL Server</label>
            <div class="col-sm-2">
                <input type="text" class="form-control" autocomplete="off" name="host" id="sqlServer"
                       placeholder="127.0.0.1" value="">
            </div>
            <label for="sqlPort" class="col-sm-2 form-control-label">MySQL Port</label>
            <div class="col-sm-2">
                <input type="number" autocomplete="off" class="form-control" name="port" id="sqlPort"
                       placeholder="3306" value="">
            </div>

            <div class="col-sm-1">
                <button id="new" type="reset" class="btn btn-success" name="new">New</button>
            </div>

            <!--            <div class="col-sm-1">-->
            <!--                <a href="#deleteDb" data-toggle="modal" class="btn btn-danger" id="delete" name="delete">Delete</a>-->
            <!--            </div>-->

            <div class="col-sm-1">
                <button id="connect" type="button" class="btn btn-info" name="connect" value="true">Connect</button>
            </div>
        </div>
        <div class="form-group row">
            <label for="username" class="col-sm-2 form-control-label">username</label>
            <div class="col-sm-2">
                <input type="text" autocomplete="off" value="" class="form-control" id="username" name="user"
                       placeholder="root">
            </div>
            <label for="password" class="col-sm-2 form-control-label">password</label>
            <div class="col-sm-2">
                <input type="password" value="" autocomplete="off" class="form-control" id="sqlPort" name="pwd"
                       placeholder="password">
            </div>

            <div class="col-sm-1">
                <a href="#loadDb" name="load" data-toggle="modal" id="loadF" class="btn btn-default "
                   name="load">Load</a>
            </div>

            <div class="col-sm-1">
                <button type="button" name="save" id="save" class="btn btn-primary" name="save">Save</button>
            </div>
            <div class="col-sm-2">
                <i class="fa fa-check" aria-hidden="true" style="display: none"></i>
                <i class="fa fa-minus-circle" aria-hidden="true" style="display: none"></i>
            </div>
        </div>
    </form>
</div>
<div class="container">
    <div class="row">
        <label for="sqlDatabases" class="col-sm-2" style="padding-left: 2.4%;">Databases</label>
        <select class=" form-control "
                id="sqlDatabases"
                ng-model="list" ng-options="item.name for item in result">
            <option value="">Select a database from dropdown</option>
        </select>
        <div class="container">
            <div class="row">
                <div ng-repeat="item in list.tables" class="bpm-checkboxes">
                    <input type="checkbox" id="{{item.name}}" class="disabled" disabled checked>
                    <p class="bpm-db-table">{{item.name}}</p>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12" id="code">
                    <label>Show file content</label>
                    <input type="file" on-read-file="showContent($fileContent)"/>
                    <textarea disabled style="width: 100%; min-height: 500px; resize: none; padding:
                    50px 0 0; margin:0 0 50px;">{{content}}</textarea>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Delete Modal
<div class="modal fade" id="deleteDb">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                <h3 class="modal-title">Stored Connections</h3>
            </div>
            <div class="modal-body">
                <h5 class="text-center">List of Stored connections in Database</h5>
                <table class="table table-striped" id="tblGrid">
                    <thead id="tblHead">
                    <tr>
                        <th>Id</th>
                        <th>Host</th>
                        <th>Username</th>
                        <th>Port</th>
                        <th>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                    <tr ng-repeat="item in connections">
                        <td>{{$index+1}}</td>
                        <td>{{item.host}}</td>
                        <td>{{item.user}}</td>
                        <td>{{item.port}}</td>
                        <td><a href="#" ng-click="remove(item)"><i class="fa fa-trash-o"
                                                                   aria-hidden="true"></i></a></td>
                    </tr>
                    </tbody>
                </table>

            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default " data-dismiss="modal">Close</button>
            </div>

        </div>
    </div>
</div>
-->
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

<?php include_once "_footer.inc.php" ?>

